const fs = require('fs');
const path = require('path');
const EVENTS_FILE = path.join(__dirname, '../../../events.log');

function writeEvent(event) {
  fs.appendFileSync(EVENTS_FILE, JSON.stringify(event) + '\n');
}

module.exports = { writeEvent, EVENTS_FILE };
