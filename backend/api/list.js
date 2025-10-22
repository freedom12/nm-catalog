const express = require('express');
const router = express.Router();
const stmt = require('../db/statements');

router.get('/lang', (_, res) => {
  try {
    const rows = stmt.lang.select.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/hardware', (_, res) => {
  try {
    const rows = stmt.hardware.select.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
