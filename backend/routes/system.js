const express = require('express');
const router = express.Router();
const os = require('os');

router.get('/info', (req, res) => {
  res.json({
    platform: os.platform(),
    arch: os.arch(),
    memory: {
      total: os.totalmem(),
      free: os.freemem()
    },
    cpus: os.cpus().length,
    node: process.version,
    version: '1.0.0',
    uptime: process.uptime()
  });
});

router.get('/logs', (req, res) => {
  res.json({ logs: [] }); // placeholder
});

module.exports = router;
