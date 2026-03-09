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

// Common vulnerability patterns to scan for
const PATTERNS = [
  { id: 'sql-injection', name: 'SQL Injection Risk', severity: 'high', pattern: /query\s*\(\s*[`'"]/gi, desc: 'String interpolation in SQL queries' },
  { id: 'eval-usage', name: 'eval() Usage', severity: 'high', pattern: /\beval\s*\(/g, desc: 'eval() can execute arbitrary code' },
  { id: 'innerHTML', name: 'innerHTML Assignment', severity: 'medium', pattern: /\.innerHTML\s*=/g, desc: 'Can lead to XSS vulnerabilities' },
  { id: 'console-log', name: 'Console Logs', severity: 'low', pattern: /console\.(log|error|warn|debug)\s*\(/g, desc: 'Debug logs should be removed in production' },
  { id: 'hardcoded-secret', name: 'Hardcoded Secret', severity: 'critical', pattern: /(password|secret|api_key|apikey|token)\s*[:=]\s*['"][^'"]{8,}/gi, desc: 'Credentials should not be hardcoded' },
  { id: 'http-protocol', name: 'HTTP (not HTTPS)', severity: 'medium', pattern: /fetch\s*\(\s*['"]http:\/\//g, desc: 'Use HTTPS for secure connections' },
  { id: 'no-input-validation', name: 'Unvalidated req.body', severity: 'medium', pattern: /req\.body\.\w+\s*(?!&&|!=|!==|\.trim|\.length)/g, desc: 'Always validate user input' },
];

// GET /api/security/:projectId/scan
router.get('/:projectId/scan', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  const findings = [];

  try {
    // Scan source files
    const walkDir = (d) => {
      const items = fs.readdirSync(d, { withFileTypes: true });
      for (const item of items) {
        if (item.name === 'node_modules' || item.name.startsWith('.')) continue;
        const fp = path.join(d, item.name);
        if (item.isDirectory()) walkDir(fp);
        else if (/\.(js|jsx|ts|tsx|py|html)$/.test(item.name)) {
          const content = fs.readFileSync(fp, 'utf8');
          const rel = path.relative(dir, fp);
          for (const p of PATTERNS) {
            const matches = [...content.matchAll(p.pattern)];
            for (const m of matches.slice(0, 3)) {
              const lines = content.substring(0, m.index).split('\n');
              findings.push({
                id: p.id,
                name: p.name,
                severity: p.severity,
                file: rel,
                line: lines.length,
                code: m[0].substring(0, 60),
                description: p.desc
              });
            }
          }
        }
      }
    };
    walkDir(dir);

    // Try npm audit if package.json exists
    let npmAudit = null;
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const { stdout } = await execAsync('npm audit --json 2>/dev/null', { cwd: dir });
        const auditData = JSON.parse(stdout);
        npmAudit = {
          vulnerabilities: auditData.metadata?.vulnerabilities || {},
          total: Object.values(auditData.metadata?.vulnerabilities || {}).reduce((a, b) => a + b, 0)
        };
      } catch { /* npm audit returns non-zero on vulns */ }
    }

    const score = Math.max(0, 100 - (findings.filter(f => f.severity === 'critical').length * 20) 
      - (findings.filter(f => f.severity === 'high').length * 10)
      - (findings.filter(f => f.severity === 'medium').length * 5)
      - (findings.filter(f => f.severity === 'low').length * 1));

    res.json({ findings, npmAudit, score, scannedAt: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
