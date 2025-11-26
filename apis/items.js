const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET all items
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query('SELECT * FROM Items ORDER BY item_id ASC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET item by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Items WHERE item_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST new item
router.post('/', async (req, res) => {
  const { item_description, item_value } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Items (item_description, item_value) VALUES ($1, $2) RETURNING *',
      [item_description, item_value]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { item_description, item_value } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Items SET item_description = $1, item_value = $2 WHERE item_id = $3 RETURNING *',
      [item_description, item_value, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Items WHERE item_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
