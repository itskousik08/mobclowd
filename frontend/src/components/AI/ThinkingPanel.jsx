import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Loader } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export default function ThinkingPanel() {
  const { isAiThinking, aiThinking } = useAppStore();

  if (!isAiThinking && aiThinking.length === 0) return null;

  return (
    <AnimatePresence>
      {isAiThinking && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: .95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: .95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="glass-strong rounded-xl px-4 py-3 border border-indigo-500/20"
            style={{ boxShadow: '0 0 40px rgba(99,102,241,.2)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Brain size={14} className="text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-300">AI Thinking</span>
              <Loader size={12} className="text-indigo-400 animate-spin ml-auto" />
            </div>
            <div className="space-y-1 max-h-28 overflow-auto">
              {aiThinking.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * .1 }}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">›</span>
                  <span className="text-gray-400">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
