module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS game_related (
        gid TEXT,
        rgid TEXT,
        UNIQUE (gid, rgid)
      );
  `,
  selectByGid: () => `SELECT * FROM game_related WHERE gid = ?`,
  insert: () => `INSERT OR IGNORE INTO game_related (gid, rgid) VALUES (?, ?)`,
  delete: () => `DELETE FROM game_related`,
};
