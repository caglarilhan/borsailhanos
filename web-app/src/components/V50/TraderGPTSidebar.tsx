'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X } from 'lucide-react';

export default function TraderGPTSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      type: 'ai',
      content: 'Bugün en güçlü sinyaller: THYAO, SISE, EREGL.'
    }
  ]);

  const quickQuestions = [
    'Bankacılık sektörü analizi',
    'Bugün en iyi fırsatlar',
    'Risk analizi'
  ];

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, 
      { id: Date.now().toString(), type: 'user', content: input },
      { id: (Date.now() + 1).toString(), type: 'ai', content: 'AI analiz devam ediyor...' }
    ]);
    setInput('');
  };

  return (
    <>
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <MessageSquare className="w-7 h-7 text-white" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed bottom-6 right-6 w-96 h-[600px] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-cyan-500 p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-white" />
                <h3 className="text-white font-bold">🤖 TraderGPT</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.type === 'user'
                        ? 'bg-purple-500 text-white'
                        : 'bg-slate-800 text-gray-300'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Questions */}
            <div className="px-4 pb-2 space-y-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(q)}
                  className="w-full text-left text-xs text-cyan-400 hover:text-cyan-300 px-3 py-2 bg-slate-800 rounded-lg"
                >
                  💡 {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Soru sor..."
                className="flex-1 px-4 py-2 bg-slate-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleSend}
                className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center hover:from-purple-600 hover:to-cyan-600 transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

