const path = require('path');
const Database = require('better-sqlite3');
const [playlist, playlist_game, playlist_track] = [
  require('../schema/playlist'),
  require('../schema/playlist_game'),
  require('../schema/playlist_track'),
];

function update() {
  const dbPath = path.join(__dirname, '../../files/data.db');
  const db = new Database(dbPath);
  const sqlList = [
    playlist.create(),
    playlist_game.create(),
    playlist_track.create(),
    `CREATE INDEX idx_game_hardware ON game(hardware)`,
    `CREATE INDEX idx_track_gid ON track(gid)`,
    `CREATE INDEX idx_track_gid_idx ON track(gid, idx)`,
    `CREATE INDEX idx_playlist_type ON playlist(type)`,
    `CREATE INDEX idx_playlist_game_pid ON playlist_game(pid)`,
    `CREATE INDEX idx_playlist_game_gid ON playlist_game(gid)`,
    `CREATE INDEX idx_playlist_track_pid_idx ON playlist_track(pid, idx)`,
  ];
  const trans = db.transaction(() => {
    for (const sql of sqlList) {
      db.exec(sql);
    }
  });
  trans();
  db.close();
}

module.exports = update;
