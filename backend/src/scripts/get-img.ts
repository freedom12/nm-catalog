/*
  Download images (run both [pull-game] and [pull-playlist] first)
  
  -- original    # also download original images
  -- error       # download images of previous error tasks
  -- --dir=xxx   # set target directory for compressed images
*/

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import sharp from 'sharp';
import pLimit from 'p-limit';
import { DEFAULT_LANG, LangCode, LangCodeValue } from '@nm-catalog/shared';
import { stmt } from '../db/statements.js';
import { COMMON_PATHS, FILES_DIR, ROOT_DIR } from '../utils/paths.js';
import { info, readText, toError, writeText } from '../utils/tools.js';
import { DataRow } from '../db/schema/index.js';

type Task = {
  lang: LangCodeValue;
  imgIds: string[];
  originalDir: string;
  compressedDir: string;
  errors: string[];
};

const args = process.argv.slice(2);
const isSaveOriginal = args.includes('original');
const isDownloadError = args.includes('error');

let langs = Object.values(LangCode);
const targetLangs = langs.filter((x) => args.includes(x));
if (!targetLangs.length) {
  const enIdx = langs.indexOf(DEFAULT_LANG);
  [langs[0], langs[enIdx]] = [langs[enIdx], langs[0]];
} else {
  langs = targetLangs;
}

let [palylistIds, sectionPalylistIds]: [string[], string[]] = [[], []];
try {
  const updateds = JSON.parse(readText(COMMON_PATHS['updated_playlist.json']));
  palylistIds = updateds.playlistIds ?? [];
  sectionPalylistIds = updateds.sectionPlaylistIds ?? [];
} catch (error) {}

const sGameIds = readText(COMMON_PATHS['new_game.json']).slice(1, -1).replace(/"/g, `'`);
const tasks: Task[] = [];
const sPalylistIds = palylistIds.map((x: string) => `'${x}'`).join(',');
const sSectionPalylistIds = sectionPalylistIds.map((x: string) => `'${x}'`).join(',');

for (const lang of langs) {
  let imgIds = [];

  if (!isDownloadError) {
    const langStr = lang.replace('-', '_');
    const diff = lang.includes('en') ? '' : `and img_${langStr} <> img_en_US`;
    const sql = `
        select img_${langStr} from game where id in (${sGameIds}) ${diff} 
        union select img_${langStr} from track where gid in (${sGameIds}) ${
      !sSectionPalylistIds
        ? ''
        : `or id in (select tid from playlist_track t1 inner join playlist t2 on t1.pid=t2.id where t2.type='SPECIAL' and t1.pid in (${sSectionPalylistIds}))`
    } ${diff}
        union select img_${langStr} from playlist where id in (${[
      sPalylistIds,
      sSectionPalylistIds,
    ]
      .filter((x) => x)
      .join(',')}) ${diff}
      `;
    imgIds = stmt
      .sql(sql)
      .all()
      .map((x) => (<DataRow>x)[`img_${langStr}`]);
  } else {
    const errors = JSON.parse(readText(COMMON_PATHS['error_img.json']));
    imgIds = errors[lang];
  }

  const originalDir = path.join(ROOT_DIR, '../assets/original_images', `${lang}`);
  const compressedDir = path.join(ROOT_DIR, '../assets/new', `img_${lang}`);
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
info(`To download ${sum} image(s).`);

const processImage = async (imgId: string, index: number, task: Task) => {
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
  } catch (error) {
    const err = toError(error);
    console.error(`❌ ${task.lang}-${index + 1} (${imgId}): ${err.message}`);
    task.errors.push(imgId);
  }
};

const run = async (task: Task) => {
  const limit = pLimit(5);
  const tasks = task.imgIds.map((id, idx) => limit(() => processImage(id, idx, task)));
  await Promise.all(tasks);
  let msg = `${task.lang}: All tasks proccessed`;
  if (task.errors.length > 0) {
    msg += `, with ${task.errors.length} errors`;
  }
  msg += '.';
  info(msg);
};

const runAll = async () => {
  await Promise.all(tasks.map((x) => run(x)));
  const errors: Record<string, string[]> = {};
  for (const task of tasks) {
    errors[task.lang] = task.errors;
  }
  writeText(COMMON_PATHS['error_img.json'], errors);
  console.log(`All tasks completed`);
};

runAll();
