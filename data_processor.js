// data_processor.js
require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');

const EVENTS_FILE = './events.log';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT, 10),
});

(async () => {
  const revenueMap = {};

  const rl = readline.createInterface({
    input: fs.createReadStream(EVENTS_FILE),
    crlfDelay: Infinity
  });

  try {
    for await (const line of rl) {
      const { userId, name, value } = JSON.parse(line);
      const amount = name === 'add_revenue' ? value : -value;
      revenueMap[userId] = (revenueMap[userId] || 0) + amount;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const [userId, delta] of Object.entries(revenueMap)) {
        await client.query(`
          INSERT INTO users_revenue (user_id, revenue)
          VALUES ($1, $2)
          ON CONFLICT (user_id)
          DO UPDATE SET revenue = users_revenue.revenue + $2;
        `, [userId, delta]);
      }
      await client.query('COMMIT');
      console.log('Data processing complete.');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction failed:', error);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error processing events:', error);
  } finally {
    await pool.end();
  }
})();
