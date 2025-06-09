const args = process.argv.slice(2);
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const [lang, hardware, game, track] = [
  require('../schema/lang'),
  require('../schema/hardware'),
  require('../schema/game'),
  require('../schema/track'),
];
const { getTransaction } = require('../transaction');

const dbPath = path.join(__dirname, '../data.db');
const force = args[0]?.split('=')[0] === 'force';
if (force) {
  fs.unlinkSync(dbPath);
  console.warn('Delete existed database.');
}

if (!fs.existsSync(dbPath)) {
  console.log('No database, initializing...');

  const db = new Database(dbPath);
  try {
    [lang, hardware, game, track].forEach((x) => {
      db.exec(x.create());
      if (!!x.preparedData) {
        const trans = getTransaction(x.insert(), db);
        trans(x.preparedData);
      }
    });
    db.close();

    console.log('Database initialized!');
  } catch (error) {
    console.error(error);
    db.close();
    fs.unlinkSync(dbPath);
  }
} else {
  console.log('Database existed.');
}
