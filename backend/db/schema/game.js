module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS game (
      id TEXT PRIMARY KEY,
      year INTEGER,
      hardware TEXT,
      link TEXT,
      img TEXT,
      title_de_DE TEXT,
      title_en_US TEXT,
      title_es_ES TEXT,
      title_fr_FR TEXT,
      title_it_IT TEXT,
      title_ja_JP TEXT,
      title_ko_KR TEXT,
      title_zh_CN TEXT,
      title_zh_TW TEXT,
      inserted INTEGER
    );
  `,
  select: () => `SELECT * FROM game ORDER BY inserted DESC`,
  insert: (lang) => {
    lang = lang.replace('-', '_');
    return `
      INSERT INTO game (
        id, year, hardware, link, img, title_${lang}, inserted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET
        title_${lang}=excluded.title_${lang},
        link=excluded.link
    `;
  },
  delete: () => `DELETE FROM game`,
};
