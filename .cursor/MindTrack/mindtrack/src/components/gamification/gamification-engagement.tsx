"use client";

import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Heart,
  Activity,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  FileText,
  BookOpen,
  Brain,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Minus,
  Edit,
  Trash2,
  Copy,
  Share2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Gift,
  Crown,
  Medal,
  Flag,
  Sparkles,
  Rocket,
  Diamond,
  Gem,
  Coins,
  Wallet,
  ShoppingCart
} from "lucide-react";

// Gamification & Patient Engagement için gerekli interface'ler
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'therapy' | 'wellness' | 'social' | 'learning' | 'milestone';
  points: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress: number; // 0-100
  requirements: {
    type: 'appointments' | 'messages' | 'documents' | 'goals' | 'streak' | 'custom';
    target: number;
    current: number;
    description: string;
  }[];
  rewards: {
    type: 'points' | 'badge' | 'feature' | 'discount' | 'recognition';
    value: string;
    description: string;
  }[];
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  category: 'mental-health' | 'physical' | 'social' | 'learning' | 'creativity';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  duration: number; // days
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCompleted: boolean;
  progress: number; // 0-100
  tasks: {
    id: string;
    description: string;
    isCompleted: boolean;
    completedAt?: Date;
    points: number;
  }[];
  rewards: {
    points: number;
    badges: string[];
    features: string[];
  };
  participants: number;
  leaderboard: {
    rank: number;
    participantId: string;
    participantName: string;
    score: number;
    completedAt?: Date;
  }[];
}

interface PatientEngagement {
  patientId: string;
  totalPoints: number;
  level: number;
  experience: number;
  experienceToNextLevel: number;
  streak: number; // consecutive days
  longestStreak: number;
  achievements: Achievement[];
  challenges: Challenge[];
  badges: {
    id: string;
    name: string;
    icon: string;
    earnedAt: Date;
    category: string;
  }[];
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    totalMessages: number;
    totalDocuments: number;
    goalsCompleted: number;
    challengesCompleted: number;
    daysActive: number;
    lastActive: Date;
  };
  preferences: {
    notifications: boolean;
    leaderboard: boolean;
    socialFeatures: boolean;
    personalizedChallenges: boolean;
  };
}

interface MotivationTool {
  id: string;
  name: string;
  type: 'quote' | 'video' | 'exercise' | 'meditation' | 'journal' | 'reminder';
  category: 'inspiration' | 'education' | 'practice' | 'reflection';
  content: string;
  duration?: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isCompleted: boolean;
  completedAt?: Date;
  rating?: number; // 1-5
  feedback?: string;
  tags: string[];
  isRecommended: boolean;
  usageCount: number;
  averageRating: number;
}

interface EngagementAnalytics {
  patientId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  metrics: {
    activeDays: number;
    totalPoints: number;
    pointsEarned: number;
    achievementsUnlocked: number;
    challengesCompleted: number;
    streakDays: number;
    engagementScore: number; // 0-100
    sessionDuration: number; // minutes
    featuresUsed: string[];
  };
  trends: {
    date: Date;
    points: number;
    achievements: number;
    challenges: number;
    engagement: number;
  }[];
  insights: {
    type: 'positive' | 'negative' | 'neutral';
    message: string;
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
  }[];
}

