#!/usr/bin/env python3
"""
AI Trading Sinyalleri Doğruluk Takip Sistemi
Gerçek performansı ölçmek için sinyalleri kaydeder ve istatistik tutar
"""

import json
import sqlite3
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os

class SignalTracker:
    def __init__(self, db_path: str = "signal_tracker.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Veritabanını başlat"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sinyaller tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS signals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                signal TEXT NOT NULL,
                confidence REAL NOT NULL,
                price REAL NOT NULL,
                timestamp TEXT NOT NULL,
                prediction_date TEXT NOT NULL,
                target_date TEXT NOT NULL,
                actual_price REAL DEFAULT NULL,
                actual_change REAL DEFAULT NULL,
                is_correct INTEGER DEFAULT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # İstatistikler tablosu
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                symbol TEXT NOT NULL,
                total_signals INTEGER DEFAULT 0,
                correct_signals INTEGER DEFAULT 0,
                accuracy_rate REAL DEFAULT 0.0,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_signal(self, symbol: str, signal: str, confidence: float, 
                   price: float, prediction_days: int = 1) -> int:
        """Yeni sinyal kaydet"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        now = datetime.now()
        prediction_date = now.strftime('%Y-%m-%d %H:%M:%S')
        target_date = (now + timedelta(days=prediction_days)).strftime('%Y-%m-%d %H:%M:%S')
        
        cursor.execute('''
            INSERT INTO signals (symbol, signal, confidence, price, timestamp, 
                               prediction_date, target_date)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (symbol, signal, confidence, price, now.isoformat(), 
              prediction_date, target_date))
        
        signal_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        print(f"✅ Sinyal kaydedildi: {symbol} {signal} - ID: {signal_id}")
        return signal_id
    
    def update_result(self, signal_id: int, actual_price: float):
        """Sinyal sonucunu güncelle"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Orijinal sinyali al
        cursor.execute('SELECT symbol, signal, price FROM signals WHERE id = ?', (signal_id,))
        result = cursor.fetchone()
        
        if not result:
            print(f"❌ Sinyal bulunamadı: {signal_id}")
            conn.close()
            return
        
        symbol, signal, original_price = result
        actual_change = ((actual_price - original_price) / original_price) * 100
        
        # Doğruluk kontrolü
        is_correct = None
        if signal == 'BUY':
            is_correct = 1 if actual_change > 0 else 0
        elif signal == 'SELL':
            is_correct = 1 if actual_change < 0 else 0
        elif signal == 'HOLD':
            is_correct = 1 if abs(actual_change) < 1.0 else 0  # %1'den az değişim
        
        # Sonucu güncelle
        cursor.execute('''
            UPDATE signals 
            SET actual_price = ?, actual_change = ?, is_correct = ?
            WHERE id = ?
        ''', (actual_price, actual_change, is_correct, signal_id))
        
        conn.commit()
        conn.close()
        
        print(f"📊 Sonuç güncellendi: {symbol} {signal} -> {actual_change:.2f}% ({'✅' if is_correct else '❌'})")
        
        # İstatistikleri güncelle
        self.update_statistics(symbol)
    
    def update_statistics(self, symbol: str):
        """Sembol istatistiklerini güncelle"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Toplam ve doğru sinyal sayısını hesapla
        cursor.execute('''
            SELECT COUNT(*), SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END)
            FROM signals 
            WHERE symbol = ? AND is_correct IS NOT NULL
        ''', (symbol,))
        
        total, correct = cursor.fetchone()
        
        if total > 0:
            accuracy = (correct / total) * 100
            
            # İstatistikleri güncelle veya ekle
            cursor.execute('''
                INSERT OR REPLACE INTO statistics (symbol, total_signals, correct_signals, accuracy_rate, last_updated)
                VALUES (?, ?, ?, ?, ?)
            ''', (symbol, total, correct, accuracy, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def get_statistics(self, symbol: Optional[str] = None) -> Dict:
        """İstatistikleri getir"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if symbol:
            cursor.execute('''
                SELECT symbol, total_signals, correct_signals, accuracy_rate, last_updated
                FROM statistics WHERE symbol = ?
            ''', (symbol,))
        else:
            cursor.execute('''
                SELECT symbol, total_signals, correct_signals, accuracy_rate, last_updated
                FROM statistics ORDER BY accuracy_rate DESC
            ''')
        
        results = cursor.fetchall()
        conn.close()
        
        stats = {}
        for row in results:
            symbol_name, total, correct, accuracy, last_updated = row
            stats[symbol_name] = {
                'total_signals': total,
                'correct_signals': correct,
                'accuracy_rate': accuracy,
                'last_updated': last_updated
            }
        
        return stats
    
    def get_pending_signals(self) -> List[Dict]:
        """Sonuç bekleyen sinyalleri getir"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, symbol, signal, confidence, price, prediction_date, target_date
            FROM signals 
            WHERE actual_price IS NULL AND target_date <= ?
            ORDER BY target_date ASC
        ''', (datetime.now().strftime('%Y-%m-%d %H:%M:%S'),))
        
        results = cursor.fetchall()
        conn.close()
        
        pending = []
        for row in results:
            pending.append({
                'id': row[0],
                'symbol': row[1],
                'signal': row[2],
                'confidence': row[3],
                'price': row[4],
                'prediction_date': row[5],
                'target_date': row[6]
            })
        
        return pending
    
    def export_report(self) -> str:
        """Detaylı rapor oluştur"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Genel istatistikler
        cursor.execute('''
            SELECT 
                COUNT(*) as total_signals,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_signals,
                AVG(CASE WHEN is_correct IS NOT NULL THEN is_correct ELSE NULL END) * 100 as overall_accuracy
            FROM signals WHERE is_correct IS NOT NULL
        ''')
        
        general_stats = cursor.fetchone()
        
        # Sembol bazında istatistikler
        cursor.execute('''
            SELECT symbol, total_signals, correct_signals, accuracy_rate
            FROM statistics ORDER BY accuracy_rate DESC
        ''')
        
        symbol_stats = cursor.fetchall()
        
        conn.close()
        
        # Rapor oluştur
        report = f"""
📊 AI TRADING SİNYALLERİ DOĞRULUK RAPORU
{'='*50}

📈 GENEL İSTATİSTİKLER:
• Toplam Sinyal: {general_stats[0] or 0}
• Doğru Sinyal: {general_stats[1] or 0}
• Genel Doğruluk: {(general_stats[2] * 100) if general_stats[2] else 0:.1f}%

📊 SEMBOL BAZINDA PERFORMANS:
"""
        
        for symbol, total, correct, accuracy in symbol_stats:
            report += f"• {symbol}: {correct}/{total} ({accuracy:.1f}%)\n"
        
        report += f"""
🕐 Rapor Tarihi: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        return report

# Test fonksiyonu
def test_tracker():
    """Test fonksiyonu"""
    tracker = SignalTracker()
    
    print("🧪 Signal Tracker Test Başlıyor...")
    
    # Test sinyalleri ekle
    signals = [
        ('THYAO', 'BUY', 0.85, 325.50),
        ('ASELS', 'SELL', 0.72, 88.40),
        ('TUPRS', 'BUY', 0.91, 145.20),
        ('SISE', 'BUY', 0.78, 45.80),
        ('EREGL', 'HOLD', 0.65, 67.30),
        ('BIMAS', 'BUY', 0.82, 125.80),
        ('KCHOL', 'BUY', 0.76, 155.30),
        ('SAHOL', 'HOLD', 0.65, 72.10)
    ]
    
    signal_ids = []
    for symbol, signal, confidence, price in signals:
        signal_id = tracker.save_signal(symbol, signal, confidence, price)
        signal_ids.append(signal_id)
    
    print(f"\n✅ {len(signals)} sinyal kaydedildi!")
    
    # İstatistikleri göster
    stats = tracker.get_statistics()
    print(f"\n📊 Mevcut İstatistikler:")
    for symbol, data in stats.items():
        print(f"• {symbol}: {data['correct_signals']}/{data['total_signals']} ({data['accuracy_rate']:.1f}%)")
    
    # Rapor oluştur
    report = tracker.export_report()
    print(f"\n{report}")

if __name__ == "__main__":
    test_tracker()
