import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, RefreshCw, ExternalLink, Eye, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const MODES = [
  { id: 'desktop', icon: Monitor, width: '100%' },
  { id: 'tablet', icon: Tablet, width: '768px' },
  { id: 'mobile', icon: Smartphone, width: '390px' },
];

export default function PreviewPanel({ projectId }) {
  const { previewUrl, previewMode, setPreviewMode } = useAppStore();
  const [key, setKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const mode = MODES.find(m => m.id === previewMode) || MODES[0];

  useEffect(() => { if (previewUrl) { setLoading(true); setKey(k => k + 1); } }, [previewUrl]);

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
          <Eye size={12} /> Preview
        </div>
        <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          {MODES.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setPreviewMode(id)}
              className={`p-1.5 rounded-md transition-all ${previewMode === id ? 'text-indigo-400' : 'text-gray-600 hover:text-gray-400'}`}
              style={{ background: previewMode === id ? 'rgba(99,102,241,0.15)' : 'transparent' }}>
              <Icon size={13} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => { setLoading(true); setKey(k => k + 1); }} className="btn-icon" style={{ width: 26, height: 26 }}>
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => window.open(previewUrl, '_blank')} className="btn-icon" style={{ width: 26, height: 26 }}>
            <ExternalLink size={12} />
          </button>
        </div>
      </div>

      {/* Browser bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0"
        style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f43f5e', opacity: 0.7 }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#f59e0b', opacity: 0.7 }} />
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10b981', opacity: 0.7 }} />
        </div>
        <div className="flex-1 text-xs px-2 py-0.5 rounded text-center truncate"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          {previewUrl ? `localhost:3001 · ${projectId}` : 'No preview'}
        </div>
        {loading && <Loader size={11} className="animate-spin" style={{ color: 'var(--muted)', flexShrink: 0 }} />}
      </div>

      {/* Frame */}
      <div className="flex-1 overflow-auto flex justify-center p-2"
        style={{ background: '#111' }}>
        {previewUrl ? (
          <div style={{
            width: mode.width, height: '100%', minHeight: 300, flexShrink: 0,
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            borderRadius: previewMode === 'desktop' ? 4 : 16,
            overflow: 'hidden', transition: 'width 0.3s ease',
          }}>
            <iframe key={key} src={previewUrl} title="Preview"
              style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
              onLoad={() => setLoading(false)} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 text-center" style={{ color: 'var(--muted)' }}>
            <Eye size={32} className="opacity-20" />
            <p className="text-sm">No preview yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
