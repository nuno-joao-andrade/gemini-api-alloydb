const express = require('express');
const router = express.Router();
const pool = require('../lib/db');

// GET user's order history with items
router.get('/:id/orders', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        o.order_id,
        o.create_date,
        o.status,
        json_agg(
          json_build_object(
            'item_id', i.item_id,
            'item_description', i.item_description,
            'item_value', i.item_value,
            'quantity', oi.quantity
          )
        ) AS items
      FROM Orders o
      JOIN Order_Items oi ON o.order_id = oi.order_id
      JOIN Items i ON oi.item_id = i.item_id
      WHERE o.user_id = $1
      GROUP BY o.order_id, o.create_date, o.status
      ORDER BY o.create_date DESC;
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      // Check if user exists to distinguish between no orders and invalid user
      const userCheck = await pool.query('SELECT 1 FROM Users WHERE user_id = $1', [id]);
      if (userCheck.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json([]); // User exists but has no orders
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
