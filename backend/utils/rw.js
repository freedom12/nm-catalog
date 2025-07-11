const fs = require('fs');
const path = require('path');

module.exports = {
  readText: (fileName) => {
    const filePath = path.join(__dirname, '../files', fileName);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    } else {
      return '';
    }
  },
  writeText: (fileName, data) => {
    const filePath = path.join(__dirname, '../files', fileName ?? 'data.json');
    fs.writeFileSync(
      filePath,
      typeof data === 'object' ? JSON.stringify(data) : data,
      'utf8'
    );
  },
};
