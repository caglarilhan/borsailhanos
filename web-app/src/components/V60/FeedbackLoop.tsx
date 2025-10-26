'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  BarChart3,
  Zap,
  Award
} from 'lucide-react';

interface FeedbackEntry {
  id: string;
  symbol: string;
  signal: string;
  timestamp: Date;
  userVote: 'correct' | 'incorrect' | null;
  expectedOutcome: string;
  actualOutcome?: string;
}

export default function FeedbackLoop() {
  const [feedbacks, setFeedbacks] = useState<FeedbackEntry[]>([
    {
      id: '1',
      symbol: 'THYAO',
      signal: 'STRONG_BUY',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      userVote: 'correct',
      expectedOutcome: 'Yükseliş +5%',
      actualOutcome: 'Yükseliş +7.2%'
    },
    {
      id: '2',
      symbol: 'AKBNK',
      signal: 'BUY',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      userVote: 'correct',
      expectedOutcome: 'Yükseliş +3%',
      actualOutcome: 'Yükseliş +4.1%'
    },
    {
      id: '3',
      symbol: 'EREGL',
      signal: 'HOLD',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      userVote: 'correct',
      expectedOutcome: 'Konsolide',
      actualOutcome: 'Konsolide -0.5%'
    },
    {
      id: '4',
      symbol: 'TUPRS',
      signal: 'SELL',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      userVote: 'incorrect',
      expectedOutcome: 'Düşüş -4%',
      actualOutcome: 'Yükseliş +1.2%'
    }
  ]);

  const [stats, setStats] = useState({
    totalFeedback: 4,
    correct: 3,
    incorrect: 1,
    accuracy: 75,
    aiImprovement: 12.5
  });

  const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);

  const handleVote = (id: string, vote: 'correct' | 'incorrect') => {
    setFeedbacks(prev => prev.map(fb => 
      fb.id === id ? { ...fb, userVote: vote } : fb
    ));

    // Update stats
    const newStats = {
      ...stats,
      correct: stats.correct + (vote === 'correct' ? 1 : 0),
      incorrect: stats.incorrect + (vote === 'incorrect' ? 1 : 0),
      totalFeedback: stats.totalFeedback + 1
    };
    
    const newAccuracy = (newStats.correct / newStats.totalFeedback) * 100;
    
    setStats({
      ...newStats,
      accuracy: newAccuracy,
      aiImprovement: newAccuracy - 75 + 12.5
    });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-lg p-4 border border-emerald-500/30">
          <div className="text-3xl font-bold text-emerald-400">{stats.totalFeedback}</div>
          <div className="text-sm text-gray-400 mt-1">Toplam Feedback</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
          <div className="text-3xl font-bold text-green-400">{stats.correct}</div>
          <div className="text-sm text-gray-400 mt-1">Doğru Tahmin</div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg p-4 border border-red-500/30">
          <div className="text-3xl font-bold text-red-400">{stats.incorrect}</div>
          <div className="text-sm text-gray-400 mt-1">Yanlış Tahmin</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
          <div className="text-3xl font-bold text-purple-400">{stats.accuracy.toFixed(1)}%</div>
          <div className="text-sm text-gray-400 mt-1">AI İyileşme</div>
        </div>
      </div>

      {/* AI Learning Progress */}
      <div className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400" />
              AI Öğrenme İlerlemesi
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              Geri bildirimleriniz AI modelini güçlendiriyor
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-400">+{stats.aiImprovement.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">İyileşme Oranı</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-emerald-400 font-bold text-xl">87.5%</div>
            <div className="text-xs text-gray-400">Şu Anki Doğruluk</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-cyan-400 font-bold text-xl">+12.5%</div>
            <div className="text-xs text-gray-400">Geri Bildirim Etkisi</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-4">
            <div className="text-purple-400 font-bold text-xl">15</div>
            <div className="text-xs text-gray-400">Seviye Puanı</div>
          </div>
        </div>
      </div>

      {/* Feedback History */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Feedback Geçmişi
        </h4>

        <div className="space-y-3">
          {feedbacks.map((feedback, idx) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    feedback.signal.includes('BUY') ? 'bg-green-500 text-white' :
                    feedback.signal.includes('SELL') ? 'bg-red-500 text-white' :
                    'bg-amber-500 text-white'
                  }`}>
                    {feedback.signal}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{feedback.symbol}</div>
                    <div className="text-xs text-gray-400">{formatDate(feedback.timestamp)}</div>
                  </div>
                </div>

                {feedback.userVote && (
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                    feedback.userVote === 'correct' 
                      ? 'bg-emerald-500/20 border border-emerald-500/30' 
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}>
                    {feedback.userVote === 'correct' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-bold">
                      {feedback.userVote === 'correct' ? 'Doğru' : 'Yanlış'}
                    </span>
                  </div>
                )}
              </div>

              {feedback.actualOutcome && (
                <div className="mb-3 p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Beklenen:</span>
                    <span className="text-cyan-400 font-bold">{feedback.expectedOutcome}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-400">Gerçek:</span>
                    <span className="text-green-400 font-bold">{feedback.actualOutcome}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleVote(feedback.id, 'correct')}
                  disabled={feedback.userVote !== null}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                    feedback.userVote === 'correct'
                      ? 'bg-emerald-500 text-white'
                      : feedback.userVote === 'incorrect'
                      ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-slate-700 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5 inline mr-2" />
                  Doğru
                </button>
                <button
                  onClick={() => handleVote(feedback.id, 'incorrect')}
                  disabled={feedback.userVote !== null}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                    feedback.userVote === 'incorrect'
                      ? 'bg-red-500 text-white'
                      : feedback.userVote === 'correct'
                      ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                      : 'bg-slate-700 text-red-400 hover:bg-red-500/20'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5 inline mr-2" />
                  Yanlış
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rewards */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-lg p-6 border border-yellow-500/30">
        <div className="flex items-center gap-4">
          <Award className="w-12 h-12 text-yellow-400" />
          <div className="flex-1">
            <div className="font-bold text-yellow-400 mb-1">🎁 Ödül Sistemi Aktif</div>
            <p className="text-sm text-gray-300">
              Her feedback için 10 trader points kazanırsınız. AI'yı geliştirdikçe ödüller artar!
            </p>
          </div>
          <div className="text-2xl">💰</div>
        </div>
      </div>
    </div>
  );
}

