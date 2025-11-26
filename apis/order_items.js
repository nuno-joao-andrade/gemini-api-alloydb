const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET all order items
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Order_Items ORDER BY order_items_id ASC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET order item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Order_Items WHERE order_items_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST new order item
router.post('/', async (req, res) => {
  const { order_id, item_id, quantity } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Order_Items (order_id, item_id, quantity) VALUES ($1, $2, $3) RETURNING *',
      [order_id, item_id, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update order item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { order_id, item_id, quantity } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Order_Items SET order_id = $1, item_id = $2, quantity = $3 WHERE order_items_id = $4 RETURNING *',
      [order_id, item_id, quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE order item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Order_Items WHERE order_items_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order Item not found' });
    }
    res.json({ message: 'Order Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
