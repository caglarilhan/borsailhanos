'use client';

import React, { useState, useEffect } from 'react';
import { 
  AcademicCapIcon, 
  PlayIcon,
  ClockIcon,
  StarIcon,
  UserGroupIcon,
  TrophyIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  duration_hours: number;
  lessons: Array<{
    id: string;
    title: string;
    content: string;
    duration_minutes: number;
    video_url: string;
    resources: string[];
  }>;
  quiz: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correct_answer: number;
      explanation: string;
    }>;
  };
  instructor: string;
  rating: number;
  enrolled_count: number;
  created_at: string;
  is_premium: boolean;
}

interface SocialTrader {
  user_id: string;
  username: string;
  display_name: string;
  total_followers: number;
  total_following: number;
  total_trades: number;
  win_rate: number;
  total_return: number;
  sharpe_ratio: number;
  max_drawdown: number;
  risk_score: number;
  is_verified: boolean;
  is_premium: boolean;
  created_at: string;
  last_active: string;
}

interface TradeSignal {
  id: string;
  trader_id: string;
  symbol: string;
  signal_type: string;
  entry_price: number;
  target_price: number;
  stop_loss: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
  is_active: boolean;
  followers_count: number;
  performance?: { [key: string]: number };
}

interface EducationSystemProps {
  isLoading?: boolean;
}

const API_BASE_URL = 'http://127.0.0.1:8081';

