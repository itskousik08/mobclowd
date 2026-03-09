# 🚀 MobCloud AI v4

**Local Autonomous Development Platform** — Build, debug, deploy, and manage your entire software lifecycle with AI, all privately on your device.

[![Local First](https://img.shields.io/badge/Local%20First-100%25%20Private-6366f1?style=flat-square)](https://github.com)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-8b5cf6?style=flat-square)](https://ollama.ai)
[![Version](https://img.shields.io/badge/Version-4.0.0-22d3ee?style=flat-square)](https://github.com)

---

## ✨ What's New in v4

MobCloud v4 is a complete upgrade from v3, transforming the platform into a full autonomous development environment:

| Feature | v3 | v4 |
|---------|----|----|
| AI Chat | ✅ | ✅ Enhanced with agent commands |
| Live Code Gen | ✅ | ✅ Multi-file, better streaming |
| Instant Preview | ✅ | ✅ Desktop + Mobile |
| File Explorer | ✅ | ✅ With drag & drop |
| **Git Manager** | ❌ | ✅ Full git workflow UI |
| **Database Manager** | ❌ | ✅ SQLite schema + query builder |
| **Security Scanner** | ❌ | ✅ Auto vulnerability detection |
| **CI/CD Pipeline** | ❌ | ✅ Local pipeline simulator |
| **API Tester** | ❌ | ✅ Postman-style tool |
| **AI Agent System** | ❌ | ✅ 8 specialized agents |
| **Analytics Dashboard** | ❌ | ✅ Dev metrics + charts |
| **Personality Modes** | ❌ | ✅ Professional / Lovable / Expert |
| **Settings Panel** | ❌ | ✅ User preferences |
| **Keyboard Shortcuts** | ❌ | ✅ Cmd+K for chat |
| **Notification System** | ❌ | ✅ In-app notifications |

---

## 🏃 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Ollama](https://ollama.ai) installed and running

### 1. Install Ollama & Pull a Model

```bash
# Install Ollama from https://ollama.ai
ollama pull llama3          # Recommended (8B)
# or
ollama pull codellama       # Better for code
ollama pull mistral         # Fast and capable
```

### 2. Setup MobCloud

```bash
# Install all dependencies
npm run install:all

# Start development servers
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🧠 AI Agents

MobCloud v4 includes 8 specialized AI agents accessible from the tools sidebar:

| Agent | Purpose |
|-------|---------|
| **CodeAgent** | Generates, refactors, and edits code |
| **GitAgent** | Auto-commits, branch management, PR descriptions |
| **DebugAgent** | Finds and fixes bugs automatically |
| **DeployAgent** | Dockerfiles, CI/CD, deployment configs |
| **DocsAgent** | README, JSDoc, API documentation |
| **DatabaseAgent** | Schema design, migrations, queries |
| **SecurityAgent** | Vulnerability fixes, input validation |
| **EmailAgent** | Email templates, SMTP configuration |

### Example Commands

```
Create React dashboard with authentication
Fix all TypeScript errors in src/
Add Docker support for this project
Generate comprehensive README with API docs
Create SQLite schema for a blog app
Scan and fix all security vulnerabilities
```

---

## 🛠️ Tools Sidebar (New in v4)

Click the icons on the right sidebar in the workspace:

- **Git** — Initialize repos, view changes, commit, view history
- **DB** — SQLite schema viewer, query builder, table management
- **Sec** — Security scanner with severity scoring
- **CI** — CI/CD pipeline simulator with step logs
- **API** — Postman-style API testing tool
- **AI** — Multi-agent orchestration panel
- **Stats** — Analytics dashboard with charts

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Focus AI chat input |
| `Ctrl + Enter` | Send chat message |
| `Ctrl + S` | Save active file |

---

## 🎭 Personality Modes

Configure your preferred AI interaction style in **Settings** (gear icon):

- **Professional** — Clear, efficient, neutral
- **Lovable** — Friendly mentor, encouraging, celebratory
  > *"Good morning Kousik from Guwahati! Ready to build something amazing today? 🚀"*
- **Expert** — Deep technical, precise terminology

---

## 🔒 Privacy & Security

- **100% Local** — All data stays on your machine
- **No telemetry** — Zero external data collection
- **Encrypted** — API keys stored locally
- **Sandboxed** — Code execution in isolated environments
- **Offline First** — Works without internet

---

## 📁 Project Structure

```
mobcloud-v4/
├── backend/                 # Node.js + Express API
│   ├── routes/
│   │   ├── ai.js           # AI streaming endpoint
│   │   ├── git.js          # Git operations (NEW)
│   │   ├── database.js     # SQLite management (NEW)
│   │   ├── security.js     # Security scanning (NEW)
│   │   ├── cicd.js         # Pipeline simulation (NEW)
│   │   ├── analytics.js    # Metrics tracking (NEW)
│   │   ├── files.js        # File management
│   │   ├── projects.js     # Project CRUD
│   │   └── ollama.js       # Ollama proxy
│   ├── services/
│   │   ├── agent.js        # AI agent with file writing
│   │   ├── ollama.js       # Streaming chat
│   │   └── projects.js     # Project service
│   └── server.js           # Express + Socket.IO
│
└── frontend/                # React + Vite
    └── src/
        ├── components/
        │   ├── Workspace/
        │   │   ├── WorkspaceHeader.jsx
        │   │   └── ToolsSidebar.jsx   # NEW - tool hub
        │   ├── Chat/ChatPanel.jsx     # AI chat
        │   ├── Editor/EditorPanel.jsx # CodeMirror editor
        │   ├── Preview/PreviewPanel.jsx
        │   ├── FileExplorer/
        │   ├── Git/GitPanel.jsx       # NEW
        │   ├── Database/DatabasePanel.jsx # NEW
        │   ├── Security/SecurityPanel.jsx # NEW
        │   ├── CI/CICDPanel.jsx       # NEW
        │   ├── API/APITestPanel.jsx   # NEW
        │   ├── Agents/AgentsPanel.jsx # NEW
        │   ├── Analytics/AnalyticsPanel.jsx # NEW
        │   └── Modals/
        │       ├── SettingsModal.jsx  # NEW
        │       └── NewProjectModal.jsx
        ├── store/useAppStore.js       # Zustand state
        └── utils/api.js               # API client
```

---

## 🚧 Roadmap

- [ ] Email Management (IMAP/SMTP)
- [ ] Performance Profiler (flame graphs)
- [ ] SEO Analyzer
- [ ] Workflow Builder (visual drag-drop)
- [ ] Plugin Marketplace
- [ ] Multi-language UI (react-i18next)
- [ ] Backup System with timeline
- [ ] Offline Knowledge Base (RAG + PDF indexing)
- [ ] Accessibility Scanner (WCAG)

---

## 📄 License

MIT — Built with ❤️ for developers who value privacy
