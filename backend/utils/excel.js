const fs = require('fs');
const xlsx = require('xlsx');

module.exports = {
  readFile: (filePaths, deleteAfterDone = false) => {
    const result = [];
    filePaths.forEach((path) => {
      const workbook = xlsx.readFile(path);
      const sheetNames = workbook.SheetNames;

      const sheetData = [];
      sheetNames.forEach((sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet);
        const data = [];
        rawData.forEach((row) => {
          data.push(normalizeKeys(row));
        });
        sheetData.push(data);
      });
      if (deleteAfterDone) {
        fs.unlinkSync(path);
      }
      result.push(sheetData);
    });
    return result;
  },
};

function normalizeKeys(row) {
  const normalized = {};
  for (let key in row) {
    const cleanKey = key.toLowerCase().replace(/_/g, '');
    normalized[cleanKey] = row[key];
  }
  return normalized;
}
