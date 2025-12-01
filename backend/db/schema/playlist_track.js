module.exports = {
  create: () => `
    CREATE TABLE IF NOT EXISTS playlist_track (
      pid TEXT,
      idx INTEGER,
      tid TEXT,
      UNIQUE (pid, tid)
    );
  `,
  selectTrackByPid: () => `
    SELECT t.*
    FROM playlist_track pt
    INNER JOIN track t ON pt.tid = t.id
    WHERE pt.pid = ?
    ORDER BY pt.idx
  `,
  insert: () => `INSERT OR IGNORE INTO playlist_track (pid, idx, tid) VALUES (?, ?, ?)`,
  deleteByPid: () => `DELETE FROM playlist_track WHERE pid = ?`,
};
