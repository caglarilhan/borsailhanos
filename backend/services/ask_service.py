#!/usr/bin/env python3
"""
Soru-Cevap Servisi
- Kullanıcı sorularını analiz eder
- Mevcut verilerden akıllı cevaplar üretir
"""

import re
from typing import Dict, List, Optional
from datetime import datetime, timedelta

# Local imports
try:
    from backend.data.price_layer import fetch_recent_ohlcv
    from backend.data.fundamentals import fetch_basic_fundamentals
    from backend.services.mcdm import compute_entropy_topsis
    from backend.services.pattern_adapter import detect_patterns_from_ohlcv
    from backend.services.macro_adapter import get_market_regime_summary
    from backend.services.sentiment import sentiment_tr
    from backend.services.rl_agent import SimpleRLAagent
except ImportError:
    from ..data.price_layer import fetch_recent_ohlcv
    from ..data.fundamentals import fetch_basic_fundamentals
    from ..services.mcdm import compute_entropy_topsis
    from ..services.pattern_adapter import detect_patterns_from_ohlcv
    from ..services.macro_adapter import get_market_regime_summary
    from ..services.sentiment import sentiment_tr
    from ..services.rl_agent import SimpleRLAagent

class AskService:
    def __init__(self):
        self.rl_agent = SimpleRLAagent()
        
    def extract_symbols(self, question: str) -> List[str]:
        """Soru metninden hisse sembollerini çıkar"""
        # BIST sembolleri pattern'i
        bist_pattern = r'\b([A-Z]{2,5}\.IS)\b'
        symbols = re.findall(bist_pattern, question.upper())
        
        # Eğer sembol bulunamazsa, yaygın hisseleri varsay
        if not symbols:
            if any(word in question.lower() for word in ['sise', 'sisecam']):
                symbols = ['SISE.IS']
            elif any(word in question.lower() for word in ['eregl', 'ereğli']):
                symbols = ['EREGL.IS']
            elif any(word in question.lower() for word in ['tüpraş', 'tupras']):
                symbols = ['TUPRS.IS']
            elif any(word in question.lower() for word in ['akbank', 'akbnk']):
                symbols = ['AKBNK.IS']
            else:
                symbols = ['SISE.IS', 'EREGL.IS', 'TUPRS.IS']  # Varsayılan
                
        return symbols
        
    def analyze_question_type(self, question: str) -> str:
        """Soru tipini analiz et"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ['nasıl', 'ne durumda', 'durumu']):
            return 'status'
        elif any(word in question_lower for word in ['alayım', 'satayım', 'ne yapayım']):
            return 'action'
        elif any(word in question_lower for word in ['yükselir', 'düşer', 'tahmin']):
            return 'prediction'
        elif any(word in question_lower for word in ['risk', 'güvenli', 'tehlikeli']):
            return 'risk'
        elif any(word in question_lower for word in ['güçlü', 'zayıf', 'en iyi']):
            return 'ranking'
        else:
            return 'general'
            
    def generate_status_answer(self, symbols: List[str]) -> str:
        """Durum analizi cevabı"""
        answers = []
        
        for symbol in symbols[:3]:  # Max 3 hisse
            try:
                # Fiyat verisi
                df = fetch_recent_ohlcv(symbol=symbol, period="1mo", interval="1d")
                if df.empty:
                    continue
                    
                current_price = df['close'].iloc[-1]
                prev_price = df['close'].iloc[-2] if len(df) > 1 else current_price
                price_change = (current_price - prev_price) / prev_price
                
                # Pattern analizi
                patterns = detect_patterns_from_ohlcv(df.tail(50))
                bullish_patterns = [p for p in patterns if p.get('signal') in ['BUY', 'BULLISH']]
                
                # TOPSIS skoru
                fundamentals = fetch_basic_fundamentals([symbol])
                if not fundamentals.empty:
                    benefit_flags = [1, 1, 0]
                    topsis = compute_entropy_topsis(
                        fundamentals[["NetProfitMargin", "ROE", "DebtEquity"]], 
                        benefit_flags
                    )
                    topsis_score = float(topsis.get(symbol)) if symbol in topsis.index else 0.5
                else:
                    topsis_score = 0.5
                    
                # Cevap oluştur
                change_emoji = "📈" if price_change > 0 else "📉"
                pattern_text = f"{len(bullish_patterns)} güçlü sinyal" if bullish_patterns else "zayıf sinyal"
                
                answer = f"{symbol}: {change_emoji} {price_change:+.1%} | TOPSIS: {topsis_score:.2f} | {pattern_text}"
                answers.append(answer)
                
            except Exception as e:
                continue
                
        if answers:
            return "📊 Güncel Durum:\n" + "\n".join(answers)
        else:
            return "❌ Veri alınamadı, lütfen daha sonra tekrar deneyin."
            
    def generate_action_answer(self, symbols: List[str]) -> str:
        """Aksiyon önerisi cevabı"""
        answers = []
        
        for symbol in symbols[:2]:  # Max 2 hisse
            try:
                df = fetch_recent_ohlcv(symbol=symbol, period="1mo", interval="1d")
                if df.empty:
                    continue
                    
                # Pattern analizi
                patterns = detect_patterns_from_ohlcv(df.tail(50))
                latest_tags = [p.get('pattern_type', '') for p in patterns[:3]]
                
                # TOPSIS skoru
                fundamentals = fetch_basic_fundamentals([symbol])
                if not fundamentals.empty:
                    benefit_flags = [1, 1, 0]
                    topsis = compute_entropy_topsis(
                        fundamentals[["NetProfitMargin", "ROE", "DebtEquity"]], 
                        benefit_flags
                    )
                    topsis_score = float(topsis.get(symbol)) if symbol in topsis.index else 0.5
                else:
                    topsis_score = 0.5
                    
                # RL önerisi
                advice = self.rl_agent.advise(topsis_score, latest_tags)
                
                # Cevap oluştur
                action_emoji = {"BUY": "🟢", "SELL": "🔴", "HOLD": "🟡"}.get(advice.side, "🟡")
                answer = f"{symbol}: {action_emoji} {advice.side} | Boyut: %{advice.size_pct*100:.0f} | SL: %{advice.stop_loss_pct*100:.0f}"
                answers.append(answer)
                
            except Exception as e:
                continue
                
        if answers:
            return "💡 Önerilerim:\n" + "\n".join(answers)
        else:
            return "❌ Analiz yapılamadı, lütfen daha sonra tekrar deneyin."
            
    def generate_prediction_answer(self, symbols: List[str]) -> str:
        """Tahmin cevabı"""
        answers = []
        
        for symbol in symbols[:2]:
            try:
                df = fetch_recent_ohlcv(symbol=symbol, period="1mo", interval="1d")
                if df.empty:
                    continue
                    
                # Pattern analizi
                patterns = detect_patterns_from_ohlcv(df.tail(50))
                bullish_patterns = [p for p in patterns if p.get('signal') in ['BUY', 'BULLISH']]
                bearish_patterns = [p for p in patterns if p.get('signal') in ['SELL', 'BEARISH']]
                
                # Market regime
                regime = get_market_regime_summary()
                
                # Tahmin oluştur
                if len(bullish_patterns) > len(bearish_patterns):
                    prediction = "📈 Yükseliş eğilimi"
                    confidence = len(bullish_patterns) * 20
                elif len(bearish_patterns) > len(bullish_patterns):
                    prediction = "📉 Düşüş eğilimi"
                    confidence = len(bearish_patterns) * 20
                else:
                    prediction = "➡️ Yatay hareket"
                    confidence = 50
                    
                # Market regime etkisi
                if regime.get('regime') == 'RISK_ON':
                    prediction += " (Risk-on modu destekliyor)"
                elif regime.get('regime') == 'RISK_OFF':
                    prediction += " (Risk-off modu baskılıyor)"
                    
                answer = f"{symbol}: {prediction} | Güven: %{min(confidence, 90)}"
                answers.append(answer)
                
            except Exception as e:
                continue
                
        if answers:
            return "🔮 Tahminlerim:\n" + "\n".join(answers)
        else:
            return "❌ Tahmin yapılamadı, lütfen daha sonra tekrar deneyin."
            
    async def answer_question(self, question: str) -> str:
        """Soruya cevap ver"""
        symbols = self.extract_symbols(question)
        question_type = self.analyze_question_type(question)
        
        # Cevap üret
        if question_type == 'status':
            answer = self.generate_status_answer(symbols)
        elif question_type == 'action':
            answer = self.generate_action_answer(symbols)
        elif question_type == 'prediction':
            answer = self.generate_prediction_answer(symbols)
        else:
            answer = "🤖 Anladım, analiz ediyorum...\n" + self.generate_status_answer(symbols)
            
        return answer

# Global ask service
ask_service = AskService()
