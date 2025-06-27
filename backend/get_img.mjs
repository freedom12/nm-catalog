import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import pLimit from 'p-limit';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const isSaveOriginal = args.includes('original');
const isDownloadError = args.includes('error');

const dbPath = path.join(__dirname, 'db', 'data.db');
const db = new Database(dbPath);
const newFilePath = path.join(__dirname, './files', 'new_game.json');
const errorFilePath = path.join(__dirname, './files', 'error_img.json');

const gameIds = fs.readFileSync(newFilePath, 'utf8').slice(1, -1).replace(/"/g, `'`);
const imgIds = !isDownloadError
  ? db
      .prepare(`select img from game where id in (${gameIds}) union select img from track where gid in (${gameIds})`)
      .all()
      .map((x) => x.img)
  : JSON.parse(fs.readFileSync(errorFilePath, 'utf8'));

const originalDir = path.join(__dirname, 'files/img', 'original');
const compressedDir = path.join(__dirname, '../frontend/public/assets', 'img_new');
fs.mkdirSync(originalDir, { recursive: true });
fs.mkdirSync(compressedDir, { recursive: true });

// function getExtensionFromMime(mime) {
//   const map = {
//     'image/jpeg': '.jpg',
//     'image/png': '.png',
//     'image/webp': '.webp',
//     'image/gif': '.gif',
//   };
//   return map[mime] || '.jpg';
// }

const host = 'https://image-assets.m.nintendo.com';
const errors = [];
console.log(`共需下载 ${imgIds.length} 个图片`);

async function processImage(imgId, index) {
  try {
    const response = await axios.get(`${host}/${imgId}`, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // const contentType = response.headers['content-type'];
    // const ext = getExtensionFromMime(contentType);
    const ext = '.jpg';
    const filename = `${imgId}${ext}`;
    const compressedPath = path.join(compressedDir, filename);

    if (isSaveOriginal) {
      const originalPath = path.join(originalDir, filename);
      fs.writeFileSync(originalPath, buffer);
    }

    const metadata = await sharp(buffer).metadata();
    await sharp(buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 30 })
      .resize(Math.round(metadata.width / 4), Math.round(metadata.height / 4))
      .toFile(compressedPath);

    console.log(`✅ 处理完成第${index + 1}个: ${filename}`);
  } catch (err) {
    console.error(`❌ 错误-${index + 1} (${imgId}): ${err.message}`);
    errors.push(imgId);
  }
}

async function run() {
  const limit = pLimit(5);
  const tasks = imgIds.map((id, idx) => limit(() => processImage(id, idx)));
  await Promise.all(tasks);
  if (errors.length > 0) {
    let msg = '所有图片处理完成';
    if (errors.length > 0) {
      msg += `，其中${errors.length}项失败，详见：${errorFilePath}`;
    }
    msg += '。';
    console.log('\x1b[33m%s\x1b[0m', msg);
  }
  fs.writeFileSync(errorFilePath, JSON.stringify(errors), 'utf8');
}

run();
