module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS track (
      id TEXT PRIMARY KEY,
      gid TEXT,
      idx INTEGER,
      duration TEXT,
      isloop INTEGER,
      isbest INTEGER,
      img TEXT,
      title_de_DE TEXT,
      title_en_US TEXT,
      title_es_ES TEXT,
      title_fr_FR TEXT,
      title_it_IT TEXT,
      title_ja_JP TEXT,
      title_ko_KR TEXT,
      title_zh_CN TEXT,
      title_zh_TW TEXT
    );
  `,
  select: () => `SELECT * FROM track WHERE gid = ? ORDER BY idx`,
  insert: (lang) => {
    lang = lang.replace('-', '_');
    return `
      INSERT INTO track (
        id, gid, idx, duration, isloop, isbest, img, title_${lang}
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET title_${lang}=excluded.title_${lang}
    `;
  },
  delete: () => `DELETE FROM track`,
};
