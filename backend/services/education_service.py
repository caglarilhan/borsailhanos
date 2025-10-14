"""
Eğitim ve Öğrenme Servisi
Robinhood, eToro benzeri eğitim özellikleri
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import json

class EducationService:
    """Eğitim ve öğrenme servisi"""
    
    def __init__(self):
        self.courses = self._initialize_courses()
        self.articles = self._initialize_articles()
        self.quizzes = self._initialize_quizzes()
        self.user_progress = {}  # user_id -> progress
        
    def _initialize_courses(self) -> List[Dict[str, Any]]:
        """Eğitim kurslarını başlat"""
        return [
            {
                "id": "course_1",
                "title": "Yatırıma Giriş",
                "description": "Yatırım dünyasına ilk adımınız",
                "level": "beginner",
                "duration": "30 dakika",
                "lessons": [
                    {
                        "id": "lesson_1_1",
                        "title": "Yatırım Nedir?",
                        "content": "Yatırım, gelecekteki kazanç beklentisiyle bugünkü tasarrufların değerlendirilmesidir...",
                        "duration": "10 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_1_2",
                        "title": "Risk ve Getiri",
                        "content": "Yüksek getiri, yüksek risk demektir. Risk toleransınızı belirleyin...",
                        "duration": "10 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_1_3",
                        "title": "Portföy Çeşitlendirme",
                        "content": "Yumurtalarınızı aynı sepete koymayın. Çeşitlendirme riski azaltır...",
                        "duration": "10 dakika",
                        "type": "text"
                    }
                ],
                "quiz_id": "quiz_1"
            },
            {
                "id": "course_2",
                "title": "Hisse Senedi Analizi",
                "description": "Hisse senetlerini nasıl analiz edersiniz?",
                "level": "intermediate",
                "duration": "45 dakika",
                "lessons": [
                    {
                        "id": "lesson_2_1",
                        "title": "Temel Analiz",
                        "content": "Şirketin finansal durumunu analiz etme yöntemleri...",
                        "duration": "15 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_2_2",
                        "title": "Teknik Analiz",
                        "content": "Fiyat grafikleri ve indikatörlerle analiz...",
                        "duration": "15 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_2_3",
                        "title": "P/E Oranı ve Diğer Metrikler",
                        "content": "Şirket değerleme metrikleri...",
                        "duration": "15 dakika",
                        "type": "text"
                    }
                ],
                "quiz_id": "quiz_2"
            },
            {
                "id": "course_3",
                "title": "Kripto Para Yatırımı",
                "description": "Kripto para dünyasına giriş",
                "level": "intermediate",
                "duration": "40 dakika",
                "lessons": [
                    {
                        "id": "lesson_3_1",
                        "title": "Blockchain Teknolojisi",
                        "content": "Blockchain nasıl çalışır?",
                        "duration": "15 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_3_2",
                        "title": "Bitcoin ve Altcoinler",
                        "content": "Farklı kripto para türleri...",
                        "duration": "15 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_3_3",
                        "title": "Kripto Para Riskleri",
                        "content": "Kripto para yatırımının riskleri...",
                        "duration": "10 dakika",
                        "type": "text"
                    }
                ],
                "quiz_id": "quiz_3"
            },
            {
                "id": "course_4",
                "title": "Risk Yönetimi",
                "description": "Yatırım risklerini nasıl yönetirsiniz?",
                "level": "advanced",
                "duration": "50 dakika",
                "lessons": [
                    {
                        "id": "lesson_4_1",
                        "title": "Stop Loss ve Take Profit",
                        "content": "Zarar durdurma ve kar alma stratejileri...",
                        "duration": "20 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_4_2",
                        "title": "Pozisyon Boyutlandırma",
                        "content": "Her işlemde ne kadar risk almalısınız?",
                        "duration": "15 dakika",
                        "type": "text"
                    },
                    {
                        "id": "lesson_4_3",
                        "title": "Duygusal Kontrol",
                        "content": "Yatırımda duygularınızı kontrol etme...",
                        "duration": "15 dakika",
                        "type": "text"
                    }
                ],
                "quiz_id": "quiz_4"
            }
        ]
    
    def _initialize_articles(self) -> List[Dict[str, Any]]:
        """Makaleleri başlat"""
        return [
            {
                "id": "article_1",
                "title": "2024 Yatırım Trendleri",
                "summary": "2024 yılında dikkat edilmesi gereken yatırım trendleri",
                "content": "2024 yılında yatırımcılar için önemli trendler...",
                "author": "BIST AI Ekibi",
                "published_at": "2024-01-15",
                "category": "trends",
                "read_time": "5 dakika",
                "tags": ["trend", "2024", "yatırım"]
            },
            {
                "id": "article_2",
                "title": "BIST 100 Analizi",
                "summary": "BIST 100 endeksinin detaylı analizi",
                "content": "BIST 100 endeksinin son performansı ve gelecek beklentileri...",
                "author": "Analiz Ekibi",
                "published_at": "2024-01-10",
                "category": "analysis",
                "read_time": "8 dakika",
                "tags": ["BIST", "analiz", "endeks"]
            },
            {
                "id": "article_3",
                "title": "Kripto Para Güvenliği",
                "summary": "Kripto para yatırımında güvenlik önlemleri",
                "content": "Kripto para yatırımında dikkat edilmesi gereken güvenlik konuları...",
                "author": "Güvenlik Uzmanı",
                "published_at": "2024-01-05",
                "category": "security",
                "read_time": "6 dakika",
                "tags": ["kripto", "güvenlik", "yatırım"]
            },
            {
                "id": "article_4",
                "title": "Teknik Analiz İndikatörleri",
                "summary": "En popüler teknik analiz indikatörleri",
                "content": "RSI, MACD, Bollinger Bands gibi indikatörlerin kullanımı...",
                "author": "Teknik Analiz Uzmanı",
                "published_at": "2024-01-01",
                "category": "technical",
                "read_time": "10 dakika",
                "tags": ["teknik analiz", "indikatör", "RSI", "MACD"]
            }
        ]
    
    def _initialize_quizzes(self) -> List[Dict[str, Any]]:
        """Quizleri başlat"""
        return [
            {
                "id": "quiz_1",
                "title": "Yatırıma Giriş Quiz",
                "course_id": "course_1",
                "questions": [
                    {
                        "id": "q1_1",
                        "question": "Yatırım nedir?",
                        "options": [
                            "Bugünkü tasarrufların gelecekteki kazanç beklentisiyle değerlendirilmesi",
                            "Sadece hisse senedi almak",
                            "Bankaya para yatırmak",
                            "Kripto para almak"
                        ],
                        "correct_answer": 0,
                        "explanation": "Yatırım, gelecekteki kazanç beklentisiyle bugünkü tasarrufların değerlendirilmesidir."
                    },
                    {
                        "id": "q1_2",
                        "question": "Risk ve getiri arasındaki ilişki nasıldır?",
                        "options": [
                            "Yüksek getiri, yüksek risk",
                            "Düşük getiri, yüksek risk",
                            "Risk ve getiri arasında ilişki yok",
                            "Yüksek getiri, düşük risk"
                        ],
                        "correct_answer": 0,
                        "explanation": "Genel olarak yüksek getiri beklentisi, yüksek risk ile birlikte gelir."
                    }
                ]
            },
            {
                "id": "quiz_2",
                "title": "Hisse Senedi Analizi Quiz",
                "course_id": "course_2",
                "questions": [
                    {
                        "id": "q2_1",
                        "question": "P/E oranı nedir?",
                        "options": [
                            "Fiyat/Kazanç oranı",
                            "Portföy/Endeks oranı",
                            "Performans/Ekonomi oranı",
                            "Piyasa/Emtia oranı"
                        ],
                        "correct_answer": 0,
                        "explanation": "P/E oranı, bir hisse senedinin fiyatının kazancına oranıdır."
                    }
                ]
            }
        ]
    
    def get_courses(self, level: str = None) -> List[Dict[str, Any]]:
        """Kursları getir"""
        if level:
            return [course for course in self.courses if course["level"] == level]
        return self.courses
    
    def get_course(self, course_id: str) -> Dict[str, Any]:
        """Belirli bir kursu getir"""
        for course in self.courses:
            if course["id"] == course_id:
                return course
        return {"error": "Course not found"}
    
    def get_articles(self, category: str = None, limit: int = 10) -> List[Dict[str, Any]]:
        """Makaleleri getir"""
        articles = self.articles
        
        if category:
            articles = [article for article in articles if article["category"] == category]
        
        # Tarihe göre sırala (en yeni önce)
        articles.sort(key=lambda x: x["published_at"], reverse=True)
        
        return articles[:limit]
    
    def get_article(self, article_id: str) -> Dict[str, Any]:
        """Belirli bir makaleyi getir"""
        for article in self.articles:
            if article["id"] == article_id:
                return article
        return {"error": "Article not found"}
    
    def get_quiz(self, quiz_id: str) -> Dict[str, Any]:
        """Quiz getir"""
        for quiz in self.quizzes:
            if quiz["id"] == quiz_id:
                return quiz
        return {"error": "Quiz not found"}
    
    def submit_quiz(self, user_id: str, quiz_id: str, answers: List[int]) -> Dict[str, Any]:
        """Quiz cevaplarını gönder"""
        quiz = self.get_quiz(quiz_id)
        
        if "error" in quiz:
            return quiz
        
        correct_answers = 0
        total_questions = len(quiz["questions"])
        
        for i, question in enumerate(quiz["questions"]):
            if i < len(answers) and answers[i] == question["correct_answer"]:
                correct_answers += 1
        
        score = (correct_answers / total_questions) * 100
        
        # Kullanıcı ilerlemesini kaydet
        if user_id not in self.user_progress:
            self.user_progress[user_id] = {}
        
        if "quizzes" not in self.user_progress[user_id]:
            self.user_progress[user_id]["quizzes"] = {}
        
        self.user_progress[user_id]["quizzes"][quiz_id] = {
            "score": score,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "completed_at": datetime.now().isoformat()
        }
        
        return {
            "quiz_id": quiz_id,
            "score": score,
            "correct_answers": correct_answers,
            "total_questions": total_questions,
            "passed": score >= 70,  # %70 ve üzeri geçer
            "completed_at": datetime.now().isoformat()
        }
    
    def get_user_progress(self, user_id: str) -> Dict[str, Any]:
        """Kullanıcı ilerlemesini getir"""
        if user_id not in self.user_progress:
            return {
                "courses_completed": 0,
                "quizzes_completed": 0,
                "total_score": 0,
                "achievements": []
            }
        
        progress = self.user_progress[user_id]
        
        # Tamamlanan kurs sayısı
        courses_completed = len(progress.get("courses", {}))
        
        # Tamamlanan quiz sayısı
        quizzes_completed = len(progress.get("quizzes", {}))
        
        # Ortalama skor
        quiz_scores = [quiz["score"] for quiz in progress.get("quizzes", {}).values()]
        total_score = sum(quiz_scores) / len(quiz_scores) if quiz_scores else 0
        
        # Başarımlar
        achievements = []
        if courses_completed >= 1:
            achievements.append("İlk Kurs")
        if courses_completed >= 3:
            achievements.append("Öğrenci")
        if total_score >= 80:
            achievements.append("Yüksek Skor")
        
        return {
            "courses_completed": courses_completed,
            "quizzes_completed": quizzes_completed,
            "total_score": total_score,
            "achievements": achievements,
            "progress": progress
        }
    
    def mark_lesson_completed(self, user_id: str, course_id: str, lesson_id: str) -> Dict[str, Any]:
        """Dersi tamamlandı olarak işaretle"""
        if user_id not in self.user_progress:
            self.user_progress[user_id] = {}
        
        if "courses" not in self.user_progress[user_id]:
            self.user_progress[user_id]["courses"] = {}
        
        if course_id not in self.user_progress[user_id]["courses"]:
            self.user_progress[user_id]["courses"][course_id] = {
                "lessons_completed": [],
                "completed_at": None
            }
        
        if lesson_id not in self.user_progress[user_id]["courses"][course_id]["lessons_completed"]:
            self.user_progress[user_id]["courses"][course_id]["lessons_completed"].append(lesson_id)
        
        # Kurs tamamlandı mı kontrol et
        course = self.get_course(course_id)
        if "error" not in course:
            total_lessons = len(course["lessons"])
            completed_lessons = len(self.user_progress[user_id]["courses"][course_id]["lessons_completed"])
            
            if completed_lessons >= total_lessons:
                self.user_progress[user_id]["courses"][course_id]["completed_at"] = datetime.now().isoformat()
        
        return {
            "course_id": course_id,
            "lesson_id": lesson_id,
            "completed_at": datetime.now().isoformat()
        }

# Global instance
education_service = EducationService()

def get_courses(level: str = None) -> List[Dict[str, Any]]:
    """Kursları getir"""
    return education_service.get_courses(level)

def get_course(course_id: str) -> Dict[str, Any]:
    """Kurs getir"""
    return education_service.get_course(course_id)

def get_articles(category: str = None, limit: int = 10) -> List[Dict[str, Any]]:
    """Makaleleri getir"""
    return education_service.get_articles(category, limit)

def get_article(article_id: str) -> Dict[str, Any]:
    """Makale getir"""
    return education_service.get_article(article_id)

def get_quiz(quiz_id: str) -> Dict[str, Any]:
    """Quiz getir"""
    return education_service.get_quiz(quiz_id)

def submit_quiz(user_id: str, quiz_id: str, answers: List[int]) -> Dict[str, Any]:
    """Quiz gönder"""
    return education_service.submit_quiz(user_id, quiz_id, answers)

def get_user_progress(user_id: str) -> Dict[str, Any]:
    """Kullanıcı ilerlemesi"""
    return education_service.get_user_progress(user_id)

def mark_lesson_completed(user_id: str, course_id: str, lesson_id: str) -> Dict[str, Any]:
    """Ders tamamlandı"""
    return education_service.mark_lesson_completed(user_id, course_id, lesson_id)
