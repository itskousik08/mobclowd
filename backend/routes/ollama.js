const express = require('express');
const router = express.Router();
const { getModels, checkOllama } = require('../services/ollama');

router.get('/models', async (req, res) => {
  try {
    const models = await getModels();
    res.json({ models });
  } catch (err) {
    res.status(503).json({ error: 'Ollama not available', details: err.message });
  }
});

router.get('/status', async (req, res) => {
  const ok = await checkOllama();
  res.json({ connected: ok, url: process.env.OLLAMA_URL || 'http://localhost:11434' });
});

module.exports = router;
