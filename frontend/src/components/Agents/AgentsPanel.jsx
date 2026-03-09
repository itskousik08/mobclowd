import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Code, GitBranch, Bug, Rocket, BookOpen, Database, Shield, Mail, Zap, Play, CheckCircle, Clock } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import toast from 'react-hot-toast';

const AGENTS = [
  { id: 'CodeAgent', icon: Code, color: '#818cf8', desc: 'Generates, refactors, and edits code', prompts: ['Refactor all components to use TypeScript', 'Add error boundaries to React components', 'Optimize performance bottlenecks'] },
  { id: 'GitAgent', icon: GitBranch, color: '#34d399', desc: 'Manages commits, branches, and PRs', prompts: ['Auto-commit current changes with smart message', 'Create feature branch for user auth', 'Generate PR description for current diff'] },
  { id: 'DebugAgent', icon: Bug, color: '#f43f5e', desc: 'Finds and fixes bugs automatically', prompts: ['Scan code for common React bugs', 'Fix all TypeScript errors', 'Review and fix accessibility issues'] },
  { id: 'DeployAgent', icon: Rocket, color: '#f59e0b', desc: 'Manages deployment and CI/CD', prompts: ['Create Dockerfile for this project', 'Generate GitHub Actions workflow', 'Add nginx config for static hosting'] },
  { id: 'DocsAgent', icon: BookOpen, color: '#22d3ee', desc: 'Generates documentation and READMEs', prompts: ['Generate comprehensive README.md', 'Add JSDoc comments to all functions', 'Create API documentation'] },
  { id: 'DatabaseAgent', icon: Database, color: '#a78bfa', desc: 'Designs schemas and queries', prompts: ['Design database schema for this app', 'Add Prisma ORM integration', 'Create migration scripts'] },
  { id: 'SecurityAgent', icon: Shield, color: '#10b981', desc: 'Audits and secures the codebase', prompts: ['Fix all security vulnerabilities found', 'Add input validation everywhere', 'Implement CORS and rate limiting'] },
  { id: 'EmailAgent', icon: Mail, color: '#fb923c', desc: 'Handles email templates and SMTP', prompts: ['Create email notification templates', 'Set up nodemailer configuration', 'Design HTML email layout'] },
];

export default function AgentsPanel({ projectId }) {
  const { addMessage, updateLastMessage, setIsAiThinking, selectedModel } = useAppStore();
  const [activeAgent, setActiveAgent] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [running, setRunning] = useState(null);
  const [completedAgents, setCompletedAgents] = useState([]);

  function selectAgent(agent) {
    setActiveAgent(activeAgent?.id === agent.id ? null : agent);
    setSelectedPrompt('');
  }

  async function runAgentTask(agent, prompt) {
    if (!selectedModel) { toast.error('Select an Ollama model first'); return; }
    setRunning(agent.id);
    toast.loading(`${agent.id} is working...`, { id: 'agent' });

    const agentPrompt = `[${agent.id}] ${prompt}`;
    addMessage({ role: 'user', content: `🤖 ${agent.id}: ${prompt}` });
    addMessage({ role: 'assistant', content: '', streaming: true });
    setIsAiThinking(true);

    try {
      const { streamAI } = await import('../../utils/api');
      await new Promise((resolve, reject) => {
        streamAI({
          projectId,
          messages: [{ role: 'user', content: agentPrompt }],
          model: selectedModel,
          onChunk: (chunk, full) => {
            const display = full.replace(/<file path="[^"]*">[\s\S]*?<\/file>/g, '').replace(/<thinking>[\s\S]*?<\/thinking>/g, '').trim();
            updateLastMessage({ content: display, streaming: true });
          },
          onDone: () => {
            updateLastMessage({ streaming: false });
            setIsAiThinking(false);
            setCompletedAgents(c => [...c, agent.id]);
            toast.success(`${agent.id} completed!`, { id: 'agent' });
            setRunning(null);
            resolve();
          },
          onError: (err) => {
            setIsAiThinking(false);
            setRunning(null);
            toast.error(err.message, { id: 'agent' });
            reject(err);
          }
        });
      });
    } catch {}
  }

  return (
    <div className="tool-panel" style={{ width: 360 }}>
      <div className="tool-panel-header">
        <Bot size={15} style={{ color: '#c084fc' }} />
        <span className="font-semibold text-sm">AI Agents</span>
        <span className="tag tag-indigo text-[10px] ml-1">{AGENTS.length} agents</span>
        <div className="flex-1" />
        <Zap size={13} style={{ color: '#f59e0b' }} />
      </div>

      <div className="tool-panel-body space-y-2">
        <div className="text-xs mb-3" style={{ color: 'var(--muted)' }}>
          Select an agent and give it a task. Agents communicate through the chat panel.
        </div>

        {AGENTS.map((agent) => (
          <div key={agent.id}>
            <motion.button
              onClick={() => selectAgent(agent)}
              className={`agent-card w-full text-left ${activeAgent?.id === agent.id ? 'active' : ''}`}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${agent.color}15`, color: agent.color }}>
                  <agent.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold">{agent.id}</span>
                    {completedAgents.includes(agent.id) && (
                      <CheckCircle size={11} style={{ color: '#10b981' }} />
                    )}
                    {running === agent.id && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full animate-pulse"
                        style={{ background: `${agent.color}20`, color: agent.color }}>running</span>
                    )}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{agent.desc}</div>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ background: running === agent.id ? agent.color : 'var(--border)' }} />
              </div>
            </motion.button>

            <AnimatePresence>
              {activeAgent?.id === agent.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden">
                  <div className="mt-2 p-3 rounded-lg space-y-2" style={{ background: 'var(--surface2)', border: `1px solid ${agent.color}25` }}>
                    <div className="text-[11px] font-semibold" style={{ color: agent.color }}>Quick Tasks</div>
                    {agent.prompts.map((p, i) => (
                      <button key={i} onClick={() => setSelectedPrompt(p)}
                        className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                        style={{
                          background: selectedPrompt === p ? `${agent.color}15` : 'var(--surface3)',
                          color: selectedPrompt === p ? agent.color : 'var(--text2)',
                          border: `1px solid ${selectedPrompt === p ? agent.color + '40' : 'var(--border)'}`
                        }}>
                        {p}
                      </button>
                    ))}
                    <input
                      value={selectedPrompt}
                      onChange={e => setSelectedPrompt(e.target.value)}
                      placeholder="Or type a custom task..."
                      className="input text-xs py-2 mt-1"
                    />
                    <button
                      onClick={() => selectedPrompt && runAgentTask(agent, selectedPrompt)}
                      disabled={!selectedPrompt || running === agent.id}
                      className="btn-primary text-xs py-2 w-full"
                      style={{ background: `linear-gradient(135deg, ${agent.color}, ${agent.color}99)` }}>
                      <Play size={12} /> Run {agent.id}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
