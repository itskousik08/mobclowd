import React, { useRef, useEffect, useCallback, useState } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { X, Save, FileText, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

function getLang(path) {
  const ext = path?.split('.').pop()?.toLowerCase();
  return { html: html(), htm: html(), css: css(), js: javascript(), jsx: javascript({ jsx: true }),
    ts: javascript({ typescript: true }), tsx: javascript({ jsx: true, typescript: true }), json: json() }[ext] || html();
}

export default function EditorPanel({ projectId }) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const { openFiles, activeFile, closeFile, setActiveFile, updateFileContent, markFileSaved } = useAppStore();
  const [saving, setSaving] = useState(false);
  const lastPath = useRef(null);

  useEffect(() => {
    if (!editorRef.current || !activeFile) return;
    if (viewRef.current && lastPath.current === activeFile.path) return; // same file, don't recreate

    viewRef.current?.destroy();
    viewRef.current = null;
    lastPath.current = activeFile.path;

    const state = EditorState.create({
      doc: activeFile.content || '',
      extensions: [
        basicSetup,
        oneDark,
        getLang(activeFile.path),
        EditorView.theme({
          '&': { height: '100%', background: 'var(--surface)' },
          '.cm-content': { fontFamily: "'JetBrains Mono', monospace", fontSize: '13px', padding: '8px 0' },
          '.cm-focused': { outline: 'none' },
          '.cm-gutters': { background: 'var(--surface2)', borderRight: '1px solid var(--border)', minWidth: 44 },
          '.cm-lineNumbers .cm-gutterElement': { color: 'var(--muted)', fontSize: '12px' },
          '.cm-activeLineGutter': { background: 'rgba(99,102,241,0.08)' },
          '.cm-activeLine': { background: 'rgba(99,102,241,0.04)' },
          '.cm-selectionBackground': { background: 'rgba(99,102,241,0.2) !important' },
          '.cm-cursor': { borderLeftColor: '#818cf8' },
        }),
        EditorView.updateListener.of(upd => {
          if (upd.docChanged) updateFileContent(activeFile.path, upd.state.doc.toString());
        }),
      ]
    });

    viewRef.current = new EditorView({ state, parent: editorRef.current });
    return () => { viewRef.current?.destroy(); viewRef.current = null; lastPath.current = null; };
  }, [activeFile?.path]);

  // Sync external content changes (AI writes)
  useEffect(() => {
    if (!viewRef.current || !activeFile) return;
    const cur = viewRef.current.state.doc.toString();
    if (cur !== activeFile.content && activeFile.content !== undefined) {
      viewRef.current.dispatch({ changes: { from: 0, to: cur.length, insert: activeFile.content || '' } });
    }
  }, [activeFile?.content]);

  const save = useCallback(async () => {
    if (!activeFile || saving) return;
    setSaving(true);
    try {
      await api.writeFile(projectId, activeFile.path, activeFile.content || '');
      markFileSaved(activeFile.path);
      toast.success(`Saved`, { icon: '💾', duration: 1500 });
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  }, [activeFile, projectId, saving]);

  useEffect(() => {
    const fn = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); save(); } };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [save]);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--surface)' }}>
      {/* Tabs */}
      <div className="flex items-center overflow-x-auto flex-shrink-0"
        style={{ background: 'var(--surface2)', borderBottom: '1px solid var(--border)', minHeight: 36 }}>
        {openFiles.map(f => {
          const isActive = activeFile?.path === f.path;
          const fname = f.path.split('/').pop();
          return (
            <div key={f.path} onClick={() => setActiveFile(f)}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer flex-shrink-0 group text-xs transition-colors"
              style={{
                borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                borderRight: '1px solid var(--border)',
                background: isActive ? 'var(--surface)' : 'transparent',
                color: isActive ? 'var(--text)' : 'var(--muted)',
                minWidth: 80, maxWidth: 160,
              }}>
              <span className="truncate">{fname}</span>
              {f.modified && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
              <button onClick={e => { e.stopPropagation(); closeFile(f.path); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 hover:text-white">
                <X size={11} />
              </button>
            </div>
          );
        })}
        {openFiles.length === 0 && (
          <span className="text-xs px-4 py-2" style={{ color: 'var(--muted)' }}>Open a file to edit</span>
        )}
        <div className="flex-1" />
        {activeFile && (
          <button onClick={save} disabled={saving}
            className="px-3 py-1 text-xs flex items-center gap-1.5 flex-shrink-0 transition-colors"
            style={{ color: saving ? '#818cf8' : 'var(--muted)' }}>
            {saving ? <Loader size={11} className="animate-spin" /> : <Save size={11} />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      {/* Editor */}
      {activeFile ? (
        <div ref={editorRef} className="flex-1 overflow-hidden" style={{ minHeight: 0 }} />
      ) : (
        <div className="flex-1 flex items-center justify-center flex-col gap-3" style={{ color: 'var(--muted)' }}>
          <FileText size={36} className="opacity-20" />
          <div className="text-center">
            <p className="text-sm font-medium mb-1">No file open</p>
            <p className="text-xs opacity-70">Click a file in explorer or let AI generate code</p>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-0.5 text-xs flex-shrink-0"
        style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
        <span>{activeFile?.path || 'No file'}</span>
        <div className="flex items-center gap-3">
          {activeFile && <span>{activeFile.path.split('.').pop()?.toUpperCase()}</span>}
          <span>UTF-8</span>
          <span>Spaces: 2</span>
        </div>
      </div>
    </div>
  );
}
