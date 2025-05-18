const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const { writeEvent } = require('../services/fileWriter');
const logger = require('../../utils/logger');

router.post('/liveEvent', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== process.env.AUTH_SECRET) {
    logger.error('Unauthorized access attempt');
    return res.status(403).send('Forbidden');
  }

  try {
    writeEvent(req.body);
    logger.log('Event logged:', req.body);
    res.send('Event received');
  } catch (error) {
    logger.error('Error writing event:', error);
    res.status(500).send('Internal server error');
  }
});

router.get('/userEvents/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query('SELECT * FROM users_revenue WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    logger.error('Database error:', err);
    res.status(500).send('Database error');
  }
});

module.exports = router;
