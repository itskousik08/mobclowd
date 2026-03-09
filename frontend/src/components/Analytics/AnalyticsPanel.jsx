import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, RefreshCw, TrendingUp, FileCode, GitCommit, Bot, Star } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#0d0d1a', border: '1px solid var(--border)', color: 'var(--text)' }}>
      <div className="font-semibold mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {p.value}</div>
      ))}
    </div>
  );
};

function MetricCard({ icon: Icon, label, value, color, trend }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="metric-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}15`, color }}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: 'var(--muted)' }}>{label}</div>
        <div className="text-xl font-bold mt-0.5">{value}</div>
      </div>
      {trend && (
        <div className="text-xs font-semibold" style={{ color: '#10b981' }}>
          <TrendingUp size={12} style={{ display: 'inline' }} /> {trend}
        </div>
      )}
    </motion.div>
  );
}

export default function AnalyticsPanel({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chart, setChart] = useState('commits');

  async function load() {
    setLoading(true);
    try {
      const d = await api.request(`/api/analytics/${projectId}`);
      setData(d);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { load(); }, [projectId]);

  return (
    <div className="tool-panel" style={{ width: 380 }}>
      <div className="tool-panel-header">
        <BarChart2 size={15} style={{ color: '#c084fc' }} />
        <span className="font-semibold text-sm">Analytics</span>
        <div className="flex-1" />
        <button onClick={load} className="btn-icon" style={{ width: 28, height: 28 }}>
          <RefreshCw size={13} />
        </button>
      </div>

      <div className="tool-panel-body">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="flex gap-1.5"><div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" /></div>
          </div>
        ) : !data ? (
          <div className="text-center py-8 text-sm" style={{ color: 'var(--muted)' }}>No data available</div>
        ) : (
          <div className="space-y-4">
            {/* Project health */}
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="score-ring"
                  style={{ borderColor: data.projectHealth.score >= 80 ? '#10b981' : data.projectHealth.score >= 60 ? '#f59e0b' : '#f43f5e', color: data.projectHealth.score >= 80 ? '#10b981' : '#f59e0b', width: 56, height: 56, fontSize: 16 }}>
                  {data.projectHealth.score}
                </div>
                <div>
                  <div className="font-semibold text-sm">Project Health</div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {[
                      { label: 'Git', ok: data.projectHealth.hasGit },
                      { label: 'Tests', ok: data.projectHealth.hasTests },
                      { label: 'README', ok: data.projectHealth.hasReadme },
                    ].map(item => (
                      <span key={item.label} className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: item.ok ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)', color: item.ok ? '#10b981' : '#f43f5e' }}>
                        {item.ok ? '✓' : '✗'} {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 gap-2">
              <MetricCard icon={FileCode} label="Total Files" value={data.summary.totalFiles} color="#818cf8" />
              <MetricCard icon={GitCommit} label="Commits" value={data.summary.commits} color="#34d399" />
              <MetricCard icon={Bot} label="AI Requests" value={data.summary.aiInteractions} color="#c084fc" />
              <MetricCard icon={Star} label="Lines of Code" value={(data.summary.totalLines || 0).toLocaleString()} color="#f59e0b" />
            </div>

            {/* Charts */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold">Activity (7 days)</span>
                <div className="flex-1" />
                <div className="flex gap-1">
                  {['commits', 'linesAdded', 'aiRequests'].map(c => (
                    <button key={c} onClick={() => setChart(c)}
                      className="text-[10px] px-2 py-1 rounded-md transition-all"
                      style={{
                        background: chart === c ? 'rgba(99,102,241,0.2)' : 'var(--surface3)',
                        color: chart === c ? '#818cf8' : 'var(--muted)'
                      }}>
                      {c === 'commits' ? 'Commits' : c === 'linesAdded' ? 'Lines' : 'AI'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.chartData}>
                    <defs>
                      <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey={chart} stroke="#6366f1" fill="url(#colorGrad)" strokeWidth={2} dot={false} name={chart} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
