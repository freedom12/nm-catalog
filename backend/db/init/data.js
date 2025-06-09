const args = process.argv.slice(2);
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const { importdata } = require('../../utils/import');

const folderPath = path.join(__dirname, '../../files/xlsx');
const files = fs
  .readdirSync(folderPath)
  .filter((filename) => filename.endsWith('.xlsx'))
  .map((filename) => ({
    path: path.join(folderPath, filename),
    filename: filename,
  }));

const dbPath = path.join(__dirname, '../data.db');
const db = new Database(dbPath);
const desc = args[0]?.split('=')[0] === 'desc';

try {
  importdata(files, desc, db);
} catch (error) {
  console.error(error);
} finally {
  db.close();
}
