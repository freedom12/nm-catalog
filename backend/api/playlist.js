const express = require('express');
const router = express.Router();
const stmt = require('../db/statements');

router.get('/:id/detail', (req, res) => {
  const id = req.params.id;
  try {
    const playlist = stmt.playlist.selectById.all(id)[0];
    const games = [];
    const tracks = [];

    if (['SINGLE_GAME_ALL', 'BEST', 'LOOP'].includes(playlist.type)) {
      games.push(...stmt.playlist_game.selectGameByPid.all(id));

      const allTracks = stmt.track.selectByGid.all(games[0].id);
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
      if (playlist.tracksnum) {
        if (playlist.isrelatedgame) {
          games.push(...stmt.playlist_game.selectGameByPid.all(id));
        }

        const ptIds = stmt.playlist_track.selectTrackByPid.all(id).map((x) => x.id);
        const pTracks = stmt.track
          .selectByIds(ptIds)
          .all()
          .sort((a, b) => ptIds.indexOf(a.id) - ptIds.indexOf(b.id));
        tracks.push(...pTracks);
      } else {
        // const sUtc9 = now.toLocaleString('en-US', {
        //   timeZone: 'Asia/Tokyo',
        // });
        // # daily order (response/playlist_(pid).json)
      }
    }

    tracks.forEach((x, i) => {
      x.pidx = i + 1;
    });

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
