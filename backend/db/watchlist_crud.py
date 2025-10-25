#!/usr/bin/env python3
"""
Watchlist CRUD - Database Persistence
Kullanıcıya özel watchlist yönetimi
"""

import json
from datetime import datetime
from typing import List, Dict

class WatchlistManager:
    """
    Watchlist veritabanı yöneticisi
    """
    
    def __init__(self):
        # In-memory storage (production'da Firestore/MongoDB olacak)
        self.watchlists = {}  # {user_id: [symbols]}
        self.metadata = {}    # {user_id: {created_at, updated_at}}
    
    def get_watchlist(self, user_id: str = 'default'):
        """
        Kullanıcının watchlist'ini getir
        """
        watchlist = self.watchlists.get(user_id, ['THYAO', 'ASELS', 'TUPRS', 'SISE', 'EREGL'])
        
        return {
            'user_id': user_id,
            'symbols': watchlist,
            'count': len(watchlist),
            'last_updated': self.metadata.get(user_id, {}).get('updated_at', datetime.now().isoformat())
        }
    
    def add_symbol(self, user_id: str, symbol: str):
        """
        Watchlist'e sembol ekle
        """
        if user_id not in self.watchlists:
            self.watchlists[user_id] = []
            self.metadata[user_id] = {
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        
        if symbol not in self.watchlists[user_id]:
            self.watchlists[user_id].append(symbol)
            self.metadata[user_id]['updated_at'] = datetime.now().isoformat()
            
            # TODO: Firestore'a kaydet
            print(f"➕ {symbol} added to {user_id}'s watchlist")
            
            return {
                'status': 'success',
                'message': f'{symbol} watchlist'e eklendi',
                'watchlist': self.watchlists[user_id]
            }
        else:
            return {
                'status': 'error',
                'message': f'{symbol} zaten watchlist'te'
            }
    
    def remove_symbol(self, user_id: str, symbol: str):
        """
        Watchlist'ten sembol çıkar
        """
        if user_id in self.watchlists and symbol in self.watchlists[user_id]:
            self.watchlists[user_id].remove(symbol)
            self.metadata[user_id]['updated_at'] = datetime.now().isoformat()
            
            # TODO: Firestore'dan sil
            print(f"➖ {symbol} removed from {user_id}'s watchlist")
            
            return {
                'status': 'success',
                'message': f'{symbol} watchlist'ten çıkarıldı',
                'watchlist': self.watchlists[user_id]
            }
        else:
            return {
                'status': 'error',
                'message': f'{symbol} watchlist'te bulunamadı'
            }
    
    def update_watchlist(self, user_id: str, symbols: List[str]):
        """
        Watchlist'i tamamen güncelle
        """
        self.watchlists[user_id] = symbols
        
        if user_id not in self.metadata:
            self.metadata[user_id] = {'created_at': datetime.now().isoformat()}
        
        self.metadata[user_id]['updated_at'] = datetime.now().isoformat()
        
        # TODO: Firestore'a kaydet
        print(f"🔄 {user_id}'s watchlist updated: {len(symbols)} symbols")
        
        return {
            'status': 'success',
            'message': 'Watchlist güncellendi',
            'symbols': symbols,
            'count': len(symbols)
        }
    
    def clear_watchlist(self, user_id: str):
        """
        Watchlist'i temizle
        """
        if user_id in self.watchlists:
            self.watchlists[user_id] = []
            self.metadata[user_id]['updated_at'] = datetime.now().isoformat()
            
            return {
                'status': 'success',
                'message': 'Watchlist temizlendi'
            }
        
        return {
            'status': 'error',
            'message': 'Watchlist bulunamadı'
        }
    
    def get_all_watchlists(self):
        """
        Tüm kullanıcıların watchlist'lerini getir (Admin için)
        """
        return {
            'total_users': len(self.watchlists),
            'watchlists': [
                {
                    'user_id': user_id,
                    'symbols': symbols,
                    'count': len(symbols),
                    'metadata': self.metadata.get(user_id, {})
                }
                for user_id, symbols in self.watchlists.items()
            ]
        }

# Global instance
watchlist_manager = WatchlistManager()

if __name__ == '__main__':
    # Test
    print("📋 Watchlist Manager Test")
    print("=" * 50)
    
    # Get watchlist
    wl = watchlist_manager.get_watchlist('user123')
    print("Get:", wl)
    
    # Add symbol
    add = watchlist_manager.add_symbol('user123', 'GARAN')
    print("\nAdd:", add)
    
    # Remove symbol
    remove = watchlist_manager.remove_symbol('user123', 'SISE')
    print("\nRemove:", remove)
    
    # Update watchlist
    update = watchlist_manager.update_watchlist('user123', ['THYAO', 'ASELS', 'TUPRS'])
    print("\nUpdate:", update)
    
    # Get all (admin)
    all_wl = watchlist_manager.get_all_watchlists()
    print("\nAll Watchlists:", json.dumps(all_wl, indent=2))
