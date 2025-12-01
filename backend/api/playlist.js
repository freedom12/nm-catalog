const express = require('express');
const router = express.Router();
const stmt = require('../db/statements');

router.get('/:id/detail', (req, res) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById.all(id)[0];
    const games = [];
    const tracks = [];

    if (playlist.isrelatedgame) {
      games.push(...stmt.playlist_game.selectGameByPid.all(id));

      if (playlist.type === 'MULTIPLE') {
        const ptIds = stmt.playlist_track.selectTrackByPid.all(id).map((x) => x.id);
        const pTracks = stmt
          .sql(
            `select * from track where id in (${ptIds.map((x) => `'${x}'`).join(',')})`
          )
          .all()
          .sort((a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id));
        tracks.push(...pTracks);
      } else {
        const allTracks = stmt.track.selectByGid.all(games[0].id);
        if (playlist.type !== 'SINGLE_GAME') {
          tracks.push(
            ...allTracks.filter((x) => {
              switch (playlist.type) {
                case 'SINGLE_GAME_ALL':
                  return true;
                case 'BEST':
                  return x.isbest;
                case 'LOOP':
                  return x.isloop;
              }
            })
          );
        } else {
          const ptIds = stmt.playlist_track.selectTrackByPid.all(id).map((x) => x.id);
          tracks.push(
            ...allTracks
              .filter((x) => ptIds.includes(x.id))
              .sort((a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id))
          );
        }
      }
    } else {
      // TODO
    }

    const result = {
      playlist: playlist,
      games: games,
      tracks: tracks,
    };
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
