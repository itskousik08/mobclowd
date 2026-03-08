import React, { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, Folder, FolderOpen,
  FilePlus, FolderPlus, RefreshCw, Trash2, Edit2,
  X, Check, Search, FileText, Database, Globe
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

// File type config
const FILE_CONFIG = {
  // Web
  html: { color: '#e34c26', label: '🌐' },
  css:  { color: '#264de4', label: '🎨' },
  scss: { color: '#cc6699', label: '🎨' },
  js:   { color: '#f7df1e', label: '⚡' },
  jsx:  { color: '#61dafb', label: '⚛️' },
  ts:   { color: '#3178c6', label: '🔷' },
  tsx:  { color: '#3178c6', label: '⚛️' },
  vue:  { color: '#42b883', label: '💚' },
  // Data
  json: { color: '#fbc02d', label: '{}' },
  yaml: { color: '#fbc02d', label: '📋' },
  yml:  { color: '#fbc02d', label: '📋' },
  toml: { color: '#9c4221', label: '⚙️' },
  // Docs
  md:   { color: '#42a5f5', label: '📝' },
  txt:  { color: '#90a4ae', label: '📄' },
  // Media
  svg:  { color: '#ff7043', label: '🖼️' },
  png:  { color: '#66bb6a', label: '🖼️' },
  jpg:  { color: '#66bb6a', label: '🖼️' },
  ico:  { color: '#ff9800', label: '🔖' },
  // Code
  py:   { color: '#3776ab', label: '🐍' },
  php:  { color: '#777bb4', label: '🐘' },
  sql:  { color: '#f06292', label: '🗄️' },
  prisma: { color: '#2d3748', label: '◈' },
  // Config
  env:  { color: '#66bb6a', label: '🔑' },
  gitignore: { color: '#f14e32', label: '⬡' },
  dockerfile: { color: '#2496ed', label: '🐳' },
  sh:   { color: '#89e051', label: '⬢' },
  // Other
  xml:  { color: '#f97316', label: '📐' },
  graphql: { color: '#e10098', label: '◈' },
};

function getFileConfig(name) {
  const lower = name.toLowerCase();
  if (lower === 'dockerfile') return FILE_CONFIG.dockerfile;
  if (lower === '.gitignore') return FILE_CONFIG.gitignore;
  if (lower.startsWith('.env')) return FILE_CONFIG.env;
  const ext = lower.split('.').pop();
  return FILE_CONFIG[ext] || { color: '#90a4ae', label: '📄' };
}

// Count files in tree
function countFiles(tree) {
  return tree.reduce((sum, item) => {
    if (item.type === 'file') return sum + 1;
    return sum + countFiles(item.children || []);
  }, 0);
}

// Search in tree
function filterTree(tree, query) {
  if (!query) return tree;
  return tree.reduce((acc, item) => {
    if (item.type === 'directory') {
      const children = filterTree(item.children || [], query);
      if (children.length > 0) acc.push({ ...item, children, _open: true });
    } else if (item.name.toLowerCase().includes(query.toLowerCase())) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// ─── File / Folder Node ───────────────────────
function FileNode({ item, depth, projectId, onFileOpen, activeFilePath, onRefresh, forceOpen }) {
  const [open, setOpen] = useState(forceOpen || depth < 2);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const indent = depth * 14 + 8;
  const config = getFileConfig(item.name);

  async function del(e) {
    e.stopPropagation();
    if (!confirm(`Delete ${item.name}?`)) return;
    try { await api.deleteFile(projectId, item.path); onRefresh(); toast.success('Deleted'); }
    catch (err) { toast.error('Delete failed: ' + err.message); }
  }

  async function rename(e) {
    e?.preventDefault();
    if (!newName.trim() || newName === item.name) { setRenaming(false); return; }
    try {
      const dir = item.path.substring(0, item.path.lastIndexOf('/') + 1);
      await api.renameFile(projectId, item.path, dir + newName.trim());
      onRefresh(); setRenaming(false);
    } catch { toast.error('Rename failed'); }
  }

  // Directory
  if (item.type === 'directory') {
    const isOpen = forceOpen || open;
    return (
      <div>
        <div className="file-item group" style={{ paddingLeft: indent }} onClick={() => setOpen(v => !v)}>
          <span className="flex-shrink-0" style={{ color: 'var(--muted)', display: 'flex', alignItems: 'center' }}>
            {isOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
          <span className="flex-shrink-0">
            {isOpen
              ? <FolderOpen size={13} style={{ color: '#f59e0b' }} />
              : <Folder size={13} style={{ color: '#f59e0b' }} />}
          </span>
          {renaming ? (
            <form onSubmit={rename} onClick={e => e.stopPropagation()} className="flex-1">
              <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                onBlur={() => setRenaming(false)}
                className="w-full bg-transparent outline-none border-b text-xs"
                style={{ borderColor: 'var(--accent)' }} />
            </form>
          ) : (
            <>
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-xs opacity-40 flex-shrink-0">{(item.children || []).length}</span>
            </>
          )}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
            <button onClick={e => { e.stopPropagation(); setRenaming(true); }} className="btn-icon" style={{ width: 18, height: 18 }}>
              <Edit2 size={9} /></button>
            <button onClick={del} className="btn-icon hover:text-red-400" style={{ width: 18, height: 18 }}>
              <Trash2 size={9} /></button>
          </div>
        </div>
        {isOpen && (item.children || []).map(c => (
          <FileNode key={c.path} item={c} depth={depth + 1} projectId={projectId}
            onFileOpen={onFileOpen} activeFilePath={activeFilePath} onRefresh={onRefresh}
            forceOpen={forceOpen} />
        ))}
      </div>
    );
  }

  // File
  const isActive = activeFilePath === item.path;
  return (
    <div className={`file-item group ${isActive ? 'active' : ''}`} style={{ paddingLeft: indent }}
      onClick={() => onFileOpen(item.path)}>
      <span style={{ width: 11, flexShrink: 0 }} />
      <span className="text-xs flex-shrink-0" style={{ color: config.color }}>{config.label}</span>
      {renaming ? (
        <form onSubmit={rename} onClick={e => e.stopPropagation()} className="flex-1">
          <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
            onBlur={() => setRenaming(false)}
            className="w-full bg-transparent outline-none border-b text-xs"
            style={{ borderColor: 'var(--accent)' }} />
        </form>
      ) : (
        <span className="flex-1 truncate text-xs">{item.name}</span>
      )}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
        <button onClick={e => { e.stopPropagation(); setRenaming(true); }} className="btn-icon" style={{ width: 18, height: 18 }}>
          <Edit2 size={9} /></button>
        <button onClick={del} className="btn-icon hover:text-red-400" style={{ width: 18, height: 18 }}>
          <Trash2 size={9} /></button>
      </div>
    </div>
  );
}

// ─── Main Explorer ─────────────────────────────
export default function FileExplorer({ projectId, onFileOpen, onRefresh }) {
  const { fileTree, currentProject, activeFile } = useAppStore();
  const [newFileName, setNewFileName] = useState('');
  const [newDirName, setNewDirName] = useState('');
  const [showNewFile, setShowNewFile] = useState(false);
  const [showNewDir, setShowNewDir] = useState(false);
  const [search, setSearch] = useState('');

  const totalFiles = useMemo(() => countFiles(fileTree), [fileTree]);
  const visibleTree = useMemo(() => filterTree(fileTree, search), [fileTree, search]);

  async function createFile(e) {
    e.preventDefault();
    if (!newFileName.trim()) return;
    try {
      await api.writeFile(projectId, newFileName.trim(), '');
      await onRefresh();
      onFileOpen(newFileName.trim());
      setNewFileName(''); setShowNewFile(false);
      toast.success(`Created ${newFileName.trim()}`);
    } catch { toast.error('Create failed'); }
  }

  async function createDir(e) {
    e.preventDefault();
    if (!newDirName.trim()) return;
    try {
      await api.mkdir(projectId, newDirName.trim());
      await onRefresh();
      setNewDirName(''); setShowNewDir(false);
      toast.success(`Folder created`);
    } catch { toast.error('Create folder failed'); }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="px-3 pt-3 pb-2 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              {currentProject?.name || 'Explorer'}
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              {totalFiles} file{totalFiles !== 1 ? 's' : ''}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { setShowNewFile(v => !v); setShowNewDir(false); }}
              className="btn-icon tooltip" data-tip="New file" style={{ width: 24, height: 24 }}>
              <FilePlus size={13} /></button>
            <button onClick={() => { setShowNewDir(v => !v); setShowNewFile(false); }}
              className="btn-icon tooltip" data-tip="New folder" style={{ width: 24, height: 24 }}>
              <FolderPlus size={13} /></button>
            <button onClick={onRefresh} className="btn-icon tooltip" data-tip="Refresh" style={{ width: 24, height: 24 }}>
              <RefreshCw size={12} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search files..."
            className="input text-xs py-1.5 pl-7" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
              <X size={11} style={{ color: 'var(--muted)' }} /></button>
          )}
        </div>
      </div>

      {/* New file input */}
      {showNewFile && (
        <form onSubmit={createFile} className="px-2 py-1.5 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-1 items-center">
            <FileText size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
            <input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)}
              placeholder="path/to/file.ext" className="input text-xs py-1 flex-1" />
            <button type="submit" className="btn-icon" style={{ width: 26, height: 26, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Check size={11} /></button>
            <button type="button" onClick={() => setShowNewFile(false)} className="btn-icon" style={{ width: 26, height: 26 }}>
              <X size={11} /></button>
          </div>
          <p className="text-xs mt-1 px-1" style={{ color: 'var(--muted)' }}>Use / for nested: src/components/Nav.jsx</p>
        </form>
      )}

      {/* New dir input */}
      {showNewDir && (
        <form onSubmit={createDir} className="px-2 py-1.5 flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex gap-1 items-center">
            <Folder size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <input autoFocus value={newDirName} onChange={e => setNewDirName(e.target.value)}
              placeholder="folder/name" className="input text-xs py-1 flex-1" />
            <button type="submit" className="btn-icon" style={{ width: 26, height: 26, background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
              <Check size={11} /></button>
            <button type="button" onClick={() => setShowNewDir(false)} className="btn-icon" style={{ width: 26, height: 26 }}>
              <X size={11} /></button>
          </div>
        </form>
      )}

      <div className="flex-shrink-0" style={{ borderTop: '1px solid var(--border)' }} />

      {/* Tree */}
      <div className="flex-1 overflow-auto py-1">
        {visibleTree.length === 0 ? (
          <div className="text-center py-10 px-4">
            <Folder size={28} className="mx-auto mb-2 opacity-20" />
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              {search ? `No files matching "${search}"` : 'No files yet. Ask AI to create a project!'}
            </p>
          </div>
        ) : visibleTree.map(item => (
          <FileNode key={item.path} item={item} depth={0} projectId={projectId}
            onFileOpen={onFileOpen} activeFilePath={activeFile?.path}
            onRefresh={onRefresh} forceOpen={!!search} />
        ))}
      </div>
    </div>
  );
}
