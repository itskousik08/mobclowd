import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function ThinkingPanel() {
  const { isAiThinking, aiThinkingSteps } = useAppStore();
  if (!isAiThinking) return null;
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 z-50 max-w-xs w-full px-4"
        style={{ transform: 'translateX(-50%)' }}>
        <div className="glass rounded-xl px-4 py-3" style={{ border: '1px solid rgba(99,102,241,0.25)', boxShadow: '0 0 30px rgba(99,102,241,0.15)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain size={13} style={{ color: '#818cf8' }} />
            <span className="text-xs font-semibold" style={{ color: '#a5b4fc' }}>AI Thinking</span>
            <Loader size={11} className="animate-spin ml-auto" style={{ color: '#818cf8' }} />
          </div>
          <div className="space-y-1 max-h-24 overflow-auto">
            {aiThinkingSteps.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-start gap-1.5 text-xs" style={{ color: 'var(--text2)' }}>
                <span style={{ color: '#818cf8' }}>›</span>{s}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
