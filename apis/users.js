const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET all users
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query('SELECT * FROM Users ORDER BY user_id ASC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET user by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE user_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST new user
router.post('/', async (req, res) => {
  const { name, email, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Users (name, email, status) VALUES ($1, $2, $3) RETURNING *',
      [name, email, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update user
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Users SET name = $1, email = $2, status = $3 WHERE user_id = $4 RETURNING *',
      [name, email, status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Users WHERE user_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
