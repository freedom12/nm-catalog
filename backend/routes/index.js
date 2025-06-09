const listRoutes = require('./list');
const gameRoutes = require('./game');
const uploadRoutes = require('./upload');

module.exports = (app) => {
  app.use('/api/list', listRoutes);
  app.use('/api/game', gameRoutes);
  app.use('/api/upload', uploadRoutes);
};
