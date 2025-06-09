const express = require('express');
const router = express.Router();
const db = require('../db');
const [game, track] = [require('../db/schema/game'), require('../db/schema/track')];

router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(game.select());
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  try {
    const stmt = db.prepare(track.select());
    const rows = stmt.all(id);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
