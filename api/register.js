const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, phone } = req.body;
    try {
      const result = await db.query(
        'INSERT INTO users (username, phone, balance) VALUES ($1, $2, $3) RETURNING *',
        [username, phone, 0]
      );
      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end();
  }
}