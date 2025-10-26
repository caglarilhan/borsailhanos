'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  TrendingUp, 
  Target,
  Award,
  Zap,
  Crown,
  BarChart3,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface UserStats {
  level: number;
  points: number;
  traderPoints: number;
  accuracyScore: number;
  totalSignals: number;
  correctSignals: number;
  badges: string[];
  weeklyProgress: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress: number;
}

export default function GamificationSystem() {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 5,
    points: 2840,
    traderPoints: 8750,
    accuracyScore: 87.3,
    totalSignals: 142,
    correctSignals: 124,
    badges: ['novice', 'analyzer', 'risk_manager'],
    weeklyProgress: 68
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'novice', title: 'Yeni Başlayan', description: 'İlk sinyal', icon: <Trophy className="w-8 h-8" />, unlocked: true, progress: 100 },
    { id: 'analyzer', title: 'Analizci', description: '10 sinyal analiz et', icon: <BarChart3 className="w-8 h-8" />, unlocked: true, progress: 100 },
    { id: 'risk_manager', title: 'Risk Yöneticisi', description: 'Risk analizi yap', icon: <Target className="w-8 h-8" />, unlocked: true, progress: 100 },
    { id: 'trader', title: 'Trader', description: '50 sinyal', icon: <TrendingUp className="w-8 h-8" />, unlocked: true, progress: 100 },
    { id: 'master', title: 'Usta Trader', description: '100 sinyal', icon: <Crown className="w-8 h-8" />, unlocked: false, progress: 58 },
    { id: 'ai_tester', title: 'AI Testçi', description: 'AI\'ya 25 feedback ver', icon: <Sparkles className="w-8 h-8" />, unlocked: false, progress: 32 }
  ]);

  const levelConfig = {
    1: { name: 'Başlangıç', color: '#94a3b8', next: 0 },
    2: { name: 'Çırak', color: '#10b981', next: 500 },
    3: { name: 'Kalfa', color: '#3b82f6', next: 1000 },
    4: { name: 'Trader', color: '#8b5cf6', next: 2000 },
    5: { name: 'Pro Trader', color: '#f59e0b', next: 5000 },
    6: { name: 'Master', color: '#ef4444', next: 10000 },
    7: { name: 'Elite', color: '#06b6d4', next: 25000 },
    8: { name: 'Legend', color: '#ec4899', next: 50000 }
  };

  const getLevelConfig = (level: number) => levelConfig[level as keyof typeof levelConfig] || levelConfig[8];

  const calculateProgress = () => {
    const config = getLevelConfig(userStats.level);
    const progress = (userStats.points / config.next) * 100;
    return Math.min(progress, 100);
  };

  const getLevelBadgeColor = (level: number) => {
    return getLevelConfig(level).color;
  };

  return (
    <div className="space-y-6">
      {/* User Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ 
                background: `linear-gradient(135deg, ${getLevelBadgeColor(userStats.level)}, ${getLevelConfig(userStats.level + 1).color})`,
                boxShadow: `0 10px 30px ${getLevelBadgeColor(userStats.level)}40`
              }}
            >
              {userStats.level}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">{getLevelConfig(userStats.level).name}</h3>
              <p className="text-sm text-yellow-200/80">Level {userStats.level}</p>
              <p className="text-xs text-gray-400 mt-1">{userStats.points} / {getLevelConfig(userStats.level).next} puan</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold" style={{ color: getLevelBadgeColor(userStats.level) }}>
              {userStats.traderPoints.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Trader Points</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${calculateProgress()}%` }}
            transition={{ duration: 1 }}
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, ${getLevelBadgeColor(userStats.level)}, ${getLevelConfig(userStats.level + 1).color})`
            }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-400 text-center">
          Sonraki level için {getLevelConfig(userStats.level).next - userStats.points} puan daha gerekli
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-emerald-400 font-bold text-2xl">{userStats.accuracyScore}%</div>
          <div className="text-sm text-gray-400">Doğruluk Skoru</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-cyan-400 font-bold text-2xl">{userStats.correctSignals}/{userStats.totalSignals}</div>
          <div className="text-sm text-gray-400">Doğru Sinyal</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/30">
          <div className="text-purple-400 font-bold text-2xl">{userStats.weeklyProgress}%</div>
          <div className="text-sm text-gray-400">Haftalık İlerleme</div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-400" />
          Rozetler ve Başarımlar
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`bg-slate-800/50 rounded-lg p-4 border-2 transition-all ${
                achievement.unlocked 
                  ? 'border-yellow-400/50 bg-yellow-400/10' 
                  : 'border-slate-700 opacity-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${achievement.unlocked ? 'text-yellow-400' : 'text-gray-600'}`}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white">{achievement.title}</div>
                  <div className="text-xs text-gray-400">{achievement.description}</div>
                  {!achievement.unlocked && (
                    <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  )}
                  {achievement.unlocked && (
                    <div className="mt-2 flex items-center gap-1 text-yellow-400 text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Kazanıldı
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Leaderboard */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/30">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          Haftalık Lider Tablosu
        </h4>
        <div className="space-y-3">
          {[
            { rank: 1, name: 'Ali Kaya', points: 15420, level: 8, accuracy: 92.1 },
            { rank: 2, name: 'Sen', points: 8750, level: 5, accuracy: 87.3 },
            { rank: 3, name: 'Mehmet Yılmaz', points: 8210, level: 5, accuracy: 84.5 },
            { rank: 4, name: 'Ayşe Demir', points: 7680, level: 4, accuracy: 81.2 },
            { rank: 5, name: 'Can Öz', points: 6920, level: 4, accuracy: 78.9 }
          ].map((entry, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                entry.rank === 2 ? 'bg-yellow-400/10 border border-yellow-400/30' : 'bg-slate-700/30'
              }`}
            >
              <div className="font-bold text-xl" style={{ color: idx < 3 ? '#fbbf24' : '#94a3b8' }}>
                #{entry.rank}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white">
                  {entry.name} {entry.rank === 2 && '👈 Sen'}
                </div>
                <div className="text-xs text-gray-400">Level {entry.level} • %{entry.accuracy.toFixed(1)} doğruluk</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-cyan-400">{entry.points.toLocaleString()}</div>
                <div className="text-xs text-gray-400">puan</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone */}
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-6 border border-purple-500/30">
        <div className="flex items-center gap-4">
          <Target className="w-12 h-12 text-purple-400" />
          <div className="flex-1">
            <div className="font-bold text-white">Sonraki Hedef</div>
            <div className="text-sm text-gray-300">
              <strong>{getLevelConfig(userStats.level + 1).name}</strong> olmak için <strong>{getLevelConfig(userStats.level).next - userStats.points}</strong> puan daha kazan!
            </div>
          </div>
          <div className="text-2xl">
            {userStats.level < 8 ? '🎯' : '🏆'}
          </div>
        </div>
      </div>
    </div>
  );
}

