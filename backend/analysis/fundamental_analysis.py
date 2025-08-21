"""
Fundamental Analiz Modülü
- DuPont Analizi (ROE bileşen ayrıştırma)
- Piotroski F-Score (9 kriterli finansal sağlık)
- Finansal oranlar hesaplama
"""

import pandas as pd
import numpy as np
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class FundamentalAnalyzer:
    def __init__(self):
        self.required_ratios = [
            'NetProfitMargin', 'ROE', 'ROA', 'AssetTurnover', 
            'FinancialLeverage', 'DebtEquity', 'CurrentRatio',
            'QuickRatio', 'CashRatio', 'InterestCoverage'
        ]
    
    def calculate_financial_ratios(self, financial_data: Dict) -> pd.DataFrame:
        """Temel finansal oranları hesapla"""
        try:
            ratios = {}
            
            # Net Kar Marjı
            if 'net_income' in financial_data and 'revenue' in financial_data:
                ratios['NetProfitMargin'] = (financial_data['net_income'] / financial_data['revenue']) * 100
            
            # ROE
            if 'net_income' in financial_data and 'total_equity' in financial_data:
                ratios['ROE'] = (financial_data['net_income'] / financial_data['total_equity']) * 100
            
            # ROA
            if 'net_income' in financial_data and 'total_assets' in financial_data:
                ratios['ROA'] = (financial_data['net_income'] / financial_data['total_assets']) * 100
            
            # Borç/Özsermaye
            if 'total_debt' in financial_data and 'total_equity' in financial_data:
                ratios['DebtEquity'] = financial_data['total_debt'] / financial_data['total_equity']
            
            # Cari Oran
            if 'current_assets' in financial_data and 'current_liabilities' in financial_data:
                ratios['CurrentRatio'] = financial_data['current_assets'] / financial_data['current_liabilities']
            
            return ratios
            
        except Exception as e:
            logger.error(f"Finansal oran hesaplama hatası: {e}")
            return {}
    
    def calculate_dupont_analysis(self, financial_data: Dict) -> Dict:
        """DuPont analizi - ROE bileşen ayrıştırma"""
        try:
            dupont = {}
            
            # ROE = Net Kar Marjı × Varlık Devir Hızı × Finansal Kaldıraç
            if all(k in financial_data for k in ['net_income', 'revenue', 'total_assets', 'total_equity']):
                net_margin = financial_data['net_income'] / financial_data['revenue']
                asset_turnover = financial_data['revenue'] / financial_data['total_assets']
                financial_leverage = financial_data['total_assets'] / financial_data['total_equity']
                
                dupont['NetProfitMargin'] = net_margin * 100
                dupont['AssetTurnover'] = asset_turnover
                dupont['FinancialLeverage'] = financial_leverage
                dupont['ROE'] = net_margin * asset_turnover * financial_leverage * 100
                
                # ROE bileşen katkıları
                dupont['Margin_Contribution'] = net_margin * 100
                dupont['Turnover_Contribution'] = asset_turnover
                dupont['Leverage_Contribution'] = financial_leverage
                
            return dupont
            
        except Exception as e:
            logger.error(f"DuPont analiz hatası: {e}")
            return {}
    
    def calculate_piotroski_score(self, financial_data: Dict) -> Dict:
        """Piotroski F-Score (9 kriterli finansal sağlık)"""
        try:
            score = 0
            criteria = {}
            
            # 1. Net Kar (NI > 0)
            if financial_data.get('net_income', 0) > 0:
                score += 1
                criteria['NetIncome_Positive'] = True
            else:
                criteria['NetIncome_Positive'] = False
            
            # 2. Nakit Akışı (CFO > 0)
            if financial_data.get('operating_cash_flow', 0) > 0:
                score += 1
                criteria['CFO_Positive'] = True
            else:
                criteria['CFO_Positive'] = False
            
            # 3. ROA artışı (ROA t+1 > ROA t)
            if 'roa_current' in financial_data and 'roa_previous' in financial_data:
                if financial_data['roa_current'] > financial_data['roa_previous']:
                    score += 1
                    criteria['ROA_Increase'] = True
                else:
                    criteria['ROA_Increase'] = False
            
            # 4. Nakit Akışı > Net Kar
            if financial_data.get('operating_cash_flow', 0) > financial_data.get('net_income', 0):
                score += 1
                criteria['CFO_GT_NI'] = True
            else:
                criteria['CFO_GT_NI'] = False
            
            # 5. Borç azalması
            if 'debt_current' in financial_data and 'debt_previous' in financial_data:
                if financial_data['debt_current'] < financial_data['debt_previous']:
                    score += 1
                    criteria['Debt_Decrease'] = True
                else:
                    criteria['Debt_Decrease'] = False
            
            # 6. Cari oran artışı
            if 'current_ratio_current' in financial_data and 'current_ratio_previous' in financial_data:
                if financial_data['current_ratio_current'] > financial_data['current_ratio_previous']:
                    score += 1
                    criteria['CurrentRatio_Increase'] = True
                else:
                    criteria['CurrentRatio_Increase'] = False
            
            # 7. Hisse senedi çoğalmaması
            if 'shares_current' in financial_data and 'shares_previous' in financial_data:
                if financial_data['shares_current'] <= financial_data['shares_previous']:
                    score += 1
                    criteria['No_Share_Dilution'] = True
                else:
                    criteria['No_Share_Dilution'] = False
            
            # 8. Brüt kar marjı artışı
            if 'gross_margin_current' in financial_data and 'gross_margin_previous' in financial_data:
                if financial_data['gross_margin_current'] > financial_data['gross_margin_previous']:
                    score += 1
                    criteria['GrossMargin_Increase'] = True
                else:
                    criteria['GrossMargin_Increase'] = False
            
            # 9. Varlık devir hızı artışı
            if 'asset_turnover_current' in financial_data and 'asset_turnover_previous' in financial_data:
                if financial_data['asset_turnover_current'] > financial_data['asset_turnover_previous']:
                    score += 1
                    criteria['AssetTurnover_Increase'] = True
                else:
                    criteria['AssetTurnover_Increase'] = False
            
            criteria['Total_Score'] = score
            criteria['Score_Category'] = 'Strong' if score >= 7 else 'Moderate' if score >= 4 else 'Weak'
            
            return criteria
            
        except Exception as e:
            logger.error(f"Piotroski skor hesaplama hatası: {e}")
            return {'Total_Score': 0, 'Score_Category': 'Error'}
    
    def get_financial_health_summary(self, symbol: str, financial_data: Dict) -> Dict:
        """Tüm fundamental analizleri birleştir"""
        try:
            summary = {
                'symbol': symbol,
                'timestamp': pd.Timestamp.now().isoformat(),
                'ratios': self.calculate_financial_ratios(financial_data),
                'dupont': self.calculate_dupont_analysis(financial_data),
                'piotroski': self.calculate_piotroski_score(financial_data)
            }
            
            # Genel sağlık skoru (0-100)
            health_score = 0
            
            # Piotroski skorundan (0-9 → 0-30 puan)
            piotroski_score = summary['piotroski'].get('Total_Score', 0)
            health_score += (piotroski_score / 9) * 30
            
            # ROE'den (0-20 puan)
            roe = summary['dupont'].get('ROE', 0)
            if roe > 0:
                health_score += min(roe / 5, 20)  # Max 20 puan
            
            # Borç/Özsermaye'den (0-20 puan)
            debt_equity = summary['ratios'].get('DebtEquity', 0)
            if debt_equity > 0:
                health_score += max(0, 20 - (debt_equity * 10))  # Düşük borç = yüksek puan
            
            # Cari oran'dan (0-30 puan)
            current_ratio = summary['ratios'].get('CurrentRatio', 0)
            if current_ratio > 0:
                health_score += min(current_ratio * 15, 30)  # Max 30 puan
            
            summary['health_score'] = round(health_score, 2)
            summary['health_grade'] = 'A' if health_score >= 80 else 'B' if health_score >= 60 else 'C' if health_score >= 40 else 'D'
            
            return summary
            
        except Exception as e:
            logger.error(f"Finansal sağlık özeti hatası: {e}")
            return {'symbol': symbol, 'error': str(e)}

