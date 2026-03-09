import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Table, Play, Plus, RefreshCw, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const EXAMPLE_SCHEMAS = [
  { name: 'Users', sql: 'CREATE TABLE IF NOT EXISTS users (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  email TEXT UNIQUE NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);' },
  { name: 'Posts', sql: 'CREATE TABLE IF NOT EXISTS posts (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  user_id INTEGER,\n  title TEXT NOT NULL,\n  body TEXT,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);' },
  { name: 'Products', sql: 'CREATE TABLE IF NOT EXISTS products (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  name TEXT NOT NULL,\n  price REAL,\n  stock INTEGER DEFAULT 0\n);' },
];

export default function DatabasePanel({ projectId }) {
  const [schema, setSchema] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sql, setSql] = useState('SELECT * FROM sqlite_master WHERE type=\'table\';');
  const [queryResult, setQueryResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [tab, setTab] = useState('schema');
  const [expandedTable, setExpandedTable] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createSql, setCreateSql] = useState(EXAMPLE_SCHEMAS[0].sql);
  const [creating, setCreating] = useState(false);

  async function loadSchema() {
    setLoading(true);
    try {
      const data = await api.request(`/api/database/${projectId}/schema`);
      setSchema(data.tables || []);
    } catch (e) {
      toast.error('Failed to load schema');
    }
    setLoading(false);
  }

  useEffect(() => { loadSchema(); }, [projectId]);

  async function runQuery() {
    if (!sql.trim()) return;
    setRunning(true);
    try {
      const data = await api.request(`/api/database/${projectId}/query`, {
        method: 'POST',
        body: JSON.stringify({ sql })
      });
      setQueryResult(data);
      setTab('results');
    } catch (e) {
      toast.error(e.message || 'Query failed');
      setQueryResult({ error: e.message });
    }
    setRunning(false);
  }

  async function createTable() {
    if (!createSql.trim()) return;
    setCreating(true);
    try {
      await api.request(`/api/database/${projectId}/create-table`, {
        method: 'POST',
        body: JSON.stringify({ sql: createSql })
      });
      toast.success('Table created!');
      setShowCreate(false);
      loadSchema();
    } catch (e) {
      toast.error(e.message || 'Failed to create table');
    }
    setCreating(false);
  }

  async function dropTable(tableName) {
    if (!confirm(`Drop table "${tableName}"?`)) return;
    try {
      await api.request(`/api/database/${projectId}/table/${tableName}`, { method: 'DELETE' });
      toast.success('Table dropped');
      loadSchema();
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="tool-panel" style={{ width: 380 }}>
      <div className="tool-panel-header">
        <Database size={15} style={{ color: '#22d3ee' }} />
        <span className="font-semibold text-sm">Database</span>
        <span className="tag tag-indigo text-[10px]">SQLite</span>
        <div className="flex-1" />
        <button onClick={loadSchema} className="btn-icon" style={{ width: 28, height: 28 }}>
          <RefreshCw size={13} />
        </button>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-icon" style={{ width: 28, height: 28 }}>
          <Plus size={13} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
        {['schema', 'query', 'results'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 text-xs font-medium capitalize transition-colors"
            style={{ color: tab === t ? '#22d3ee' : 'var(--muted)', borderBottom: tab === t ? '2px solid #22d3ee' : '2px solid transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="tool-panel-body">
        {/* Create table form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden">
              <div className="p-3 rounded-lg space-y-3" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold">Create Table</span>
                  <div className="flex-1" />
                  <div className="flex gap-1">
                    {EXAMPLE_SCHEMAS.map(s => (
                      <button key={s.name} onClick={() => setCreateSql(s.sql)}
                        className="text-[10px] px-2 py-1 rounded-md transition-colors"
                        style={{ background: 'var(--surface3)', color: 'var(--text2)' }}>
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={createSql}
                  onChange={e => setCreateSql(e.target.value)}
                  className="input font-mono text-xs resize-none"
                  rows={5}
                />
                <div className="flex gap-2">
                  <button onClick={createTable} disabled={creating} className="btn-primary text-xs py-1.5 flex-1">
                    {creating ? 'Creating...' : 'Create Table'}
                  </button>
                  <button onClick={() => setShowCreate(false)} className="btn-secondary text-xs py-1.5">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {tab === 'schema' && (
          loading ? (
            <div className="flex justify-center py-8">
              <div className="flex gap-1.5"><div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" /></div>
            </div>
          ) : schema.length === 0 ? (
            <div className="text-center py-10">
              <Database size={32} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
              <div className="text-sm font-medium mb-1">No tables yet</div>
              <div className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Create your first table to get started</div>
              <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-1.5 px-4">
                <Plus size={13} /> Create Table
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {schema.map((table) => (
                <div key={table.name} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    style={{ background: 'var(--surface2)' }}
                    onClick={() => setExpandedTable(expandedTable === table.name ? null : table.name)}>
                    {expandedTable === table.name ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <Table size={13} style={{ color: '#22d3ee' }} />
                    <span className="text-xs font-semibold flex-1">{table.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,211,238,0.1)', color: '#22d3ee' }}>
                      {table.rowCount} rows
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); dropTable(table.name); }}
                      className="btn-icon hover:text-red-400" style={{ width: 22, height: 22 }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <AnimatePresence>
                    {expandedTable === table.name && (
                      <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="db-table-preview">
                          <table>
                            <thead>
                              <tr>
                                <th>Column</th>
                                <th>Type</th>
                                <th>Not Null</th>
                                <th>Default</th>
                              </tr>
                            </thead>
                            <tbody>
                              {table.columns?.map(col => (
                                <tr key={col.name}>
                                  <td className="font-mono">{col.name}</td>
                                  <td style={{ color: '#818cf8' }}>{col.type}</td>
                                  <td>{col.notnull ? '✓' : ''}</td>
                                  <td style={{ color: 'var(--muted)' }}>{col.dflt_value || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button className="w-full text-xs py-2 transition-colors"
                          style={{ color: '#22d3ee', borderTop: '1px solid var(--border)' }}
                          onClick={() => { setSql(`SELECT * FROM ${table.name} LIMIT 20;`); setTab('query'); }}>
                          Query this table →
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'query' && (
          <div className="space-y-3">
            <textarea
              value={sql}
              onChange={e => setSql(e.target.value)}
              onKeyDown={e => { if (e.ctrlKey && e.key === 'Enter') runQuery(); }}
              className="input font-mono text-xs resize-none"
              rows={6}
              placeholder="Enter SQL query... (Ctrl+Enter to run)"
            />
            <button onClick={runQuery} disabled={running} className="btn-primary text-xs py-2 w-full">
              <Play size={13} /> {running ? 'Running...' : 'Run Query (Ctrl+Enter)'}
            </button>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>
              Tip: Use SELECT, INSERT, UPDATE, DELETE, CREATE TABLE
            </div>
          </div>
        )}

        {tab === 'results' && (
          <div>
            {!queryResult ? (
              <div className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>Run a query to see results</div>
            ) : queryResult.error ? (
              <div className="p-3 rounded-lg text-xs font-mono" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
                Error: {queryResult.error}
              </div>
            ) : queryResult.rows ? (
              queryResult.rows.length === 0 ? (
                <div className="text-center py-6 text-sm" style={{ color: 'var(--muted)' }}>No rows returned</div>
              ) : (
                <div className="db-table-preview">
                  <table>
                    <thead>
                      <tr>{queryResult.columns?.map(c => <th key={c}>{c}</th>)}</tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr key={i}>{queryResult.columns?.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="p-3 rounded-lg text-xs" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="text-green-400 font-semibold">Query successful</div>
                <div style={{ color: 'var(--text2)' }}>Rows affected: {queryResult.rowsAffected ?? 0}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
