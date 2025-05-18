require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const pool = require('../config/db');
const { EVENTS_FILE } = require('../server/services/fileWriter');
const logger = require('../utils/logger');

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
      logger.log('ETL process complete.');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error('Transaction error:', err);
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error('ETL error:', err);
  } finally {
    await pool.end();
  }
})();
