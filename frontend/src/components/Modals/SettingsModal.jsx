import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Smile, Briefcase, Star, Check } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const PERSONALITIES = [
  {
    id: 'professional',
    icon: Briefcase,
    label: 'Professional',
    color: '#818cf8',
    desc: 'Clear, efficient, and to the point. Perfect for serious development work.',
    greeting: (name) => name ? `Welcome, ${name}.` : 'Welcome to MobCloud.'
  },
  {
    id: 'lovable',
    icon: Smile,
    label: 'Lovable',
    color: '#f472b6',
    desc: 'Friendly mentor style. Encouraging, warm, and celebratory of your progress.',
    greeting: (name, city) => name
      ? `Good morning${city ? ` from ${city}` : ''}, ${name}! Ready to build something amazing today? 🚀`
      : 'Hey there! Ready to build something amazing today? 🚀'
  },
  {
    id: 'expert',
    icon: Star,
    label: 'Expert',
    color: '#f59e0b',
    desc: 'Deep technical knowledge, precise terminology, and advanced recommendations.',
    greeting: (name) => name ? `Session initialized. Welcome, ${name}.` : 'Session initialized.'
  },
];

export default function SettingsModal({ open, onClose }) {
  const { personality, setPersonality, userName, setUserName, userCity, setUserCity, theme, toggleTheme } = useAppStore();
  const [name, setName] = useState(userName);
  const [city, setCity] = useState(userCity);

  function save() {
    setUserName(name);
    setUserCity(city);
    onClose();
  }

  const activeP = PERSONALITIES.find(p => p.id === personality) || PERSONALITIES[0];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }}
            className="card w-full max-w-md overflow-hidden"
            style={{ maxHeight: '85vh', overflowY: 'auto' }}>

            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                <User size={18} />
              </div>
              <div>
                <div className="font-bold text-sm">Preferences</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>Personalize your MobCloud experience</div>
              </div>
              <div className="flex-1" />
              <button onClick={onClose} className="btn-icon"><X size={16} /></button>
            </div>

            <div className="p-5 space-y-5">
              {/* User info */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Your Info</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text2)' }}>Your Name</label>
                    <input value={name} onChange={e => setName(e.target.value)}
                      placeholder="e.g. Kousik" className="input text-xs py-2" />
                  </div>
                  <div>
                    <label className="text-xs mb-1 block" style={{ color: 'var(--text2)' }}>Your City</label>
                    <input value={city} onChange={e => setCity(e.target.value)}
                      placeholder="e.g. Guwahati" className="input text-xs py-2" />
                  </div>
                </div>
              </div>

              {/* Personality */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>AI Personality</div>
                <div className="space-y-2">
                  {PERSONALITIES.map(p => (
                    <button key={p.id} onClick={() => setPersonality(p.id)}
                      className="w-full text-left p-3 rounded-xl transition-all"
                      style={{
                        background: personality === p.id ? `${p.color}10` : 'var(--surface2)',
                        border: `1.5px solid ${personality === p.id ? p.color + '50' : 'var(--border)'}`,
                      }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${p.color}15`, color: p.color }}>
                          <p.icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{p.label}</span>
                            {personality === p.id && <Check size={12} style={{ color: p.color }} />}
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: 'var(--muted)' }}>{p.desc}</div>
                        </div>
                      </div>
                      {personality === p.id && (
                        <div className="mt-2 p-2 rounded-lg text-[11px] italic" style={{ background: `${p.color}08`, color: 'var(--text2)' }}>
                          Preview: "{p.greeting(name || 'User', city)}"
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme */}
              <div className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>Appearance</div>
                <div className="flex gap-2">
                  {['dark', 'light'].map(t => (
                    <button key={t} onClick={() => theme !== t && toggleTheme()}
                      className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                      style={{
                        background: theme === t ? 'rgba(99,102,241,0.12)' : 'var(--surface2)',
                        border: `1.5px solid ${theme === t ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                        color: theme === t ? '#818cf8' : 'var(--text2)'
                      }}>
                      {t === 'dark' ? '🌙' : '☀️'} {t} mode
                    </button>
                  ))}
                </div>
              </div>

              {/* Save */}
              <button onClick={save} className="btn-primary w-full py-2.5 text-sm">
                Save Preferences
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
