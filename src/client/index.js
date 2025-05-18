require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const axios = require('axios');
const chokidar = require('chokidar');
const net = require('net');
const logger = require('../utils/logger');

const FILE_PATH = './events.jsonl';
const SERVER_PORT = process.env.PORT || 8000;
const SERVER_URL = `http://localhost:${SERVER_PORT}/liveEvent`;

function waitForServer(port, retries = 10, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const socket = net.createConnection(port, '127.0.0.1');
      socket.once('connect', () => {
        socket.end();
        resolve();
      });
      socket.once('error', () => {
        attempts++;
        if (attempts >= retries) return reject(new Error('Server not available'));
        setTimeout(check, delay);
      });
    };
    check();
  });
}

async function sendEvents() {
  if (!fs.existsSync(FILE_PATH)) {
    logger.error('Events file not found:', FILE_PATH);
    return;
  }
  const rl = readline.createInterface({
    input: fs.createReadStream(FILE_PATH),
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    try {
      const event = JSON.parse(line);
      await axios.post(SERVER_URL, event, {
        headers: { Authorization: process.env.AUTH_SECRET }
      });
      logger.log('Event sent:', event);
    } catch (err) {
      logger.error('Error sending event:', err.message);
    }
  }
}

(async () => {
  try {
    await waitForServer(SERVER_PORT);
    logger.log('Server is ready, sending events from file...');
    await sendEvents();

    logger.log('Watching for file changes...');
    chokidar.watch(FILE_PATH).on('change', () => {
      logger.log('File changed. Re-sending events...');
      sendEvents();
    });
  } catch (err) {
    logger.error('Startup error:', err.message);
  }
})();
