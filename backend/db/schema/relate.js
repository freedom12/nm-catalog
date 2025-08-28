module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS relate (
        gid TEXT,
        rgid TEXT,
        UNIQUE (gid, rgid)
      );
  `,
  selectByGid: () => `SELECT * FROM relate WHERE gid = ?`,
  insert: () => `INSERT OR IGNORE INTO relate (gid, rgid) VALUES (?, ?)`,
  delete: () => `DELETE FROM relate`,
};
