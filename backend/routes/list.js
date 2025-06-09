const express = require('express');
const router = express.Router();
const db = require('../db');
const [lang, hardware] = [require('../db/schema/lang'), require('../db/schema/hardware')];

router.get('/lang', (req, res) => {
  try {
    const stmt = db.prepare(lang.select());
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', (req, res) => {
  try {
    const stmt = db.prepare(hardware.select());
    const rows = stmt.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
