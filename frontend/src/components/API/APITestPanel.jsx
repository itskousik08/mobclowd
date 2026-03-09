import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Play, Plus, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_COLORS = { GET: '#10b981', POST: '#818cf8', PUT: '#f59e0b', PATCH: '#22d3ee', DELETE: '#f43f5e' };

const EXAMPLES = [
  { name: 'JSONPlaceholder Posts', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts?_limit=5' },
  { name: 'JSONPlaceholder Users', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users' },
  { name: 'Create Post', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: '{"title":"Test","body":"Content","userId":1}' },
];

export default function APITestPanel() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts?_limit=3');
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }]);
  const [body, setBody] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('response');
  const [showExamples, setShowExamples] = useState(false);

  async function sendRequest() {
    if (!url.trim()) { toast.error('Enter a URL'); return; }
    setLoading(true);
    setResponse(null);
    const start = Date.now();
    try {
      const opts = {
        method,
        headers: headers.reduce((acc, h) => { if (h.key) acc[h.key] = h.value; return acc; }, {}),
      };
      if (['POST', 'PUT', 'PATCH'].includes(method) && body) opts.body = body;
      const res = await fetch(url, opts);
      const duration = Date.now() - start;
      const text = await res.text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { parsed = null; }
      setResponse({ status: res.status, statusText: res.statusText, duration, body: parsed || text, raw: text, size: text.length });
      setTab('response');
    } catch (e) {
      setResponse({ error: e.message, duration: Date.now() - start });
      toast.error('Request failed: ' + e.message);
    }
    setLoading(false);
  }

  function addHeader() {
    setHeaders(h => [...h, { key: '', value: '' }]);
  }

  function loadExample(ex) {
    setMethod(ex.method);
    setUrl(ex.url);
    if (ex.body) setBody(ex.body);
    setShowExamples(false);
  }

  const statusColor = !response ? 'var(--muted)'
    : response.status < 300 ? '#10b981'
    : response.status < 400 ? '#f59e0b'
    : '#f43f5e';

  return (
    <div className="tool-panel" style={{ width: 400 }}>
      <div className="tool-panel-header">
        <Globe size={15} style={{ color: '#22d3ee' }} />
        <span className="font-semibold text-sm">API Tester</span>
        <div className="flex-1" />
        <button onClick={() => setShowExamples(!showExamples)} className="btn-secondary text-xs py-1 px-2">
          Examples <ChevronDown size={12} />
        </button>
      </div>

      {showExamples && (
        <div className="px-3 pb-3 pt-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => loadExample(ex)}
              className="flex items-center gap-2 w-full text-xs py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="font-bold text-[10px]" style={{ color: METHOD_COLORS[ex.method] }}>{ex.method}</span>
              <span style={{ color: 'var(--text2)' }}>{ex.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="tool-panel-body space-y-3">
        {/* Method + URL */}
        <div className="flex gap-2">
          <select value={method} onChange={e => setMethod(e.target.value)}
            className="input text-xs py-2 w-24 flex-shrink-0 font-bold"
            style={{ color: METHOD_COLORS[method] }}>
            {METHODS.map(m => <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>)}
          </select>
          <input
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendRequest()}
            placeholder="https://api.example.com/endpoint"
            className="input text-xs py-2 flex-1 font-mono"
          />
          <button onClick={sendRequest} disabled={loading} className="btn-primary text-xs py-2 px-4 flex-shrink-0">
            {loading ? '...' : <Play size={13} />}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b" style={{ borderColor: 'var(--border)' }}>
          {['headers', 'body', 'response'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="text-xs pb-2 capitalize font-medium transition-colors"
              style={{ color: tab === t ? '#22d3ee' : 'var(--muted)', borderBottom: tab === t ? '2px solid #22d3ee' : '2px solid transparent' }}>
              {t}
              {t === 'response' && response && (
                <span className="ml-1 text-[10px] font-bold" style={{ color: statusColor }}>
                  {response.status}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === 'headers' && (
          <div className="space-y-2">
            {headers.map((h, i) => (
              <div key={i} className="flex gap-2">
                <input value={h.key} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, key: e.target.value } : x))}
                  placeholder="Header key" className="input text-xs py-1.5 flex-1" />
                <input value={h.value} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, value: e.target.value } : x))}
                  placeholder="Value" className="input text-xs py-1.5 flex-1" />
                <button onClick={() => setHeaders(hs => hs.filter((_, j) => j !== i))} className="btn-icon hover:text-red-400" style={{ width: 28, height: 28 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <button onClick={addHeader} className="btn-secondary text-xs py-1.5 w-full">
              <Plus size={12} /> Add Header
            </button>
          </div>
        )}

        {tab === 'body' && (
          <div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className="input font-mono text-xs resize-none"
              rows={8}
            />
          </div>
        )}

        {tab === 'response' && (
          !response ? (
            <div className="text-center py-8 text-xs" style={{ color: 'var(--muted)' }}>
              Send a request to see the response
            </div>
          ) : response.error ? (
            <div className="p-3 rounded-lg text-xs" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
              Error: {response.error}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Status bar */}
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold" style={{ color: statusColor }}>{response.status} {response.statusText}</span>
                <span style={{ color: 'var(--muted)' }}>{response.duration}ms</span>
                <span style={{ color: 'var(--muted)' }}>{(response.size / 1024).toFixed(1)}KB</span>
              </div>
              {/* Body */}
              <div className="rounded-lg overflow-auto" style={{ maxHeight: 280, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                <pre className="p-3 text-[11px] font-mono" style={{ color: '#e2e8f0' }}>
                  {typeof response.body === 'object' ? JSON.stringify(response.body, null, 2) : response.body}
                </pre>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
