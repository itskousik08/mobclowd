import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        if (next === 'light') document.documentElement.classList.add('light-mode');
        else document.documentElement.classList.remove('light-mode');
      },

      // Ollama
      ollamaStatus: 'unknown',
      models: [],
      selectedModel: '',
      setOllamaStatus: (s) => set({ ollamaStatus: s }),
      setModels: (m) => set({ models: m }),
      setSelectedModel: (m) => set({ selectedModel: m }),

      // Projects
      projects: [],
      currentProject: null,
      setProjects: (p) => set({ projects: p }),
      setCurrentProject: (p) => set({ currentProject: p }),
      addProject: (p) => set(s => ({ projects: [p, ...s.projects] })),
      removeProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),

      // Files
      fileTree: [],
      setFileTree: (t) => set({ fileTree: t }),
      openFiles: [],
      activeFile: null,
      openFile: (file) => {
        const { openFiles } = get();
        const exists = openFiles.find(f => f.path === file.path);
        if (!exists) set({ openFiles: [...openFiles, file], activeFile: file });
        else set({ activeFile: exists });
      },
      closeFile: (path) => {
        const { openFiles, activeFile } = get();
        const filtered = openFiles.filter(f => f.path !== path);
        const newActive = activeFile?.path === path ? (filtered[filtered.length - 1] || null) : activeFile;
        set({ openFiles: filtered, activeFile: newActive });
      },
      setActiveFile: (f) => set({ activeFile: f }),
      updateFileContent: (path, content) => {
        const { openFiles, activeFile } = get();
        const updated = openFiles.map(f => f.path === path ? { ...f, content, modified: true } : f);
        set({ openFiles: updated });
        if (activeFile?.path === path) set({ activeFile: { ...activeFile, content, modified: true } });
      },
      markFileSaved: (path) => {
        const { openFiles, activeFile } = get();
        const updated = openFiles.map(f => f.path === path ? { ...f, modified: false } : f);
        set({ openFiles: updated });
        if (activeFile?.path === path) set({ activeFile: { ...activeFile, modified: false } });
      },

      // Chat
      messages: [],
      isAiThinking: false,
      aiThinkingSteps: [],
      addMessage: (m) => set(s => ({ messages: [...s.messages, { ...m, id: m.id || Date.now() }] })),
      updateLastMessage: (upd) => set(s => {
        if (!s.messages.length) return s;
        const msgs = [...s.messages];
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...upd };
        return { messages: msgs };
      }),
      clearChat: () => set({ messages: [], aiThinkingSteps: [] }),
      setIsAiThinking: (v) => set({ isAiThinking: v }),
      setAiThinkingSteps: (s) => set({ aiThinkingSteps: s }),
      addThinkingStep: (s) => set(st => ({ aiThinkingSteps: [...st.aiThinkingSteps, s] })),

      // Preview
      previewUrl: '',
      previewMode: 'desktop',
      setPreviewUrl: (u) => set({ previewUrl: u }),
      setPreviewMode: (m) => set({ previewMode: m }),

      // Layout panels
      showExplorer: true,
      showChat: true,
      showPreview: true,
      togglePanel: (p) => set(s => ({ [p]: !s[p] })),

      // Mobile active panel
      mobilePanel: 'chat', // 'chat' | 'editor' | 'preview' | 'files'
      setMobilePanel: (p) => set({ mobilePanel: p }),

      // Prompt history
      promptHistory: [],
      addToHistory: (txt) => set(s => ({
        promptHistory: [{ text: txt, ts: Date.now() }, ...s.promptHistory].slice(0, 50)
      })),

      // AI actions log
      aiActions: [],
      addAiAction: (a) => set(s => ({ aiActions: [{ ...a, ts: Date.now() }, ...s.aiActions].slice(0, 30) })),
      clearAiActions: () => set({ aiActions: [] }),

      // Suggestions
      suggestions: [],
      setSuggestions: (s) => set({ suggestions: s }),
    }),
    {
      name: 'mobclowd-v2',
      partialize: (s) => ({
        theme: s.theme,
        selectedModel: s.selectedModel,
        promptHistory: s.promptHistory,
        showExplorer: s.showExplorer,
        showChat: s.showChat,
        showPreview: s.showPreview,
      })
    }
  )
);
