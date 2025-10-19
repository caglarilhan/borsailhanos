"""
BIST AI Smart Trader - Fundamental Veri Sağlayıcısı
Yahoo Finance ile bilanço, finansal oranlar ve temel analiz verilerini çeker
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import asyncio
import json

class FundamentalDataProvider:
    def __init__(self):
        # BIST hisse sembolleri
        self.bist_symbols = [
            'AKBNK.IS', 'ARCLK.IS', 'ASELS.IS', 'BIMAS.IS', 'EKGYO.IS',
            'EREGL.IS', 'FROTO.IS', 'GARAN.IS', 'HALKB.IS', 'ISCTR.IS',
            'KCHOL.IS', 'KOZAL.IS', 'KOZAA.IS', 'PETKM.IS', 'PGSUS.IS',
            'SAHOL.IS', 'SASA.IS', 'SISE.IS', 'TAVHL.IS', 'THYAO.IS',
            'TKFEN.IS', 'TOASO.IS', 'TUPRS.IS', 'VAKBN.IS', 'YKBNK.IS',
            'ZOREN.IS', 'ADNAC.IS', 'BUCIM.IS', 'CCOLA.IS', 'DOHOL.IS'
        ]

    def get_fundamental_data(self, symbol):
        """Tek hisse için fundamental veri çek"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Temel bilgiler
            info = ticker.info
            
            # Finansal oranlar
            ratios = self._extract_financial_ratios(info)
            
            # Bilanço verileri
            balance_sheet = ticker.balance_sheet
            income_statement = ticker.income_stmt
            cash_flow = ticker.cashflow
            
            # DuPont analizi
            dupont = self._calculate_dupont_analysis(info, income_statement, balance_sheet)
            
            # Piotroski F-Score
            piotroski = self._calculate_piotroski_score(income_statement, balance_sheet, cash_flow)
            
            return {
                'symbol': symbol.replace('.IS', ''),
                'company_name': info.get('longName', ''),
                'sector': info.get('sector', ''),
                'industry': info.get('industry', ''),
                'market_cap': info.get('marketCap', 0),
                'enterprise_value': info.get('enterpriseValue', 0),
                'ratios': ratios,
                'dupont': dupont,
                'piotroski_score': piotroski,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"⚠️ {symbol} fundamental veri hatası: {e}")
            return None

    def _extract_financial_ratios(self, info):
        """Finansal oranları çıkar"""
        return {
            # Kârlılık Oranları
            'gross_margin': info.get('grossMargins', 0) * 100 if info.get('grossMargins') else 0,
            'operating_margin': info.get('operatingMargins', 0) * 100 if info.get('operatingMargins') else 0,
            'net_margin': info.get('profitMargins', 0) * 100 if info.get('profitMargins') else 0,
            'roe': info.get('returnOnEquity', 0) * 100 if info.get('returnOnEquity') else 0,
            'roa': info.get('returnOnAssets', 0) * 100 if info.get('returnOnAssets') else 0,
            'roic': info.get('returnOnInvestment', 0) * 100 if info.get('returnOnInvestment') else 0,
            
            # Değerleme Oranları
            'pe_ratio': info.get('trailingPE', 0),
            'forward_pe': info.get('forwardPE', 0),
            'peg_ratio': info.get('pegRatio', 0),
            'price_to_book': info.get('priceToBook', 0),
            'price_to_sales': info.get('priceToSalesTrailing12Months', 0),
            'ev_to_ebitda': info.get('enterpriseToEbitda', 0),
            'ev_to_revenue': info.get('enterpriseToRevenue', 0),
            
            # Likidite Oranları
            'current_ratio': info.get('currentRatio', 0),
            'quick_ratio': info.get('quickRatio', 0),
            'cash_ratio': info.get('cashRatio', 0),
            
            # Borç Oranları
            'debt_to_equity': info.get('debtToEquity', 0),
            'debt_to_assets': info.get('debtToAssets', 0),
            'interest_coverage': info.get('interestCoverage', 0),
            
            # Verimlilik Oranları
            'asset_turnover': info.get('assetTurnover', 0),
            'inventory_turnover': info.get('inventoryTurnover', 0),
            'receivables_turnover': info.get('receivablesTurnover', 0),
            
            # Büyüme Oranları
            'revenue_growth': info.get('revenueGrowth', 0) * 100 if info.get('revenueGrowth') else 0,
            'earnings_growth': info.get('earningsGrowth', 0) * 100 if info.get('earningsGrowth') else 0,
            'eps_growth': info.get('earningsQuarterlyGrowth', 0) * 100 if info.get('earningsQuarterlyGrowth') else 0,
            
            # Diğer
            'dividend_yield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0,
            'payout_ratio': info.get('payoutRatio', 0) * 100 if info.get('payoutRatio') else 0,
            'beta': info.get('beta', 0),
            'book_value': info.get('bookValue', 0),
            'eps': info.get('trailingEps', 0),
            'forward_eps': info.get('forwardEps', 0)
        }

    def _calculate_dupont_analysis(self, info, income_statement, balance_sheet):
        """DuPont analizi hesapla"""
        try:
            # Son yıl verileri
            if income_statement.empty or balance_sheet.empty:
                return {
                    'net_profit_margin': 0,
                    'asset_turnover': 0,
                    'equity_multiplier': 0,
                    'roe_dupont': 0,
                    'analysis': 'Veri yetersiz'
                }
            
            # Son yıl verilerini al
            latest_income = income_statement.iloc[:, 0]
            latest_balance = balance_sheet.iloc[:, 0]
            
            # Net kâr marjı
            net_income = latest_income.get('Net Income', 0)
            revenue = latest_income.get('Total Revenue', 0)
            net_profit_margin = (net_income / revenue * 100) if revenue != 0 else 0
            
            # Varlık devir hızı
            total_assets = latest_balance.get('Total Assets', 0)
            asset_turnover = (revenue / total_assets) if total_assets != 0 else 0
            
            # Özkaynak çarpanı
            total_equity = latest_balance.get('Stockholders Equity', 0)
            equity_multiplier = (total_assets / total_equity) if total_equity != 0 else 0
            
            # DuPont ROE
            roe_dupont = net_profit_margin * asset_turnover * equity_multiplier
            
            # Analiz
            analysis = self._analyze_dupont_components(net_profit_margin, asset_turnover, equity_multiplier)
            
            return {
                'net_profit_margin': net_profit_margin,
                'asset_turnover': asset_turnover,
                'equity_multiplier': equity_multiplier,
                'roe_dupont': roe_dupont,
                'analysis': analysis
            }
            
        except Exception as e:
            print(f"⚠️ DuPont analizi hatası: {e}")
            return {
                'net_profit_margin': 0,
                'asset_turnover': 0,
                'equity_multiplier': 0,
                'roe_dupont': 0,
                'analysis': 'Hesaplama hatası'
            }

    def _analyze_dupont_components(self, net_margin, asset_turnover, equity_multiplier):
        """DuPont bileşenlerini analiz et"""
        analysis_parts = []
        
        # Net kâr marjı analizi
        if net_margin > 15:
            analysis_parts.append("Yüksek kârlılık")
        elif net_margin > 5:
            analysis_parts.append("Orta kârlılık")
        else:
            analysis_parts.append("Düşük kârlılık")
        
        # Varlık devir hızı analizi
        if asset_turnover > 1.5:
            analysis_parts.append("Yüksek verimlilik")
        elif asset_turnover > 0.8:
            analysis_parts.append("Orta verimlilik")
        else:
            analysis_parts.append("Düşük verimlilik")
        
        # Özkaynak çarpanı analizi
        if equity_multiplier > 2.5:
            analysis_parts.append("Yüksek kaldıraç")
        elif equity_multiplier > 1.5:
            analysis_parts.append("Orta kaldıraç")
        else:
            analysis_parts.append("Düşük kaldıraç")
        
        return " | ".join(analysis_parts)

    def _calculate_piotroski_score(self, income_statement, balance_sheet, cash_flow):
        """Piotroski F-Score hesapla"""
        try:
            if income_statement.empty or balance_sheet.empty or cash_flow.empty:
                return {'score': 0, 'analysis': 'Veri yetersiz'}
            
            score = 0
            analysis_parts = []
            
            # Son 2 yıl verileri
            latest_income = income_statement.iloc[:, 0]
            prev_income = income_statement.iloc[:, 1] if income_statement.shape[1] > 1 else latest_income
            
            latest_balance = balance_sheet.iloc[:, 0]
            prev_balance = balance_sheet.iloc[:, 1] if balance_sheet.shape[1] > 1 else latest_balance
            
            latest_cashflow = cash_flow.iloc[:, 0]
            
            # 1. Net Income pozitif mi?
            net_income = latest_income.get('Net Income', 0)
            if net_income > 0:
                score += 1
                analysis_parts.append("Pozitif net gelir")
            
            # 2. ROA pozitif mi?
            total_assets = latest_balance.get('Total Assets', 0)
            roa = (net_income / total_assets) if total_assets != 0 else 0
            if roa > 0:
                score += 1
                analysis_parts.append("Pozitif ROA")
            
            # 3. Operasyonel nakit akışı pozitif mi?
            operating_cashflow = latest_cashflow.get('Operating Cash Flow', 0)
            if operating_cashflow > 0:
                score += 1
                analysis_parts.append("Pozitif operasyonel nakit")
            
            # 4. Operasyonel nakit akışı > Net gelir mi?
            if operating_cashflow > net_income:
                score += 1
                analysis_parts.append("Nakit > Gelir")
            
            # 5. Uzun vadeli borç azaldı mı?
            current_debt = latest_balance.get('Long Term Debt', 0)
            prev_debt = prev_balance.get('Long Term Debt', 0)
            if current_debt < prev_debt:
                score += 1
                analysis_parts.append("Borç azaldı")
            
            # 6. Cari oran arttı mı?
            current_assets = latest_balance.get('Current Assets', 0)
            current_liabilities = latest_balance.get('Current Liabilities', 0)
            prev_current_assets = prev_balance.get('Current Assets', 0)
            prev_current_liabilities = prev_balance.get('Current Liabilities', 0)
            
            current_ratio = (current_assets / current_liabilities) if current_liabilities != 0 else 0
            prev_current_ratio = (prev_current_assets / prev_current_liabilities) if prev_current_liabilities != 0 else 0
            
            if current_ratio > prev_current_ratio:
                score += 1
                analysis_parts.append("Cari oran arttı")
            
            # 7. Hisse senedi sayısı azaldı mı? (Basitleştirilmiş)
            # Bu genellikle treasury stock ile ölçülür, basit versiyonda atlıyoruz
            score += 0  # Bu kriteri atlıyoruz
            
            # 8. Brüt marj arttı mı?
            current_revenue = latest_income.get('Total Revenue', 0)
            current_cogs = latest_income.get('Cost Of Revenue', 0)
            prev_revenue = prev_income.get('Total Revenue', 0)
            prev_cogs = prev_income.get('Cost Of Revenue', 0)
            
            current_gross_margin = ((current_revenue - current_cogs) / current_revenue) if current_revenue != 0 else 0
            prev_gross_margin = ((prev_revenue - prev_cogs) / prev_revenue) if prev_revenue != 0 else 0
            
            if current_gross_margin > prev_gross_margin:
                score += 1
                analysis_parts.append("Brüt marj arttı")
            
            # 9. Varlık devir hızı arttı mı?
            current_asset_turnover = (current_revenue / total_assets) if total_assets != 0 else 0
            prev_total_assets = prev_balance.get('Total Assets', 0)
            prev_asset_turnover = (prev_revenue / prev_total_assets) if prev_total_assets != 0 else 0
            
            if current_asset_turnover > prev_asset_turnover:
                score += 1
                analysis_parts.append("Varlık devir hızı arttı")
            
            # Analiz
            if score >= 7:
                analysis = "Güçlü finansal sağlık"
            elif score >= 4:
                analysis = "Orta finansal sağlık"
            else:
                analysis = "Zayıf finansal sağlık"
            
            return {
                'score': score,
                'max_score': 9,
                'analysis': analysis,
                'details': analysis_parts
            }
            
        except Exception as e:
            print(f"⚠️ Piotroski skor hatası: {e}")
            return {'score': 0, 'analysis': 'Hesaplama hatası'}

    def get_bulk_fundamental_data(self, symbols=None):
        """Toplu fundamental veri çek"""
        if symbols is None:
            symbols = self.bist_symbols[:10]  # İlk 10 hisse
        
        results = []
        for symbol in symbols:
            try:
                data = self.get_fundamental_data(symbol)
                if data:
                    results.append(data)
            except Exception as e:
                print(f"⚠️ {symbol} toplu veri hatası: {e}")
                continue
        
        return results

    def calculate_financial_score(self, fundamental_data):
        """Finansal sağlık skoru hesapla"""
        try:
            ratios = fundamental_data['ratios']
            dupont = fundamental_data['dupont']
            piotroski = fundamental_data['piotroski_score']
            
            score = 0
            max_score = 100
            
            # Kârlılık (25 puan)
            profitability_score = 0
            if ratios['roe'] > 15:
                profitability_score += 10
            elif ratios['roe'] > 10:
                profitability_score += 5
            
            if ratios['net_margin'] > 10:
                profitability_score += 10
            elif ratios['net_margin'] > 5:
                profitability_score += 5
            
            if ratios['operating_margin'] > 15:
                profitability_score += 5
            elif ratios['operating_margin'] > 10:
                profitability_score += 2
            
            # Likidite (20 puan)
            liquidity_score = 0
            if ratios['current_ratio'] > 2:
                liquidity_score += 10
            elif ratios['current_ratio'] > 1.5:
                liquidity_score += 5
            
            if ratios['quick_ratio'] > 1:
                liquidity_score += 10
            elif ratios['quick_ratio'] > 0.8:
                liquidity_score += 5
            
            # Borç yönetimi (20 puan)
            debt_score = 0
            if ratios['debt_to_equity'] < 0.5:
                debt_score += 10
            elif ratios['debt_to_equity'] < 1:
                debt_score += 5
            
            if ratios['interest_coverage'] > 5:
                debt_score += 10
            elif ratios['interest_coverage'] > 2:
                debt_score += 5
            
            # Büyüme (15 puan)
            growth_score = 0
            if ratios['revenue_growth'] > 10:
                growth_score += 8
            elif ratios['revenue_growth'] > 5:
                growth_score += 4
            
            if ratios['earnings_growth'] > 15:
                growth_score += 7
            elif ratios['earnings_growth'] > 10:
                growth_score += 3
            
            # Değerleme (10 puan)
            valuation_score = 0
            if ratios['pe_ratio'] > 0 and ratios['pe_ratio'] < 15:
                valuation_score += 5
            elif ratios['pe_ratio'] > 0 and ratios['pe_ratio'] < 25:
                valuation_score += 3
            
            if ratios['price_to_book'] > 0 and ratios['price_to_book'] < 2:
                valuation_score += 5
            elif ratios['price_to_book'] > 0 and ratios['price_to_book'] < 3:
                valuation_score += 3
            
            # Piotroski bonus (10 puan)
            piotroski_bonus = (piotroski['score'] / 9) * 10
            
            total_score = profitability_score + liquidity_score + debt_score + growth_score + valuation_score + piotroski_bonus
            
            return {
                'total_score': min(total_score, max_score),
                'max_score': max_score,
                'breakdown': {
                    'profitability': profitability_score,
                    'liquidity': liquidity_score,
                    'debt_management': debt_score,
                    'growth': growth_score,
                    'valuation': valuation_score,
                    'piotroski_bonus': piotroski_bonus
                },
                'grade': self._get_financial_grade(total_score)
            }
            
        except Exception as e:
            print(f"⚠️ Finansal skor hatası: {e}")
            return {'total_score': 0, 'grade': 'F'}

    def _get_financial_grade(self, score):
        """Finansal not ver"""
        if score >= 90:
            return 'A+'
        elif score >= 80:
            return 'A'
        elif score >= 70:
            return 'B+'
        elif score >= 60:
            return 'B'
        elif score >= 50:
            return 'C+'
        elif score >= 40:
            return 'C'
        else:
            return 'D'

