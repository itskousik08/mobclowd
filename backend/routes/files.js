const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

function getProjectDir(app, projectId) {
  return path.join(app.get('workspaceDir'), projectId);
}

function safePath(base, rel) {
  const full = path.resolve(base, rel);
  if (!full.startsWith(base)) throw new Error('Path traversal detected');
  return full;
}

// GET file content
router.get('/:projectId/*', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.params[0];
    const full = safePath(projectDir, filePath);
    if (!fs.existsSync(full)) return res.status(404).json({ error: 'File not found' });
    const stat = fs.statSync(full);
    if (stat.isDirectory()) return res.status(400).json({ error: 'Is a directory' });

    const mimeType = mime.lookup(full) || 'text/plain';
    const isBinary = mimeType.startsWith('image/') || mimeType.startsWith('application/octet');

    if (isBinary) {
      return res.sendFile(full);
    }

    const content = fs.readFileSync(full, 'utf-8');
    res.json({ content, path: filePath, mimeType });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST write file
router.post('/:projectId/*', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.params[0];
    const full = safePath(projectDir, filePath);
    const { content } = req.body;

    fs.ensureDirSync(path.dirname(full));
    fs.writeFileSync(full, content || '', 'utf-8');

    // Emit file change event
    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('file-changed', { path: filePath, content });

    res.json({ success: true, path: filePath });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT rename/move file
router.put('/:projectId/rename', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const { from, to } = req.body;
    const fullFrom = safePath(projectDir, from);
    const fullTo = safePath(projectDir, to);

    fs.ensureDirSync(path.dirname(fullTo));
    fs.moveSync(fullFrom, fullTo);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE file
router.delete('/:projectId/*', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const filePath = req.params[0];
    const full = safePath(projectDir, filePath);
    fs.removeSync(full);

    const io = req.app.get('io');
    io.to(`project-${req.params.projectId}`).emit('file-deleted', { path: filePath });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create directory
router.post('/:projectId/mkdir', (req, res) => {
  try {
    const projectDir = getProjectDir(req.app, req.params.projectId);
    const { dirPath } = req.body;
    const full = safePath(projectDir, dirPath);
    fs.ensureDirSync(full);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
