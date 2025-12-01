const express = require('express');
const router = express.Router();
const axios = require('axios');
const stmt = require('../db/statements');
const rw = require('../utils/rw');

function getGameList(groupBy = '') {
  const rows = stmt.game.selectGroupBy(groupBy).all();
  rows.forEach((x) => {
    delete x.inserted;
  });
  return rows;
}

function getGameByYear() {
  return new Promise(async (resolve, reject) => {
    const fileName = 'res-year.json';
    const data = rw.readText(fileName);

    if (!data) {
      let gameList;

      try {
        gameList = getGameList('year');
        const result = (
          await axios.get(
            `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=RELEASEDAT&lang=en-US`
          )
        ).data.releasedAt.map((x) => ({
          name: x.releasedYear,
          games: x.items
            .map((y) => gameList.find((z) => z.id === y.id))
            .filter((y) => !!y),
        }));
        rw.writeText(fileName, result);
        resolve(result);
      } catch (err) {
        const msg = err.message;

        try {
          const result = [];
          gameList.forEach((x) => {
            const last = result[result.length - 1];
            if (!last || last.name !== x.year) {
              result.push({
                name: x.year,
                games: [x],
              });
            } else {
              last.games.push(x);
            }
          });
          resolve(result);
        } catch (err) {
          reject({
            'Nintendo error': msg,
            'Local error': err.message,
          });
        }
      }
    } else {
      resolve(JSON.parse(data));
    }
  });
}

router.get('/recent', (_, res) => {
  try {
    const result = getGameList();
    res.json([
      {
        name: '',
        games: result,
      },
    ]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', async (_, res) => {
  const fileName = 'res-platform.json';
  const data = rw.readText(fileName);

  if (!data) {
    let gameList;

    try {
      gameList = getGameList('hardware');
      const result = (
        await axios.get(
          `https://api.m.nintendo.com/catalog/gameGroups?country=JP&groupingPolicy=HARDWARE&lang=en-US`
        )
      ).data.hardware.map((x) => ({
        name: x.formalHardware,
        games: x.items.map((y) => gameList.find((z) => z.id === y.id)).filter((y) => !!y),
      }));
      rw.writeText(fileName, result);
      res.json(result);
    } catch (err) {
      const msg = err.message;

      try {
        const result = [];
        gameList.forEach((x) => {
          const last = result[result.length - 1];
          if (!last || last.name !== x.hardware) {
            result.push({
              name: x.hardware,
              games: [x],
            });
          } else {
            last.games.push(x);
          }
        });
        res.json(result);
      } catch (err) {
        res.status(500).json({
          'Nintendo error': msg,
          'Local error': err.message,
        });
      }
    }
  } else {
    return res.json(JSON.parse(data));
  }
});

router.get('/release', async (_, res) => {
  getGameByYear()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get('/:id/detail', async (req, res) => {
  const id = req.params.id;
  try {
    const [game, tracks, playlists, relates] = await Promise.all([
      new Promise((resolve, reject) => {
        try {
          const result = stmt.game.selectById.all(id)[0];
          delete result.inserted;
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = stmt.game.selectEntityById.all(id)[0].id;
          const result = stmt.track.selectByGid.all(gid);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }),

      new Promise((resolve, reject) => {
        try {
          const gid = stmt.game.selectEntityById.all(id)[0].id;
          const result = stmt.playlist.selectByGid.all(gid);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }),

      new Promise(async (resolve, reject) => {
        try {
          const rgids = stmt.game_related.selectByGid.all(id).map((x) => x.rgid);
          const linkIds = stmt.game.selectLinkChainById.all(id).map((x) => x.id);
          const linkRgids = [];
          if (linkIds.length > 0) {
            const validLinkIds = linkIds.filter((x) => x !== id);
            for (const linkId of validLinkIds) {
              const linkGameIds = stmt.game.selectLinkChainById
                .all(linkId)
                .map((x) => x.id)
                .filter((x) => x !== id);
              linkRgids.push(
                ...linkGameIds
                  .map((x) => stmt.game_related.selectByGid.all(x).map((y) => y.rgid))
                  .flat()
              );
            }
          }
          const set = new Set([...rgids, ...linkIds, ...linkRgids]);
          set.delete(id);
          const result = (await getGameByYear())
            .map((x) => x.games)
            .reduce((a, b) => [...a, ...b])
            .filter((x) => x.id !== id && (set.has(x.id) || set.has(x.link)));
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }),
    ]);

    const result = {
      game: game,
      tracks: tracks,
      playlists: playlists,
      relateds: relates,
    };
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
