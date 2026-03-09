# MobCloud Pro — Autonomous AI Agent Platform

> Full project lifecycle management: files, git, email, search, preview — all local, all private.

## Quick Start

```bash
# 1. Clone and enter
git clone <your-repo-url>
cd mobclowd-pro

# 2. Start with Docker (recommended)
docker compose up --build

# 3. Pull an AI model (in a new terminal)
ollama pull llama3        # General purpose
ollama pull qwen2.5       # Best for tool-calling
ollama pull llama3.2      # Fast, good for tools

# 4. Open the app
open http://localhost:5173

# 5. Test the agent
# In the chat: "Create test.txt with hello world"
```

## Manual Setup (No Docker)

### Backend (Python 3.11+)
```bash
cd agent
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env         # Edit as needed
uvicorn main:app --reload --port 8000
```

### Frontend (Node 18+)
```bash
cd frontend
npm install
npm run dev                  # Starts on port 5173
```

### Ollama
```bash
# macOS/Linux
curl https://ollama.ai/install.sh | sh
ollama serve
ollama pull llama3
```

## Architecture

```
mobclowd-pro/
├── agent/                    # Python FastAPI backend
│   ├── main.py               # FastAPI app, all REST + WS endpoints
│   ├── services/
│   │   ├── agent_runner.py   # ReAct loop over Ollama
│   │   ├── memory.py         # ChromaDB / SQLite RAG memory
│   │   └── audit.py          # Audit logger, vault, auth
│   ├── tools/
│   │   ├── file_tools.py     # Read/write/delete/organize with backup+diff
│   │   ├── git_tools.py      # GitPython integration
│   │   ├── email_tools.py    # IMAP/SMTP
│   │   ├── search_tools.py   # Glob + semantic search
│   │   ├── calendar_tools.py # ICS file ops
│   │   └── web_tools.py      # URL fetch → markdown
│   └── requirements.txt
├── frontend/                 # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   ├── chat/ChatAgent.jsx    # ReAct visualizer + voice
│       │   └── modals/ConfirmModal.jsx
│       ├── hooks/
│       │   ├── useAgentWS.js         # WebSocket to Python agent
│       │   └── useKeyboardShortcuts.js
│       ├── pages/
│       │   ├── SettingsPage.jsx      # Vault + model picker
│       │   └── LogsPage.jsx          # Audit log viewer
│       └── store/useProStore.js      # Zustand global state
├── tests/
│   └── backend/test_agent.py         # 20+ pytest tests
├── docker-compose.yml
└── README.md
```

## AI Capabilities

### File & Folder Operations
```
"Create src/components, src/hooks, src/lib folders"
"Read utils.js and summarize what it does"
"Edit index.html line 10 to add <div class='pro-theme'>"
"Delete all .log files in the logs/ folder"
"Organize root folder files by type into subfolders"
"Find all files that contain 'fetchUser'"
```

### Git
```
"Check git status"
"Commit all changes with message 'UI improvements'"
"Create branch 'feature/auth' and switch to it"
"Show last 10 commits"
"Push to origin main"
```

### Email (after configuring credentials in Settings → Vault)
```
"List my last 10 emails"
"Read email UID 123"
"Send email to alice@example.com with subject 'Update'"
"Search emails for 'invoice'"
```

### Database
```
"Create supabase.sql with a users and posts schema"
"Add src/lib/supabase.js with Supabase client setup"
"Set up Firebase config with auth and firestore"
```

### Web & Docs
```
"Fetch https://docs.tailwindcss.com and save as docs/tailwind.md"
"Read the React hooks documentation and create a summary"
```

### Calendar
```
"Create event 'Deploy v2' on 2024-12-01 at 10:00"
"List all upcoming events"
"Delete event with UID abc-123"
```

## Testing

```bash
# Backend tests
cd agent
pip install pytest pytest-asyncio
pytest ../tests/backend/test_agent.py -v

# Run specific test
pytest ../tests/backend/test_agent.py::test_full_file_workflow -v
```

## Security

- **Vault**: All secrets (GitHub token, email creds) encrypted with AES-256 via `cryptography` library
- **Sandbox**: All file ops restricted to project directory (path traversal blocked)
- **Confirm modals**: Every write/delete shown to user with diff before executing
- **Audit log**: Every action logged to SQLite with timestamp, actor, details
- **JWT auth**: Local username/password with 24h token expiry
- **Backups**: Automatic backup before every write/delete

### Default Login
- Username: `admin`
- Password: `mobcloud123`
- Change in: Settings → Auth

## Environment Variables

```bash
# agent/.env
MOBCLOUD_VAULT_KEY=your-32-char-secret-key
MOBCLOUD_JWT_SECRET=your-jwt-secret
OLLAMA_HOST=http://localhost:11434
```

## Recommended Models

| Model | Size | Best For |
|-------|------|----------|
| `qwen2.5` | 7B | Tool calling, code gen |
| `llama3` | 8B | General tasks |
| `llama3.2` | 3B | Fast, tool calling |
| `mistral-nemo` | 12B | Complex reasoning |
| `qwen2.5:72b` | 72B | Maximum capability |

## License

MIT — Free for local, private use.
