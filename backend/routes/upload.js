const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const upload = multer({ dest: './files/' });

const { importdata } = require('../utils/import');

router.post('/', upload.array('files'), (req, res) => {
  const [files, desc] = [req.files, req.body.desc === 'true'];
  if (!files || files.length === 0) return res.status(400).send('No files uploaded');

  const result = importdata(
    files.map((file) => ({
      path: file.path,
      filename: file.originalname,
    })),
    desc,
    true
  );

  files.forEach((file) => {
    fs.unlinkSync(file.path);
  });

  res.json(result);
});

module.exports = router;
