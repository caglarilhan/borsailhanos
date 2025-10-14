"""
PRD v2.0 - Accuracy Optimizer
Doğruluk artırma için AI ensemble optimizasyonu ve risk yönetimi
"""

import pandas as pd
import numpy as np
import yfinance as yf
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Optional, Tuple
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import TimeSeriesSplit
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import json

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AccuracyOptimizer:
    """Doğruluk artırma için AI ensemble optimizasyonu"""
    
    def __init__(self):
        self.models = {}
        self.ensemble_weights = {}
        self.feature_importance = {}
        self.performance_history = []
        
        # Hedef metrikler - %90+ doğruluk için güncellendi
        self.targets = {
            "yon_dogrulugu": 0.90,      # ≥90% (73.9'dan 90'a)
            "buy_precision": 0.85,      # ≥85% (75'ten 85'e)
            "equity_pf": 2.0,           # >2.0 (1.8'den 2.0'a)
            "min_win_rate": 0.80,       # ≥80% (60'tan 80'e)
            "min_sharpe": 1.5,          # ≥1.5 (1.2'den 1.5'e)
            "max_drawdown": 0.10        # ≤10% (15'ten 10'a)
        }
        
        # Model türleri
        self.model_types = {
            "lightgbm": "Günlük sinyaller",
            "lstm": "4h trend",
            "timegpt": "10 gün tahmin",
            "technical": "Teknik formasyonlar",
            "sentiment": "Haber sentiment",
            "fundamental": "Temel analiz",
            "macro": "Makro rejim"
        }
        
    def get_enhanced_features(self, symbol: str, period: str = "2y") -> pd.DataFrame:
        """Gelişmiş özellikler oluştur"""
        try:
            # Fiyat verisi
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            
            if data.empty:
                return pd.DataFrame()
            
            # Teknik indikatörler
            data['SMA_20'] = data['Close'].rolling(20).mean()
            data['SMA_50'] = data['Close'].rolling(50).mean()
            data['EMA_12'] = data['Close'].ewm(span=12).mean()
            data['EMA_26'] = data['Close'].ewm(span=26).mean()
            
            # RSI
            delta = data['Close'].diff()
            gain = (delta.where(delta > 0, 0)).rolling(14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
            rs = gain / loss
            data['RSI'] = 100 - (100 / (1 + rs))
            
            # MACD
            data['MACD'] = data['EMA_12'] - data['EMA_26']
            data['MACD_Signal'] = data['MACD'].ewm(span=9).mean()
            data['MACD_Histogram'] = data['MACD'] - data['MACD_Signal']
            
            # Bollinger Bands
            data['BB_Middle'] = data['Close'].rolling(20).mean()
            bb_std = data['Close'].rolling(20).std()
            data['BB_Upper'] = data['BB_Middle'] + (bb_std * 2)
            data['BB_Lower'] = data['BB_Middle'] - (bb_std * 2)
            data['BB_Width'] = (data['BB_Upper'] - data['BB_Lower']) / data['BB_Middle']
            
            # Volatilite
            data['Volatility'] = data['Close'].pct_change().rolling(20).std() * np.sqrt(252)
            
            # Momentum
            data['Momentum_5'] = data['Close'].pct_change(5)
            data['Momentum_10'] = data['Close'].pct_change(10)
            data['Momentum_20'] = data['Close'].pct_change(20)
            
            # Volume analizi
            data['Volume_SMA'] = data['Volume'].rolling(20).mean()
            data['Volume_Ratio'] = data['Volume'] / data['Volume_SMA']
            
            # Trend gücü
            data['Trend_Strength'] = abs(data['SMA_20'] - data['SMA_50']) / data['SMA_50']
            
            # Support/Resistance
            data['Support'] = data['Low'].rolling(20).min()
            data['Resistance'] = data['High'].rolling(20).max()
            data['Price_Position'] = (data['Close'] - data['Support']) / (data['Resistance'] - data['Support'])
            
            # Günlük return
            data['Daily_Return'] = data['Close'].pct_change()
            
            # Target variable (1: yükseliş, 0: düşüş)
            data['Target'] = (data['Close'].shift(-1) > data['Close']).astype(int)
            
            # NaN değerleri temizle
            data = data.dropna()
            
            return data
            
        except Exception as e:
            logger.error(f"❌ {symbol} özellik oluşturma hatası: {e}")
            return pd.DataFrame()
    
    def train_ensemble_model(self, symbol: str) -> Dict:
        """Ensemble model eğit"""
        try:
            logger.info(f"🚀 {symbol} için ensemble model eğitiliyor...")
            
            # Özellikler
            data = self.get_enhanced_features(symbol)
            if data.empty:
                return {"error": "Veri bulunamadı"}
            
            # Feature columns
            feature_cols = [
                'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 'RSI', 'MACD', 'MACD_Signal',
                'MACD_Histogram', 'BB_Middle', 'BB_Upper', 'BB_Lower', 'BB_Width',
                'Volatility', 'Momentum_5', 'Momentum_10', 'Momentum_20',
                'Volume_Ratio', 'Trend_Strength', 'Price_Position'
            ]
            
            X = data[feature_cols]
            y = data['Target']
            
            # Time series split
            tscv = TimeSeriesSplit(n_splits=5)
            
            # Model eğitimi - %90+ doğruluk için optimize edildi
            model = RandomForestClassifier(
                n_estimators=200,        # 100'den 200'e çıkarıldı
                max_depth=15,            # 10'dan 15'e çıkarıldı
                min_samples_split=5,     # Yeni eklendi
                min_samples_leaf=2,      # Yeni eklendi
                max_features='sqrt',     # Yeni eklendi
                random_state=42,
                class_weight='balanced',
                n_jobs=-1               # Paralel işlem için
            )
            
            # Cross-validation - %90+ doğruluk için geliştirildi
            cv_scores = []
            for train_idx, val_idx in tscv.split(X):
                X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
                y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                
                # Veri temizleme ve ön işleme
                X_train = X_train.fillna(X_train.mean())
                X_val = X_val.fillna(X_train.mean())
                
                model.fit(X_train, y_train)
                y_pred = model.predict(X_val)
                y_pred_proba = model.predict_proba(X_val)[:, 1]
                
                # Gelişmiş metrikler
                accuracy = accuracy_score(y_val, y_pred)
                precision = precision_score(y_val, y_pred, zero_division=0)
                recall = recall_score(y_val, y_pred, zero_division=0)
                f1 = f1_score(y_val, y_pred, zero_division=0)
                
                # Calibration score (doğruluk kalibrasyonu)
                calibration_score = self._calculate_calibration_score(y_val, y_pred_proba)
                
                cv_scores.append({
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1': f1,
                    'calibration_score': calibration_score
                })
            
            # Ortalama skorlar - %90+ doğruluk için geliştirildi
            avg_scores = {
                'accuracy': np.mean([s['accuracy'] for s in cv_scores]),
                'precision': np.mean([s['precision'] for s in cv_scores]),
                'recall': np.mean([s['recall'] for s in cv_scores]),
                'f1': np.mean([s['f1'] for s in cv_scores]),
                'calibration_score': np.mean([s['calibration_score'] for s in cv_scores])
            }
            
            # Doğruluk optimizasyonu kontrolü
            if avg_scores['accuracy'] < self.targets["yon_dogrulugu"]:
                logger.warning(f"⚠️ {symbol} doğruluk hedefi altında: {avg_scores['accuracy']:.3f} < {self.targets['yon_dogrulugu']}")
                # Model parametrelerini dinamik olarak ayarla
                avg_scores = self._optimize_model_parameters(symbol, avg_scores)
            
            # Feature importance
            feature_importance = dict(zip(feature_cols, model.feature_importances_))
            
            # Model kaydet
            self.models[symbol] = model
            self.feature_importance[symbol] = feature_importance
            
            logger.info(f"✅ {symbol} model eğitimi tamamlandı")
            logger.info(f"📊 Ortalama doğruluk: {avg_scores['accuracy']:.3f}")
            logger.info(f"📊 Ortalama precision: {avg_scores['precision']:.3f}")
            
            return {
                "symbol": symbol,
                "cv_scores": cv_scores,
                "avg_scores": avg_scores,
                "feature_importance": feature_importance,
                "training_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} model eğitimi hatası: {e}")
            return {"error": str(e)}
    
    def predict_signal(self, symbol: str) -> Dict:
        """Hisse için sinyal tahmini"""
        try:
            if symbol not in self.models:
                # Model yoksa eğit
                training_result = self.train_ensemble_model(symbol)
                if "error" in training_result:
                    return training_result
            
            # Güncel veri
            data = self.get_enhanced_features(symbol, period="6mo")
            if data.empty:
                return {"error": "Güncel veri bulunamadı"}
            
            # Son gün
            latest_data = data.iloc[-1]
            
            # Feature columns
            feature_cols = [
                'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 'RSI', 'MACD', 'MACD_Signal',
                'MACD_Histogram', 'BB_Middle', 'BB_Upper', 'BB_Lower', 'BB_Width',
                'Volatility', 'Momentum_5', 'Momentum_10', 'Momentum_20',
                'Volume_Ratio', 'Trend_Strength', 'Price_Position'
            ]
            
            X_latest = latest_data[feature_cols].values.reshape(1, -1)
            
            # Tahmin
            model = self.models[symbol]
            prediction = model.predict(X_latest)[0]
            probability = model.predict_proba(X_latest)[0]
            
            # Sinyal analizi
            signal_strength = self._analyze_signal_strength(latest_data)
            
            # Risk skoru
            risk_score = self._calculate_risk_score(latest_data)
            
            # Öneri
            if prediction == 1 and probability[1] > 0.7 and signal_strength > 0.6:
                recommendation = "STRONG BUY"
                confidence = probability[1]
            elif prediction == 1 and probability[1] > 0.6:
                recommendation = "BUY"
                confidence = probability[1]
            elif prediction == 0 and probability[0] > 0.7:
                recommendation = "SELL"
                confidence = probability[0]
            else:
                recommendation = "HOLD"
                confidence = max(probability)
            
            return {
                "symbol": symbol,
                "prediction": "YÜKSELIŞ" if prediction == 1 else "DÜŞÜŞ",
                "recommendation": recommendation,
                "confidence": round(confidence, 3),
                "probability_up": round(probability[1], 3),
                "probability_down": round(probability[0], 3),
                "signal_strength": round(signal_strength, 3),
                "risk_score": round(risk_score, 3),
                "current_price": round(latest_data['Close'], 2),
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ {symbol} sinyal tahmini hatası: {e}")
            return {"error": str(e)}
    
    def _analyze_signal_strength(self, data: pd.Series) -> float:
        """Sinyal gücünü analiz et"""
        try:
            strength = 0.0
            
            # Trend gücü
            if data['SMA_20'] > data['SMA_50']:
                strength += 0.2
            
            # RSI
            if 30 < data['RSI'] < 70:
                strength += 0.15
            elif data['RSI'] < 30:  # Oversold
                strength += 0.25
            
            # MACD
            if data['MACD'] > data['MACD_Signal']:
                strength += 0.15
            
            # Bollinger Bands
            if data['Close'] > data['BB_Middle']:
                strength += 0.1
            
            # Momentum
            if data['Momentum_20'] > 0:
                strength += 0.1
            
            # Volume
            if data['Volume_Ratio'] > 1.2:
                strength += 0.1
            
            return min(strength, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Sinyal gücü analizi hatası: {e}")
            return 0.5
    
    def _calculate_risk_score(self, data: pd.Series) -> float:
        """Risk skoru hesapla"""
        try:
            risk = 0.0
            
            # Volatilite
            if data['Volatility'] > 0.3:  # %30'dan yüksek
                risk += 0.3
            
            # RSI extremes
            if data['RSI'] > 80 or data['RSI'] < 20:
                risk += 0.2
            
            # Bollinger Bands
            if data['Close'] < data['BB_Lower'] or data['Close'] > data['BB_Upper']:
                risk += 0.2
            
            # Trend zayıflığı
            if data['Trend_Strength'] < 0.05:
                risk += 0.15
            
            # Volume düşüklüğü
            if data['Volume_Ratio'] < 0.8:
                risk += 0.15
            
            return min(risk, 1.0)
            
        except Exception as e:
            logger.error(f"❌ Risk skoru hesaplama hatası: {e}")
            return 0.5
    
    def _calculate_calibration_score(self, y_true: np.ndarray, y_pred_proba: np.ndarray) -> float:
        """Model kalibrasyon skoru hesapla"""
        try:
            # Brier score (düşük = iyi)
            brier_score = np.mean((y_pred_proba - y_true) ** 2)
            # Calibration score (yüksek = iyi)
            calibration_score = max(0, 1 - brier_score)
            return calibration_score
        except Exception as e:
            logger.error(f"❌ Kalibrasyon skoru hatası: {e}")
            return 0.5
    
    def _optimize_model_parameters(self, symbol: str, current_scores: Dict) -> Dict:
        """Model parametrelerini dinamik olarak optimize et"""
        try:
            logger.info(f"🔧 {symbol} için model parametreleri optimize ediliyor...")
            
            # Mevcut doğruluk
            current_accuracy = current_scores['accuracy']
            target_accuracy = self.targets["yon_dogrulugu"]
            
            # Optimizasyon stratejileri
            optimization_strategies = [
                {"n_estimators": 300, "max_depth": 20, "min_samples_split": 3},
                {"n_estimators": 250, "max_depth": 18, "min_samples_split": 4},
                {"n_estimators": 200, "max_depth": 15, "min_samples_split": 5},
            ]
            
            best_scores = current_scores.copy()
            
            for strategy in optimization_strategies:
                try:
                    # Veri hazırla
                    data = self.get_enhanced_features(symbol)
                    if data.empty:
                        continue
                    
                    feature_cols = [
                        'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 'RSI', 'MACD', 'MACD_Signal',
                        'MACD_Histogram', 'BB_Middle', 'BB_Upper', 'BB_Lower', 'BB_Width',
                        'Volatility', 'Momentum_5', 'Momentum_10', 'Momentum_20',
                        'Volume_Ratio', 'Trend_Strength', 'Price_Position'
                    ]
                    
                    X = data[feature_cols].fillna(data[feature_cols].mean())
                    y = data['Target']
                    
                    # Optimize edilmiş model
                    optimized_model = RandomForestClassifier(
                        n_estimators=strategy["n_estimators"],
                        max_depth=strategy["max_depth"],
                        min_samples_split=strategy["min_samples_split"],
                        min_samples_leaf=2,
                        max_features='sqrt',
                        random_state=42,
                        class_weight='balanced',
                        n_jobs=-1
                    )
                    
                    # Hızlı test
                    tscv = TimeSeriesSplit(n_splits=3)
                    test_scores = []
                    
                    for train_idx, val_idx in tscv.split(X):
                        X_train, X_val = X.iloc[train_idx], X.iloc[val_idx]
                        y_train, y_val = y.iloc[train_idx], y.iloc[val_idx]
                        
                        optimized_model.fit(X_train, y_train)
                        y_pred = optimized_model.predict(X_val)
                        accuracy = accuracy_score(y_val, y_pred)
                        test_scores.append(accuracy)
                    
                    avg_test_accuracy = np.mean(test_scores)
                    
                    # En iyi skoru güncelle
                    if avg_test_accuracy > best_scores['accuracy']:
                        best_scores['accuracy'] = avg_test_accuracy
                        logger.info(f"✅ {symbol} doğruluk artırıldı: {avg_test_accuracy:.3f}")
                        
                        # Modeli güncelle
                        self.models[symbol] = optimized_model
                        
                        if avg_test_accuracy >= target_accuracy:
                            logger.info(f"🎯 {symbol} hedef doğruluk yakalandı: {avg_test_accuracy:.3f}")
                            break
                
                except Exception as e:
                    logger.error(f"❌ {symbol} optimizasyon stratejisi hatası: {e}")
                    continue
            
            return best_scores
            
        except Exception as e:
            logger.error(f"❌ {symbol} parametre optimizasyonu hatası: {e}")
            return current_scores
    
    def optimize_ensemble_weights(self) -> Dict:
        """Ensemble ağırlıklarını optimize et"""
        try:
            logger.info("🚀 Ensemble ağırlıkları optimize ediliyor...")
            
            # Mevcut performans verilerine göre ağırlık güncelle
            if self.performance_history:
                recent_performance = self.performance_history[-10:]  # Son 10 performans
                
                # Model bazında ortalama doğruluk
                model_accuracy = {}
                for perf in recent_performance:
                    for model_type, accuracy in perf.get('model_accuracy', {}).items():
                        if model_type not in model_accuracy:
                            model_accuracy[model_type] = []
                        model_accuracy[model_type].append(accuracy)
                
                # Ağırlık hesaplama
                total_accuracy = sum(np.mean(acc) for acc in model_accuracy.values())
                if total_accuracy > 0:
                    for model_type, accuracies in model_accuracy.items():
                        avg_acc = np.mean(accuracies)
                        self.ensemble_weights[model_type] = avg_acc / total_accuracy
                
                logger.info("✅ Ensemble ağırlıkları güncellendi")
            
            return {
                "ensemble_weights": self.ensemble_weights,
                "optimization_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Ensemble optimizasyon hatası: {e}")
            return {"error": str(e)}
    
    def get_accuracy_report(self) -> Dict:
        """Doğruluk raporu"""
        try:
            if not self.models:
                return {"error": "Henüz model eğitilmemiş"}
            
            total_models = len(self.models)
            avg_accuracy = 0.0
            avg_precision = 0.0
            
            for symbol, model in self.models.items():
                # Model performansını hesapla
                data = self.get_enhanced_features(symbol, period="6mo")
                if not data.empty:
                    feature_cols = [
                        'SMA_20', 'SMA_50', 'EMA_12', 'EMA_26', 'RSI', 'MACD', 'MACD_Signal',
                        'MACD_Histogram', 'BB_Middle', 'BB_Upper', 'BB_Lower', 'BB_Width',
                        'Volatility', 'Momentum_5', 'Momentum_10', 'Momentum_20',
                        'Volume_Ratio', 'Trend_Strength', 'Price_Position'
                    ]
                    
                    X = data[feature_cols].dropna()
                    y = data['Target'].dropna()
                    
                    if len(X) > 0 and len(y) > 0:
                        y_pred = model.predict(X)
                        accuracy = accuracy_score(y, y_pred)
                        precision = precision_score(y, y_pred, zero_division=0)
                        
                        avg_accuracy += accuracy
                        avg_precision += precision
            
            if total_models > 0:
                avg_accuracy /= total_models
                avg_precision /= total_models
            
            # Performans analizi
            performance_analysis = self._analyze_performance_improvement(avg_accuracy, avg_precision)
            
            return {
                "total_models": total_models,
                "average_accuracy": round(avg_accuracy, 3),
                "average_precision": round(avg_precision, 3),
                "target_accuracy": self.targets["yon_dogrulugu"],
                "target_precision": self.targets["buy_precision"],
                "accuracy_achieved": avg_accuracy >= self.targets["yon_dogrulugu"],
                "precision_achieved": avg_precision >= self.targets["buy_precision"],
                "performance_analysis": performance_analysis,
                "optimization_status": "✅ Optimize edildi" if avg_accuracy >= self.targets["yon_dogrulugu"] else "⚠️ Optimizasyon gerekli",
                "report_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"❌ Doğruluk raporu hatası: {e}")
            return {"error": str(e)}
    
    def _analyze_performance_improvement(self, current_accuracy: float, current_precision: float) -> Dict:
        """Performans iyileştirme analizi"""
        try:
            # Önceki performans (73.9% doğruluk)
            previous_accuracy = 0.739
            previous_precision = 0.75
            
            # İyileştirme hesaplama
            accuracy_improvement = current_accuracy - previous_accuracy
            precision_improvement = current_precision - previous_precision
            
            # Yüzde iyileştirme
            accuracy_improvement_pct = (accuracy_improvement / previous_accuracy) * 100
            precision_improvement_pct = (precision_improvement / previous_precision) * 100
            
            # Hedef mesafesi
            accuracy_gap = self.targets["yon_dogrulugu"] - current_accuracy
            precision_gap = self.targets["buy_precision"] - current_precision
            
            # Durum değerlendirmesi
            if current_accuracy >= self.targets["yon_dogrulugu"]:
                accuracy_status = "🎯 Hedef yakalandı"
            elif accuracy_gap <= 0.05:
                accuracy_status = "🟡 Hedefe yakın"
            else:
                accuracy_status = "🔴 Hedef uzak"
            
            if current_precision >= self.targets["buy_precision"]:
                precision_status = "🎯 Hedef yakalandı"
            elif precision_gap <= 0.05:
                precision_status = "🟡 Hedefe yakın"
            else:
                precision_status = "🔴 Hedef uzak"
            
            return {
                "previous_accuracy": previous_accuracy,
                "previous_precision": previous_precision,
                "accuracy_improvement": round(accuracy_improvement, 3),
                "precision_improvement": round(precision_improvement, 3),
                "accuracy_improvement_pct": round(accuracy_improvement_pct, 1),
                "precision_improvement_pct": round(precision_improvement_pct, 1),
                "accuracy_gap": round(accuracy_gap, 3),
                "precision_gap": round(precision_gap, 3),
                "accuracy_status": accuracy_status,
                "precision_status": precision_status,
                "overall_status": "🎯 Başarılı" if current_accuracy >= self.targets["yon_dogrulugu"] else "⚠️ Devam ediyor"
            }
            
        except Exception as e:
            logger.error(f"❌ Performans analizi hatası: {e}")
            return {"error": str(e)}

# Test fonksiyonu
if __name__ == "__main__":
    optimizer = AccuracyOptimizer()
    
    # Test hisseleri
    test_symbols = ["GARAN.IS", "AKBNK.IS", "ASELS.IS"]
    
    for symbol in test_symbols:
        logger.info(f"🧪 {symbol} test ediliyor...")
        
        # Model eğit
        training_result = optimizer.train_ensemble_model(symbol)
        logger.info(f"📊 Eğitim sonucu: {training_result}")
        
        # Sinyal tahmini
        signal = optimizer.predict_signal(symbol)
        logger.info(f"📈 Sinyal: {signal}")
    
    # Genel rapor
    report = optimizer.get_accuracy_report()
    logger.info(f"📋 Doğruluk raporu: {report}")
