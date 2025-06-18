const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { from_user, amount, ewallet_type, ewallet_number } = req.body;
    try {
      await db.query('BEGIN');
      const sender = await db.query('SELECT balance FROM users WHERE id = $1', [from_user]);
      if (sender.rows.length === 0 || sender.rows[0].balance < amount) {
        throw new Error('Insufficient funds');
      }
      await db.query('UPDATE users SET balance = balance - $1 WHERE id = $2', [amount, from_user]);
      const trx = await db.query(
        'INSERT INTO transactions (from_user, amount, status, ewallet_type, ewallet_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [from_user, amount, 'SUCCESS', ewallet_type, ewallet_number]
      );
      await db.query('COMMIT');
      res.status(200).json({ trx: trx.rows[0], external: { status: 'SUCCESS', message: `Transfer ${amount} to ${ewallet_type}:${ewallet_number}` } });
    } catch (err) {
      await db.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).end();
  }
}