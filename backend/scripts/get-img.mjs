/*
  Download images
  
  -- original    # also download original images
  -- error       # download images of previous error tasks
  -- --dir=xxx   # set target directory for compressed images
*/

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import rw from '../utils/rw.js';
import stmt from '../db/statements.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const isSaveOriginal = args.includes('original');
const isDownloadError = args.includes('error');
const prodDir = args.find((x) => x.startsWith('--dir='))?.split('=')[1];

let langs = stmt.lang.select.all().map((x) => x.id);
const targetLang = langs.filter((x) => args.includes(x));
if (!targetLang.length) {
  const enIdx = langs.indexOf('en-US');
  [langs[0], langs[enIdx]] = [langs[enIdx], langs[0]];
} else {
  langs = targetLang;
}

const gameIds = rw.readText('new_game.json').slice(1, -1).replace(/"/g, `'`);
const tasks = [];
for (const lang of langs) {
  let imgIds = [];

  if (!isDownloadError) {
    const langStr = lang.replace('-', '_');
    const diff = lang.includes('en') ? '' : `and img_${langStr} <> img_en_US`;
    const sql = `select img_${langStr} from game where id in (${gameIds}) ${diff} union select img_${langStr} from track where gid in (${gameIds}) ${diff}`;
    imgIds = stmt
      .sql(sql)
      .all()
      .map((x) => x[`img_${langStr}`]);
  } else {
    const errors = JSON.parse(rw.readText('error_img.json'));
    imgIds = errors[lang];
  }

  const originalDir = path.join(__dirname, '../files/img', `original_${lang}`);
  const compressedDir = path.join(
    __dirname,
    `../${!prodDir ? '../frontend/public/assets/new' : prodDir}`,
    `img_${lang}`
  );
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
const sum = tasks.map((x) => x.imgIds.length).reduce((a, b) => a + b, 0);
console.log('\x1b[32m%s\x1b[0m', `To download ${sum} image(s).`);

async function processImage(imgId, index, task) {
  try {
    const res = await axios.get(`${host}/${imgId}`, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(res.data);
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

    console.log(`✅ ${task.lang}-${index + 1}: ${filename}`);
  } catch (err) {
    console.error(`❌ ${task.lang}-${index + 1} (${imgId}): ${err.message}`);
    task.errors.push(imgId);
  }
}

async function run(task) {
  const limit = pLimit(5);
  const tasks = task.imgIds.map((id, idx) => limit(() => processImage(id, idx, task)));
  await Promise.all(tasks);
  let msg = `${task.lang}: All tasks proccessed`;
  if (task.errors.length > 0) {
    msg += `, with ${task.errors.length} errors`;
  }
  msg += '.';
  console.log('\x1b[33m%s\x1b[0m', msg);
}

async function runAll() {
  await Promise.all(tasks.map((x) => run(x)));
  const errors = {};
  for (const task of tasks) {
    errors[task.lang] = task.errors;
  }
  rw.writeText('error_img.json', errors);
  console.log(`All tasks completed`);
}

runAll();
