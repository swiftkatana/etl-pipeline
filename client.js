// client.js
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const axios = require('axios');

const FILE_PATH = './events.jsonl';
const SERVER_URL = `http://localhost:${process.env.PORT || 8000}/liveEvent`;

const rl = readline.createInterface({
  input: fs.createReadStream(FILE_PATH),
  crlfDelay: Infinity
});

rl.on('line', async (line) => {
  try {
    const event = JSON.parse(line);
    await axios.post(SERVER_URL, event, {
      headers: { Authorization: process.env.AUTH_SECRET }
    });
    console.log('Event sent:', event);
  } catch (err) {
    console.error('Error sending event:', err.message);
  }
});