# Test fonksiyonu
def test_fundamental_analysis():
    """Test verisi ile fundamental analizi test et"""
    analyzer = FundamentalAnalyzer()
    
    # Örnek finansal veri
    test_data = {
        'net_income': 1000000,
        'revenue': 10000000,
        'total_equity': 5000000,
        'total_assets': 15000000,
        'total_debt': 2000000,
        'current_assets': 8000000,
        'current_liabilities': 3000000,
        'operating_cash_flow': 1200000,
        'roa_current': 6.67,
        'roa_previous': 6.0,
        'debt_current': 2000000,
        'debt_previous': 2200000,
        'current_ratio_current': 2.67,
        'current_ratio_previous': 2.5,
        'shares_current': 1000000,
        'shares_previous': 1000000,
        'gross_margin_current': 25,
        'gross_margin_previous': 24,
        'asset_turnover_current': 0.67,
        'asset_turnover_previous': 0.65
    }
    
    result = analyzer.get_financial_health_summary('SISE.IS', test_data)
    
    print("=== Fundamental Analiz Test Sonucu ===")
    print(f"Symbol: {result['symbol']}")
    print(f"Sağlık Skoru: {result['health_score']}/100 ({result['health_grade']})")
    print(f"Piotroski F-Score: {result['piotroski']['Total_Score']}/9")
    print(f"ROE: {result['dupont'].get('ROE', 0):.2f}%")
    print(f"Borç/Özsermaye: {result['ratios'].get('DebtEquity', 0):.2f}")
    print(f"Cari Oran: {result['ratios'].get('CurrentRatio', 0):.2f}")
    
    return result

if __name__ == "__main__":
    test_fundamental_analysis()
