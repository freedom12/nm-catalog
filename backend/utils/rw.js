const fs = require('fs');
const path = require('path');

const readText = (fileName) => {
  const filePath = path.join(__dirname, '../files', fileName);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf8');
  } else {
    return '';
  }
};

const writeText = (fileName, data) => {
  const filePath = path.join(__dirname, '../files', fileName ?? 'data.json');
  const finalDir = path.dirname(filePath);
  fs.mkdirSync(finalDir, { recursive: true });
  fs.writeFileSync(
    filePath,
    typeof data === 'object' ? JSON.stringify(data) : data,
    'utf8'
  );
};

const paths = {
  'new_game.json': 'new_game.json',
  'updated_playlist.json': 'updated_playlist.json',
  'error_img.json': 'error_img.json',
  'res_playlist_section.json': 'response/playlist_section.json',
  'res_game_platform.json': 'response/game_platform.json',
  'res_game_year.json': 'response/game_year.json',
};

module.exports = { readText, writeText, paths };
