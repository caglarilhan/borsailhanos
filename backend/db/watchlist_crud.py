#!/usr/bin/env python3
"""
BIST AI Smart Trader - Watchlist CRUD Service
Complete watchlist management with real-time updates
"""

import asyncio
import logging
import sqlite3
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class WatchlistItem(BaseModel):
    symbol: str
    name: str
    added_at: Optional[str] = None
    notes: Optional[str] = None
    alert_price: Optional[float] = None
    alert_type: Optional[str] = None  # 'above', 'below', 'change'

class WatchlistCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class WatchlistUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None

class WatchlistCRUD:
    def __init__(self, db_path: str = "bist_ai.db"):
        self.db_path = db_path
        self.init_database()
        
        # WebSocket connections for real-time updates
        self.active_connections: List[Any] = []
        
        logger.info("📋 Watchlist CRUD Service initialized")

    def init_database(self):
        """Initialize database tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create watchlists table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS watchlists (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    user_id TEXT NOT NULL,
                    is_public BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create watchlist_items table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS watchlist_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    watchlist_id INTEGER NOT NULL,
                    symbol TEXT NOT NULL,
                    name TEXT NOT NULL,
                    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    notes TEXT,
                    alert_price REAL,
                    alert_type TEXT,
                    FOREIGN KEY (watchlist_id) REFERENCES watchlists (id) ON DELETE CASCADE,
                    UNIQUE(watchlist_id, symbol)
                )
            ''')
            
            # Create watchlist_shares table (for sharing)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS watchlist_shares (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    watchlist_id INTEGER NOT NULL,
                    shared_with_user_id TEXT NOT NULL,
                    permission TEXT DEFAULT 'read', -- 'read', 'write'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (watchlist_id) REFERENCES watchlists (id) ON DELETE CASCADE,
                    UNIQUE(watchlist_id, shared_with_user_id)
                )
            ''')
            
            # Create indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_watchlist_items_symbol ON watchlist_items(symbol)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_watchlist_items_watchlist_id ON watchlist_items(watchlist_id)')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Database initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise

    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    async def create_watchlist(self, user_id: str, watchlist_data: WatchlistCreate) -> Dict[str, Any]:
        """Create a new watchlist"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO watchlists (name, description, user_id, is_public)
                VALUES (?, ?, ?, ?)
            ''', (watchlist_data.name, watchlist_data.description, user_id, watchlist_data.is_public))
            
            watchlist_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            result = {
                'id': watchlist_id,
                'name': watchlist_data.name,
                'description': watchlist_data.description,
                'user_id': user_id,
                'is_public': watchlist_data.is_public,
                'created_at': datetime.now().isoformat(),
                'items': []
            }
            
            logger.info(f"✅ Watchlist created: {watchlist_data.name} (ID: {watchlist_id})")
            
            # Notify WebSocket clients
            await self.broadcast_watchlist_update('created', result)
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Failed to create watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_watchlists(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all watchlists for a user"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get user's own watchlists and shared ones
            cursor.execute('''
                SELECT DISTINCT w.*, 
                       COUNT(wi.id) as item_count,
                       MAX(wi.added_at) as last_updated
                FROM watchlists w
                LEFT JOIN watchlist_items wi ON w.id = wi.watchlist_id
                WHERE w.user_id = ? OR w.id IN (
                    SELECT watchlist_id FROM watchlist_shares 
                    WHERE shared_with_user_id = ?
                )
                GROUP BY w.id
                ORDER BY w.created_at DESC
            ''', (user_id, user_id))
            
            watchlists = []
            for row in cursor.fetchall():
                watchlist = {
                    'id': row['id'],
                    'name': row['name'],
                    'description': row['description'],
                    'user_id': row['user_id'],
                    'is_public': bool(row['is_public']),
                    'created_at': row['created_at'],
                    'updated_at': row['updated_at'],
                    'item_count': row['item_count'],
                    'last_updated': row['last_updated']
                }
                watchlists.append(watchlist)
            
            conn.close()
            
            logger.info(f"📋 Retrieved {len(watchlists)} watchlists for user {user_id}")
            return watchlists
            
        except Exception as e:
            logger.error(f"❌ Failed to get watchlists: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_watchlist(self, watchlist_id: int, user_id: str) -> Dict[str, Any]:
        """Get a specific watchlist with items"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check if user has access to this watchlist
            cursor.execute('''
                SELECT w.* FROM watchlists w
                LEFT JOIN watchlist_shares ws ON w.id = ws.watchlist_id
                WHERE w.id = ? AND (w.user_id = ? OR ws.shared_with_user_id = ?)
            ''', (watchlist_id, user_id, user_id))
            
            watchlist_row = cursor.fetchone()
            if not watchlist_row:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # Get watchlist items
            cursor.execute('''
                SELECT * FROM watchlist_items
                WHERE watchlist_id = ?
                ORDER BY added_at DESC
            ''', (watchlist_id,))
            
            items = []
            for row in cursor.fetchall():
                item = {
                    'id': row['id'],
                    'symbol': row['symbol'],
                    'name': row['name'],
                    'added_at': row['added_at'],
                    'notes': row['notes'],
                    'alert_price': row['alert_price'],
                    'alert_type': row['alert_type']
                }
                items.append(item)
            
            conn.close()
            
            result = {
                'id': watchlist_row['id'],
                'name': watchlist_row['name'],
                'description': watchlist_row['description'],
                'user_id': watchlist_row['user_id'],
                'is_public': bool(watchlist_row['is_public']),
                'created_at': watchlist_row['created_at'],
                'updated_at': watchlist_row['updated_at'],
                'items': items
            }
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to get watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def update_watchlist(self, watchlist_id: int, user_id: str, update_data: WatchlistUpdate) -> Dict[str, Any]:
        """Update a watchlist"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check ownership
            cursor.execute('SELECT user_id FROM watchlists WHERE id = ?', (watchlist_id,))
            owner_row = cursor.fetchone()
            if not owner_row or owner_row['user_id'] != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to update this watchlist")
            
            # Build update query
            update_fields = []
            update_values = []
            
            if update_data.name is not None:
                update_fields.append('name = ?')
                update_values.append(update_data.name)
            
            if update_data.description is not None:
                update_fields.append('description = ?')
                update_values.append(update_data.description)
            
            if update_data.is_public is not None:
                update_fields.append('is_public = ?')
                update_values.append(update_data.is_public)
            
            if update_fields:
                update_fields.append('updated_at = CURRENT_TIMESTAMP')
                update_values.append(watchlist_id)
                
                cursor.execute(f'''
                    UPDATE watchlists 
                    SET {', '.join(update_fields)}
                    WHERE id = ?
                ''', update_values)
                
                conn.commit()
            
            conn.close()
            
            # Get updated watchlist
            result = await self.get_watchlist(watchlist_id, user_id)
            
            logger.info(f"✅ Watchlist updated: {watchlist_id}")
            
            # Notify WebSocket clients
            await self.broadcast_watchlist_update('updated', result)
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to update watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def delete_watchlist(self, watchlist_id: int, user_id: str) -> Dict[str, Any]:
        """Delete a watchlist"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check ownership
            cursor.execute('SELECT user_id FROM watchlists WHERE id = ?', (watchlist_id,))
            owner_row = cursor.fetchone()
            if not owner_row or owner_row['user_id'] != user_id:
                raise HTTPException(status_code=403, detail="Not authorized to delete this watchlist")
            
            # Get watchlist info before deletion
            watchlist_info = await self.get_watchlist(watchlist_id, user_id)
            
            # Delete watchlist (items will be deleted by CASCADE)
            cursor.execute('DELETE FROM watchlists WHERE id = ?', (watchlist_id,))
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Watchlist deleted: {watchlist_id}")
            
            # Notify WebSocket clients
            await self.broadcast_watchlist_update('deleted', {'id': watchlist_id})
            
            return {'message': 'Watchlist deleted successfully', 'id': watchlist_id}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to delete watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def add_to_watchlist(self, watchlist_id: int, user_id: str, item: WatchlistItem) -> Dict[str, Any]:
        """Add item to watchlist"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check access
            cursor.execute('''
                SELECT w.user_id FROM watchlists w
                LEFT JOIN watchlist_shares ws ON w.id = ws.watchlist_id
                WHERE w.id = ? AND (w.user_id = ? OR ws.shared_with_user_id = ?)
            ''', (watchlist_id, user_id, user_id))
            
            access_row = cursor.fetchone()
            if not access_row:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # Add item
            cursor.execute('''
                INSERT OR REPLACE INTO watchlist_items 
                (watchlist_id, symbol, name, notes, alert_price, alert_type)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (watchlist_id, item.symbol, item.name, item.notes, item.alert_price, item.alert_type))
            
            item_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            result = {
                'id': item_id,
                'watchlist_id': watchlist_id,
                'symbol': item.symbol,
                'name': item.name,
                'added_at': datetime.now().isoformat(),
                'notes': item.notes,
                'alert_price': item.alert_price,
                'alert_type': item.alert_type
            }
            
            logger.info(f"✅ Added {item.symbol} to watchlist {watchlist_id}")
            
            # Notify WebSocket clients
            await self.broadcast_watchlist_update('item_added', result)
            
            return result
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to add item to watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def remove_from_watchlist(self, watchlist_id: int, user_id: str, symbol: str) -> Dict[str, Any]:
        """Remove item from watchlist"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check access
            cursor.execute('''
                SELECT w.user_id FROM watchlists w
                LEFT JOIN watchlist_shares ws ON w.id = ws.watchlist_id
                WHERE w.id = ? AND (w.user_id = ? OR ws.shared_with_user_id = ?)
            ''', (watchlist_id, user_id, user_id))
            
            access_row = cursor.fetchone()
            if not access_row:
                raise HTTPException(status_code=404, detail="Watchlist not found")
            
            # Remove item
            cursor.execute('''
                DELETE FROM watchlist_items 
                WHERE watchlist_id = ? AND symbol = ?
            ''', (watchlist_id, symbol))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Item not found in watchlist")
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Removed {symbol} from watchlist {watchlist_id}")
            
            # Notify WebSocket clients
            await self.broadcast_watchlist_update('item_removed', {
                'watchlist_id': watchlist_id,
                'symbol': symbol
            })
            
            return {'message': f'{symbol} removed from watchlist', 'symbol': symbol}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to remove item from watchlist: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def broadcast_watchlist_update(self, action: str, data: Dict[str, Any]):
        """Broadcast watchlist updates to WebSocket clients"""
        try:
            message = {
                'type': 'watchlist_update',
                'action': action,
                'data': data,
                'timestamp': datetime.now().isoformat()
            }
            
            # Send to all active connections
            for connection in self.active_connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"❌ Failed to send WebSocket message: {e}")
                    # Remove disconnected clients
                    self.active_connections.remove(connection)
            
        except Exception as e:
            logger.error(f"❌ Failed to broadcast watchlist update: {e}")

    def get_watchlist_stats(self, user_id: str) -> Dict[str, Any]:
        """Get watchlist statistics for a user"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Get basic stats
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_watchlists,
                    SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public_watchlists,
                    SUM(CASE WHEN is_public = 0 THEN 1 ELSE 0 END) as private_watchlists
                FROM watchlists 
                WHERE user_id = ?
            ''', (user_id,))
            
            stats_row = cursor.fetchone()
            
            # Get item stats
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_items,
                    COUNT(DISTINCT symbol) as unique_symbols
                FROM watchlist_items wi
                JOIN watchlists w ON wi.watchlist_id = w.id
                WHERE w.user_id = ?
            ''', (user_id,))
            
            item_stats_row = cursor.fetchone()
            
            conn.close()
            
            stats = {
                'total_watchlists': stats_row['total_watchlists'],
                'public_watchlists': stats_row['public_watchlists'],
                'private_watchlists': stats_row['private_watchlists'],
                'total_items': item_stats_row['total_items'],
                'unique_symbols': item_stats_row['unique_symbols']
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Failed to get watchlist stats: {e}")
            return {}

# Global watchlist CRUD instance
watchlist_crud = WatchlistCRUD()

# FastAPI app for watchlist endpoints
app = FastAPI(title="BIST AI Watchlist Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.post("/api/watchlists")
async def create_watchlist_endpoint(
    watchlist_data: WatchlistCreate,
    user_id: str = "default_user"  # In production, get from JWT token
):
    return await watchlist_crud.create_watchlist(user_id, watchlist_data)

@app.get("/api/watchlists")
async def get_watchlists_endpoint(user_id: str = "default_user"):
    return await watchlist_crud.get_watchlists(user_id)

@app.get("/api/watchlists/{watchlist_id}")
async def get_watchlist_endpoint(watchlist_id: int, user_id: str = "default_user"):
    return await watchlist_crud.get_watchlist(watchlist_id, user_id)

@app.put("/api/watchlists/{watchlist_id}")
async def update_watchlist_endpoint(
    watchlist_id: int,
    update_data: WatchlistUpdate,
    user_id: str = "default_user"
):
    return await watchlist_crud.update_watchlist(watchlist_id, user_id, update_data)

@app.delete("/api/watchlists/{watchlist_id}")
async def delete_watchlist_endpoint(watchlist_id: int, user_id: str = "default_user"):
    return await watchlist_crud.delete_watchlist(watchlist_id, user_id)

@app.post("/api/watchlists/{watchlist_id}/items")
async def add_to_watchlist_endpoint(
    watchlist_id: int,
    item: WatchlistItem,
    user_id: str = "default_user"
):
    return await watchlist_crud.add_to_watchlist(watchlist_id, user_id, item)

@app.delete("/api/watchlists/{watchlist_id}/items/{symbol}")
async def remove_from_watchlist_endpoint(
    watchlist_id: int,
    symbol: str,
    user_id: str = "default_user"
):
    return await watchlist_crud.remove_from_watchlist(watchlist_id, user_id, symbol)

@app.get("/api/watchlists/stats")
async def get_watchlist_stats_endpoint(user_id: str = "default_user"):
    return watchlist_crud.get_watchlist_stats(user_id)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)