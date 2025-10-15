#!/usr/bin/env python3
"""
🎓 Education System
Trading eğitimi, kurslar, quiz ve sosyal trading
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
from enum import Enum
import random

class CourseLevel(Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    EXPERT = "Expert"

class CourseCategory(Enum):
    TECHNICAL_ANALYSIS = "Technical Analysis"
    FUNDAMENTAL_ANALYSIS = "Fundamental Analysis"
    RISK_MANAGEMENT = "Risk Management"
    PSYCHOLOGY = "Psychology"
    STRATEGIES = "Strategies"
    AI_TRADING = "AI Trading"

@dataclass
class Course:
    id: str
    title: str
    description: str
    category: CourseCategory
    level: CourseLevel
    duration_hours: int
    lessons: List[Dict[str, Any]]
    quiz: Dict[str, Any]
    instructor: str
    rating: float
    enrolled_count: int
    created_at: str
    is_premium: bool = False

@dataclass
class UserProgress:
    user_id: str
    course_id: str
    completed_lessons: List[str]
    quiz_score: Optional[float]
    completion_percentage: float
    started_at: str
    completed_at: Optional[str]

@dataclass
class SocialTrader:
    user_id: str
    username: str
    display_name: str
    avatar_url: Optional[str]
    total_followers: int
    total_following: int
    total_trades: int
    win_rate: float
    total_return: float
    sharpe_ratio: float
    max_drawdown: float
    risk_score: float
    is_verified: bool
    is_premium: bool
    created_at: str
    last_active: str

@dataclass
class TradeSignal:
    id: str
    trader_id: str
    symbol: str
    signal_type: str  # BUY, SELL, HOLD
    entry_price: float
    target_price: float
    stop_loss: float
    confidence: float
    reasoning: str
    timestamp: str
    is_active: bool
    followers_count: int
    performance: Optional[Dict[str, float]]

class EducationSystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.courses: Dict[str, Course] = {}
        self.user_progress: Dict[str, List[UserProgress]] = {}
        self.social_traders: Dict[str, SocialTrader] = {}
        self.trade_signals: Dict[str, List[TradeSignal]] = {}
        self.follow_relationships: Dict[str, List[str]] = {}  # user_id -> [followed_user_ids]
        
        # Initialize with sample data
        self._initialize_courses()
        self._initialize_social_traders()

    def _initialize_courses(self):
        """Initialize sample courses"""
        courses_data = [
            {
                'id': 'tech_analysis_basics',
                'title': 'Teknik Analiz Temelleri',
                'description': 'RSI, MACD, Bollinger Bands gibi temel teknik göstergeleri öğrenin',
                'category': CourseCategory.TECHNICAL_ANALYSIS,
                'level': CourseLevel.BEGINNER,
                'duration_hours': 4,
                'instructor': 'Prof. Dr. Mehmet Yılmaz',
                'rating': 4.8,
                'enrolled_count': 1250,
                'is_premium': False,
                'lessons': [
                    {
                        'id': 'lesson_1',
                        'title': 'Teknik Analiz Nedir?',
                        'content': 'Teknik analizin temel kavramları ve tarihçesi',
                        'duration_minutes': 30,
                        'video_url': 'https://example.com/video1.mp4',
                        'resources': ['pdf1.pdf', 'chart1.png']
                    },
                    {
                        'id': 'lesson_2',
                        'title': 'RSI Göstergesi',
                        'content': 'Relative Strength Index nasıl kullanılır',
                        'duration_minutes': 45,
                        'video_url': 'https://example.com/video2.mp4',
                        'resources': ['rsi_guide.pdf']
                    }
                ],
                'quiz': {
                    'questions': [
                        {
                            'id': 'q1',
                            'question': 'RSI değeri 70\'in üzerinde ne anlama gelir?',
                            'options': ['Aşırı alım', 'Aşırı satım', 'Nötr', 'Belirsiz'],
                            'correct_answer': 0,
                            'explanation': 'RSI 70\'in üzerinde aşırı alım bölgesini gösterir'
                        }
                    ]
                }
            },
            {
                'id': 'ai_trading_advanced',
                'title': 'AI ile Trading Stratejileri',
                'description': 'Yapay zeka ve makine öğrenmesi ile gelişmiş trading stratejileri',
                'category': CourseCategory.AI_TRADING,
                'level': CourseLevel.ADVANCED,
                'duration_hours': 12,
                'instructor': 'Dr. Ayşe Kaya',
                'rating': 4.9,
                'enrolled_count': 450,
                'is_premium': True,
                'lessons': [
                    {
                        'id': 'lesson_1',
                        'title': 'AI Modelleri ve Trading',
                        'content': 'LightGBM, LSTM, Transformer modellerinin trading\'de kullanımı',
                        'duration_minutes': 60,
                        'video_url': 'https://example.com/ai_video1.mp4',
                        'resources': ['ai_models.pdf', 'code_examples.py']
                    }
                ],
                'quiz': {
                    'questions': [
                        {
                            'id': 'q1',
                            'question': 'Hangi AI modeli zaman serisi tahmini için en uygun?',
                            'options': ['LSTM', 'CNN', 'Random Forest', 'SVM'],
                            'correct_answer': 0,
                            'explanation': 'LSTM modelleri zaman serisi verilerinde en başarılıdır'
                        }
                    ]
                }
            },
            {
                'id': 'risk_management',
                'title': 'Risk Yönetimi ve Portföy Optimizasyonu',
                'description': 'Stop-loss, position sizing ve portföy çeşitlendirme stratejileri',
                'category': CourseCategory.RISK_MANAGEMENT,
                'level': CourseLevel.INTERMEDIATE,
                'duration_hours': 6,
                'instructor': 'Uzman Trader Ali Demir',
                'rating': 4.7,
                'enrolled_count': 890,
                'is_premium': False,
                'lessons': [
                    {
                        'id': 'lesson_1',
                        'title': 'Risk Yönetimi Temelleri',
                        'content': 'Risk nedir, nasıl ölçülür ve yönetilir',
                        'duration_minutes': 40,
                        'video_url': 'https://example.com/risk_video1.mp4',
                        'resources': ['risk_guide.pdf']
                    }
                ],
                'quiz': {
                    'questions': [
                        {
                            'id': 'q1',
                            'question': 'Portföyünüzün %2\'sinden fazlasını tek bir işlemde riske atmamalısınız. Bu kuralın adı nedir?',
                            'options': ['2% Kuralı', 'Risk Kuralı', 'Portföy Kuralı', 'Güvenlik Kuralı'],
                            'correct_answer': 0,
                            'explanation': '2% kuralı, tek işlemde portföyün %2\'sinden fazla riske atılmaması kuralıdır'
                        }
                    ]
                }
            }
        ]
        
        for course_data in courses_data:
            course = Course(
                id=course_data['id'],
                title=course_data['title'],
                description=course_data['description'],
                category=course_data['category'],
                level=course_data['level'],
                duration_hours=course_data['duration_hours'],
                lessons=course_data['lessons'],
                quiz=course_data['quiz'],
                instructor=course_data['instructor'],
                rating=course_data['rating'],
                enrolled_count=course_data['enrolled_count'],
                created_at=datetime.now().isoformat(),
                is_premium=course_data['is_premium']
            )
            self.courses[course.id] = course

    def _initialize_social_traders(self):
        """Initialize sample social traders"""
        traders_data = [
            {
                'user_id': 'trader_1',
                'username': 'bist_master',
                'display_name': 'BIST Uzmanı',
                'total_followers': 15420,
                'total_following': 234,
                'total_trades': 1250,
                'win_rate': 0.78,
                'total_return': 0.45,
                'sharpe_ratio': 1.85,
                'max_drawdown': 0.12,
                'risk_score': 0.25,
                'is_verified': True,
                'is_premium': True,
            },
            {
                'user_id': 'trader_2',
                'username': 'ai_trader_pro',
                'display_name': 'AI Trading Pro',
                'total_followers': 8930,
                'total_following': 156,
                'total_trades': 890,
                'win_rate': 0.82,
                'total_return': 0.38,
                'sharpe_ratio': 1.92,
                'max_drawdown': 0.08,
                'risk_score': 0.18,
                'is_verified': True,
                'is_premium': True,
            },
            {
                'user_id': 'trader_3',
                'username': 'swing_king',
                'display_name': 'Swing Trading Kralı',
                'total_followers': 5670,
                'total_following': 89,
                'total_trades': 450,
                'win_rate': 0.71,
                'total_return': 0.29,
                'sharpe_ratio': 1.45,
                'max_drawdown': 0.15,
                'risk_score': 0.32,
                'is_verified': False,
                'is_premium': False,
            }
        ]
        
        for trader_data in traders_data:
            trader = SocialTrader(
                user_id=trader_data['user_id'],
                username=trader_data['username'],
                display_name=trader_data['display_name'],
                avatar_url=None,
                total_followers=trader_data['total_followers'],
                total_following=trader_data['total_following'],
                total_trades=trader_data['total_trades'],
                win_rate=trader_data['win_rate'],
                total_return=trader_data['total_return'],
                sharpe_ratio=trader_data['sharpe_ratio'],
                max_drawdown=trader_data['max_drawdown'],
                risk_score=trader_data['risk_score'],
                is_verified=trader_data['is_verified'],
                is_premium=trader_data['is_premium'],
                created_at=datetime.now().isoformat(),
                last_active=datetime.now().isoformat()
            )
            self.social_traders[trader.user_id] = trader

    async def get_courses(self, category: Optional[CourseCategory] = None, 
                         level: Optional[CourseLevel] = None) -> List[Course]:
        """Get courses with optional filtering"""
        courses = list(self.courses.values())
        
        if category:
            courses = [c for c in courses if c.category == category]
        
        if level:
            courses = [c for c in courses if c.level == level]
        
        # Sort by rating and enrollment
        courses.sort(key=lambda x: (x.rating, x.enrolled_count), reverse=True)
        
        return courses

    async def get_course_details(self, course_id: str) -> Optional[Course]:
        """Get detailed course information"""
        return self.courses.get(course_id)

    async def enroll_user(self, user_id: str, course_id: str) -> bool:
        """Enroll user in a course"""
        try:
            if course_id not in self.courses:
                return False
            
            if user_id not in self.user_progress:
                self.user_progress[user_id] = []
            
            # Check if already enrolled
            existing_progress = next(
                (p for p in self.user_progress[user_id] if p.course_id == course_id),
                None
            )
            
            if existing_progress:
                return True  # Already enrolled
            
            # Create new progress
            progress = UserProgress(
                user_id=user_id,
                course_id=course_id,
                completed_lessons=[],
                quiz_score=None,
                completion_percentage=0.0,
                started_at=datetime.now().isoformat(),
                completed_at=None
            )
            
            self.user_progress[user_id].append(progress)
            
            # Update enrollment count
            self.courses[course_id].enrolled_count += 1
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error enrolling user {user_id} in course {course_id}: {e}")
            return False

    async def complete_lesson(self, user_id: str, course_id: str, lesson_id: str) -> bool:
        """Mark lesson as completed"""
        try:
            if user_id not in self.user_progress:
                return False
            
            progress = next(
                (p for p in self.user_progress[user_id] if p.course_id == course_id),
                None
            )
            
            if not progress:
                return False
            
            if lesson_id not in progress.completed_lessons:
                progress.completed_lessons.append(lesson_id)
                
                # Update completion percentage
                course = self.courses.get(course_id)
                if course:
                    total_lessons = len(course.lessons)
                    progress.completion_percentage = len(progress.completed_lessons) / total_lessons
                    
                    # Check if course is completed
                    if progress.completion_percentage >= 1.0:
                        progress.completed_at = datetime.now().isoformat()
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error completing lesson: {e}")
            return False

    async def submit_quiz(self, user_id: str, course_id: str, answers: Dict[str, int]) -> float:
        """Submit quiz answers and calculate score"""
        try:
            course = self.courses.get(course_id)
            if not course:
                return 0.0
            
            quiz = course.quiz
            total_questions = len(quiz['questions'])
            correct_answers = 0
            
            for question in quiz['questions']:
                question_id = question['id']
                if question_id in answers and answers[question_id] == question['correct_answer']:
                    correct_answers += 1
            
            score = correct_answers / total_questions if total_questions > 0 else 0.0
            
            # Update user progress
            if user_id in self.user_progress:
                progress = next(
                    (p for p in self.user_progress[user_id] if p.course_id == course_id),
                    None
                )
                if progress:
                    progress.quiz_score = score
            
            return score
            
        except Exception as e:
            self.logger.error(f"Error submitting quiz: {e}")
            return 0.0

    async def get_user_progress(self, user_id: str) -> List[UserProgress]:
        """Get user's course progress"""
        return self.user_progress.get(user_id, [])

    async def get_top_traders(self, limit: int = 10) -> List[SocialTrader]:
        """Get top performing social traders"""
        traders = list(self.social_traders.values())
        
        # Sort by performance metrics
        traders.sort(key=lambda x: (x.win_rate, x.total_return, x.sharpe_ratio), reverse=True)
        
        return traders[:limit]

    async def follow_trader(self, user_id: str, trader_id: str) -> bool:
        """Follow a social trader"""
        try:
            if trader_id not in self.social_traders:
                return False
            
            if user_id not in self.follow_relationships:
                self.follow_relationships[user_id] = []
            
            if trader_id not in self.follow_relationships[user_id]:
                self.follow_relationships[user_id].append(trader_id)
                
                # Update follower count
                self.social_traders[trader_id].total_followers += 1
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error following trader: {e}")
            return False

    async def unfollow_trader(self, user_id: str, trader_id: str) -> bool:
        """Unfollow a social trader"""
        try:
            if user_id in self.follow_relationships:
                if trader_id in self.follow_relationships[user_id]:
                    self.follow_relationships[user_id].remove(trader_id)
                    
                    # Update follower count
                    if trader_id in self.social_traders:
                        self.social_traders[trader_id].total_followers = max(0, 
                            self.social_traders[trader_id].total_followers - 1)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error unfollowing trader: {e}")
            return False

    async def get_followed_traders(self, user_id: str) -> List[SocialTrader]:
        """Get list of followed traders"""
        if user_id not in self.follow_relationships:
            return []
        
        followed_ids = self.follow_relationships[user_id]
        return [self.social_traders[tid] for tid in followed_ids if tid in self.social_traders]

    async def create_trade_signal(self, trader_id: str, signal_data: Dict[str, Any]) -> Optional[TradeSignal]:
        """Create a new trade signal"""
        try:
            if trader_id not in self.social_traders:
                return None
            
            signal = TradeSignal(
                id=f"signal_{trader_id}_{datetime.now().timestamp()}",
                trader_id=trader_id,
                symbol=signal_data.get('symbol', ''),
                signal_type=signal_data.get('signal_type', 'HOLD'),
                entry_price=signal_data.get('entry_price', 0.0),
                target_price=signal_data.get('target_price', 0.0),
                stop_loss=signal_data.get('stop_loss', 0.0),
                confidence=signal_data.get('confidence', 0.0),
                reasoning=signal_data.get('reasoning', ''),
                timestamp=datetime.now().isoformat(),
                is_active=True,
                followers_count=0,
                performance=None
            )
            
            if trader_id not in self.trade_signals:
                self.trade_signals[trader_id] = []
            
            self.trade_signals[trader_id].append(signal)
            
            return signal
            
        except Exception as e:
            self.logger.error(f"Error creating trade signal: {e}")
            return None

    async def get_trader_signals(self, trader_id: str, limit: int = 20) -> List[TradeSignal]:
        """Get trader's recent signals"""
        if trader_id not in self.trade_signals:
            return []
        
        signals = self.trade_signals[trader_id]
        signals.sort(key=lambda x: x.timestamp, reverse=True)
        
        return signals[:limit]

    async def get_feed_signals(self, user_id: str, limit: int = 50) -> List[TradeSignal]:
        """Get signals from followed traders"""
        followed_traders = await self.get_followed_traders(user_id)
        all_signals = []
        
        for trader in followed_traders:
            trader_signals = await self.get_trader_signals(trader.user_id, limit)
            all_signals.extend(trader_signals)
        
        # Sort by timestamp
        all_signals.sort(key=lambda x: x.timestamp, reverse=True)
        
        return all_signals[:limit]

    async def get_leaderboard(self, metric: str = 'total_return', limit: int = 20) -> List[SocialTrader]:
        """Get trader leaderboard"""
        traders = list(self.social_traders.values())
        
        if metric == 'total_return':
            traders.sort(key=lambda x: x.total_return, reverse=True)
        elif metric == 'win_rate':
            traders.sort(key=lambda x: x.win_rate, reverse=True)
        elif metric == 'sharpe_ratio':
            traders.sort(key=lambda x: x.sharpe_ratio, reverse=True)
        elif metric == 'followers':
            traders.sort(key=lambda x: x.total_followers, reverse=True)
        
        return traders[:limit]

    async def get_course_statistics(self) -> Dict[str, Any]:
        """Get education system statistics"""
        total_courses = len(self.courses)
        total_enrollments = sum(course.enrolled_count for course in self.courses.values())
        total_traders = len(self.social_traders)
        total_signals = sum(len(signals) for signals in self.trade_signals.values())
        
        return {
            'total_courses': total_courses,
            'total_enrollments': total_enrollments,
            'total_traders': total_traders,
            'total_signals': total_signals,
            'average_course_rating': sum(course.rating for course in self.courses.values()) / total_courses if total_courses > 0 else 0,
            'top_category': max(
                [(category, sum(1 for c in self.courses.values() if c.category == category)) 
                 for category in CourseCategory],
                key=lambda x: x[1]
            )[0].value if self.courses else None
        }

# Global instance
education_system = EducationSystem()
