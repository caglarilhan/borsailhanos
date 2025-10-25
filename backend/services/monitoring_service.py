#!/usr/bin/env python3
"""
BIST AI Smart Trader - Monitoring Service
Grafana metrics integration and system monitoring
"""

import asyncio
import logging
import time
import psutil
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sqlite3
import os

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MonitoringService:
    def __init__(self, db_path: str = "bist_ai.db"):
        self.db_path = db_path
        self.init_database()
        
        # Metrics configuration
        self.metrics_config = {
            'collection_interval': 30,  # seconds
            'retention_days': 30,
            'alert_thresholds': {
                'cpu_usage': 80.0,
                'memory_usage': 85.0,
                'disk_usage': 90.0,
                'response_time': 5.0,  # seconds
                'error_rate': 0.05  # 5%
            }
        }
        
        # Performance counters
        self.counters = {
            'requests_total': 0,
            'requests_success': 0,
            'requests_error': 0,
            'predictions_total': 0,
            'predictions_success': 0,
            'predictions_error': 0,
            'websocket_connections': 0,
            'notifications_sent': 0
        }
        
        logger.info("📊 Monitoring Service initialized")

    def init_database(self):
        """Initialize monitoring database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Create metrics table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    metric_name TEXT NOT NULL,
                    metric_value REAL NOT NULL,
                    metric_type TEXT NOT NULL, -- 'gauge', 'counter', 'histogram'
                    labels TEXT, -- JSON labels
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create alerts table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS alerts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    alert_name TEXT NOT NULL,
                    alert_level TEXT NOT NULL, -- 'info', 'warning', 'critical'
                    message TEXT NOT NULL,
                    metric_name TEXT,
                    metric_value REAL,
                    threshold REAL,
                    status TEXT DEFAULT 'active', -- 'active', 'resolved'
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP
                )
            ''')
            
            # Create performance_logs table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS performance_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    endpoint TEXT,
                    method TEXT,
                    response_time REAL,
                    status_code INTEGER,
                    user_id TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Create indexes
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_metrics_name_timestamp ON metrics(metric_name, timestamp)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_performance_timestamp ON performance_logs(timestamp)')
            
            conn.commit()
            conn.close()
            
            logger.info("✅ Monitoring database initialized")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")
            raise

    def get_db_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    async def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system performance metrics"""
        try:
            # CPU metrics
            cpu_percent = psutil.cpu_percent(interval=1)
            cpu_count = psutil.cpu_count()
            
            # Memory metrics
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available = memory.available
            memory_used = memory.used
            
            # Disk metrics
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            disk_free = disk.free
            disk_used = disk.used
            
            # Network metrics
            network = psutil.net_io_counters()
            network_bytes_sent = network.bytes_sent
            network_bytes_recv = network.bytes_recv
            
            # Process metrics
            process = psutil.Process()
            process_cpu = process.cpu_percent()
            process_memory = process.memory_info()
            
            metrics = {
                'timestamp': datetime.now().isoformat(),
                'system': {
                    'cpu_percent': cpu_percent,
                    'cpu_count': cpu_count,
                    'memory_percent': memory_percent,
                    'memory_available': memory_available,
                    'memory_used': memory_used,
                    'disk_percent': disk_percent,
                    'disk_free': disk_free,
                    'disk_used': disk_used,
                    'network_bytes_sent': network_bytes_sent,
                    'network_bytes_recv': network_bytes_recv
                },
                'process': {
                    'cpu_percent': process_cpu,
                    'memory_rss': process_memory.rss,
                    'memory_vms': process_memory.vms
                },
                'counters': self.counters.copy()
            }
            
            # Store metrics in database
            await self.store_metrics(metrics)
            
            # Check for alerts
            await self.check_alerts(metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Failed to collect system metrics: {e}")
            return {}

    async def store_metrics(self, metrics: Dict[str, Any]):
        """Store metrics in database"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            timestamp = datetime.now()
            
            # Store system metrics
            for metric_name, value in metrics['system'].items():
                cursor.execute('''
                    INSERT INTO metrics (metric_name, metric_value, metric_type, labels)
                    VALUES (?, ?, ?, ?)
                ''', (metric_name, value, 'gauge', json.dumps({'source': 'system'})))
            
            # Store process metrics
            for metric_name, value in metrics['process'].items():
                cursor.execute('''
                    INSERT INTO metrics (metric_name, metric_value, metric_type, labels)
                    VALUES (?, ?, ?, ?)
                ''', (metric_name, value, 'gauge', json.dumps({'source': 'process'})))
            
            # Store counter metrics
            for metric_name, value in metrics['counters'].items():
                cursor.execute('''
                    INSERT INTO metrics (metric_name, metric_value, metric_type, labels)
                    VALUES (?, ?, ?, ?)
                ''', (metric_name, value, 'counter', json.dumps({'source': 'application'})))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to store metrics: {e}")

    async def check_alerts(self, metrics: Dict[str, Any]):
        """Check metrics against alert thresholds"""
        try:
            thresholds = self.metrics_config['alert_thresholds']
            alerts = []
            
            # Check CPU usage
            cpu_percent = metrics['system']['cpu_percent']
            if cpu_percent > thresholds['cpu_usage']:
                alerts.append({
                    'alert_name': 'high_cpu_usage',
                    'alert_level': 'warning' if cpu_percent < 95 else 'critical',
                    'message': f'CPU usage is {cpu_percent:.1f}%',
                    'metric_name': 'cpu_percent',
                    'metric_value': cpu_percent,
                    'threshold': thresholds['cpu_usage']
                })
            
            # Check memory usage
            memory_percent = metrics['system']['memory_percent']
            if memory_percent > thresholds['memory_usage']:
                alerts.append({
                    'alert_name': 'high_memory_usage',
                    'alert_level': 'warning' if memory_percent < 95 else 'critical',
                    'message': f'Memory usage is {memory_percent:.1f}%',
                    'metric_name': 'memory_percent',
                    'metric_value': memory_percent,
                    'threshold': thresholds['memory_usage']
                })
            
            # Check disk usage
            disk_percent = metrics['system']['disk_percent']
            if disk_percent > thresholds['disk_usage']:
                alerts.append({
                    'alert_name': 'high_disk_usage',
                    'alert_level': 'warning' if disk_percent < 95 else 'critical',
                    'message': f'Disk usage is {disk_percent:.1f}%',
                    'metric_name': 'disk_percent',
                    'metric_value': disk_percent,
                    'threshold': thresholds['disk_usage']
                })
            
            # Store alerts
            for alert in alerts:
                await self.create_alert(alert)
            
        except Exception as e:
            logger.error(f"❌ Failed to check alerts: {e}")

    async def create_alert(self, alert_data: Dict[str, Any]):
        """Create a new alert"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Check if alert already exists and is active
            cursor.execute('''
                SELECT id FROM alerts 
                WHERE alert_name = ? AND status = 'active'
            ''', (alert_data['alert_name'],))
            
            existing_alert = cursor.fetchone()
            
            if not existing_alert:
                cursor.execute('''
                    INSERT INTO alerts 
                    (alert_name, alert_level, message, metric_name, metric_value, threshold)
                    VALUES (?, ?, ?, ?, ?, ?)
                ''', (
                    alert_data['alert_name'],
                    alert_data['alert_level'],
                    alert_data['message'],
                    alert_data['metric_name'],
                    alert_data['metric_value'],
                    alert_data['threshold']
                ))
                
                conn.commit()
                logger.warning(f"🚨 Alert created: {alert_data['alert_name']} - {alert_data['message']}")
            
            conn.close()
            
        except Exception as e:
            logger.error(f"❌ Failed to create alert: {e}")

    async def log_performance(self, endpoint: str, method: str, response_time: float, 
                           status_code: int, user_id: str = None):
        """Log API performance metrics"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO performance_logs 
                (endpoint, method, response_time, status_code, user_id)
                VALUES (?, ?, ?, ?, ?)
            ''', (endpoint, method, response_time, status_code, user_id))
            
            conn.commit()
            conn.close()
            
            # Update counters
            self.counters['requests_total'] += 1
            if 200 <= status_code < 400:
                self.counters['requests_success'] += 1
            else:
                self.counters['requests_error'] += 1
            
        except Exception as e:
            logger.error(f"❌ Failed to log performance: {e}")

    async def get_metrics(self, metric_name: str = None, hours: int = 24) -> List[Dict[str, Any]]:
        """Get metrics from database"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Calculate time range
            start_time = datetime.now() - timedelta(hours=hours)
            
            if metric_name:
                cursor.execute('''
                    SELECT * FROM metrics 
                    WHERE metric_name = ? AND timestamp >= ?
                    ORDER BY timestamp DESC
                ''', (metric_name, start_time))
            else:
                cursor.execute('''
                    SELECT * FROM metrics 
                    WHERE timestamp >= ?
                    ORDER BY timestamp DESC
                ''', (start_time,))
            
            metrics = []
            for row in cursor.fetchall():
                metric = {
                    'id': row['id'],
                    'metric_name': row['metric_name'],
                    'metric_value': row['metric_value'],
                    'metric_type': row['metric_type'],
                    'labels': json.loads(row['labels']) if row['labels'] else {},
                    'timestamp': row['timestamp']
                }
                metrics.append(metric)
            
            conn.close()
            
            return metrics
            
        except Exception as e:
            logger.error(f"❌ Failed to get metrics: {e}")
            return []

    async def get_alerts(self, status: str = 'active') -> List[Dict[str, Any]]:
        """Get alerts from database"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT * FROM alerts 
                WHERE status = ?
                ORDER BY created_at DESC
            ''', (status,))
            
            alerts = []
            for row in cursor.fetchall():
                alert = {
                    'id': row['id'],
                    'alert_name': row['alert_name'],
                    'alert_level': row['alert_level'],
                    'message': row['message'],
                    'metric_name': row['metric_name'],
                    'metric_value': row['metric_value'],
                    'threshold': row['threshold'],
                    'status': row['status'],
                    'created_at': row['created_at'],
                    'resolved_at': row['resolved_at']
                }
                alerts.append(alert)
            
            conn.close()
            
            return alerts
            
        except Exception as e:
            logger.error(f"❌ Failed to get alerts: {e}")
            return []

    async def resolve_alert(self, alert_id: int) -> Dict[str, Any]:
        """Resolve an alert"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE alerts 
                SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (alert_id,))
            
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Alert not found")
            
            conn.commit()
            conn.close()
            
            logger.info(f"✅ Alert {alert_id} resolved")
            
            return {'message': 'Alert resolved successfully', 'id': alert_id}
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"❌ Failed to resolve alert: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    async def get_performance_summary(self, hours: int = 24) -> Dict[str, Any]:
        """Get performance summary"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            start_time = datetime.now() - timedelta(hours=hours)
            
            # Get performance statistics
            cursor.execute('''
                SELECT 
                    COUNT(*) as total_requests,
                    AVG(response_time) as avg_response_time,
                    MAX(response_time) as max_response_time,
                    COUNT(CASE WHEN status_code >= 200 AND status_code < 400 THEN 1 END) as success_requests,
                    COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests
                FROM performance_logs 
                WHERE timestamp >= ?
            ''', (start_time,))
            
            stats = cursor.fetchone()
            
            # Calculate error rate
            total_requests = stats['total_requests'] or 0
            error_requests = stats['error_requests'] or 0
            error_rate = (error_requests / total_requests) if total_requests > 0 else 0
            
            # Get top endpoints by response time
            cursor.execute('''
                SELECT endpoint, AVG(response_time) as avg_response_time, COUNT(*) as request_count
                FROM performance_logs 
                WHERE timestamp >= ?
                GROUP BY endpoint
                ORDER BY avg_response_time DESC
                LIMIT 10
            ''', (start_time,))
            
            top_endpoints = []
            for row in cursor.fetchall():
                top_endpoints.append({
                    'endpoint': row['endpoint'],
                    'avg_response_time': row['avg_response_time'],
                    'request_count': row['request_count']
                })
            
            conn.close()
            
            summary = {
                'time_range_hours': hours,
                'total_requests': total_requests,
                'success_requests': stats['success_requests'] or 0,
                'error_requests': error_requests,
                'error_rate': error_rate,
                'avg_response_time': stats['avg_response_time'] or 0,
                'max_response_time': stats['max_response_time'] or 0,
                'top_endpoints': top_endpoints,
                'timestamp': datetime.now().isoformat()
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Failed to get performance summary: {e}")
            return {}

    async def cleanup_old_metrics(self):
        """Clean up old metrics based on retention policy"""
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            retention_days = self.metrics_config['retention_days']
            cutoff_date = datetime.now() - timedelta(days=retention_days)
            
            # Delete old metrics
            cursor.execute('DELETE FROM metrics WHERE timestamp < ?', (cutoff_date,))
            metrics_deleted = cursor.rowcount
            
            # Delete old performance logs
            cursor.execute('DELETE FROM performance_logs WHERE timestamp < ?', (cutoff_date,))
            logs_deleted = cursor.rowcount
            
            # Delete resolved alerts older than 7 days
            alert_cutoff = datetime.now() - timedelta(days=7)
            cursor.execute('DELETE FROM alerts WHERE status = "resolved" AND resolved_at < ?', (alert_cutoff,))
            alerts_deleted = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            logger.info(f"🧹 Cleanup completed: {metrics_deleted} metrics, {logs_deleted} logs, {alerts_deleted} alerts deleted")
            
        except Exception as e:
            logger.error(f"❌ Failed to cleanup old metrics: {e}")

    async def start_metrics_collection(self):
        """Start continuous metrics collection"""
        logger.info("📊 Starting metrics collection")
        
        while True:
            try:
                await self.collect_system_metrics()
                await asyncio.sleep(self.metrics_config['collection_interval'])
            except Exception as e:
                logger.error(f"❌ Metrics collection error: {e}")
                await asyncio.sleep(60)  # Wait longer on error

# Global monitoring service instance
monitoring_service = MonitoringService()

# FastAPI app
app = FastAPI(title="BIST AI Monitoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Endpoints
@app.get("/api/metrics")
async def get_metrics_endpoint(metric_name: str = None, hours: int = 24):
    return await monitoring_service.get_metrics(metric_name, hours)

@app.get("/api/metrics/system")
async def get_system_metrics_endpoint():
    return await monitoring_service.collect_system_metrics()

@app.get("/api/alerts")
async def get_alerts_endpoint(status: str = 'active'):
    return await monitoring_service.get_alerts(status)

@app.put("/api/alerts/{alert_id}/resolve")
async def resolve_alert_endpoint(alert_id: int):
    return await monitoring_service.resolve_alert(alert_id)

@app.get("/api/performance/summary")
async def get_performance_summary_endpoint(hours: int = 24):
    return await monitoring_service.get_performance_summary(hours)

@app.post("/api/performance/log")
async def log_performance_endpoint(
    endpoint: str,
    method: str,
    response_time: float,
    status_code: int,
    user_id: str = None
):
    await monitoring_service.log_performance(endpoint, method, response_time, status_code, user_id)
    return {'message': 'Performance logged successfully'}

@app.post("/api/metrics/cleanup")
async def cleanup_metrics_endpoint():
    await monitoring_service.cleanup_old_metrics()
    return {'message': 'Cleanup completed'}

if __name__ == "__main__":
    # Start metrics collection in background
    asyncio.create_task(monitoring_service.start_metrics_collection())
    
    # Start FastAPI server
    uvicorn.run(app, host="0.0.0.0", port=8004)