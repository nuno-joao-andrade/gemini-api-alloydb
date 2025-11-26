const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET all ratings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Ratings ORDER BY rating_id ASC LIMIT 100');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET rating by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM Ratings WHERE rating_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST new rating
router.post('/', async (req, res) => {
  const { value, comments, user_id, order_items_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Ratings (value, comments, user_id, order_items_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [value, comments, user_id, order_items_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT update rating
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { value, comments, user_id, order_items_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Ratings SET value = $1, comments = $2, user_id = $3, order_items_id = $4 WHERE rating_id = $5 RETURNING *',
      [value, comments, user_id, order_items_id, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE rating
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM Ratings WHERE rating_id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Rating not found' });
    }
    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
