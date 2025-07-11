const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../db');
const [game, track] = [require('../db/schema/game'), require('../db/schema/track')];
const rw = require('../utils/rw');

function getGameList(groupBy = '') {
  const stmt = db.prepare(game.selectGroupBy(groupBy));
  const rows = stmt.all();
  rows.forEach((x) => {
    delete x.inserted;
  });
  return rows;
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
          if (!last || last.name !== x.year) {
            result.push({
              name: x.year,
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
    res.json(JSON.parse(data));
  }
});

router.get('/track/:id', (req, res) => {
  const id = req.params.id;
  const result = {};
  try {
    let stmt = db.prepare(game.selectBy());
    let rows = stmt.all(id);
    result.game = rows[0];
    delete result.game.inserted;
    stmt = db.prepare(track.selectBy());
    rows = stmt.all(result.game.link || result.game.id);
    result.tracks = rows;
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
