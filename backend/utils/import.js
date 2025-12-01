const excel = require('./excel');
const stmt = require('../db/statements');
const { getTransactionByStatement } = require('../db/transaction');
const rw = require('./rw');
const { info } = require('../utils/tools.js');

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
    stmt.game.delete.run();
    stmt.track.delete.run();
  }

  const [sources, filenames] = [
    excel.readFile(files.map((x) => x.path)),
    files.map((x) => x.filename),
  ];
  const ms = Date.now();
  const langs = stmt.lang.select.all().map((x) => x.id);
  const existedGameIds = !fullUpdate ? stmt.game.select.all().map((x) => x.id) : [];
  const newGameIds = sources[0][0]
    .filter((row) => !existedGameIds.includes(row.id))
    .map((row) => row.id);

  info(`+++++++++ ${newGameIds.length} new game(s) found. +++++++++`);

  sources.forEach((workbook, i) => {
    const lang = ((fileName) => {
      return langs[langs.map((x) => fileName.includes(x)).indexOf(true)];
    })(filenames[i]);
    let diff = -1;
    const gameData = [];
    const trackData = [];
    const relateData = [];

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

      let trans = getTransactionByStatement(stmt.game.insert(lang));
      trans(gameData);
      trans = getTransactionByStatement(stmt.track.insert(lang));
      trans(trackData);
    });

    if (i === sources.length - 1) {
      info(`Updating related data...`);

      stmt.game_related.delete.run();
      relateData.push(
        ...workbook[0]
          .map((row) => {
            const data = row?.relatedgame
              .split('|')
              .map((x) => workbook[0].find((y) => y.name === x)?.id)
              .filter((x) => !!x)
              .map((x) => [row.id, x]);
            return data.flat(0);
          })
          .reduce((a, b) => [...a, ...b])
      );
      getTransactionByStatement(stmt.game_related.insert)(relateData);
    }
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
