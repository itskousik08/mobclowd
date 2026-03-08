const express = require('express');
const router = express.Router();
const AIAgent = require('../services/agent');

let agent;
router.use((req, res, next) => {
  if (!agent) {
    agent = new AIAgent(req.app.get('workspaceDir'), req.app.get('io'));
  }
  req.agent = agent;
  next();
});

// POST chat with AI (streaming via SSE)
router.post('/chat/:projectId', async (req, res) => {
  const { messages, model, socketId } = req.body;

  if (!messages || !model) {
    return res.status(400).json({ error: 'messages and model required' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const io = req.app.get('io');
  const fakeSocket = {
    emit: (event, data) => {
      res.write(`data: ${JSON.stringify({ event, data })}\n\n`);
    }
  };

  try {
    const result = await req.agent.processStream({
      projectId: req.params.projectId,
      messages,
      model,
      socket: fakeSocket
    });

    res.write(`data: ${JSON.stringify({ event: 'complete', data: result })}\n\n`);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ event: 'error', data: { message: err.message } })}\n\n`);
  }

  res.end();
});

// POST analyze project
router.post('/analyze/:projectId', async (req, res) => {
  const { model } = req.body;
  const projectDir = req.agent.getProjectDir(req.params.projectId);
  const context = await req.agent.readProjectContext(req.params.projectId);

  if (!context) return res.json({ analysis: 'No files found in project.' });

  const prompt = `Analyze this web project and provide:
1. What type of project this is
2. Current state and quality
3. Top 5 specific improvements you recommend
4. Technologies used

Project files:
${context}`;

  const io = req.app.get('io');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const { streamChat } = require('../services/ollama');
  await streamChat({
    model: model || 'llama3',
    messages: [{ role: 'user', content: prompt }],
    onChunk: (chunk, full) => {
      res.write(`data: ${JSON.stringify({ chunk, full })}\n\n`);
    },
    onDone: () => res.end(),
    onError: (err) => {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  });
});

// POST generate component
router.post('/component/:projectId', async (req, res) => {
  const { componentName, description, model } = req.body;

  const messages = [{
    role: 'user',
    content: `Create a ${componentName} component. ${description || ''}
    
    Make it modern, beautiful, and add it to the project. Create appropriate HTML, CSS, and JS files or add to existing ones.`
  }];

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const fakeSocket = {
    emit: (event, data) => {
      res.write(`data: ${JSON.stringify({ event, data })}\n\n`);
    }
  };

  try {
    await req.agent.processStream({
      projectId: req.params.projectId,
      messages,
      model,
      socket: fakeSocket
    });
  } catch (err) {
    res.write(`data: ${JSON.stringify({ event: 'error', data: { message: err.message } })}\n\n`);
  }

  res.end();
});

module.exports = router;
