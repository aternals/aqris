const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { user_id, amount } = req.body;
    try {
      await db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, user_id]);
      const user = await db.query('SELECT * FROM users WHERE id = $1', [user_id]);
      res.status(200).json(user.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end();
  }
}