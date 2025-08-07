/*
  Initialized data from xlsx files
  
  -- desc    # games in reverse order
  -- full    # full update
*/

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const { importdata } = require('../utils/import');

const folderPath = path.join(__dirname, '../files/xlsx');
const files = fs
  .readdirSync(folderPath)
  .filter((filename) => filename.endsWith('.xlsx'))
  .map((filename) => ({
    path: path.join(folderPath, filename),
    filename: filename,
  }));

const dbPath = path.join(__dirname, '../db/data.db');
const db = new Database(dbPath);
const args = process.argv.slice(2);
const isDesc = args.includes('desc');
const isFullUpdate = args.includes('full');

try {
  importdata(files, { descend: isDesc, fullUpdate: isFullUpdate }, db);
} catch (err) {
  console.error(err);
} finally {
  db.close();
}
