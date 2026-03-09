import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ── Theme ──────────────────────
      theme: 'dark',
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // ── Personality ─────────────────
      personality: 'professional', // 'professional' | 'lovable' | 'expert'
      userName: '',
      userCity: '',
      setPersonality: (personality) => set({ personality }),
      setUserName: (userName) => set({ userName }),
      setUserCity: (userCity) => set({ userCity }),

      // ── Ollama ──────────────────────
      ollamaStatus: 'unknown',
      models: [],
      selectedModel: '',
      setOllamaStatus: (s) => set({ ollamaStatus: s }),
      setModels: (m) => set({ models: m }),
      setSelectedModel: (m) => set({ selectedModel: m }),

      // ── Projects ────────────────────
      projects: [],
      currentProject: null,
      setProjects: (p) => set({ projects: p }),
      setCurrentProject: (p) => set({ currentProject: p }),
      addProject: (p) => set(s => ({ projects: [p, ...s.projects] })),
      removeProject: (id) => set(s => ({ projects: s.projects.filter(p => p.id !== id) })),

      // ── File Explorer ───────────────
      fileTree: [],
      setFileTree: (tree) => set({ fileTree: tree }),

      // ── Editor ──────────────────────
      openFiles: [],
      activeFile: null,
      openFile: (file) => set(s => {
        const exists = s.openFiles.find(f => f.path === file.path);
        if (exists) return { activeFile: exists };
        const updated = [...s.openFiles, file];
        return { openFiles: updated, activeFile: file };
      }),
      closeFile: (path) => set(s => {
        const updated = s.openFiles.filter(f => f.path !== path);
        const wasActive = s.activeFile?.path === path;
        return {
          openFiles: updated,
          activeFile: wasActive ? (updated[updated.length - 1] || null) : s.activeFile
        };
      }),
      setActiveFile: (file) => set({ activeFile: file }),
      updateFileContent: (path, content) => set(s => ({
        openFiles: s.openFiles.map(f => f.path === path ? { ...f, content, dirty: true } : f),
        activeFile: s.activeFile?.path === path ? { ...s.activeFile, content, dirty: true } : s.activeFile
      })),
      markFileSaved: (path) => set(s => ({
        openFiles: s.openFiles.map(f => f.path === path ? { ...f, dirty: false } : f),
        activeFile: s.activeFile?.path === path ? { ...s.activeFile, dirty: false } : s.activeFile
      })),

      // ── Preview ─────────────────────
      previewUrl: '',
      setPreviewUrl: (url) => set({ previewUrl: url }),

      // ── Chat / AI ───────────────────
      chatMessages: {},
      isAiThinking: false,
      aiThinkingSteps: [],
      aiActions: [],
      addMessage: (msg) => set(s => {
        const projectId = s.currentProject?.id || 'global';
        const msgs = s.chatMessages[projectId] || [];
        return { chatMessages: { ...s.chatMessages, [projectId]: [...msgs, { ...msg, id: Date.now() }] } };
      }),
      updateLastMessage: (updates) => set(s => {
        const projectId = s.currentProject?.id || 'global';
        const msgs = [...(s.chatMessages[projectId] || [])];
        if (!msgs.length) return {};
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...updates };
        return { chatMessages: { ...s.chatMessages, [projectId]: msgs } };
      }),
      clearMessages: (projectId) => set(s => ({
        chatMessages: { ...s.chatMessages, [projectId]: [] }
      })),
      setIsAiThinking: (v) => set({ isAiThinking: v }),
      setAiThinkingSteps: (steps) => set({ aiThinkingSteps: steps }),
      addAiAction: (action) => set(s => ({ aiActions: [...s.aiActions.slice(-50), action] })),

      // ── Panels (desktop) ───────────────
      showExplorer: true,
      showPreview: true,
      showChat: true,
      togglePanel: (panel) => set(s => ({ [`show${panel}`]: !s[`show${panel}`] })),

      // ── Mobile panel ──────────────────
      mobilePanel: 'chat',
      setMobilePanel: (p) => set({ mobilePanel: p }),

      // ── Notifications ─────────────────
      notifications: [],
      addNotification: (n) => set(s => ({ 
        notifications: [{ ...n, id: Date.now(), read: false, time: new Date().toISOString() }, ...s.notifications.slice(0, 49)]
      })),
      markAllRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),
      clearNotifications: () => set({ notifications: [] }),

      // ── Keyboard shortcuts preference ──
      cmdKEnabled: true,

      // ── Welcome seen ──────────────────
      welcomeSeen: false,
      setWelcomeSeen: () => set({ welcomeSeen: true }),
    }),
    {
      name: 'mobcloud-v4-store',
      partialize: (s) => ({
        theme: s.theme,
        personality: s.personality,
        userName: s.userName,
        userCity: s.userCity,
        selectedModel: s.selectedModel,
        welcomeSeen: s.welcomeSeen,
        cmdKEnabled: s.cmdKEnabled,
      })
    }
  )
);
