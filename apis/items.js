const express = require('express');
const router = express.Router();
const pool = require('../lib/db');
const { GoogleGenAI } = require('@google/genai');

// Initialize Gemini API
const client = new GoogleGenAI({vertexai: true, apiKey:process.env.GOOGLE_API_KEY});

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

// GET top complaints for an item using Gemini AI
router.get('/:id/top-complaints', async (req, res) => {
  const { id } = req.params;

  

  try {
    // 1. Fetch comments from AlloyDB
    // We join Ratings with Order_Items to filter by item_id
    const result = await pool.query(
      `SELECT r.comments
       FROM Ratings r
       JOIN Order_Items oi ON r.order_items_id = oi.order_items_id
       WHERE oi.item_id = $1
       AND r.comments IS NOT NULL
       AND length(r.comments) > 0
       LIMIT 100`, // Increased limit for better analysis context
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ message: 'No comments found for this item to analyze.' });
    }

    // Concatenate comments for the prompt
    const comments = result.rows.map(row => `- ${row.comments}`).join('\n');

    // 2. Analyze with Gemini API
    // We ask for a structured summary of the top 3 complaints
    const prompt = `
      You are an expert product analyst. Analyze the following customer reviews for a product.
      Identify the top 3 most frequent complaints or recurring negative themes.
      
      Reviews:
      ${comments}
      
      Please provide the output in this exact format:
      1. **[Issue Title]**: [Concise summary of the issue]
      2. **[Issue Title]**: [Concise summary of the issue]
      3. **[Issue Title]**: [Concise summary of the issue]
    `;

    // Check if API key is present for GoogleGenAI
    if (!process.env.GOOGLE_API_KEY) {
      return res.status(500).json({ error: 'GOOGLE_API_KEY is not set in environment variables.' });
    }

    const aiResult = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    console.log()
    const text = aiResult.text;

    res.json({
      item_id: id,
      analysis: text
    });

  } catch (err) {
    console.error('Error in /top-complaints:', err);
    // Check if it's an API related error
    if (err.message && err.message.includes('API key')) {
         res.status(500).json({ error: 'Invalid or missing Gemini API Key.' });
    } else {
         res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  }
});

// GET average rating for an item
router.get('/:id/average-rating', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT AVG(r.value) as average_rating
       FROM Ratings r
       JOIN Order_Items oi ON r.order_items_id = oi.order_items_id
       WHERE oi.item_id = $1`,
      [id]
    );
    res.json(result.rows[0]);
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
