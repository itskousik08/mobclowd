import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitBranch, Database, Shield, Cpu, BarChart2, Bot, Globe,
  X, ChevronRight
} from 'lucide-react';
import GitPanel from '../Git/GitPanel.jsx';
import DatabasePanel from '../Database/DatabasePanel.jsx';
import SecurityPanel from '../Security/SecurityPanel.jsx';
import CICDPanel from '../CI/CICDPanel.jsx';
import AnalyticsPanel from '../Analytics/AnalyticsPanel.jsx';
import AgentsPanel from '../Agents/AgentsPanel.jsx';
import APITestPanel from '../API/APITestPanel.jsx';

const TOOLS = [
  { id: 'git', icon: GitBranch, label: 'Git', color: '#34d399', tip: 'Git Manager' },
  { id: 'db', icon: Database, label: 'DB', color: '#22d3ee', tip: 'Database' },
  { id: 'security', icon: Shield, label: 'Sec', color: '#10b981', tip: 'Security Scanner' },
  { id: 'cicd', icon: Cpu, label: 'CI', color: '#f59e0b', tip: 'CI/CD Pipeline' },
  { id: 'api', icon: Globe, label: 'API', color: '#22d3ee', tip: 'API Tester' },
  { id: 'agents', icon: Bot, label: 'AI', color: '#c084fc', tip: 'AI Agents' },
  { id: 'analytics', icon: BarChart2, label: 'Stats', color: '#c084fc', tip: 'Analytics' },
];

function PanelComponent({ toolId, projectId }) {
  switch (toolId) {
    case 'git': return <GitPanel projectId={projectId} />;
    case 'db': return <DatabasePanel projectId={projectId} />;
    case 'security': return <SecurityPanel projectId={projectId} />;
    case 'cicd': return <CICDPanel projectId={projectId} />;
    case 'api': return <APITestPanel />;
    case 'agents': return <AgentsPanel projectId={projectId} />;
    case 'analytics': return <AnalyticsPanel projectId={projectId} />;
    default: return null;
  }
}

export default function ToolsSidebar({ projectId }) {
  const [activeTool, setActiveTool] = useState(null);

  function toggle(toolId) {
    setActiveTool(activeTool === toolId ? null : toolId);
  }

  return (
    <div className="flex h-full" style={{ position: 'relative' }}>
      {/* Floating tool panel */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            key={activeTool}
            initial={{ opacity: 0, x: 20, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              right: '100%',
              top: 0,
              bottom: 0,
              zIndex: 50,
              overflow: 'hidden',
              display: 'flex',
            }}>
            <PanelComponent toolId={activeTool} projectId={projectId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar icons */}
      <div className="tools-sidebar">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => toggle(tool.id)}
            className={`tools-sidebar-btn tooltip ${activeTool === tool.id ? 'active' : ''}`}
            data-tip={tool.tip}
            title={tool.tip}
            style={activeTool === tool.id ? { color: tool.color, background: `${tool.color}15` } : {}}
          >
            <tool.icon size={16} />
          </button>
        ))}

        <div className="flex-1" />

        {activeTool && (
          <button onClick={() => setActiveTool(null)} className="tools-sidebar-btn" title="Close panel">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
