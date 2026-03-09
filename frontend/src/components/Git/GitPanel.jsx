import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, GitCommit, Plus, RefreshCw, Check, X, ChevronRight, AlertCircle, FileDiff } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const statusColors = {
  M: '#f59e0b', A: '#10b981', D: '#f43f5e', '?': '#6366f1', R: '#8b5cf6'
};
const statusLabels = { M: 'Modified', A: 'Added', D: 'Deleted', '?': 'Untracked', R: 'Renamed' };

export default function GitPanel({ projectId }) {
  const [gitData, setGitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commitMsg, setCommitMsg] = useState('');
  const [committing, setCommitting] = useState(false);
  const [tab, setTab] = useState('changes');

  async function load() {
    setLoading(true);
    try {
      const data = await api.request(`/api/git/${projectId}/status`);
      setGitData(data);
    } catch { toast.error('Failed to load git status'); }
    setLoading(false);
  }

  useEffect(() => { load(); }, [projectId]);

  async function initGit() {
    try {
      toast.loading('Initializing git...', { id: 'git' });
      await api.request(`/api/git/${projectId}/init`, { method: 'POST' });
      toast.success('Git initialized!', { id: 'git' });
      load();
    } catch (e) { toast.error(e.message, { id: 'git' }); }
  }

  async function commit() {
    if (!commitMsg.trim()) { toast.error('Enter a commit message'); return; }
    setCommitting(true);
    try {
      await api.request(`/api/git/${projectId}/commit`, { method: 'POST', body: JSON.stringify({ message: commitMsg }) });
      toast.success('Committed!');
      setCommitMsg('');
      load();
    } catch (e) { toast.error(e.message); }
    setCommitting(false);
  }

  const TABS = [
    { id: 'changes', label: 'Changes' },
    { id: 'commits', label: 'History' },
  ];

  return (
    <div className="tool-panel" style={{ width: 340 }}>
      <div className="tool-panel-header">
        <GitBranch size={15} style={{ color: '#818cf8' }} />
        <span className="font-semibold text-sm">Git</span>
        {gitData?.branch && (
          <span className="tag tag-indigo ml-1">{gitData.branch}</span>
        )}
        <div className="flex-1" />
        <button onClick={load} className="btn-icon" style={{ width: 28, height: 28 }}>
          <RefreshCw size={13} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex gap-1.5"><div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" /></div>
        </div>
      ) : !gitData?.initialized ? (
        <div className="tool-panel-body flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <GitBranch size={24} style={{ color: '#818cf8' }} />
          </div>
          <div>
            <div className="font-semibold text-sm mb-1">No Git repository</div>
            <div className="text-xs" style={{ color: 'var(--muted)' }}>Initialize Git to start tracking changes</div>
          </div>
          <button onClick={initGit} className="btn-primary text-xs px-4 py-2">
            <GitBranch size={13} /> Initialize Git
          </button>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex-1 py-2 text-xs font-medium transition-colors"
                style={{ color: tab === t.id ? '#818cf8' : 'var(--muted)', borderBottom: tab === t.id ? '2px solid #818cf8' : '2px solid transparent' }}>
                {t.label}
                {t.id === 'changes' && gitData.changes?.length > 0 && (
                  <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                    {gitData.changes.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="tool-panel-body">
            {tab === 'changes' && (
              <div className="space-y-3">
                {/* Commit input */}
                {gitData.changes?.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <input
                      value={commitMsg}
                      onChange={e => setCommitMsg(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && commit()}
                      placeholder="Commit message..."
                      className="input text-xs py-2"
                    />
                    <button onClick={commit} disabled={committing || !commitMsg.trim()} className="btn-primary text-xs py-1.5 w-full">
                      {committing ? 'Committing...' : <><GitCommit size={12} /> Commit All Changes</>}
                    </button>
                  </div>
                )}

                {/* Changes list */}
                {gitData.changes?.length === 0 ? (
                  <div className="text-center py-8">
                    <Check size={24} className="mx-auto mb-2" style={{ color: '#10b981' }} />
                    <div className="text-sm font-medium" style={{ color: '#10b981' }}>Clean working tree</div>
                    <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>No uncommitted changes</div>
                  </div>
                ) : (
                  <AnimatePresence>
                    {gitData.changes.map((c, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-2 rounded-lg"
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                        <span className="text-xs font-bold w-4 flex-shrink-0" style={{ color: statusColors[c.status] || 'var(--muted)' }}>
                          {c.status}
                        </span>
                        <FileDiff size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                        <span className="text-xs truncate flex-1 font-mono" style={{ color: 'var(--text2)' }}>{c.file}</span>
                        <span className="text-[10px]" style={{ color: statusColors[c.status] || 'var(--muted)' }}>
                          {statusLabels[c.status] || c.status}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            )}

            {tab === 'commits' && (
              <div className="space-y-2">
                {gitData.commits?.length === 0 ? (
                  <div className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No commits yet</div>
                ) : gitData.commits?.map((c, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="commit-item">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)', fontSize: 10, fontFamily: 'monospace', color: '#818cf8' }}>
                      {c.hash}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate" style={{ color: 'var(--text)' }}>{c.message}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: 'var(--muted)' }}>{c.author} · {c.time}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
