import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import WorkspaceHeader from '../components/Workspace/WorkspaceHeader.jsx';
import FileExplorer from '../components/FileExplorer/FileExplorer.jsx';
import EditorPanel from '../components/Editor/EditorPanel.jsx';
import ChatPanel from '../components/Chat/ChatPanel.jsx';
import PreviewPanel from '../components/Preview/PreviewPanel.jsx';
import ToolsSidebar from '../components/Workspace/ToolsSidebar.jsx';

export default function WorkspacePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { setCurrentProject, setFileTree, openFile, updateFileContent, setPreviewUrl, mobilePanel, setMobilePanel, addNotification, personality, userName } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [explorerWidth, setExplorerWidth] = useState(220);
  const [chatWidth, setChatWidth] = useState(360);
  const dragging = useRef(null);

  useEffect(() => {
    api.getProject(projectId)
      .then(({ project, tree }) => {
        setCurrentProject(project);
        setFileTree(tree);
        setPreviewUrl(`/preview/${projectId}/index.html`);
      })
      .catch(() => { toast.error('Project not found'); navigate('/'); })
      .finally(() => setLoading(false));
  }, [projectId]);

  const refreshTree = useCallback(async () => {
    const { tree } = await api.getProject(projectId).catch(() => ({ tree: null }));
    if (tree) setFileTree(tree);
  }, [projectId]);

  const openFileHandler = useCallback(async (filePath) => {
    try {
      const { content, mimeType } = await api.readFile(projectId, filePath);
      openFile({ path: filePath, content, mimeType });
      setMobilePanel('editor');
    } catch { toast.error('Failed to open file'); }
  }, [projectId]);

  // Keyboard shortcut: Cmd+K focuses chat
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setMobilePanel('chat');
        document.querySelector('[data-chat-input]')?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Resize logic
  function startResize(side) {
    return (e) => {
      dragging.current = { side, startX: e.clientX };
      const onMove = (e) => {
        const dx = e.clientX - dragging.current.startX;
        dragging.current.startX = e.clientX;
        if (dragging.current.side === 'explorer') setExplorerWidth(w => Math.max(160, Math.min(340, w + dx)));
        if (dragging.current.side === 'chat') setChatWidth(w => Math.max(280, Math.min(500, w - dx)));
      };
      const onUp = () => { dragging.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); document.body.style.cursor = ''; document.body.style.userSelect = ''; };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    };
  }

  if (loading) return (
    <div className="h-screen app-bg flex items-center justify-center">
      <div className="flex gap-1.5"><div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" /></div>
    </div>
  );

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--bg)' }}>
      <WorkspaceHeader projectId={projectId} onRefreshTree={refreshTree} />

      {/* Desktop layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* File explorer */}
        <div className="hidden md:flex flex-col flex-shrink-0" style={{ width: explorerWidth }}>
          <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />
        </div>
        <div className="hidden md:block resize-h" onMouseDown={startResize('explorer')} />

        {/* Editor - center */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <EditorPanel projectId={projectId} />
        </div>

        {/* Preview */}
        <div className="hidden lg:flex flex-col flex-shrink-0" style={{ width: '35%', minWidth: 260 }}>
          <PreviewPanel projectId={projectId} />
        </div>

        {/* Chat */}
        <div className="hidden md:flex flex-col flex-shrink-0" style={{ width: chatWidth }}>
          <div className="resize-h" onMouseDown={startResize('chat')} style={{ width: 3 }} />
          <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />
        </div>

        {/* v4: Tools sidebar */}
        <div className="hidden md:flex">
          <ToolsSidebar projectId={projectId} />
        </div>
      </div>

      {/* Mobile layout */}
      <div className="md:hidden flex-1 overflow-hidden">
        {mobilePanel === 'files' && <FileExplorer projectId={projectId} onFileOpen={openFileHandler} onRefresh={refreshTree} />}
        {mobilePanel === 'editor' && <EditorPanel projectId={projectId} />}
        {mobilePanel === 'preview' && <PreviewPanel projectId={projectId} />}
        {mobilePanel === 'chat' && <ChatPanel projectId={projectId} onRefreshTree={refreshTree} />}
      </div>

      {/* Mobile bottom tabs */}
      <div className="md:hidden flex border-t flex-shrink-0" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        {[
          { id: 'chat', label: 'AI Chat', emoji: '🤖' },
          { id: 'files', label: 'Files', emoji: '📁' },
          { id: 'editor', label: 'Editor', emoji: '✏️' },
          { id: 'preview', label: 'Preview', emoji: '👁️' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setMobilePanel(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-1 text-xs transition-colors ${mobilePanel === tab.id ? 'text-indigo-400' : 'text-gray-500'}`}
            style={{ background: mobilePanel === tab.id ? 'rgba(99,102,241,0.08)' : 'transparent' }}>
            <span className="text-base">{tab.emoji}</span>
            <span className="text-[10px]">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
