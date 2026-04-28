const express = require('express')
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static('public'))

// DB
const db = new sqlite3.Database('./data.db');

// crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS clicks (
    user_id TEXT PRIMARY KEY,
    count INTEGER
  )
`);

let contador = 0;

app.listen(PORT, () => {
  console.log('Servidor corriendo');
});

app.get('/click', (req, res) => {
  console.log(req.query)
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'missing userId' });
  }

  db.get(
    "SELECT count FROM clicks WHERE user_id = ?",
    [userId],
    (err, row) => {

      if (!row) {
        db.run(
          "INSERT INTO clicks (user_id, count) VALUES (?, 1)",
          [userId],
          () => res.json({ count: 1 })
        );
      } else {
        const newCount = row.count + 1;

        db.run(
          "UPDATE clicks SET count = ? WHERE user_id = ?",
          [newCount, userId],
          () => res.json({ count: newCount })
        );
      }

    }
  );
});

app.get('/count', (req, res) => {
  db.get("SELECT count as total FROM clicks", (err, row) => {
    res.json({ count: row.total || 0 });
  });
});