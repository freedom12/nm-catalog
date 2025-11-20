/*
  Initialized database
  
  -- force    # force to create new database file
*/

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const [lang, hardware, game, track, game_related] = [
  require('../db/schema/lang'),
  require('../db/schema/hardware'),
  require('../db/schema/game'),
  require('../db/schema/track'),
  require('../db/schema/game_related'),
];
const { getTransactionBySql } = require('../db/transaction');

const dbPath = path.join(__dirname, '../files/data.db');
const args = process.argv.slice(2);
const isForced = args.includes('force');

if (isForced) {
  fs.unlinkSync(dbPath);
  console.warn('Delete existed database.');
}

if (!fs.existsSync(dbPath)) {
  console.log('No database, initializing...');

  const db = new Database(dbPath);
  try {
    [lang, hardware, game, track, game_related].forEach((x) => {
      db.exec(x.create());
      if (!!x.preparedData) {
        const trans = getTransactionBySql(x.insert(), db);
        trans(x.preparedData);
      }
    });
    db.close();

    console.log('Database initialized!');
  } catch (err) {
    console.error(err);
    db.close();
    fs.unlinkSync(dbPath);
  }
} else {
  console.log('Database existed.');
}
