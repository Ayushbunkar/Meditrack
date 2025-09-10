// Simple Gemini API proxy for CORS
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' + GEMINI_API_KEY;

app.post('/gemini', async (req, res) => {
  try {
    const response = await axios.post(GEMINI_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Gemini proxy server running on port ${PORT}`);
});
