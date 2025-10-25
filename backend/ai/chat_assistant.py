"""
🚀 BIST AI Smart Trader - AI Chat Assistant
==========================================

Kullanıcı ile doğal dil ile etkileşim kuran AI asistan.
Finansal soruları yanıtlar, analiz önerileri sunar.

Özellikler:
- Doğal dil işleme
- Finansal soru yanıtlama
- Analiz önerileri
- Kişiselleştirilmiş yanıtlar
- Context awareness
"""

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import uuid

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class ChatMessage:
    """Chat mesajı"""
    id: str
    role: str  # 'user', 'assistant', 'system'
    content: str
    timestamp: datetime
    metadata: Dict[str, Any]
    
    def to_dict(self):
        data = asdict(self)
        data['timestamp'] = self.timestamp.isoformat()
        return data

@dataclass
class ChatSession:
    """Chat oturumu"""
    session_id: str
    user_id: str
    messages: List[ChatMessage]
    context: Dict[str, Any]
    created_at: datetime
    last_activity: datetime
    
    def to_dict(self):
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        data['last_activity'] = self.last_activity.isoformat()
        return data

@dataclass
class ChatResponse:
    """Chat yanıtı"""
    message: ChatMessage
    suggestions: List[str]
    actions: List[Dict[str, Any]]
    confidence: float
    
    def to_dict(self):
        data = asdict(self)
        data['message'] = self.message.to_dict()
        return data

