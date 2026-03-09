import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Sun, Moon, Eye, EyeOff, Zap, Cpu, Settings, Bell,
  Wifi, WifiOff, ChevronDown, Wrench, RefreshCw, Package } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api, streamAI } from '../../utils/api';
import toast from 'react-hot-toast';

const FIX_ACTIONS = [
  { id: 'responsive', label: '📱 Make Responsive', desc: 'Fix mobile layout' },
  { id: 'darkmode', label: '🌙 Add Dark Mode', desc: 'Toggle system' },
  { id: 'seo', label: '🔍 Add SEO', desc: 'Meta, OG, sitemap' },
  { id: 'performance', label: '⚡ Optimize', desc: 'Performance boost' },
  { id: 'accessibility', label: '♿ Accessibility', desc: 'ARIA, keyboard nav' },
];

export default function WorkspaceHeader({ projectId, onRefreshTree }) {
  const navigate = useNavigate();
  const {
    currentProject, theme, toggleTheme,
    ollamaStatus, models, selectedModel, setSelectedModel,
    showExplorer, showPreview, showChat, togglePanel,
    addMessage, updateLastMessage, setIsAiThinking, setAiThinkingSteps, addAiAction,
  } = useAppStore();

  const [showModelPicker, setShowModelPicker] = useState(false);
  const [showFix, setShowFix] = useState(false);
  const [fixing, setFixing] = useState(null);

  const statusColor = { connected: '#10b981', disconnected: '#f43f5e', unknown: '#f59e0b' }[ollamaStatus] || '#f59e0b';

  async function runFix(fixId) {
    if (!selectedModel) { toast.error('Select a model first'); return; }
    setShowFix(false);
    setFixing(fixId);

    addMessage({ role: 'assistant', content: '', streaming: true });
    setIsAiThinking(true);
    setAiThinkingSteps([]);

    const fix = FIX_ACTIONS.find(f => f.id === fixId);
    toast.loading(`Running: ${fix?.label}...`, { id: 'fix' });

    let filesChanged = [];

    streamAI({
      projectId,
      messages: [{ role: 'user', content: `Apply fix: ${fixId}` }],
      model: selectedModel,
      onFile: async ({ path: fp }) => {
        if (!filesChanged.includes(fp)) filesChanged.push(fp);
        addAiAction({ type: 'fix', path: fp, message: `Fixed: ${fp}` });
        await onRefreshTree?.();
      },
      onChunk: (chunk, full) => {
        const display = full.replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '').replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
        updateLastMessage({ content: display, streaming: true });
      },
      onDone: (data) => {
        updateLastMessage({ streaming: false, filesChanged: data?.filesChanged || filesChanged });
        setIsAiThinking(false);
        setFixing(null);
        onRefreshTree?.();
        toast.success(`${fix?.label} applied!`, { id: 'fix' });
      },
      onError: (err) => {
        updateLastMessage({ content: `⚠️ Fix failed: ${err.message}`, streaming: false });
        setIsAiThinking(false);
        setFixing(null);
        toast.error(err.message, { id: 'fix' });
      }
    });
  }

  return (
    <header className="flex items-center gap-2 px-3 h-11 flex-shrink-0"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>

      {/* Back + brand */}
      <button onClick={() => navigate('/')} className="btn-ghost text-xs py-1 px-2 flex-shrink-0">
        <ArrowLeft size={13} /><span className="hidden sm:inline ml-1">Home</span>
      </button>
      <span style={{ color: 'var(--border2)', flexShrink: 0 }}>|</span>
      <div className="flex items-center gap-2 flex-shrink-0 min-w-0">
        <div className="w-5 h-5 rounded flex items-center justify-center font-black text-white text-xs flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>M</div>
        <span className="font-semibold text-sm truncate max-w-[100px] md:max-w-[200px]">
          {currentProject?.name || '...'}
        </span>
      </div>

      <div className="flex-1" />

      {/* Panel toggles — desktop */}
      <div className="hidden md:flex items-center gap-1">
        {[
          { key: 'showExplorer', label: 'Files', active: showExplorer },
          { key: 'showPreview', label: 'Preview', active: showPreview },
          { key: 'showChat', label: 'Chat', active: showChat },
        ].map(({ key, label, active }) => (
          <button key={key} onClick={() => togglePanel(key)}
            className={`text-xs px-2.5 py-1 rounded-lg transition-all ${active ? 'tag tag-indigo' : 'btn-ghost'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* AI Fix menu */}
      <div className="relative hidden md:block">
        <button onClick={() => setShowFix(v => !v)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all ${fixing ? 'tag tag-yellow animate-pulse' : 'btn-secondary'}`}>
          <Wrench size={12} />
          {fixing ? 'Fixing...' : 'AI Fix'}
          <ChevronDown size={11} />
        </button>
        {showFix && (
          <div className="absolute top-full right-0 mt-1 z-50 w-48 rounded-xl overflow-hidden"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            {FIX_ACTIONS.map(f => (
              <button key={f.id} onClick={() => runFix(f.id)}
                className="w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between"
                style={{ color: 'var(--text2)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <span>{f.label}</span>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{f.desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Model picker */}
      <div className="relative hidden md:block">
        <button onClick={() => setShowModelPicker(v => !v)}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg btn-ghost">
          <Cpu size={12} />
          <span className="max-w-[90px] truncate">{selectedModel || 'No model'}</span>
          <ChevronDown size={11} />
        </button>
        {showModelPicker && models.length > 0 && (
          <div className="absolute top-full right-0 mt-1 z-50 min-w-[160px] rounded-xl overflow-hidden"
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', boxShadow: '0 16px 40px rgba(0,0,0,0.5)' }}>
            <div className="px-3 py-2 text-xs font-medium border-b" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
              Select Model
            </div>
            <div className="max-h-48 overflow-auto py-1">
              {models.map(m => (
                <button key={m.name} onClick={() => { setSelectedModel(m.name); setShowModelPicker(false); }}
                  className="w-full text-left px-3 py-2 text-xs transition-colors"
                  style={{
                    background: selectedModel === m.name ? 'rgba(99,102,241,0.1)' : 'transparent',
                    color: selectedModel === m.name ? '#a5b4fc' : 'var(--text2)',
                  }}
                  onMouseEnter={e => { if (selectedModel !== m.name) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                  onMouseLeave={e => { if (selectedModel !== m.name) e.currentTarget.style.background = 'transparent'; }}>
                  {m.name}
                  {m.size && <span className="ml-2" style={{ color: 'var(--muted)' }}>
                    {(m.size / 1e9).toFixed(1)}GB
                  </span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
      {/* Notifications */}
      <div className="relative flex-shrink-0">
        <button className="btn-icon" title="Notifications">
          <Bell size={14} />
        </button>
        {(notifications?.filter(n => !n.read).length > 0) && (
          <div className="notif-badge" />
        )}
      </div>


      {/* Theme */}
      <button onClick={toggleTheme} className="btn-icon flex-shrink-0">
        {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
      </button>

      {/* Download */}
      <button onClick={() => window.open(api.downloadProject(projectId), '_blank')}
        className="btn-primary text-xs py-1.5 px-3 flex-shrink-0">
        <Download size={12} />
        <span className="hidden sm:inline">Export</span>
      </button>
    </header>
  );
}
