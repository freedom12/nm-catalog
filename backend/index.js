const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const routes = require('./routes');

const app = express();
app.use(compression());
app.use(cors());
app.use(express.json());
app.disable('x-powered-by');
routes(app);

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${port}`);
});
