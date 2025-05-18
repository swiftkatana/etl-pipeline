require('dotenv').config();
const express = require('express');
const eventsRouter = require('./routes/events');
const logger = require('../utils/logger');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use('/', eventsRouter);

app.listen(port, () => {
  logger.log(`Server running at http://localhost:${port}`);
});
