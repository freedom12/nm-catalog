import { LangCodeValue } from '@nm-catalog/shared';
import { DBTableConfig } from './index.js';

const tbPlaylist: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS playlist (
      id TEXT PRIMARY KEY,
      type TEXT,
      isrelatedgame INTEGER,
      tracksnum INTEGER,
      title_de_DE TEXT,
      title_en_US TEXT,
      title_es_ES TEXT,
      title_fr_FR TEXT,
      title_it_IT TEXT,
      title_ja_JP TEXT,
      title_ko_KR TEXT,
      title_zh_CN TEXT,
      title_zh_TW TEXT,
      img_de_DE TEXT,
      img_en_US TEXT,
      img_es_ES TEXT,
      img_fr_FR TEXT,
      img_it_IT TEXT,
      img_ja_JP TEXT,
      img_ko_KR TEXT,
      img_zh_CN TEXT,
      img_zh_TW TEXT,
      desc_de_DE TEXT,
      desc_en_US TEXT,
      desc_es_ES TEXT,
      desc_fr_FR TEXT,
      desc_it_IT TEXT,
      desc_ja_JP TEXT,
      desc_ko_KR TEXT,
      desc_zh_CN TEXT,
      desc_zh_TW TEXT
    );
  `,
  selectById: () => `SELECT * FROM playlist WHERE id = ?`,
  selectByIds: (ids: string[] = []) =>
    `SELECT * FROM playlist WHERE id in (${ids.map((id) => `'${id}'`).join(',')})`,
  selectByGid: () => `
    SELECT p.*
    FROM playlist p
    INNER JOIN playlist_game pg ON p.id = pg.pid
    WHERE pg.gid = ?
    ORDER BY
      CASE p.type
        WHEN 'SINGLE_GAME_ALL' THEN 1
        WHEN 'BEST' THEN 2
        WHEN 'LOOP' THEN 3
        WHEN 'SINGLE_GAME' THEN 4
        ELSE 99
      END;
  `,
  insert: (lang: LangCodeValue) => {
    const sLang = lang.replace('-', '_');
    return `
      INSERT INTO playlist (
        id, type, isrelatedgame, tracksnum, title_${sLang}, img_${sLang}, desc_${sLang}
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET
        title_${sLang}=excluded.title_${sLang},
        img_${sLang}=excluded.img_${sLang},
        desc_${sLang}=excluded.desc_${sLang}
    `;
  },
  delete: () => `DELETE FROM playlist`,
};

export default tbPlaylist;
