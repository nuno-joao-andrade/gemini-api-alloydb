const express = require('express');
const router = express.Router();
const pool = require('../lib/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PubSub } = require('@google-cloud/pubsub');

// Initialize AI and PubSub
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash",
  generationConfig: { responseMimeType: "application/json" } 
});
const pubSubClient = new PubSub({ projectId: process.env.GOOGLE_CLOUD_PROJECT });
const TOPIC_NAME = process.env.PUBSUB_TOPIC_NAME || 'negative-ratings';

// Helper function to analyze sentiment and publish if negative
async function analyzeAndPublish(rating) {
  try {
    // 1. Analyze with Gemini
    const prompt = `
      Analyze the sentiment of the following product review.
      
      Review Details:
      - Rating Value: ${rating.value}/5
      - Comments: "${rating.comments}"
      
      Task:
      Determine if the sentiment is NEGATIVE. A rating of 1 or 2 is usually negative.
      If it is NEGATIVE, draft a polite, empathetic, and professional customer service reply (max 2 sentences) addressing the user's concerns.
      
      Output JSON format:
      {
        "is_negative": boolean,
        "suggested_reply": string | null
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = JSON.parse(response.text());

    // 2. Publish to Pub/Sub if negative
    if (analysis.is_negative) {
      const payload = {
        rating_id: rating.rating_id,
        user_id: rating.user_id,
        rating_value: rating.value,
        comments: rating.comments,
        suggested_reply: analysis.suggested_reply,
        timestamp: new Date().toISOString()
      };

      const dataBuffer = Buffer.from(JSON.stringify(payload));
      try {
        const messageId = await pubSubClient.topic(TOPIC_NAME).publishMessage({ data: dataBuffer });
        console.log(`Negative rating detected. Published message ${messageId} to topic ${TOPIC_NAME}`);
      } catch (pubSubErr) {
        console.error(`Failed to publish to Pub/Sub topic ${TOPIC_NAME}:`, pubSubErr.message);
      }
    }
  } catch (err) {
    console.error('Error during AI analysis or Pub/Sub publishing:', err);
  }
}

// GET all ratings
router.get('/', async (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  const offset = parseInt(req.query.offset) || 0;
  try {
    const result = await pool.query('SELECT * FROM Ratings ORDER BY rating_id ASC LIMIT $1 OFFSET $2', [limit, offset]);
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
    const newRating = result.rows[0];
    
    // Async analysis (fire and forget to avoid blocking response)
    analyzeAndPublish(newRating);
    
    res.status(201).json(newRating);
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
    const updatedRating = result.rows[0];

    // Async analysis
    analyzeAndPublish(updatedRating);

    res.json(updatedRating);
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
