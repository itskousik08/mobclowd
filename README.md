# Mobclowd 🚀

**Professional Local AI Development Platform**

Build websites and web applications using local AI models powered by [Ollama](https://ollama.ai). Fully private, no cloud required.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![Ollama](https://img.shields.io/badge/Ollama-Compatible-purple.svg)](https://ollama.ai)

---

## ✨ Features

- **🤖 AI-Powered Development** — Chat with local AI models to build and modify websites
- **⚡ Live Code Generation** — Watch AI write code in real-time in the editor
- **🌐 Live Preview** — Instant preview with desktop, tablet, and mobile views
- **📁 File Explorer** — Full project management with create, rename, delete
- **💬 AI Chat Interface** — ChatGPT-style interface with streaming responses
- **🎨 Professional UI** — Dark-mode IDE inspired by Cursor and VS Code
- **📦 Project Templates** — Landing page, portfolio, dashboard, blog starters
- **💾 Export Projects** — Download as ZIP at any time
- **🔄 Undo/Redo** — Automatic snapshots before AI changes
- **🧠 AI Thinking Panel** — See what the AI is doing step by step

---

## 🎬 Quick Start

### Prerequisites

- [Node.js 18+](https://nodejs.org)
- [Ollama](https://ollama.ai) installed and running

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/itskousik08/mobclowd.git
cd mobclowd

# 2. Install all dependencies
npm run install:all

# 3. Set up environment
cp backend/.env.example backend/.env

# 4. Start Ollama (in a separate terminal)
ollama serve

# 5. Pull an AI model
ollama pull llama3

# 6. Start Mobclowd
npm run dev
```

### Open in browser

```
http://localhost:5173
```

---

## 🤖 Supported AI Models

Mobclowd works with any model available in Ollama:

| Model | Size | Best For |
|-------|------|----------|
| `llama3` | 4.7GB | General web development |
| `codellama` | 3.8GB | Code generation |
| `mistral` | 4.1GB | Fast generation |
| `deepseek-coder` | 776MB | Code-focused tasks |
| `glm4` | 5.5GB | Advanced reasoning |
| `phi3` | 2.3GB | Lightweight option |

```bash
# Install recommended model
ollama pull llama3

# Or for code-heavy work
ollama pull codellama

# Lightweight alternative
ollama pull phi3
```

---

## 🖥 User Guide

### Creating a Project

1. Click **New Project** on the home page
2. Enter a project name
3. Choose a template (or start blank)
4. The AI workspace opens automatically

### Using the AI

Type prompts in the AI chat panel on the right:

```
Create a modern hero section with a gradient background
```

```
Add a navigation bar with logo and links
```

```
Make the design responsive for mobile devices
```

```
Add smooth scroll animations to all sections
```

```
Create a contact form with validation
```

### Working with Code

- Click any file in the **File Explorer** to open it
- Edit code directly in the **Code Editor**
- Press `Ctrl+S` / `Cmd+S` to save
- The **Preview** updates automatically

### Preview Modes

- 🖥 **Desktop** — Full width view
- 📱 **Tablet** — 768px width
- 📲 **Mobile** — 375px width

### Exporting Your Project

Click **Export** in the top bar to download your project as a ZIP file.

---

## 🏗 Project Structure

```
mobclowd/
├── backend/                 # Express.js API server
│   ├── routes/
│   │   ├── ai.js           # AI streaming endpoints
│   │   ├── projects.js     # Project management
│   │   ├── files.js        # File operations
│   │   ├── ollama.js       # Ollama model API
│   │   └── templates.js    # Project templates
│   ├── services/
│   │   ├── agent.js        # AI coding agent
│   │   ├── ollama.js       # Ollama streaming client
│   │   ├── projects.js     # Project service
│   │   └── templates.js    # Template definitions
│   ├── workspace/          # User projects (auto-created)
│   └── server.js           # Main server entry
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat/       # AI chat interface
│   │   │   ├── Editor/     # CodeMirror editor
│   │   │   ├── FileExplorer/
│   │   │   ├── Preview/    # Live website preview
│   │   │   ├── Workspace/  # Header, Activity bar
│   │   │   ├── AI/         # Thinking panel
│   │   │   ├── Modals/     # New project modal
│   │   │   └── UI/         # Shared components
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   └── WorkspacePage.jsx
│   │   ├── store/          # Zustand state management
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # API client, helpers
│   │   └── styles/         # Global CSS
│   └── package.json
│
├── scripts/
│   └── setup.js            # Installation helper
├── docs/                   # Additional documentation
└── package.json            # Root workspace config
```

---

## ⚙ Configuration

### Backend Environment (`.env`)

```env
PORT=3001
OLLAMA_URL=http://localhost:11434
NODE_ENV=development
```

### Custom Ollama URL

If Ollama runs on a different host:

```env
OLLAMA_URL=http://192.168.1.100:11434
```

---

## 🔧 Development

```bash
# Start backend only
cd backend && npm run dev

# Start frontend only
cd frontend && npm run dev

# Build frontend for production
cd frontend && npm run build
```

---

## 🎨 Example Prompts

### Landing Pages

```
Create a SaaS landing page for a project management tool with dark theme
```

```
Build a hero section with animated gradient background and CTA buttons
```

### Portfolios

```
Create a developer portfolio with project cards and GitHub-style design
```

### UI Components

```
Add a sticky navigation bar with blur effect and mobile hamburger menu
```

```
Create a pricing table with 3 tiers, highlighted middle card
```

### Improvements

```
Make this page look more professional and modern
```

```
Add CSS animations to the hero section
```

```
Improve the mobile layout and fix spacing issues
```

---

## 🐛 Troubleshooting

### Ollama Not Connected

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve

# Check installed models
ollama list
```

### Port Already in Use

```bash
# Kill process on port 3001
kill $(lsof -ti:3001)

# Or change port in .env
echo "PORT=3002" >> backend/.env
```

### No Models Showing

```bash
# Pull a model first
ollama pull llama3

# Or a smaller model
ollama pull phi3:mini
```

### AI Not Generating Code

- Make sure a model is selected in the model picker
- Check Ollama status indicator (top right)
- Verify model is fully downloaded: `ollama list`

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

**Made with ❤️ using Ollama**
