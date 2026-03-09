require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Projects workspace directory
const WORKSPACE_DIR = path.join(__dirname, 'workspace');
fs.ensureDirSync(WORKSPACE_DIR);

// Make io available to routes
app.set('io', io);
app.set('workspaceDir', WORKSPACE_DIR);

// Routes
app.use('/api/ollama', require('./routes/ollama'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/files', require('./routes/files'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/system', require('./routes/system'));
// v4 Enhanced Routes
app.use('/api/git', require('./routes/git'));
app.use('/api/database', require('./routes/database'));
app.use('/api/security', require('./routes/security'));
app.use('/api/cicd', require('./routes/cicd'));
app.use('/api/analytics', require('./routes/analytics'));

// Serve workspace files statically for preview
app.use('/preview', express.static(WORKSPACE_DIR));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// Socket.IO events
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(`project-${projectId}`);
    console.log(`Socket ${socket.id} joined project ${projectId}`);
  });

  socket.on('leave-project', (projectId) => {
    socket.leave(`project-${projectId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Mobclowd Backend running on http://localhost:${PORT}`);
  console.log(`📁 Workspace: ${WORKSPACE_DIR}`);
  console.log(`🤖 Ollama API: ${process.env.OLLAMA_URL || 'http://localhost:11434'}\n`);
});

module.exports = { app, io };
