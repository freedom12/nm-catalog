const axios = require('axios');

async function request(url) {
  console.log(`Fetch: ${url}`);
  const res = await axios.get(url);
  return res.data;
}

function info(message) {
  console.log('\x1b[32m%s\x1b[0m', message);
}

module.exports = { request, info };
