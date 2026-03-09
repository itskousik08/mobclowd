const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

function getProjectDir(app, projectId) {
  return path.join(app.get('workspaceDir'), projectId);
}

// In-memory metrics store
const metricsStore = {};

function getMetrics(projectId) {
  if (!metricsStore[projectId]) {
    metricsStore[projectId] = {
      commits: [],
      linesAdded: [],
      bugsFixed: [],
      aiInteractions: 0,
      filesCreated: 0,
      sessionsData: []
    };
  }
  return metricsStore[projectId];
}

// GET /api/analytics/:projectId
router.get('/:projectId', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  const metrics = getMetrics(req.params.projectId);

  try {
    // Count files
    let totalFiles = 0, totalLines = 0;
    const walkDir = (d) => {
      try {
        fs.readdirSync(d, { withFileTypes: true }).forEach(item => {
          if (item.name === 'node_modules' || item.name.startsWith('.')) return;
          const fp = path.join(d, item.name);
          if (item.isDirectory()) walkDir(fp);
          else {
            totalFiles++;
            try {
              const content = fs.readFileSync(fp, 'utf8');
              totalLines += content.split('\n').length;
            } catch {}
          }
        });
      } catch {}
    };
    walkDir(dir);

    // Git stats
    let gitCommits = 0;
    try {
      const { stdout } = await execAsync('git rev-list --count HEAD 2>/dev/null || echo 0', { cwd: dir, shell: true });
      gitCommits = parseInt(stdout.trim()) || 0;
    } catch {}

    // Generate chart data (last 7 days mock + real)
    const now = Date.now();
    const chartData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(now - (6 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      commits: Math.max(0, gitCommits > 0 ? Math.round(gitCommits / 7) + Math.floor(Math.random() * 3) : 0),
      linesAdded: Math.floor(totalLines / 7) + Math.floor(Math.random() * 50),
      aiRequests: Math.floor(metrics.aiInteractions / 7) + Math.floor(Math.random() * 5)
    }));

    res.json({
      summary: {
        totalFiles,
        totalLines,
        commits: gitCommits,
        aiInteractions: metrics.aiInteractions,
        filesCreated: metrics.filesCreated,
      },
      chartData,
      projectHealth: {
        score: Math.min(100, 60 + (gitCommits > 0 ? 20 : 0) + (totalFiles > 3 ? 10 : 0) + (totalLines > 100 ? 10 : 0)),
        hasGit: gitCommits > 0,
        hasTests: fs.existsSync(path.join(dir, 'package.json')) ? 
          (() => { try { return !!fs.readJsonSync(path.join(dir, 'package.json'))?.scripts?.test; } catch { return false; } })() : false,
        hasReadme: fs.existsSync(path.join(dir, 'README.md')),
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/analytics/:projectId/track
router.post('/:projectId/track', (req, res) => {
  const { event, data } = req.body;
  const metrics = getMetrics(req.params.projectId);
  if (event === 'ai_interaction') metrics.aiInteractions++;
  if (event === 'file_created') metrics.filesCreated++;
  res.json({ tracked: true });
});

module.exports = router;
