const express = require('express');
const router = express.Router();
const { TEMPLATES_LIST } = require('../services/templates');

router.get('/', (req, res) => {
  res.json({ templates: TEMPLATES_LIST });
});

module.exports = router;