# Test fonksiyonu
if __name__ == "__main__":
    provider = FundamentalDataProvider()
    
    print("🚀 BIST AI Smart Trader - Fundamental Veri Sağlayıcısı Test")
    print("=" * 60)
    
    # Tek hisse testi
    print("\n📊 AKBNK Fundamental Analizi:")
    akbnk_data = provider.get_fundamental_data('AKBNK.IS')
    if akbnk_data:
        print(f"Şirket: {akbnk_data['company_name']}")
        print(f"Sektör: {akbnk_data['sector']}")
        print(f"P/E Oranı: {akbnk_data['ratios']['pe_ratio']:.2f}")
        print(f"ROE: {akbnk_data['ratios']['roe']:.2f}%")
        print(f"Net Marj: {akbnk_data['ratios']['net_margin']:.2f}%")
        print(f"Piotroski Skor: {akbnk_data['piotroski_score']['score']}/9")
        
        # Finansal skor hesapla
        financial_score = provider.calculate_financial_score(akbnk_data)
        print(f"Finansal Skor: {financial_score['total_score']:.1f}/100 ({financial_score['grade']})")
    
    # Toplu veri testi
    print("\n📈 Toplu Fundamental Veri:")
    bulk_data = provider.get_bulk_fundamental_data(['AKBNK.IS', 'GARAN.IS', 'THYAO.IS'])
    for data in bulk_data:
        score = provider.calculate_financial_score(data)
        print(f"{data['symbol']}: {score['total_score']:.1f}/100 ({score['grade']})")