const EducationSystem: React.FC<EducationSystemProps> = ({ isLoading }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [topTraders, setTopTraders] = useState<SocialTrader[]>([]);
  const [feedSignals, setFeedSignals] = useState<TradeSignal[]>([]);
  const [activeTab, setActiveTab] = useState<'courses' | 'traders' | 'feed' | 'leaderboard'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      // Mock data for demonstration
      const mockCourses: Course[] = [
        {
          id: 'tech_analysis_basics',
          title: 'Teknik Analiz Temelleri',
          description: 'RSI, MACD, Bollinger Bands gibi temel teknik göstergeleri öğrenin',
          category: 'Technical Analysis',
          level: 'Beginner',
          duration_hours: 4,
          lessons: [
            {
              id: 'lesson_1',
              title: 'Teknik Analiz Nedir?',
              content: 'Teknik analizin temel kavramları ve tarihçesi',
              duration_minutes: 30,
              video_url: 'https://example.com/video1.mp4',
              resources: ['pdf1.pdf', 'chart1.png']
            },
            {
              id: 'lesson_2',
              title: 'RSI Göstergesi',
              content: 'Relative Strength Index nasıl kullanılır',
              duration_minutes: 45,
              video_url: 'https://example.com/video2.mp4',
              resources: ['rsi_guide.pdf']
            }
          ],
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'RSI değeri 70\'in üzerinde ne anlama gelir?',
                options: ['Aşırı alım', 'Aşırı satım', 'Nötr', 'Belirsiz'],
                correct_answer: 0,
                explanation: 'RSI 70\'in üzerinde aşırı alım bölgesini gösterir'
              }
            ]
          },
          instructor: 'Prof. Dr. Mehmet Yılmaz',
          rating: 4.8,
          enrolled_count: 1250,
          created_at: new Date().toISOString(),
          is_premium: false
        },
        {
          id: 'ai_trading_advanced',
          title: 'AI ile Trading Stratejileri',
          description: 'Yapay zeka ve makine öğrenmesi ile gelişmiş trading stratejileri',
          category: 'AI Trading',
          level: 'Advanced',
          duration_hours: 12,
          lessons: [
            {
              id: 'lesson_1',
              title: 'AI Modelleri ve Trading',
              content: 'LightGBM, LSTM, Transformer modellerinin trading\'de kullanımı',
              duration_minutes: 60,
              video_url: 'https://example.com/ai_video1.mp4',
              resources: ['ai_models.pdf', 'code_examples.py']
            }
          ],
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'Hangi AI modeli zaman serisi tahmini için en uygun?',
                options: ['LSTM', 'CNN', 'Random Forest', 'SVM'],
                correct_answer: 0,
                explanation: 'LSTM modelleri zaman serisi verilerinde en başarılıdır'
              }
            ]
          },
          instructor: 'Dr. Ayşe Kaya',
          rating: 4.9,
          enrolled_count: 450,
          created_at: new Date().toISOString(),
          is_premium: true
        }
      ];

      const mockTraders: SocialTrader[] = [
        {
          user_id: 'trader_1',
          username: 'bist_master',
          display_name: 'BIST Uzmanı',
          total_followers: 15420,
          total_following: 234,
          total_trades: 1250,
          win_rate: 0.78,
          total_return: 0.45,
          sharpe_ratio: 1.85,
          max_drawdown: 0.12,
          risk_score: 0.25,
          is_verified: true,
          is_premium: true,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        },
        {
          user_id: 'trader_2',
          username: 'ai_trader_pro',
          display_name: 'AI Trading Pro',
          total_followers: 8930,
          total_following: 156,
          total_trades: 890,
          win_rate: 0.82,
          total_return: 0.38,
          sharpe_ratio: 1.92,
          max_drawdown: 0.08,
          risk_score: 0.18,
          is_verified: true,
          is_premium: true,
          created_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        }
      ];

      const mockSignals: TradeSignal[] = [
        {
          id: 'signal_1',
          trader_id: 'trader_1',
          symbol: 'THYAO',
          signal_type: 'BUY',
          entry_price: 320.0,
          target_price: 350.0,
          stop_loss: 300.0,
          confidence: 0.85,
          reasoning: 'RSI oversold ve MACD pozitif kesişim',
          timestamp: new Date().toISOString(),
          is_active: true,
          followers_count: 1250
        }
      ];

      setCourses(mockCourses);
      setTopTraders(mockTraders);
      setFeedSignals(mockSignals);
    } catch (error) {
      console.error('Error fetching education data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'Intermediate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Advanced': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Expert': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Technical Analysis': return '📊';
      case 'Fundamental Analysis': return '📈';
      case 'Risk Management': return '🛡️';
      case 'Psychology': return '🧠';
      case 'Strategies': return '⚡';
      case 'AI Trading': return '🤖';
      default: return '📚';
    }
  };

  const enrollInCourse = (courseId: string) => {
    setEnrolledCourses(prev => [...prev, courseId]);
    // In real implementation, this would call the API
  };

  const followTrader = (traderId: string) => {
    // In real implementation, this would call the API
    console.log(`Following trader: ${traderId}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Eğitim ve Sosyal Trading</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-48"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
            <h2 className="text-lg font-semibold text-gray-900">Eğitim ve Sosyal Trading</h2>
          </div>
          <div className="flex items-center space-x-2">
            {/* Tab Selector */}
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('courses')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'courses'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Kurslar
              </button>
              <button
                onClick={() => setActiveTab('traders')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'traders'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Traderlar
              </button>
              <button
                onClick={() => setActiveTab('feed')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'feed'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Feed
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'leaderboard'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Liderlik
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{getCategoryIcon(course.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
                        {course.is_premium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{course.description}</p>
                      <div className="flex items-center space-x-4 mb-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(course.level)}`}>
                          {course.level}
                        </span>
                        <div className="flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{course.duration_hours} saat</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <UserGroupIcon className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{course.enrolled_count} öğrenci</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">{course.rating}</span>
                        <span className="text-sm text-gray-500">• {course.instructor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setShowCourseDetails(true);
                      }}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
                    >
                      Detaylar
                    </button>
                    <button
                      onClick={() => enrollInCourse(course.id)}
                      disabled={enrolledCourses.includes(course.id)}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        enrolledCourses.includes(course.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {enrolledCourses.includes(course.id) ? 'Kayıtlı' : 'Kayıt Ol'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Traders Tab */}
        {activeTab === 'traders' && (
          <div className="space-y-4">
            {topTraders.map((trader) => (
              <div key={trader.user_id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {trader.display_name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{trader.display_name}</h3>
                        <span className="text-gray-500">@{trader.username}</span>
                        {trader.is_verified && (
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {trader.is_premium && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-600">Takipçi</p>
                          <p className="font-bold text-blue-600">{trader.total_followers.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">İşlem</p>
                          <p className="font-bold text-gray-900">{trader.total_trades}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Kazanma Oranı</p>
                          <p className="font-bold text-green-600">%{(trader.win_rate * 100).toFixed(0)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Toplam Getiri</p>
                          <p className="font-bold text-purple-600">%{(trader.total_return * 100).toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Sharpe: {trader.sharpe_ratio.toFixed(2)}</span>
                        <span>Max DD: %{(trader.max_drawdown * 100).toFixed(1)}</span>
                        <span>Risk: %{(trader.risk_score * 100).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => followTrader(trader.user_id)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Takip Et
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            {feedSignals.map((signal) => (
              <div key={signal.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {signal.signal_type === 'BUY' ? '🟢' : signal.signal_type === 'SELL' ? '🔴' : '🟡'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-bold text-gray-900">{signal.symbol}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        signal.signal_type === 'BUY' ? 'bg-green-100 text-green-800' :
                        signal.signal_type === 'SELL' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {signal.signal_type}
                      </span>
                      <span className="text-sm text-gray-500">
                        Güven: %{(signal.confidence * 100).toFixed(0)}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{signal.reasoning}</p>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Giriş</p>
                        <p className="font-bold text-blue-600">₺{signal.entry_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hedef</p>
                        <p className="font-bold text-green-600">₺{signal.target_price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Stop Loss</p>
                        <p className="font-bold text-red-600">₺{signal.stop_loss.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(signal.timestamp).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {signal.followers_count} takipçi
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 mb-6">
              <TrophyIcon className="h-6 w-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">En İyi Traderlar</h3>
            </div>
            {topTraders.map((trader, index) => (
              <div key={trader.user_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {trader.display_name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-gray-900">{trader.display_name}</h4>
                      {trader.is_verified && (
                        <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">@{trader.username}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">%{(trader.total_return * 100).toFixed(1)}</p>
                    <p className="text-sm text-gray-500">Getiri</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">%{(trader.win_rate * 100).toFixed(0)}</p>
                    <p className="text-sm text-gray-500">Kazanma</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{trader.sharpe_ratio.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Sharpe</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course Details Modal */}
      {showCourseDetails && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedCourse.title}
              </h3>
              <button
                onClick={() => setShowCourseDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Course Info */}
              <div>
                <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getLevelColor(selectedCourse.level)}`}>
                    {selectedCourse.level}
                  </span>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedCourse.duration_hours} saat</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserGroupIcon className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{selectedCourse.enrolled_count} öğrenci</span>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Dersler</h4>
                <div className="space-y-3">
                  {selectedCourse.lessons.map((lesson, index) => (
                    <div key={lesson.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{lesson.title}</h5>
                        <p className="text-sm text-gray-600">{lesson.content}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            <PlayIcon className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{lesson.duration_minutes} dk</span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {lesson.resources.length} kaynak
                          </span>
                        </div>
                      </div>
                      <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiz Preview */}
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-3">Quiz Önizleme</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedCourse.quiz.questions[0]?.question}
                  </p>
                  <div className="space-y-2">
                    {selectedCourse.quiz.questions[0]?.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enrollment */}
              <div className="flex space-x-3">
                <button
                  onClick={() => enrollInCourse(selectedCourse.id)}
                  disabled={enrolledCourses.includes(selectedCourse.id)}
                  className={`flex-1 px-4 py-2 font-medium rounded-md ${
                    enrolledCourses.includes(selectedCourse.id)
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {enrolledCourses.includes(selectedCourse.id) ? 'Kursa Kayıtlısınız' : 'Kursa Kayıt Ol'}
                </button>
                <button
                  onClick={() => setShowCourseDetails(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationSystem;
