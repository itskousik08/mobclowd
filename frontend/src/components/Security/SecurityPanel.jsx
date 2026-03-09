import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck, RefreshCw, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

const SEV_CONFIG = {
  critical: { color: '#ff4757', bg: 'rgba(255,71,87,0.08)', label: 'Critical', icon: ShieldAlert },
  high: { color: '#ff6b6b', bg: 'rgba(255,107,107,0.08)', label: 'High', icon: AlertTriangle },
  medium: { color: '#ffa502', bg: 'rgba(255,165,2,0.08)', label: 'Medium', icon: AlertCircle },
  low: { color: '#2ed573', bg: 'rgba(46,213,115,0.08)', label: 'Low', icon: Info },
};

export default function SecurityPanel({ projectId }) {
  const [scanData, setScanData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [expanded, setExpanded] = useState({});

  async function runScan() {
    setScanning(true);
    try {
      const data = await api.request(`/api/security/${projectId}/scan`);
      setScanData(data);
    } catch (e) {
      toast.error('Scan failed: ' + e.message);
    }
    setScanning(false);
  }

  const grouped = scanData ? scanData.findings.reduce((acc, f) => {
    if (!acc[f.severity]) acc[f.severity] = [];
    acc[f.severity].push(f);
    return acc;
  }, {}) : {};

  const scoreColor = !scanData ? 'var(--muted)' :
    scanData.score >= 80 ? '#10b981' : scanData.score >= 60 ? '#f59e0b' : '#f43f5e';

  return (
    <div className="tool-panel" style={{ width: 360 }}>
      <div className="tool-panel-header">
        <Shield size={15} style={{ color: '#10b981' }} />
        <span className="font-semibold text-sm">Security Scanner</span>
        <div className="flex-1" />
        <button onClick={runScan} disabled={scanning}
          className="btn-primary text-xs py-1 px-3">
          {scanning ? <><RefreshCw size={12} className="animate-spin" /> Scanning...</> : 'Scan Now'}
        </button>
      </div>

      <div className="tool-panel-body">
        {!scanData ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.2)' }}>
              <Shield size={28} style={{ color: '#10b981' }} />
            </div>
            <div className="font-semibold text-sm mb-1">Security Scanner</div>
            <div className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
              Scan your project for SQL injection, hardcoded secrets, XSS risks, and more
            </div>
            <button onClick={runScan} disabled={scanning} className="btn-primary px-6 py-2">
              {scanning ? 'Scanning...' : 'Run Security Scan'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <div className="score-ring" style={{
                borderColor: scoreColor, color: scoreColor,
                borderWidth: 4, boxShadow: `0 0 20px ${scoreColor}30`
              }}>
                {scanData.score}
              </div>
              <div>
                <div className="font-bold text-sm">Security Score</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {scanData.findings.length} issue{scanData.findings.length !== 1 ? 's' : ''} found
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  Scanned {new Date(scanData.scannedAt).toLocaleTimeString()}
                </div>
              </div>
              <div className="flex-1" />
              {['critical', 'high', 'medium', 'low'].map(sev => {
                const count = grouped[sev]?.length || 0;
                if (!count) return null;
                return (
                  <div key={sev} className="text-center">
                    <div className="text-lg font-bold" style={{ color: SEV_CONFIG[sev].color }}>{count}</div>
                    <div className="text-[10px] capitalize" style={{ color: 'var(--muted)' }}>{sev}</div>
                  </div>
                );
              })}
            </div>

            {/* npm audit */}
            {scanData.npmAudit && (
              <div className="p-3 rounded-lg" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <div className="text-xs font-semibold mb-2">npm audit</div>
                <div className="flex gap-3 flex-wrap">
                  {Object.entries(scanData.npmAudit.vulnerabilities || {}).map(([level, count]) => (
                    count > 0 && <span key={level} className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{ background: SEV_CONFIG[level]?.bg || 'var(--surface3)', color: SEV_CONFIG[level]?.color || 'var(--text2)' }}>
                      {count} {level}
                    </span>
                  ))}
                  {scanData.npmAudit.total === 0 && (
                    <span className="text-[11px] text-green-400">✓ No vulnerabilities</span>
                  )}
                </div>
              </div>
            )}

            {/* Findings grouped by severity */}
            {scanData.findings.length === 0 ? (
              <div className="text-center py-8">
                <ShieldCheck size={32} className="mx-auto mb-2" style={{ color: '#10b981' }} />
                <div className="font-semibold text-sm" style={{ color: '#10b981' }}>No issues found!</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Your code looks secure</div>
              </div>
            ) : (
              ['critical', 'high', 'medium', 'low'].map(sev => {
                const findings = grouped[sev];
                if (!findings?.length) return null;
                const cfg = SEV_CONFIG[sev];
                const isExpanded = expanded[sev] !== false;
                return (
                  <div key={sev}>
                    <button onClick={() => setExpanded(e => ({ ...e, [sev]: !isExpanded }))}
                      className="flex items-center gap-2 w-full text-xs font-semibold mb-2">
                      {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      <span style={{ color: cfg.color }}>{cfg.label} ({findings.length})</span>
                    </button>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-2">
                          {findings.map((f, i) => (
                            <div key={i} className="p-3 rounded-lg" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                              <div className="flex items-start gap-2">
                                <cfg.icon size={13} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-semibold" style={{ color: cfg.color }}>{f.name}</div>
                                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text2)' }}>{f.description}</div>
                                  <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--muted)' }}>
                                    {f.file}:{f.line}
                                  </div>
                                  {f.code && (
                                    <code className="text-[10px] block mt-1 px-2 py-1 rounded"
                                      style={{ background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontFamily: 'JetBrains Mono, monospace' }}>
                                      {f.code}
                                    </code>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}

            <button onClick={runScan} disabled={scanning} className="btn-secondary text-xs py-2 w-full">
              <RefreshCw size={12} /> Re-scan Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
