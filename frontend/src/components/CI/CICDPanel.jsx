import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Play, CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronRight, Terminal } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';

function StepIcon({ status }) {
  if (status === 'success') return <CheckCircle size={15} style={{ color: '#10b981' }} />;
  if (status === 'failed') return <XCircle size={15} style={{ color: '#f43f5e' }} />;
  if (status === 'running') return <RefreshCw size={15} style={{ color: '#818cf8' }} className="animate-spin" />;
  return <Clock size={15} style={{ color: 'var(--muted)' }} />;
}

export default function CICDPanel({ projectId }) {
  const [runs, setRuns] = useState([]);
  const [running, setRunning] = useState(false);
  const [expandedRun, setExpandedRun] = useState(null);
  const [expandedStep, setExpandedStep] = useState({});

  async function loadRuns() {
    try {
      const data = await api.request(`/api/cicd/${projectId}/runs`);
      setRuns(data.runs || []);
    } catch {}
  }

  useEffect(() => { loadRuns(); }, [projectId]);

  // Poll for running pipelines
  useEffect(() => {
    const hasRunning = runs.some(r => r.status === 'running');
    if (!hasRunning) return;
    const iv = setInterval(loadRuns, 2000);
    return () => clearInterval(iv);
  }, [runs]);

  async function triggerRun() {
    setRunning(true);
    try {
      const data = await api.request(`/api/cicd/${projectId}/run`, {
        method: 'POST',
        body: JSON.stringify({ pipeline: 'default' })
      });
      toast.success('Pipeline started!');
      // Start polling
      setTimeout(() => {
        loadRuns();
        setRunning(false);
      }, 1000);
      // Continue polling
      const poll = setInterval(() => {
        loadRuns();
      }, 2000);
      setTimeout(() => clearInterval(poll), 60000);
    } catch (e) {
      toast.error(e.message);
      setRunning(false);
    }
  }

  return (
    <div className="tool-panel" style={{ width: 360 }}>
      <div className="tool-panel-header">
        <Cpu size={15} style={{ color: '#f59e0b' }} />
        <span className="font-semibold text-sm">CI/CD Pipeline</span>
        <div className="flex-1" />
        <button onClick={loadRuns} className="btn-icon" style={{ width: 28, height: 28 }}>
          <RefreshCw size={13} />
        </button>
        <button onClick={triggerRun} disabled={running} className="btn-primary text-xs py-1 px-3">
          <Play size={12} /> {running ? 'Starting...' : 'Run Pipeline'}
        </button>
      </div>

      <div className="tool-panel-body">
        {runs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.2)' }}>
              <Cpu size={28} style={{ color: '#f59e0b' }} />
            </div>
            <div className="font-semibold text-sm mb-1">No pipeline runs yet</div>
            <div className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
              Run your first CI/CD pipeline to check lint, build, security, and tests
            </div>
            <button onClick={triggerRun} disabled={running} className="btn-primary px-6 py-2">
              <Play size={14} /> Run Pipeline
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {runs.map((run, runIdx) => (
              <motion.div key={run.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {/* Run header */}
                <div className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
                  style={{ background: 'var(--surface2)' }}
                  onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}>
                  {run.status === 'success' && <CheckCircle size={15} style={{ color: '#10b981' }} />}
                  {run.status === 'failed' && <XCircle size={15} style={{ color: '#f43f5e' }} />}
                  {run.status === 'running' && <RefreshCw size={15} style={{ color: '#818cf8' }} className="animate-spin" />}
                  <div className="flex-1">
                    <div className="text-xs font-semibold">
                      Run #{runs.length - runIdx}
                      <span className="ml-2 font-normal" style={{ color: 'var(--muted)' }}>
                        {new Date(run.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    {run.duration && (
                      <div className="text-[10px]" style={{ color: 'var(--muted)' }}>
                        Completed in {run.duration}s
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: run.status === 'success' ? 'rgba(16,185,129,0.1)' : run.status === 'failed' ? 'rgba(244,63,94,0.1)' : 'rgba(99,102,241,0.1)',
                      color: run.status === 'success' ? '#10b981' : run.status === 'failed' ? '#f43f5e' : '#818cf8'
                    }}>
                    {run.status}
                  </span>
                  {expandedRun === run.id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </div>

                {/* Steps */}
                <AnimatePresence>
                  {expandedRun === run.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="p-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                        {run.steps?.map((step, si) => (
                          <div key={si}>
                            <div className={`pipeline-step ${step.status}`}
                              onClick={() => setExpandedStep(e => ({ ...e, [`${run.id}-${si}`]: !e[`${run.id}-${si}`] }))}
                              style={{ cursor: 'pointer' }}>
                              <StepIcon status={step.status} />
                              <span className="text-xs flex-1 font-medium">{step.name}</span>
                              {step.finishedAt && (
                                <span className="text-[10px]" style={{ color: 'var(--muted)' }}>
                                  {Math.round((new Date(step.finishedAt) - new Date(step.startedAt)) / 1000)}s
                                </span>
                              )}
                              {step.logs?.length > 0 && (
                                expandedStep[`${run.id}-${si}`] ? <ChevronDown size={11} /> : <ChevronRight size={11} />
                              )}
                            </div>
                            <AnimatePresence>
                              {expandedStep[`${run.id}-${si}`] && step.logs?.length > 0 && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden">
                                  <div className="mt-1 p-2 rounded-lg font-mono text-[10px] space-y-0.5"
                                    style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                                    {step.logs.map((log, li) => (
                                      <div key={li} style={{ color: step.status === 'failed' ? '#fb7185' : '#a3e635' }}>
                                        <Terminal size={9} style={{ display: 'inline', marginRight: 4 }} />
                                        {log}
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {(!run.steps || run.steps.length === 0) && (
                          <div className="text-xs text-center py-2" style={{ color: 'var(--muted)' }}>
                            {run.status === 'running' ? 'Pipeline starting...' : 'No step data'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
