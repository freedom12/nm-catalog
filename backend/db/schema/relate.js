module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS relate (
        gid TEXT,
        rgid TEXT
      );
  `,
  selectBy: () => `SELECT * FROM relate WHERE gid = ?`,
  insert: () => `INSERT INTO relate (gid, rgid) VALUES (?, ?)`,
  delete: () => `DELETE FROM relate`,
};
