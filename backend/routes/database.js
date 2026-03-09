const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');

// Dynamic require for sqlite3 (optional dep)
function getSqlite() {
  try { return require('better-sqlite3'); } catch { return null; }
}

function getProjectDir(app, projectId) {
  return path.join(app.get('workspaceDir'), projectId);
}

// GET /api/database/:projectId/schema
router.get('/:projectId/schema', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  const dbPath = path.join(dir, 'database.sqlite');
  const Database = getSqlite();
  if (!Database) return res.json({ tables: [], message: 'SQLite not installed' });
  if (!fs.existsSync(dbPath)) return res.json({ tables: [], message: 'No database found. Create one first.' });
  try {
    const db = new Database(dbPath, { readonly: true });
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    const schema = tables.map(t => {
      const cols = db.prepare(`PRAGMA table_info(${t.name})`).all();
      const count = db.prepare(`SELECT COUNT(*) as c FROM ${t.name}`).get();
      return { name: t.name, columns: cols, rowCount: count?.c || 0 };
    });
    db.close();
    res.json({ tables: schema });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/database/:projectId/query
router.post('/:projectId/query', async (req, res) => {
  const { sql } = req.body;
  const dir = getProjectDir(req.app, req.params.projectId);
  const dbPath = path.join(dir, 'database.sqlite');
  const Database = getSqlite();
  if (!Database) return res.json({ rows: [], error: 'SQLite not installed' });
  try {
    fs.ensureFileSync(dbPath);
    const db = new Database(dbPath);
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA');
    if (isSelect) {
      const rows = db.prepare(sql).all();
      db.close();
      res.json({ rows, columns: rows.length > 0 ? Object.keys(rows[0]) : [] });
    } else {
      const info = db.prepare(sql).run();
      db.close();
      res.json({ rowsAffected: info.changes, lastInsertRowid: info.lastInsertRowid });
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/database/:projectId/create-table
router.post('/:projectId/create-table', async (req, res) => {
  const { sql } = req.body;
  const dir = getProjectDir(req.app, req.params.projectId);
  const dbPath = path.join(dir, 'database.sqlite');
  const Database = getSqlite();
  if (!Database) return res.status(500).json({ error: 'better-sqlite3 not installed. Run: cd backend && npm install better-sqlite3' });
  try {
    fs.ensureFileSync(dbPath);
    const db = new Database(dbPath);
    db.exec(sql);
    db.close();
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/database/:projectId/table/:tableName
router.delete('/:projectId/table/:tableName', async (req, res) => {
  const dir = getProjectDir(req.app, req.params.projectId);
  const dbPath = path.join(dir, 'database.sqlite');
  const Database = getSqlite();
  if (!Database) return res.status(500).json({ error: 'SQLite not available' });
  try {
    const db = new Database(dbPath);
    db.exec(`DROP TABLE IF EXISTS ${req.params.tableName}`);
    db.close();
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
