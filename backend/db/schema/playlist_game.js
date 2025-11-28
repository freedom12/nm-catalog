module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS playlist_game (
        pid TEXT,
        gid TEXT,
        UNIQUE (pid, gid)
      );
  `,
  selectGameByPid: () => `
    SELECT g.*
    FROM playlist_game pg
    INNER JOIN game g ON pg.gid = g.id
    WHERE pg.pid = ?
  `,
  insert: () => `INSERT OR IGNORE INTO playlist_game (pid, gid) VALUES (?, ?)`,
  delete: () => `DELETE FROM playlist_game`,
};
