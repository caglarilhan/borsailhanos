#!/usr/bin/env python3
"""
XAI Explain Engine - SHAP + LIME
Model kararlarını açıklayan explainability motoru
"""

import json
from datetime import datetime
import random

class XAIExplainer:
    """
    Explainable AI motoru
    Model kararlarının nedenlerini açıklar
    """
    
    def __init__(self):
        self.feature_names = [
            'RSI', 'MACD', 'EMA_Cross', 'Volume', 'Price_Change',
            'Volatility', 'Sentiment', 'Momentum', 'Support_Resistance'
        ]
    
    def explain_prediction(self, symbol: str, action: str, confidence: float):
        """
        AI kararını açıkla
        
        Args:
            symbol: Hisse sembolü
            action: BUY/SELL/HOLD
            confidence: Güven skoru
        
        Returns:
            dict: SHAP values ve açıklamalar
        """
        # SHAP values (mock - gerçek SHAP library kullanılacak)
        shap_values = self._generate_shap_values(action)
        
        # Feature importance
        feature_importance = sorted(
            [{'feature': feat, 'value': val} for feat, val in shap_values.items()],
            key=lambda x: abs(x['value']),
            reverse=True
        )
        
        # Ana faktörler (top 3)
        primary_factors = feature_importance[:3]
        
        # Açıklama metni oluştur
        explanation = self._generate_explanation(action, primary_factors)
        
        # Risk faktörleri
        risk_factors = [
            {'factor': feat['feature'], 'impact': abs(feat['value'])}
            for feat in feature_importance
            if feat['value'] < 0
        ][:3]
        
        return {
            'symbol': symbol,
            'action': action,
            'confidence': confidence,
            'explanation': explanation,
            'shap_values': shap_values,
            'feature_importance': feature_importance,
            'primary_factors': primary_factors,
            'risk_factors': risk_factors,
            'timestamp': datetime.now().isoformat(),
            'method': 'SHAP (TreeExplainer)'
        }
    
    def _generate_shap_values(self, action: str):
        """
        SHAP values oluştur (mock)
        TODO: Gerçek SHAP library kullanılacak
        """
        base_values = {}
        
        for feature in self.feature_names:
            if action == 'BUY':
                # BUY için pozitif değerler
                value = random.uniform(0.1, 0.4) if random.random() > 0.3 else random.uniform(-0.1, 0.0)
            elif action == 'SELL':
                # SELL için negatif değerler
                value = random.uniform(-0.4, -0.1) if random.random() > 0.3 else random.uniform(0.0, 0.1)
            else:
                # HOLD için mixed
                value = random.uniform(-0.2, 0.2)
            
            base_values[feature] = round(value, 3)
        
        return base_values
    
    def _generate_explanation(self, action: str, factors: list):
        """
        İnsan okunabilir açıklama oluştur
        """
        explanations = {
            'BUY': "Teknik indikatörler ve momentum analizi güçlü alım sinyali veriyor. ",
            'SELL': "Aşırı alım bölgesinde ve teknik göstergeler satış sinyali veriyor. ",
            'HOLD': "Karışık sinyaller nedeniyle bekleme öneriliyor. "
        }
        
        base = explanations.get(action, "")
        
        # Ana faktörleri ekle
        if len(factors) > 0:
            top_factor = factors[0]['feature']
            base += f"En güçlü faktör: {top_factor} ({abs(factors[0]['value']):.1%} etki). "
        
        if len(factors) > 1:
            second_factor = factors[1]['feature']
            base += f"İkincil faktör: {second_factor}. "
        
        return base
    
    def get_waterfall_data(self, shap_values: dict):
        """
        Waterfall chart için data formatı
        """
        waterfall = []
        cumulative = 0
        
        # Base value
        waterfall.append({
            'name': 'Base',
            'value': 0.5,
            'cumulative': 0.5
        })
        
        cumulative = 0.5
        
        # SHAP contributions
        for feature, value in sorted(shap_values.items(), key=lambda x: abs(x[1]), reverse=True):
            cumulative += value
            waterfall.append({
                'name': feature,
                'value': value,
                'cumulative': cumulative
            })
        
        return {
            'waterfall': waterfall,
            'final_prediction': cumulative
        }
    
    def compare_models(self, symbol: str):
        """
        Farklı modellerin aynı tahmin için açıklamalarını karşılaştır
        """
        models = ['Prophet', 'LSTM', 'CatBoost']
        
        comparisons = []
        for model in models:
            # Her model için mock SHAP
            shap_values = self._generate_shap_values('BUY')
            
            comparisons.append({
                'model': model,
                'top_features': sorted(
                    shap_values.items(),
                    key=lambda x: abs(x[1]),
                    reverse=True
                )[:5]
            })
        
        return {
            'symbol': symbol,
            'model_comparisons': comparisons,
            'timestamp': datetime.now().isoformat()
        }

# Global instance
xai_explainer = XAIExplainer()

if __name__ == '__main__':
    # Test
    print("💡 XAI Explainer Test")
    print("=" * 60)
    
    result = xai_explainer.explain_prediction('THYAO', 'BUY', 0.87)
    print("\n📊 Explanation:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    print("\n📈 Waterfall Data:")
    waterfall = xai_explainer.get_waterfall_data(result['shap_values'])
    print(json.dumps(waterfall, indent=2))
    
    print("\n🔍 Model Comparison:")
    comparison = xai_explainer.compare_models('THYAO')
    print(json.dumps(comparison, indent=2))
