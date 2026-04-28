const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// CONEXIÓN A SUPABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en puerto', PORT);
});

app.get('/count', async (req, res) => {
  const result = await pool.query(
    'SELECT SUM(count) as total FROM clicks'
  );

  res.json({ count: result.rows[0].total || 0 });
});

app.get('/click', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'missing userId' });
  }

  try {
    const result = await pool.query(
      'SELECT count FROM clicks WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      await pool.query(
        'INSERT INTO clicks (user_id, count) VALUES ($1, 1)',
        [userId]
      );

      return res.json({ count: 1 });
    }

    const newCount = result.rows[0].count + 1;

    await pool.query(
      'UPDATE clicks SET count = $1 WHERE user_id = $2',
      [newCount, userId]
    );

    res.json({ count: newCount });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'db error' });
  }
});