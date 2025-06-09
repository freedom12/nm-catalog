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

const dbPath = path.join(__dirname, 'db', 'data.db');
const db = new Database(dbPath);
const imgIds = db
  .prepare(`select img from game union select img from track`)
  // .prepare(`select img from track`)
  .all()
  // .slice(0, 10)
  .map((x) => x.img);
const originalDir = path.join(__dirname, 'files/img', 'original');
const compressedDir = path.join(__dirname, '../frontend/public/assets', 'img');
fs.mkdirSync(originalDir, { recursive: true });
fs.mkdirSync(compressedDir, { recursive: true });

function getExtensionFromMime(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mime] || '.jpg';
}

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
    const originalPath = path.join(originalDir, filename);
    const compressedPath = path.join(compressedDir, filename);

    // fs.writeFileSync(originalPath, buffer);

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
    console.log('所有图片处理完成，其中如下失败：');
    console.warn(errors);
  }
}

run();
