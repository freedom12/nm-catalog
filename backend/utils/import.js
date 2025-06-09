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
 * @param { { path :string[], fileName: string[] }[]} files
 * @param {boolean} desc
 * @param {boolean} deleteAfter
 * @param {object} [db=require('../db')]
 */
const importdata = (files, desc, deleteAfter = false, db = require('../db')) => {
  db.prepare(game.delete()).run();
  db.prepare(track.delete()).run();

  const [sources, filenames] = [excel.readFile(files.map((x) => x.path)), files.map((x) => x.filename, deleteAfter)];
  const ms = Date.now();
  const langs = db
    .prepare(lang.select())
    .all()
    .map((x) => x.id);

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
          sheet.map((row, k) => [
            row.id,
            row.year,
            row.hardware,
            row.islink ? sheet[desc ? k - 1 : k + 1].id : '',
            row.thumbnailurl.split('/').reverse()[0],
            row.name,
            ms + (desc ? -k : k),
          ])
        );
      } else {
        const games = workbook[0];
        tracks.push(
          ...sheet.map((row) => [
            row.id,
            games[j + diff].id,
            row.index,
            row.duration,
            +row.isloop,
            +row.isbest,
            row.thumbnailurl.split('/').reverse()[0],
            row.name,
          ])
        );

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

  return sources;
};

module.exports = { importdata };
