const express = require('express');
const router = express.Router();

const listRoutes = require('./list');
const gameRoutes = require('./game');
const playlistRoutes = require('./playlist');
const uploadRoutes = require('./upload');
const proxyRoutes = require('./proxy');

router.use('/list', listRoutes);
router.use('/game', gameRoutes);
router.use('/playlist', playlistRoutes);
router.use('/upload', uploadRoutes);
router.use('/proxy', proxyRoutes);

module.exports = router;
