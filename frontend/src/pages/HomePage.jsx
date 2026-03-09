import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Folder, Trash2, ChevronRight, Clock, Sun, Moon, Cpu, Wifi, WifiOff, Zap, Code2, Globe, Layers, ArrowRight, Star, Settings, GitBranch, Shield, Database, BarChart2 } from "lucide-react";
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import NewProjectModal from '../components/Modals/NewProjectModal.jsx';
import SettingsModal from '../components/Modals/SettingsModal.jsx';

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, setProjects, removeProject, ollamaStatus, models, selectedModel, setSelectedModel, theme, toggleTheme, personality, userName, userCity } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProjects()
      .then(({ projects }) => setProjects(projects))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  async function deleteProject(e, id) {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    await api.deleteProject(id);
    removeProject(id);
    toast.success('Deleted');
  }

  const statusColor = { connected: '#10b981', disconnected: '#f43f5e', unknown: '#f59e0b' }[ollamaStatus];
  const statusLabel = { connected: 'Ollama Connected', disconnected: 'Ollama Offline', unknown: 'Checking...' }[ollamaStatus];

  return (
    <div className="app-bg min-h-screen flex flex-col overflow-auto">
      {/* Top nav */}
      <header className="glass sticky top-0 z-50 px-4 md:px-8 py-3 flex items-center gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            M
          </div>
          <div>
            <span className="font-bold text-white text-base">MobCloud</span>
            <span className="ml-1 tag tag-indigo">AI</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Status */}
        <div className="hidden md:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full"
          style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
          <span className="status-dot" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span style={{ color: statusColor }}>{statusLabel}</span>
        </div>

        {/* Model picker */}
        {models.length > 0 && (
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="hidden md:block text-xs px-3 py-1.5 rounded-lg border outline-none cursor-pointer"
            style={{ background: 'var(--surface2)', borderColor: 'var(--border)', color: 'var(--text2)' }}
          >
            {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
        )}

        {/* Theme toggle */}
        <button onClick={() => setShowSettings(true)} className="btn-icon tooltip" data-tip="Settings">
          <Settings size={16} />
        </button>

        {/* Theme toggle */}
        <button onClick={toggleTheme} className="btn-icon tooltip" data-tip={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button onClick={() => setShowNew(true)} className="btn-primary">
          <Plus size={15} />
          <span className="hidden sm:inline">New Project</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 flex-1">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 text-sm tag tag-indigo">
            <Zap size={13} /> Local AI · 100% Private · No Cloud
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 leading-[1.1]">
            Build websites with<br />
            <span className="gradient-text">MobCloud AI</span>
          </h1>
          <p className="text-base md:text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text2)', lineHeight: 1.7 }}>
            Your local AI development platform. Chat, generate code, preview instantly — all powered by Ollama on your device.
          </p>
          <button onClick={() => setShowNew(true)} className="btn-primary text-base px-6 py-3">
            Start Building <ArrowRight size={16} />
          </button>
        </motion.div>

        {/* Features row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: <Cpu size={18} />, title: 'Local AI', desc: 'Runs on Ollama' },
            { icon: <Code2 size={18} />, title: 'Live Code Gen', desc: 'Real-time writing' },
            { icon: <Globe size={18} />, title: 'Instant Preview', desc: 'Desktop & mobile' },
            { icon: <Layers size={18} />, title: 'File Explorer', desc: 'Full project view' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="card p-4 flex flex-col gap-2 hover:border-indigo-500/30 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>{f.icon}</div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{f.title}</div>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* Projects */}
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold flex-1">Your Projects</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="input w-40 md:w-56 text-xs py-2"
          />
          <button onClick={() => setShowNew(true)} className="btn-secondary text-xs py-2">
            <Plus size={14} /> New
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="flex gap-1.5">
              <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card text-center py-20 flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <Folder size={26} style={{ color: '#818cf8' }} />
            </div>
            <div>
              <div className="font-semibold mb-1">{search ? 'No projects found' : 'No projects yet'}</div>
              <div className="text-sm" style={{ color: 'var(--muted)' }}>Create your first project to get started</div>
            </div>
            {!search && (
              <button onClick={() => setShowNew(true)} className="btn-primary">
                <Plus size={15} /> Create Project
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }} transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/workspace/${p.id}`)}
                  className="card p-5 cursor-pointer group hover:border-indigo-500/35 transition-all hover:-translate-y-1 duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.18),rgba(139,92,246,0.08))' }}>
                      <Folder size={18} style={{ color: '#818cf8' }} />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => deleteProject(e, p.id)}
                        className="btn-icon text-xs hover:text-red-400" style={{ width: 28, height: 28 }}>
                        <Trash2 size={13} />
                      </button>
                      <ChevronRight size={14} style={{ color: 'var(--muted)' }} />
                    </div>
                  </div>
                  <div className="font-semibold text-sm mb-1 truncate">{p.name}</div>
                  {p.description && <div className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{p.description}</div>}
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                    <Clock size={10} />
                    {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                    {p.template && p.template !== 'blank' && (
                      <span className="tag tag-indigo ml-auto">{p.template}</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Offline warning */}
      {ollamaStatus === 'disconnected' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-5 py-3 rounded-xl flex items-center gap-3 text-sm max-w-sm mx-4"
          style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
          <WifiOff size={15} style={{ color: '#f59e0b' }} />
          <span style={{ color: 'var(--text2)' }}>Ollama offline — <span style={{ color: '#fbbf24' }}>run `ollama serve`</span></span>
        </div>
      )}

      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
      <NewProjectModal open={showNew} onClose={() => setShowNew(false)}
        onCreated={(p) => navigate(`/workspace/${p.id}`)} />
    </div>
  );
}
