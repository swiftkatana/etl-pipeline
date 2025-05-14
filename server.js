// server.js
require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 8000;
const EVENTS_FILE = path.join(__dirname, 'events.log');

app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

// POST /liveEvent
app.post('/liveEvent', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== process.env.AUTH_SECRET) return res.status(403).send('Forbidden');

  try {
    const event = JSON.stringify(req.body);
    fs.appendFileSync(EVENTS_FILE, event + '\n');
    res.send('Event received');
  } catch (error) {
    console.error('Error writing event:', error);
    res.status(500).send('Internal server error');
  }
});

// GET /userEvents/:userId
app.get('/userEvents/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query('SELECT * FROM users_revenue WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) return res.status(404).send('User not found');
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('Database error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