// Gamification & Patient Engagement Component - Oyunlaştırma ve hasta katılımı
export function GamificationEngagement() {
  // State management - Uygulama durumunu yönetmek için
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [engagement, setEngagement] = useState<PatientEngagement | null>(null);
  const [motivationTools, setMotivationTools] = useState<MotivationTool[]>([]);
  const [analytics, setAnalytics] = useState<EngagementAnalytics | null>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [showMotivationTool, setShowMotivationTool] = useState(false);
  const [engagementScore, setEngagementScore] = useState(87.5);

  // Mock data initialization - Test verilerini yüklemek için
  useEffect(() => {
    // Simulated data loading - Gerçek API'den veri çekme simülasyonu
    const mockAchievements: Achievement[] = [
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first therapy session',
        icon: '🎯',
        category: 'therapy',
        points: 50,
        difficulty: 'easy',
        isUnlocked: true,
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        progress: 100,
        requirements: [
          {
            type: 'appointments',
            target: 1,
            current: 1,
            description: 'Attend 1 therapy session'
          }
        ],
        rewards: [
          {
            type: 'points',
            value: '50',
            description: 'Earn 50 points'
          },
          {
            type: 'badge',
            value: 'First Steps Badge',
            description: 'Unlock First Steps badge'
          }
        ]
      },
      {
        id: '2',
        name: 'Consistency Champion',
        description: 'Maintain a 7-day activity streak',
        icon: '🔥',
        category: 'wellness',
        points: 100,
        difficulty: 'medium',
        isUnlocked: false,
        progress: 85,
        requirements: [
          {
            type: 'streak',
            target: 7,
            current: 6,
            description: 'Maintain 7 consecutive days of activity'
          }
        ],
        rewards: [
          {
            type: 'points',
            value: '100',
            description: 'Earn 100 points'
          },
          {
            type: 'feature',
            value: 'Advanced Analytics',
            description: 'Unlock advanced analytics features'
          }
        ]
      },
      {
        id: '3',
        name: 'Goal Crusher',
        description: 'Complete 5 treatment goals',
        icon: '🏆',
        category: 'milestone',
        points: 200,
        difficulty: 'hard',
        isUnlocked: false,
        progress: 60,
        requirements: [
          {
            type: 'goals',
            target: 5,
            current: 3,
            description: 'Complete 5 treatment goals'
          }
        ],
        rewards: [
          {
            type: 'points',
            value: '200',
            description: 'Earn 200 points'
          },
          {
            type: 'discount',
            value: '10%',
            description: 'Get 10% discount on next session'
          }
        ]
      }
    ];

    const mockChallenges: Challenge[] = [
      {
        id: '1',
        name: 'Mindful Week',
        description: 'Practice mindfulness for 7 consecutive days',
        type: 'weekly',
        category: 'mental-health',
        difficulty: 'beginner',
        duration: 7,
        startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        isActive: true,
        isCompleted: false,
        progress: 70,
        tasks: [
          {
            id: 'task_1',
            description: 'Complete 10-minute meditation',
            isCompleted: true,
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            points: 10
          },
          {
            id: 'task_2',
            description: 'Practice deep breathing exercises',
            isCompleted: true,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            points: 10
          },
          {
            id: 'task_3',
            description: 'Write in gratitude journal',
            isCompleted: false,
            points: 15
          }
        ],
        rewards: {
          points: 100,
          badges: ['Mindful Master'],
          features: ['Advanced Meditation Tools']
        },
        participants: 45,
        leaderboard: [
          {
            rank: 1,
            participantId: 'user_001',
            participantName: 'John Doe',
            score: 95,
            completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    const mockEngagement: PatientEngagement = {
      patientId: 'patient_001',
      totalPoints: 1250,
      level: 8,
      experience: 1250,
      experienceToNextLevel: 150,
      streak: 6,
      longestStreak: 12,
      achievements: mockAchievements,
      challenges: mockChallenges,
      badges: [
        {
          id: 'badge_1',
          name: 'First Steps',
          icon: '🎯',
          earnedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          category: 'therapy'
        },
        {
          id: 'badge_2',
          name: 'Consistency',
          icon: '🔥',
          earnedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          category: 'wellness'
        }
      ],
      statistics: {
        totalAppointments: 15,
        completedAppointments: 14,
        totalMessages: 23,
        totalDocuments: 8,
        goalsCompleted: 3,
        challengesCompleted: 2,
        daysActive: 45,
        lastActive: new Date()
      },
      preferences: {
        notifications: true,
        leaderboard: true,
        socialFeatures: false,
        personalizedChallenges: true
      }
    };

    const mockMotivationTools: MotivationTool[] = [
      {
        id: '1',
        name: 'Daily Inspiration Quote',
        type: 'quote',
        category: 'inspiration',
        content: 'The only way to do great work is to love what you do. - Steve Jobs',
        difficulty: 'beginner',
        isCompleted: false,
        tags: ['inspiration', 'motivation', 'daily'],
        isRecommended: true,
        usageCount: 150,
        averageRating: 4.8
      },
      {
        id: '2',
        name: '5-Minute Breathing Exercise',
        type: 'exercise',
        category: 'practice',
        content: 'Guided breathing exercise for stress relief',
        duration: 5,
        difficulty: 'beginner',
        isCompleted: false,
        tags: ['breathing', 'stress-relief', 'meditation'],
        isRecommended: true,
        usageCount: 89,
        averageRating: 4.6
      },
      {
        id: '3',
        name: 'Gratitude Journaling',
        type: 'journal',
        category: 'reflection',
        content: 'Write down 3 things you are grateful for today',
        difficulty: 'beginner',
        isCompleted: false,
        tags: ['gratitude', 'journaling', 'reflection'],
        isRecommended: true,
        usageCount: 67,
        averageRating: 4.9
      }
    ];

    const mockAnalytics: EngagementAnalytics = {
      patientId: 'patient_001',
      period: 'weekly',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      metrics: {
        activeDays: 6,
        totalPoints: 1250,
        pointsEarned: 150,
        achievementsUnlocked: 1,
        challengesCompleted: 0,
        streakDays: 6,
        engagementScore: 87.5,
        sessionDuration: 45,
        featuresUsed: ['appointments', 'messaging', 'challenges', 'motivation']
      },
      trends: [
        {
          date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          points: 1100,
          achievements: 2,
          challenges: 0,
          engagement: 75
        },
        {
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          points: 1150,
          achievements: 2,
          challenges: 0,
          engagement: 80
        },
        {
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          points: 1200,
          achievements: 2,
          challenges: 0,
          engagement: 85
        },
        {
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          points: 1220,
          achievements: 2,
          challenges: 1,
          engagement: 87
        },
        {
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          points: 1230,
          achievements: 2,
          challenges: 1,
          engagement: 88
        },
        {
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          points: 1240,
          achievements: 2,
          challenges: 1,
          engagement: 89
        },
        {
          date: new Date(),
          points: 1250,
          achievements: 2,
          challenges: 1,
          engagement: 87.5
        }
      ],
      insights: [
        {
          type: 'positive',
          message: 'Great job maintaining your activity streak!',
          recommendation: 'Keep up the momentum by completing daily challenges',
          impact: 'high'
        },
        {
          type: 'neutral',
          message: 'Your engagement is consistent',
          recommendation: 'Try new features to increase engagement',
          impact: 'medium'
        }
      ]
    };

    setAchievements(mockAchievements);
    setChallenges(mockChallenges);
    setEngagement(mockEngagement);
    setMotivationTools(mockMotivationTools);
    setAnalytics(mockAnalytics);
  }, []);

  // Unlock achievement - Başarı açma
  const unlockAchievement = useCallback(async (achievementId: string) => {
    setLoading(true);
    
    try {
      // Simulated achievement unlocking - Başarı açma simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAchievements(prev => prev.map(achievement => 
        achievement.id === achievementId 
          ? { 
              ...achievement, 
              isUnlocked: true, 
              unlockedAt: new Date(),
              progress: 100
            }
          : achievement
      ));
      
      // Update engagement points - Katılım puanlarını güncelleme
      if (engagement) {
        const achievement = achievements.find(a => a.id === achievementId);
        if (achievement) {
          setEngagement(prev => prev ? {
            ...prev,
            totalPoints: prev.totalPoints + achievement.points,
            experience: prev.experience + achievement.points
          } : null);
        }
      }
      
    } catch (error) {
      console.error('Achievement unlocking failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [achievements, engagement]);

  // Complete challenge task - Görev tamamlama
  const completeChallengeTask = useCallback(async (
    challengeId: string,
    taskId: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated task completion - Görev tamamlama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? {
              ...challenge,
              tasks: challenge.tasks.map(task => 
                task.id === taskId 
                  ? { ...task, isCompleted: true, completedAt: new Date() }
                  : task
              ),
              progress: Math.round(
                (challenge.tasks.filter(t => t.isCompleted || t.id === taskId).length / challenge.tasks.length) * 100
              )
            }
          : challenge
      ));
      
    } catch (error) {
      console.error('Task completion failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Complete motivation tool - Motivasyon aracını tamamlama
  const completeMotivationTool = useCallback(async (
    toolId: string,
    rating?: number,
    feedback?: string
  ) => {
    setLoading(true);
    
    try {
      // Simulated tool completion - Araç tamamlama simülasyonu
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setMotivationTools(prev => prev.map(tool => 
        tool.id === toolId 
          ? { 
              ...tool, 
              isCompleted: true, 
              completedAt: new Date(),
              rating,
              feedback,
              usageCount: tool.usageCount + 1
            }
          : tool
      ));
      
    } catch (error) {
      console.error('Motivation tool completion failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate engagement metrics - Katılım metriklerini hesaplama
  const calculateEngagementMetrics = useCallback(() => {
    const totalAchievements = achievements.length;
    const unlockedAchievements = achievements.filter(a => a.isUnlocked).length;
    const totalChallenges = challenges.length;
    const activeChallenges = challenges.filter(c => c.isActive).length;
    const completedChallenges = challenges.filter(c => c.isCompleted).length;
    const totalMotivationTools = motivationTools.length;
    const completedTools = motivationTools.filter(t => t.isCompleted).length;
    
    return {
      totalAchievements,
      unlockedAchievements,
      achievementRate: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0,
      totalChallenges,
      activeChallenges,
      completedChallenges,
      challengeCompletionRate: totalChallenges > 0 ? Math.round((completedChallenges / totalChallenges) * 100) : 0,
      totalMotivationTools,
      completedTools,
      toolCompletionRate: totalMotivationTools > 0 ? Math.round((completedTools / totalMotivationTools) * 100) : 0
    };
  }, [achievements, challenges, motivationTools]);

  const metrics = calculateEngagementMetrics();

  return (
    <div className="space-y-6">
      {/* Header Section - Başlık Bölümü */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏆 Gamification & Patient Engagement</h2>
          <p className="text-gray-600">Motivate patients through gamification and engagement tools</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            <Trophy className="h-3 w-3 mr-1" />
            Level {engagement?.level || 1}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            {engagementScore}% Engagement
          </Badge>
        </div>
      </div>

      {/* Patient Progress Overview - Hasta İlerleme Genel Bakış */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Total Points</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{engagement?.totalPoints || 0}</div>
            <p className="text-xs text-purple-700">
              {engagement?.experienceToNextLevel || 0} XP to next level
            </p>
            <Progress value={((engagement?.experience || 0) % 1000) / 10} className="mt-2 h-1" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.unlockedAchievements}</div>
            <p className="text-xs text-blue-700">
              {metrics.totalAchievements} total achievements
            </p>
            <Progress value={metrics.achievementRate} className="mt-2 h-1" />
          </CardContent>
        </Card>

                 <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-green-900">Active Streak</CardTitle>
             <TrendingUp className="h-4 w-4 text-green-600" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{engagement?.streak || 0} days</div>
            <p className="text-xs text-green-700">
              Longest: {engagement?.longestStreak || 0} days
            </p>
            <Progress value={(engagement?.streak || 0) / (engagement?.longestStreak || 1) * 100} className="mt-2 h-1" />
          </CardContent>
        </Card>

                 <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium text-orange-900">Challenges</CardTitle>
             <Trophy className="h-4 w-4 text-orange-600" />
           </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.completedChallenges}</div>
            <p className="text-xs text-orange-700">
              {metrics.activeChallenges} active challenges
            </p>
            <Progress value={metrics.challengeCompletionRate} className="mt-2 h-1" />
          </CardContent>
        </Card>
      </div>

      {/* Achievements System - Başarı Sistemi */}
      <Card className="border-2 border-purple-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-purple-600" />
              <span className="text-purple-900">Achievements</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                {metrics.unlockedAchievements}/{metrics.totalAchievements}
              </Badge>
            </div>
          </CardTitle>
          <CardDescription className="text-purple-700">
            Unlock achievements and earn rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border border-purple-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3">{achievement.icon}</div>
                    <div>
                      <div className="font-semibold text-purple-900">{achievement.name}</div>
                      <div className="text-sm text-purple-600">{achievement.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={achievement.isUnlocked ? 'default' : 'secondary'} className="bg-purple-100 text-purple-800">
                      {achievement.isUnlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {achievement.points} pts
                    </Badge>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {achievement.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Requirements</h4>
                    <div className="space-y-2">
                      {achievement.requirements.map((req, index) => (
                        <div key={index} className="text-sm text-purple-600">
                          <div className="flex items-center justify-between">
                            <span>{req.description}</span>
                            <span>{req.current}/{req.target}</span>
                          </div>
                          <Progress value={(req.current / req.target) * 100} className="mt-1 h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-purple-800">Rewards</h4>
                    <div className="space-y-2">
                      {achievement.rewards.map((reward, index) => (
                        <div key={index} className="text-sm text-purple-600">
                          <div className="font-medium">{reward.type}: {reward.value}</div>
                          <div className="text-xs">{reward.description}</div>
                        </div>
                      ))}
                    </div>
                    
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="mt-3 text-xs text-purple-600">
                        Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Challenges System - Görev Sistemi */}
      <Card className="border-2 border-orange-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200">
                     <CardTitle className="flex items-center justify-between">
             <div className="flex items-center">
               <Trophy className="h-5 w-5 mr-2 text-orange-600" />
               <span className="text-orange-900">Challenges</span>
             </div>
            <Button
              onClick={() => setShowCreateChallenge(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Join Challenge
            </Button>
          </CardTitle>
          <CardDescription className="text-orange-700">
            Complete challenges and compete with others
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <div key={challenge.id} className="border border-orange-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-orange-900">{challenge.name}</div>
                    <div className="text-sm text-orange-600">{challenge.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={challenge.isCompleted ? 'default' : 'secondary'} className="bg-orange-100 text-orange-800">
                      {challenge.isCompleted ? 'Completed' : challenge.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      {challenge.participants} participants
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Tasks</h4>
                    <div className="space-y-2">
                      {challenge.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-2 border border-orange-200 rounded">
                          <div className="flex items-center">
                            {task.isCompleted ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-2" />
                            )}
                            <span className="text-sm text-orange-700">{task.description}</span>
                          </div>
                          <div className="text-xs text-orange-600">{task.points} pts</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-orange-800">Rewards</h4>
                    <div className="space-y-2 text-sm text-orange-600">
                      <div>Points: {challenge.rewards.points}</div>
                      <div>Badges: {challenge.rewards.badges.join(', ')}</div>
                      <div>Features: {challenge.rewards.features.join(', ')}</div>
                    </div>
                    
                    <h5 className="font-semibold text-sm mb-2 mt-3 text-orange-800">Progress</h5>
                    <div className="flex items-center justify-between text-sm text-orange-600">
                      <span>{challenge.progress}% complete</span>
                      <span>{challenge.duration - Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days left</span>
                    </div>
                    <Progress value={challenge.progress} className="mt-1 h-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Motivation Tools - Motivasyon Araçları */}
      <Card className="border-2 border-green-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-green-600" />
              <span className="text-green-900">Motivation Tools</span>
            </div>
            <Button
              onClick={() => setShowMotivationTool(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Start Tool
            </Button>
          </CardTitle>
          <CardDescription className="text-green-700">
            Daily motivation and wellness tools
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {motivationTools.map((tool) => (
              <div key={tool.id} className="border border-green-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-green-900">{tool.name}</div>
                    <div className="text-sm text-green-600">{tool.content}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={tool.isCompleted ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                      {tool.isCompleted ? 'Completed' : 'Available'}
                    </Badge>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {tool.difficulty}
                    </Badge>
                    {tool.isRecommended && (
                      <Badge variant="outline" className="border-yellow-300 text-yellow-700">
                        Recommended
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Details</h4>
                    <div className="space-y-1 text-sm text-green-600">
                      <div>Type: {tool.type}</div>
                      <div>Category: {tool.category}</div>
                      {tool.duration && <div>Duration: {tool.duration} minutes</div>}
                      <div>Usage: {tool.usageCount} times</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Rating</h4>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= (tool.averageRating || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-green-600 ml-2">
                        {tool.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-800">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs border-green-300 text-green-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Analytics - Katılım Analitikleri */}
      <Card className="border-2 border-blue-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-blue-900">Engagement Analytics</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Track your engagement progress and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-sm mb-3 text-blue-800">Weekly Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Active Days:</span>
                  <span className="text-blue-900 font-medium">{analytics?.metrics.activeDays || 0}/7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Points Earned:</span>
                  <span className="text-blue-900 font-medium">{analytics?.metrics.pointsEarned || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Achievements:</span>
                  <span className="text-blue-900 font-medium">{analytics?.metrics.achievementsUnlocked || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Challenges:</span>
                  <span className="text-blue-900 font-medium">{analytics?.metrics.challengesCompleted || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-blue-600">Engagement Score:</span>
                  <span className="text-blue-900 font-medium">{analytics?.metrics.engagementScore || 0}%</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-sm mb-3 text-blue-800">Insights</h4>
              <div className="space-y-3">
                {analytics?.insights.map((insight, index) => (
                  <div key={index} className="p-3 border border-blue-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      {insight.type === 'positive' ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : insight.type === 'negative' ? (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      ) : (
                        <Info className="h-4 w-4 text-blue-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-blue-900">{insight.message}</span>
                    </div>
                    <p className="text-xs text-blue-600">{insight.recommendation}</p>
                    <Badge variant="outline" className="text-xs mt-1 border-blue-300 text-blue-700">
                      {insight.impact} impact
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
