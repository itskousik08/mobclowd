const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');
const execAsync = promisify(exec);

function getProjectDir(app, projectId) {
  return path.join(app.get('workspaceDir'), projectId);
}

// GET /api/git/:projectId/status
router.get('/:projectId/status', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    const isGit = fs.existsSync(path.join(dir, '.git'));
    if (!isGit) return res.json({ initialized: false });
    const { stdout: statusOut } = await execAsync('git status --porcelain', { cwd: dir });
    const { stdout: branchOut } = await execAsync('git rev-parse --abbrev-ref HEAD', { cwd: dir });
    const { stdout: logOut } = await execAsync('git log --oneline -20 --format="%H|%s|%an|%ar" 2>/dev/null || echo ""', { cwd: dir, shell: true });
    const commits = logOut.trim().split('\n').filter(Boolean).map(l => {
      const [hash, msg, author, time] = l.split('|');
      return { hash: hash?.substring(0, 7), message: msg, author, time };
    });
    const changes = statusOut.trim().split('\n').filter(Boolean).map(l => ({
      status: l.substring(0, 2).trim(),
      file: l.substring(3)
    }));
    res.json({ initialized: true, branch: branchOut.trim(), changes, commits });
  } catch (e) {
    res.json({ initialized: false, error: e.message });
  }
});

// POST /api/git/:projectId/init
router.post('/:projectId/init', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    await execAsync('git init && git add . && git commit -m "Initial commit by MobCloud AI" --allow-empty', { cwd: dir, shell: true });
    res.json({ success: true, message: 'Git repository initialized' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/git/:projectId/commit
router.post('/:projectId/commit', async (req, res) => {
  const { message } = req.body;
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    await execAsync(`git add . && git commit -m "${message.replace(/"/g, '\\"')}"`, { cwd: dir, shell: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/git/:projectId/diff
router.get('/:projectId/diff', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    const { stdout } = await execAsync('git diff HEAD 2>/dev/null || git diff', { cwd: dir, shell: true });
    res.json({ diff: stdout });
  } catch (e) {
    res.json({ diff: '' });
  }
});

// POST /api/git/:projectId/branch
router.post('/:projectId/branch', async (req, res) => {
  const { name } = req.body;
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    await execAsync(`git checkout -b "${name}"`, { cwd: dir, shell: true });
    res.json({ success: true, branch: name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/git/:projectId/branches
router.get('/:projectId/branches', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  try {
    const { stdout } = await execAsync('git branch --format="%(refname:short)"', { cwd: dir });
    const branches = stdout.trim().split('\n').filter(Boolean);
    res.json({ branches });
  } catch (e) {
    res.json({ branches: [] });
  }
});

module.exports = router;
