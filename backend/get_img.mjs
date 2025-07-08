import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import pLimit from 'p-limit';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import lang from './db/schema/lang.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const isSaveOriginal = args.includes('original');
const isDownloadError = args.includes('error');

const dbPath = path.join(__dirname, 'db', 'data.db');
const db = new Database(dbPath);
const newFilePath = path.join(__dirname, './files', 'new_game.json');
const errorFilePath = path.join(__dirname, './files', 'error_img.json');

let langs = db
  .prepare(lang.select())
  .all()
  .map((x) => x.id);
const targetLang = langs.filter((x) => args.includes(x));
if (!targetLang.length) {
  const enIdx = langs.indexOf('en-US');
  [langs[0], langs[enIdx]] = [langs[enIdx], langs[0]];
} else {
  langs = targetLang;
}

const gameIds = fs.readFileSync(newFilePath, 'utf8').slice(1, -1).replace(/"/g, `'`);
const tasks = [];
for (const lang of langs) {
  let imgIds = [];

  if (!isDownloadError) {
    const langStr = lang.replace('-', '_');
    const diff = lang.includes('en') ? '' : `and img_${langStr} <> img_en_US`;
    const sql = `select img_${langStr} from game where id in (${gameIds}) ${diff} union select img_${langStr} from track where gid in (${gameIds}) ${diff}`;
    imgIds = db
      .prepare(sql)
      .all()
      .map((x) => x[`img_${langStr}`]);
  } else {
    const errors = JSON.parse(fs.readFileSync(errorFilePath, 'utf8'));
    imgIds = errors[lang];
  }

  const originalDir = path.join(__dirname, 'files/img', `original_${lang}`);
  const compressedDir = path.join(__dirname, '../frontend/public/assets', `img_new/img_${lang}`);
  fs.mkdirSync(originalDir, { recursive: true });
  fs.mkdirSync(compressedDir, { recursive: true });

  tasks.push({
    lang: lang,
    imgIds: imgIds,
    originalDir: originalDir,
    compressedDir: compressedDir,
    errors: [],
  });
}

const host = 'https://image-assets.m.nintendo.com';
const sum = tasks.map((x) => x.imgIds.length).reduce((x, y) => x + y, 0);
console.log(`共需下载 ${sum} 个图片`);

async function processImage(imgId, index, task) {
  try {
    const response = await axios.get(`${host}/${imgId}`, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // const contentType = response.headers['content-type'];
    // const ext = getExtensionFromMime(contentType);
    const ext = '.jpg';
    const filename = `${imgId}${ext}`;
    const compressedPath = path.join(task.compressedDir, filename);

    if (isSaveOriginal) {
      const originalPath = path.join(task.originalDir, filename);
      fs.writeFileSync(originalPath, buffer);
    }

    const metadata = await sharp(buffer).metadata();
    await sharp(buffer)
      .toFormat('jpeg')
      .jpeg({ quality: 30 })
      .resize(Math.round(metadata.width / 4), Math.round(metadata.height / 4))
      .toFile(compressedPath);

    console.log(`✅ 完成 ${task.lang}-${index + 1}: ${filename}`);
  } catch (err) {
    console.error(`❌ 错误 ${task.lang}-${index + 1} (${imgId}): ${err.message}`);
    task.errors.push(imgId);
  }
}

async function run(task) {
  const limit = pLimit(5);
  const tasks = task.imgIds.map((id, idx) => limit(() => processImage(id, idx, task)));
  await Promise.all(tasks);
  if (task.errors.length > 0) {
    let msg = `${task}: 所有图片处理完成`;
    if (task.errors.length > 0) {
      msg += `，其中${task.errors.length}项失败，详见：${errorFilePath}`;
    }
    msg += '。';
    console.log('\x1b[33m%s\x1b[0m', msg);
  }
}

async function runAll() {
  await Promise.all(tasks.map((x) => run(x)));
  const errors = {};
  for (const task of tasks) {
    errors[task.lang] = task.errors;
  }
  fs.writeFileSync(errorFilePath, JSON.stringify(errors), 'utf8');
  console.log(`所有任务已完成。`);
}

runAll();
