module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS track (
      id TEXT PRIMARY KEY,
      gid TEXT,
      idx INTEGER,
      duration TEXT,
      isloop INTEGER,
      isbest INTEGER,
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
      img_zh_TW TEXT
    );
  `,
  selectByIds: (ids) =>
    `SELECT * FROM track WHERE id in (${ids.map((id) => `'${id}'`).join(',')})`,
  selectByGid: () => `SELECT * FROM track WHERE gid = ? ORDER BY idx`,
  insert: (lang) => {
    lang = lang.replace('-', '_');
    return `
      INSERT INTO track (
        id, gid, idx, duration, isloop, isbest, title_${lang}, img_${lang}
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO
      UPDATE SET
        title_${lang}=excluded.title_${lang},
        img_${lang}=excluded.img_${lang}
    `;
  },
  delete: () => `DELETE FROM track`,
  deleteByGid: () => `DELETE FROM track WHERE gid = ?`,
};
