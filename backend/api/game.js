const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const [game, track, relate] = [
  require('../db/schema/game'),
  require('../db/schema/track'),
  require('../db/schema/relate'),
];
const rw = require('../utils/rw');

function getGameList(groupBy = '') {
  const rows = db.prepare(game.selectGroupBy(groupBy)).all();
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

router.get('/recent', (req, res) => {
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

router.get('/hardware', async (req, res) => {
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

router.get('/release', async (req, res) => {
  getGameByYear()
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.status(500).json(err);
    });
});

router.get('/track/:id', (req, res) => {
  const id = req.params.id;
  const result = {};
  try {
    let rows = db.prepare(game.selectById()).all(id);
    result.game = rows[0];
    delete result.game.inserted;
    const gid = db.prepare(game.selectEntityById()).all(id)[0].id;
    rows = db.prepare(track.selectByGid()).all(gid);
    result.tracks = rows;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/relate/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const rgids = db
      .prepare(relate.selectByGid())
      .all(id)
      .map((x) => x.rgid);
    const linkids = db
      .prepare(game.selectLinkChainById())
      .all(id)
      .map((x) => x.id);
    const set = new Set([...rgids, ...linkids]);
    set.delete(id);
    const result = (await getGameByYear())
      .map((x) => x.games)
      .reduce((a, b) => [...a, ...b])
      .filter((x) => x.id !== id && (set.has(x.id) || set.has(x.link)));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
