const axios = require('axios');

const request = async (url) => {
  console.log(`Fetch: ${url}`);
  const res = await axios.get(url);
  return res.data;
};

const info = (message) => {
  console.log('\x1b[32m%s\x1b[0m', message);
};

const getDuration = (ms) => {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`;
};

module.exports = { request, info, getDuration };
