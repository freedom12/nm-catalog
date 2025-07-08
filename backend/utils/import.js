const fs = require('fs');
const path = require('path');
const excel = require('./excel');
const [lang, hardware, game, track] = [
  require('../db/schema/lang'),
  require('../db/schema/hardware'),
  require('../db/schema/game'),
  require('../db/schema/track'),
];
const { getTransaction } = require('../db/transaction');

/**
 * Import data from .xlsx
 *
 * @param { { path: string[], fileName: string[] }[]} files
 * @param { descend: boolean, fullUpdate: boolean } settings
 * @param { object } [db=require('../db')]
 */
const importdata = (files, settings, db = require('../db')) => {
  const fullUpdate = settings.fullUpdate;
  if (fullUpdate) {
    db.prepare(game.delete()).run();
    db.prepare(track.delete()).run();
  }

  const [sources, filenames] = [excel.readFile(files.map((x) => x.path)), files.map((x) => x.filename)];
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
  const newGameIds = sources[0][0].filter((row) => !existedGameIds.includes(row.id)).map((row) => row.id);
  const json = JSON.stringify(newGameIds);
  console.log('\x1b[32m%s\x1b[0m', `+++++++++ ${newGameIds.length} new game(s) found. +++++++++`);

  sources.forEach((workbook, i) => {
    const lang = ((fileName) => {
      return langs[langs.map((x) => fileName.includes(x)).indexOf(true)];
    })(filenames[i]);
    let diff = -1;
    const tracks = [];

    workbook.forEach((sheet, j) => {
      if (j === 0) {
        const trans = getTransaction(game.insert(lang), db);
        trans(
          sheet
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
        if (fullUpdate || (!fullUpdate && newGameIds.includes(workbook[0][j + diff].id))) {
          tracks.push(
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

      const trans = getTransaction(track.insert(lang), db);
      trans(tracks);
    });
  });

  setTimeout(() => {
    const filePath = path.join(__dirname, '../files', 'new_game.json');
    fs.writeFileSync(filePath, json, 'utf8');
  });

  console.log('Sucessfully updated.');
  return {
    total: sources[0][0].length,
    new: newGameIds.length,
  };
};

module.exports = { importdata };