class AIChatAssistant:
    """AI Chat Assistant"""
    
    def __init__(self, data_dir: str = "backend/ai/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Chat sessions
        self.sessions: Dict[str, ChatSession] = {}
        
        # Finansal bilgi bankası
        self.financial_knowledge = self._initialize_financial_knowledge()
        
        # Soru pattern'leri
        self.question_patterns = self._initialize_question_patterns()
        
        # Yanıt template'leri
        self.response_templates = self._initialize_response_templates()
    
    def _initialize_financial_knowledge(self) -> Dict[str, Any]:
        """Finansal bilgi bankasını başlat"""
        return {
            'stocks': {
                'THYAO': {
                    'name': 'Türk Hava Yolları',
                    'sector': 'Havacılık',
                    'description': 'Türkiye\'nin ulusal havayolu şirketi',
                    'key_metrics': ['P/E Ratio', 'ROE', 'Debt/Equity'],
                    'recent_news': 'Son çeyrek sonuçları pozitif'
                },
                'TUPRS': {
                    'name': 'Tüpraş',
                    'sector': 'Enerji',
                    'description': 'Türkiye\'nin en büyük petrol rafinerisi',
                    'key_metrics': ['P/E Ratio', 'ROE', 'Debt/Equity'],
                    'recent_news': 'Petrol fiyatlarındaki artış etkili'
                },
                'SISE': {
                    'name': 'Şişe Cam',
                    'sector': 'Cam',
                    'description': 'Cam üretim şirketi',
                    'key_metrics': ['P/E Ratio', 'ROE', 'Debt/Equity'],
                    'recent_news': 'Sürdürülebilirlik odaklı yatırımlar'
                }
            },
            'indicators': {
                'RSI': 'Relative Strength Index - Aşırı alım/satım göstergesi',
                'MACD': 'Moving Average Convergence Divergence - Trend göstergesi',
                'Bollinger Bands': 'Volatilite göstergesi',
                'SMA': 'Simple Moving Average - Trend analizi',
                'EMA': 'Exponential Moving Average - Ağırlıklı trend analizi'
            },
            'strategies': {
                'Swing Trading': 'Orta vadeli alım-satım stratejisi',
                'Day Trading': 'Günlük alım-satım stratejisi',
                'Long Term': 'Uzun vadeli yatırım stratejisi',
                'Value Investing': 'Değer yatırımı stratejisi'
            }
        }
    
    def _initialize_question_patterns(self) -> Dict[str, List[str]]:
        """Soru pattern'lerini başlat"""
        return {
            'stock_info': [
                r'(.+?)\s+(hakkında|nedir|nasıl|ne durumda)',
                r'(.+?)\s+(hisse|şirket)\s+(bilgi|analiz)',
                r'(.+?)\s+(yatırım|alım|satım)\s+(önerisi|tavsiyesi)'
            ],
            'technical_analysis': [
                r'(teknik|grafik)\s+(analiz|inceleme)',
                r'(RSI|MACD|Bollinger)\s+(nedir|nasıl|kullanım)',
                r'(trend|destek|direnç)\s+(analizi|seviyesi)'
            ],
            'market_analysis': [
                r'(piyasa|borsa)\s+(durumu|analizi|tahmini)',
                r'(sektör|endeks)\s+(analiz|performans)',
                r'(ekonomi|makro)\s+(durum|analiz)'
            ],
            'portfolio': [
                r'(portföy|yatırım)\s+(önerisi|tavsiyesi)',
                r'(risk|diversifikasyon)\s+(yönetimi|analizi)',
                r'(alım|satım)\s+(sinyali|zamanı)'
            ],
            'general': [
                r'(nasıl|neden|ne zaman|nerede)\s+(yapılır|olur|bulunur)',
                r'(açıkla|anlat|bilgi)\s+(ver|söyle)',
                r'(yardım|destek)\s+(et|ver)'
            ]
        }
    
    def _initialize_response_templates(self) -> Dict[str, List[str]]:
        """Yanıt template'lerini başlat"""
        return {
            'greeting': [
                "Merhaba! BIST AI Smart Trader asistanınızım. Size nasıl yardımcı olabilirim?",
                "Selam! Finansal analiz ve yatırım konularında size yardımcı olmaya hazırım.",
                "Hoş geldiniz! Hangi hisse veya strateji hakkında bilgi almak istiyorsunuz?"
            ],
            'stock_info': [
                "{stock_name} ({symbol}) hakkında bilgi vereyim:\n\n{sector} sektöründe faaliyet gösteren {description}.\n\nTemel metrikler: {metrics}\n\nSon haberler: {news}",
                "{symbol} analizi:\n\n• Sektör: {sector}\n• Açıklama: {description}\n• Önemli metrikler: {metrics}\n• Güncel durum: {news}"
            ],
            'technical_analysis': [
                "Teknik analiz konusunda size yardımcı olabilirim:\n\n{indicator_info}\n\nBu göstergeyi nasıl kullanacağınızı açıklayayım: {usage}",
                "Teknik analiz araçları:\n\n{indicator_name}: {indicator_info}\n\nKullanım önerisi: {usage}"
            ],
            'market_analysis': [
                "Piyasa analizi:\n\n{market_info}\n\nÖnerilerim: {suggestions}",
                "Güncel piyasa durumu:\n\n{market_status}\n\nDikkat edilmesi gerekenler: {warnings}"
            ],
            'portfolio': [
                "Portföy önerilerim:\n\n{portfolio_suggestions}\n\nRisk yönetimi: {risk_management}",
                "Yatırım stratejisi:\n\n{strategy_info}\n\nDiversifikasyon önerileri: {diversification}"
            ],
            'unknown': [
                "Bu konuda size yardımcı olabilmek için daha fazla bilgiye ihtiyacım var. Lütfen sorunuzu daha detaylı açıklayabilir misiniz?",
                "Bu soruyu tam olarak anlayamadım. Finansal analiz, hisse bilgileri veya yatırım stratejileri hakkında sorular sorabilirsiniz.",
                "Üzgünüm, bu konuda yeterli bilgim yok. Size daha iyi yardımcı olabilmem için sorunuzu farklı şekilde sorabilir misiniz?"
            ]
        }
    
    def create_session(self, user_id: str) -> str:
        """Yeni chat oturumu oluştur"""
        try:
            session_id = str(uuid.uuid4())
            
            session = ChatSession(
                session_id=session_id,
                user_id=user_id,
                messages=[],
                context={
                    'user_preferences': {},
                    'recent_searches': [],
                    'portfolio_symbols': [],
                    'risk_profile': 'medium'
                },
                created_at=datetime.now(),
                last_activity=datetime.now()
            )
            
            self.sessions[session_id] = session
            
            # Hoş geldin mesajı
            welcome_message = ChatMessage(
                id=str(uuid.uuid4()),
                role='assistant',
                content=self._get_random_template('greeting'),
                timestamp=datetime.now(),
                metadata={'type': 'greeting'}
            )
            
            session.messages.append(welcome_message)
            
            logger.info(f"✅ Chat session created: {session_id}")
            return session_id
            
        except Exception as e:
            logger.error(f"❌ Create session error: {e}")
            return ""
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Chat oturumunu getir"""
        return self.sessions.get(session_id)
    
    def _classify_question(self, question: str) -> str:
        """Soruyu sınıflandır"""
        try:
            question_lower = question.lower()
            
            for category, patterns in self.question_patterns.items():
                for pattern in patterns:
                    if re.search(pattern, question_lower):
                        return category
            
            return 'general'
            
        except Exception as e:
            logger.error(f"❌ Classify question error: {e}")
            return 'general'
    
    def _extract_entities(self, question: str) -> Dict[str, Any]:
        """Sorudan entity'leri çıkar"""
        try:
            entities = {
                'symbols': [],
                'indicators': [],
                'strategies': [],
                'keywords': []
            }
            
            question_lower = question.lower()
            
            # Hisse sembolleri
            for symbol in self.financial_knowledge['stocks'].keys():
                if symbol.lower() in question_lower:
                    entities['symbols'].append(symbol)
            
            # Teknik indikatörler
            for indicator in self.financial_knowledge['indicators'].keys():
                if indicator.lower() in question_lower:
                    entities['indicators'].append(indicator)
            
            # Stratejiler
            for strategy in self.financial_knowledge['strategies'].keys():
                if strategy.lower() in question_lower:
                    entities['strategies'].append(strategy)
            
            return entities
            
        except Exception as e:
            logger.error(f"❌ Extract entities error: {e}")
            return {'symbols': [], 'indicators': [], 'strategies': [], 'keywords': []}
    
    def _generate_response(self, question: str, category: str, entities: Dict[str, Any], context: Dict[str, Any]) -> str:
        """Yanıt oluştur"""
        try:
            if category == 'stock_info' and entities['symbols']:
                symbol = entities['symbols'][0]
                stock_info = self.financial_knowledge['stocks'].get(symbol, {})
                
                template = self._get_random_template('stock_info')
                response = template.format(
                    stock_name=stock_info.get('name', symbol),
                    symbol=symbol,
                    sector=stock_info.get('sector', 'Bilinmiyor'),
                    description=stock_info.get('description', 'Bilgi mevcut değil'),
                    metrics=', '.join(stock_info.get('key_metrics', [])),
                    news=stock_info.get('recent_news', 'Güncel haber yok')
                )
                
                return response
            
            elif category == 'technical_analysis' and entities['indicators']:
                indicator = entities['indicators'][0]
                indicator_info = self.financial_knowledge['indicators'].get(indicator, 'Bilgi mevcut değil')
                
                template = self._get_random_template('technical_analysis')
                response = template.format(
                    indicator_name=indicator,
                    indicator_info=indicator_info,
                    usage=f"{indicator} göstergesini trend analizi için kullanabilirsiniz."
                )
                
                return response
            
            elif category == 'market_analysis':
                template = self._get_random_template('market_analysis')
                response = template.format(
                    market_info="Güncel piyasa durumu analiz ediliyor...",
                    suggestions="Diversifikasyon ve risk yönetimi önemli.",
                    market_status="Piyasa volatilitesi yüksek",
                    warnings="Dikkatli yatırım yapın"
                )
                
                return response
            
            elif category == 'portfolio':
                template = self._get_random_template('portfolio')
                response = template.format(
                    portfolio_suggestions="Diversifikasyon öneriyorum",
                    risk_management="Risk yönetimi kurallarına uyun",
                    strategy_info="Uzun vadeli strateji öneriyorum",
                    diversification="Farklı sektörlerden hisseler seçin"
                )
                
                return response
            
            else:
                return self._get_random_template('unknown')
                
        except Exception as e:
            logger.error(f"❌ Generate response error: {e}")
            return "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."
    
    def _get_random_template(self, category: str) -> str:
        """Rastgele template getir"""
        try:
            templates = self.response_templates.get(category, ['Bilgi mevcut değil.'])
            import random
            return random.choice(templates)
            
        except Exception as e:
            logger.error(f"❌ Get random template error: {e}")
            return "Bilgi mevcut değil."
    
    def _generate_suggestions(self, question: str, category: str, entities: Dict[str, Any]) -> List[str]:
        """Öneriler oluştur"""
        try:
            suggestions = []
            
            if category == 'stock_info':
                suggestions.extend([
                    f"{entity} teknik analizi yap",
                    f"{entity} son haberleri göster",
                    f"{entity} portföy önerisi"
                ])
            
            elif category == 'technical_analysis':
                suggestions.extend([
                    "RSI analizi nasıl yapılır?",
                    "MACD sinyalleri nedir?",
                    "Bollinger Bantları kullanımı"
                ])
            
            elif category == 'portfolio':
                suggestions.extend([
                    "Risk yönetimi stratejileri",
                    "Diversifikasyon önerileri",
                    "Portföy optimizasyonu"
                ])
            
            else:
                suggestions.extend([
                    "Hisse analizi yap",
                    "Teknik analiz öğren",
                    "Portföy önerisi al"
                ])
            
            return suggestions[:3]  # Maksimum 3 öneri
            
        except Exception as e:
            logger.error(f"❌ Generate suggestions error: {e}")
            return []
    
    def _generate_actions(self, question: str, category: str, entities: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Aksiyonlar oluştur"""
        try:
            actions = []
            
            if entities['symbols']:
                symbol = entities['symbols'][0]
                actions.append({
                    'type': 'analyze_stock',
                    'label': f'{symbol} Analizi',
                    'data': {'symbol': symbol}
                })
            
            if category == 'technical_analysis':
                actions.append({
                    'type': 'show_indicators',
                    'label': 'Teknik Göstergeler',
                    'data': {}
                })
            
            if category == 'portfolio':
                actions.append({
                    'type': 'portfolio_analysis',
                    'label': 'Portföy Analizi',
                    'data': {}
                })
            
            return actions
            
        except Exception as e:
            logger.error(f"❌ Generate actions error: {e}")
            return []
    
    async def process_message(self, session_id: str, message: str) -> ChatResponse:
        """Mesajı işle"""
        try:
            session = self.get_session(session_id)
            if not session:
                raise ValueError(f"Session not found: {session_id}")
            
            # Kullanıcı mesajını ekle
            user_message = ChatMessage(
                id=str(uuid.uuid4()),
                role='user',
                content=message,
                timestamp=datetime.now(),
                metadata={'type': 'user_message'}
            )
            
            session.messages.append(user_message)
            
            # Soruyu analiz et
            category = self._classify_question(message)
            entities = self._extract_entities(message)
            
            # Yanıt oluştur
            response_content = self._generate_response(message, category, entities, session.context)
            
            # Öneriler ve aksiyonlar
            suggestions = self._generate_suggestions(message, category, entities)
            actions = self._generate_actions(message, category, entities)
            
            # Asistan mesajını oluştur
            assistant_message = ChatMessage(
                id=str(uuid.uuid4()),
                role='assistant',
                content=response_content,
                timestamp=datetime.now(),
                metadata={
                    'type': 'assistant_response',
                    'category': category,
                    'entities': entities,
                    'confidence': 0.8
                }
            )
            
            session.messages.append(assistant_message)
            session.last_activity = datetime.now()
            
            # Chat yanıtı oluştur
            chat_response = ChatResponse(
                message=assistant_message,
                suggestions=suggestions,
                actions=actions,
                confidence=0.8
            )
            
            logger.info(f"✅ Message processed: {category} - {len(suggestions)} suggestions")
            return chat_response
            
        except Exception as e:
            logger.error(f"❌ Process message error: {e}")
            # Fallback response
            fallback_message = ChatMessage(
                id=str(uuid.uuid4()),
                role='assistant',
                content="Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
                timestamp=datetime.now(),
                metadata={'type': 'error'}
            )
            
            return ChatResponse(
                message=fallback_message,
                suggestions=[],
                actions=[],
                confidence=0.0
            )
    
    def get_session_history(self, session_id: str, limit: int = 50) -> List[ChatMessage]:
        """Oturum geçmişini getir"""
        try:
            session = self.get_session(session_id)
            if not session:
                return []
            
            return session.messages[-limit:]
            
        except Exception as e:
            logger.error(f"❌ Get session history error: {e}")
            return []
    
    def clear_session(self, session_id: str) -> bool:
        """Oturumu temizle"""
        try:
            if session_id in self.sessions:
                del self.sessions[session_id]
                logger.info(f"✅ Session cleared: {session_id}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Clear session error: {e}")
            return False
    
    def get_statistics(self) -> Dict[str, Any]:
        """İstatistikleri getir"""
        try:
            stats = {
                'total_sessions': len(self.sessions),
                'active_sessions': len([s for s in self.sessions.values() 
                                      if (datetime.now() - s.last_activity).seconds < 3600]),
                'total_messages': sum(len(s.messages) for s in self.sessions.values()),
                'knowledge_base': {
                    'stocks': len(self.financial_knowledge['stocks']),
                    'indicators': len(self.financial_knowledge['indicators']),
                    'strategies': len(self.financial_knowledge['strategies'])
                },
                'question_patterns': sum(len(patterns) for patterns in self.question_patterns.values()),
                'response_templates': sum(len(templates) for templates in self.response_templates.values())
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Get statistics error: {e}")
            return {}

# Global instance
ai_chat_assistant = AIChatAssistant()

if __name__ == "__main__":
    async def test_chat_assistant():
        """Test fonksiyonu"""
        logger.info("🧪 Testing AI Chat Assistant...")
        
        # Yeni oturum oluştur
        session_id = ai_chat_assistant.create_session("test_user")
        logger.info(f"✅ Session created: {session_id}")
        
        # Test mesajları
        test_messages = [
            "THYAO hakkında bilgi ver",
            "RSI nedir?",
            "Portföy önerisi",
            "Piyasa analizi"
        ]
        
        # Mesajları işle
        for message in test_messages:
            response = await ai_chat_assistant.process_message(session_id, message)
            logger.info(f"✅ Response: {response.message.content[:100]}...")
            logger.info(f"💡 Suggestions: {response.suggestions}")
        
        # İstatistikler
        stats = ai_chat_assistant.get_statistics()
        logger.info(f"📊 Statistics: {stats}")
        
        logger.info("✅ AI Chat Assistant test completed")
    
    # Test çalıştır
    asyncio.run(test_chat_assistant())
