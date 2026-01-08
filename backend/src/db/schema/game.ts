import { LangCodeValue, GameGroupBy } from '@nm-catalog/shared';
import { DBTableConfig } from './index.js';

const tbGame: DBTableConfig = {
  create: () => `
    CREATE TABLE IF NOT EXISTS game (
      id TEXT PRIMARY KEY,
      year INTEGER,
      hardware TEXT,
      link TEXT,
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
      inserted INTEGER
    );
  `,
  select: () => `SELECT * FROM game ORDER BY inserted DESC`,
  selectById: () => `SELECT * FROM game WHERE id = ?`,
  selectByIds: (ids: string[] = [], excludeLink = false) =>
    `SELECT * FROM game WHERE id in (${ids.map((id) => `'${id}'`).join(',')})${
      excludeLink ? ` and link == ''` : ''
    } ORDER BY inserted`,
  selectEntityById: () => `
    WITH RECURSIVE chain AS (
      SELECT *
      FROM game
      WHERE id = ?

      UNION ALL

      SELECT t.*
      FROM game t
      JOIN chain c ON t.id = c.link
    )
    SELECT *
    FROM chain
    WHERE link = ''`,
  selectLinkChainById: () => `
    WITH RECURSIVE chain(id, link, visited) AS (
      SELECT id, link, id
      FROM game
      WHERE id = ?

      UNION ALL
      
      SELECT t.id, t.link, c.visited || ',' || t.id
      FROM game t
      JOIN chain c ON t.id = c.link
      WHERE instr(c.visited, t.id) = 0

      UNION ALL

      SELECT t.id, t.link, c.visited || ',' || t.id
      FROM game t
      JOIN chain c ON t.link = c.id
      WHERE instr(c.visited, t.id) = 0
    )
    SELECT DISTINCT id, link
    FROM chain`,
  selectGroupBy: (groupBy: GameGroupBy) => {
    switch (groupBy) {
      case 'PLATFORM':
        return `SELECT * FROM game t1 INNER JOIN hardware t2 ON t1.hardware=t2.name ORDER BY t2.year desc, inserted DESC`;
      case 'RELEASE':
        return `SELECT * FROM game ORDER BY year desc, inserted DESC`;
      case 'ADDED':
        return `SELECT * FROM game ORDER BY inserted DESC`;
    }
  },
  insert: (lang: LangCodeValue) => {
    const sLang = lang.replace('-', '_');
    return `
      INSERT INTO game (
        id, year, hardware, link, title_${sLang}, img_${sLang}, inserted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET
        title_${sLang}=excluded.title_${sLang},
        img_${sLang}=excluded.img_${sLang},
        link=excluded.link
    `;
  },
  delete: () => `DELETE FROM game`,
};

export default tbGame;
