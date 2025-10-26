'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, TrendingUp } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function TraderGPT() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Merhaba! Ben TraderGPT. Size bugün BIST piyasasında hangi sinyalleri izlemeniz gerektiğini söyleyebilirim. Sormak istediğiniz bir şey var mı?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses: Record<string, string> = {
        'bugün hangi hisseleri izlemeliyim': 'Bugün özellikle THYAO, AKBNK ve EREGL\'i izlemenizi öneririm. AI sinyallerine göre: THYAO'da güçlü momentum var (RSI 71). AKBNK\'da son 3 günde %5 pozitif trend görülüyor. EREGL ise destek seviyesine yakın, kısa vade fırsat olabilir.',
        'risk': 'Portföyünüzdeki risk seviyesi şu anda DÜŞÜK (CVaR: %3.2). En yüksek risk taşıyan pozisyon THYAO (%40 ağırlık). Önerim: Ağırlığı AKBNK ve EREGL\'e dağıtarak riski dengeliyin. Hedging için BIST30 short pozisyonu ekleyebilirsiniz.',
        'portfolio': 'Mevcut portföyünüz (THYAO %40, AKBNK %30, EREGL %30) için optimal ağırlık dağılımı: THYAO %35, AKBNK %35, EREGL %30. Bu dağılım ile Sharpe ratio 1.85\'e yükselir ve beklenen getiri %18\'dir.',
        'al sat': 'AI sinyallerine göre: THYAO için BUY sinyali mevcut (%85 güven). Hedef: 255 ₺, Stop-Loss: 240 ₺. AKBNK için BEKLE sinyali. EREGL için SELL sinyali (%72 güven). Hedef: 45 ₺, Stop-Loss: 48 ₺.'
      };

      const lowerInput = input.toLowerCase();
      let response = '';

      if (lowerInput.includes('hisse') || lowerInput.includes('izlemeli')) {
        response = responses['bugün hangi hisseleri izlemeliyim'];
      } else if (lowerInput.includes('risk')) {
        response = responses['risk'];
      } else if (lowerInput.includes('portfolio') || lowerInput.includes('portföy')) {
        response = responses['portfolio'];
      } else if (lowerInput.includes('al') || lowerInput.includes('sat')) {
        response = responses['al sat'];
      } else {
        response = `Bu konuda size yardımcı olabilirim. Şu alanlar hakkında soru sorabilirsiniz: ${lowerInput.includes('hisse') ? '' : 'hisseler, '}risk analizi, portfolio optimizasyonu, sinyaller. Daha spesifik bir soru sorarsanız, size detaylı yanıt verebilirim.`;
      }

      const aiMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">TraderGPT</h3>
            <p className="text-sm text-purple-200/80">AI Yatırım Asistanınız</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="h-[400px] overflow-y-auto p-6 space-y-4" style={{ background: 'rgba(15,23,42,0.5)' }}>
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl p-4 ${
                  msg.role === 'user' 
                    ? 'bg-cyan-500 text-white' 
                    : 'bg-slate-800 text-gray-100 border border-slate-700'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-xs mt-2 block opacity-70">
                    {msg.timestamp.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 items-center text-purple-400"
            >
              <Bot className="w-4 h-4" />
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Örn: Bugün hangi hisseleri izlemeliyim?"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              Gönder
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex gap-2 flex-wrap">
            {['Hisseler?', 'Risk?', 'Portföy?', 'Al/Sat?'].map((action) => (
              <button
                key={action}
                onClick={() => setInput(action)}
                className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-sm hover:bg-purple-500/30 transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-emerald-400 font-bold text-lg">87.3%</div>
          <div className="text-sm text-gray-400">AI Doğruluk</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-cyan-400 font-bold text-lg">1.85</div>
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-purple-400 font-bold text-lg">15</div>
          <div className="text-sm text-gray-400">Aktif Sinyal</div>
        </div>
      </div>
    </div>
  );
}

