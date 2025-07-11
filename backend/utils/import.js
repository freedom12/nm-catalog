const excel = require('./excel');
const [lang, game, track] = [
  require('../db/schema/lang'),
  require('../db/schema/game'),
  require('../db/schema/track'),
];
const { getTransaction } = require('../db/transaction');
const rw = require('./rw');

/**
 * Import data from .xlsx
 * @param { { path: string[], fileName: string[] }[]} files
 * @param { { descend: boolean, fullUpdate: boolean } } settings
 * @param { BetterSqlite3.Database } [db=require('../db')]
 * @returns { { total: number, new: number} }
 */
const importdata = (files, settings, db = require('../db')) => {
  const fullUpdate = settings.fullUpdate;
  if (fullUpdate) {
    db.prepare(game.delete()).run();
    db.prepare(track.delete()).run();
  }

  const [sources, filenames] = [
    excel.readFile(files.map((x) => x.path)),
    files.map((x) => x.filename),
  ];
  const ms = Date.now();
  const langs = db
    .prepare(lang.select())
    .all()
    .map((x) => x.id);
  const existedGameIds = !fullUpdate
    ? db
        .prepare(game.select())
        .all()
        .map((x) => x.id)
    : [];
  const newGameIds = sources[0][0]
    .filter((row) => !existedGameIds.includes(row.id))
    .map((row) => row.id);

  console.log(
    '\x1b[32m%s\x1b[0m',
    `+++++++++ ${newGameIds.length} new game(s) found. +++++++++`
  );

  sources.forEach((workbook, i) => {
    const lang = ((fileName) => {
      return langs[langs.map((x) => fileName.includes(x)).indexOf(true)];
    })(filenames[i]);
    let diff = -1;
    const gameData = [];
    const trackData = [];

    workbook.forEach((sheet, j) => {
      if (j === 0) {
        gameData.push(
          ...sheet
            .filter((row) => {
              if (fullUpdate) {
                return true;
              } else {
                return !existedGameIds.includes(row.id);
              }
            })
            .map((row, k) => {
              let linkIdx = settings.descend ? k - 1 : k + 1;
              if (!fullUpdate) {
                linkIdx += existedGameIds.length;
              }
              return [
                row.id,
                row.year,
                row.hardware,
                row.islink ? sheet[linkIdx].id : '',
                row.name,
                row.thumbnailurl.split('/').reverse()[0],
                ms + (settings.descend ? -k : k),
              ];
            })
        );
      } else {
        const games = workbook[0];
        if (
          fullUpdate ||
          (!fullUpdate && newGameIds.includes(workbook[0][j + diff].id))
        ) {
          trackData.push(
            ...sheet.map((row) => [
              row.id,
              games[j + diff].id,
              row.index,
              row.duration,
              +row.isloop,
              +row.isbest,
              row.name,
              row.thumbnailurl.split('/').reverse()[0],
            ])
          );
        }
        if (j < workbook.length - 1) {
          if (games[j + diff + 1].islink) {
            diff++;
          }
        }
      }

      let trans = getTransaction(game.insert(lang), db);
      trans(gameData);
      trans = getTransaction(track.insert(lang), db);
      trans(trackData);
    });
  });

  setTimeout(() => {
    rw.writeText('new_game.json', newGameIds);
    rw.writeText('res-platform.json', '');
    rw.writeText('res-year.json', '');
  });

  console.log('Data successfully updated.');

  return {
    total: sources[0][0].length,
    new: newGameIds.length,
  };
};

module.exports = { importdata };
