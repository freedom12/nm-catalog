const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: './files/' });

const { importdata } = require('../utils/import');

router.post('/', upload.array('files'), (req, res) => {
  const [files, desc, fullUpdate] = [req.files, req.body.desc === 'true', req.body.fullUpdate === 'true'];
  if (!files || files.length === 0) return res.status(400).send('No files uploaded');

  try {
    const result = importdata(
      files.map((file) => ({
        path: file.path,
        filename: file.originalname,
      })),
      { descend: desc, fullUpdate: fullUpdate }
    );
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    files.forEach((file) => {
      fs.unlinkSync(file.path);
    });
  }
});

module.exports = router;
