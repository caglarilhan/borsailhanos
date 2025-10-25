#!/usr/bin/env python3
"""
Data Validator - Training Data Quality Control
AI eğitimi öncesi veri kalitesi kontrolü
"""

import json
from datetime import datetime, timedelta
import random

class DataValidator:
    """
    Veri kalitesi doğrulama servisi
    """
    
    def __init__(self):
        self.validation_rules = {
            'price': {'min': 0.01, 'max': 10000, 'type': float},
            'volume': {'min': 0, 'max': 1e12, 'type': int},
            'date': {'type': str, 'format': '%Y-%m-%d'}
        }
        
        self.quality_threshold = 0.95  # %95 kaliteli veri gerekli
    
    def validate_training_data(self, data: dict):
        """
        Training data'yı doğrula
        
        Args:
            data: {prices: [...], volume: [...], dates: [...]}
        
        Returns:
            dict: Validation sonucu
        """
        print("🔍 Data Validation Başlatıldı")
        print("=" * 50)
        
        validation_results = {
            'total_records': 0,
            'valid_records': 0,
            'invalid_records': 0,
            'quality_score': 0.0,
            'errors': [],
            'warnings': [],
            'passed': False
        }
        
        # 1. Veri boş mu?
        if not data or not data.get('prices'):
            validation_results['errors'].append('Veri seti boş!')
            return validation_results
        
        prices = data.get('prices', [])
        validation_results['total_records'] = len(prices)
        
        # 2. Veri noktalarını kontrol et
        for i, price_data in enumerate(prices):
            is_valid, error = self._validate_record(price_data, i)
            
            if is_valid:
                validation_results['valid_records'] += 1
            else:
                validation_results['invalid_records'] += 1
                validation_results['errors'].append(error)
        
        # 3. Kalite skoru hesapla
        if validation_results['total_records'] > 0:
            validation_results['quality_score'] = (
                validation_results['valid_records'] / validation_results['total_records']
            )
        
        # 4. Missing data kontrolü
        missing_ratio = self._check_missing_data(prices)
        if missing_ratio > 0.05:  # %5'ten fazla eksik veri
            validation_results['warnings'].append(f'%{missing_ratio*100:.1f} veri eksik')
        
        # 5. Outlier detection
        outliers = self._detect_outliers(prices)
        if len(outliers) > 0:
            validation_results['warnings'].append(f'{len(outliers)} outlier tespit edildi')
        
        # 6. Final karar
        validation_results['passed'] = (
            validation_results['quality_score'] >= self.quality_threshold
            and len(validation_results['errors']) == 0
        )
        
        print(f"\n📊 Validation Sonuçları:")
        print(f"   Toplam kayıt: {validation_results['total_records']}")
        print(f"   Geçerli: {validation_results['valid_records']}")
        print(f"   Geçersiz: {validation_results['invalid_records']}")
        print(f"   Kalite skoru: {validation_results['quality_score']:.2%}")
        print(f"   Durum: {'✅ PASSED' if validation_results['passed'] else '❌ FAILED'}")
        
        return validation_results
    
    def _validate_record(self, record: dict, index: int):
        """Tek veri kaydını doğrula"""
        # Price kontrolü
        if 'close' not in record:
            return False, f"Index {index}: 'close' field eksik"
        
        price = record.get('close')
        if not isinstance(price, (int, float)):
            return False, f"Index {index}: price geçersiz tip"
        
        if price < self.validation_rules['price']['min'] or price > self.validation_rules['price']['max']:
            return False, f"Index {index}: price range dışında ({price})"
        
        # NaN kontrolü
        if price != price:  # NaN check
            return False, f"Index {index}: price NaN"
        
        return True, None
    
    def _check_missing_data(self, prices: list):
        """Eksik veri oranı"""
        if not prices:
            return 1.0
        
        missing = sum(1 for p in prices if p.get('close') is None or p.get('close') != p.get('close'))
        return missing / len(prices)
    
    def _detect_outliers(self, prices: list):
        """
        Outlier tespiti (IQR method)
        """
        values = [p.get('close', 0) for p in prices if p.get('close') is not None]
        
        if len(values) < 4:
            return []
        
        values.sort()
        q1_idx = len(values) // 4
        q3_idx = 3 * len(values) // 4
        
        q1 = values[q1_idx]
        q3 = values[q3_idx]
        iqr = q3 - q1
        
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers = [
            {'index': i, 'value': p.get('close')}
            for i, p in enumerate(prices)
            if p.get('close') and (p.get('close') < lower_bound or p.get('close') > upper_bound)
        ]
        
        return outliers
    
    def sanitize_data(self, data: dict):
        """
        Veriyi temizle ve düzelt
        
        - Missing values → interpolation
        - Outliers → winsorization
        - Duplicates → remove
        """
        # TODO: Veri temizleme implementasyonu
        print("🧹 Data sanitization...")
        return data

# Global instance
data_validator = DataValidator()

if __name__ == '__main__':
    # Test
    print("🔍 Data Validator Test")
    print("=" * 50)
    
    # Mock training data
    mock_data = {
        'prices': [
            {'date': '2025-01-01', 'close': 245.5},
            {'date': '2025-01-02', 'close': 247.2},
            {'date': '2025-01-03', 'close': 246.8},
            {'date': '2025-01-04', 'close': None},  # Missing
            {'date': '2025-01-05', 'close': 1000.0},  # Outlier
            {'date': '2025-01-06', 'close': 248.5}
        ]
    }
    
    result = data_validator.validate_training_data(mock_data)
    print("\n📋 Validation Result:")
    print(json.dumps(result, indent=2))
