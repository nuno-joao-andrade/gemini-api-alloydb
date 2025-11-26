const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET all orders
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query('SELECT * FROM Orders ORDER BY order_id ASC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET order by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Orders WHERE order_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST new order
router.post('/', async (req, res) => {
  const { create_date, status, user_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Orders (create_date, status, user_id) VALUES ($1, $2, $3) RETURNING *',
      [create_date, status, user_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update order
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { create_date, status, user_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Orders SET create_date = $1, status = $2, user_id = $3 WHERE order_id = $4 RETURNING *',
      [create_date, status, user_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE order
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Orders WHERE order_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
