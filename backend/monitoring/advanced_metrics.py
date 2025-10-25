#!/usr/bin/env python3
"""
BIST AI Smart Trader - Advanced Metrics & Alert Rules
Grafana alert rules and advanced monitoring metrics
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from pathlib import Path

class GrafanaAlertManager:
    def __init__(self, config_path: str = "./grafana/provisioning"):
        self.config_path = Path(config_path)
        self.alerts_path = self.config_path / "alerting"
        self.alerts_path.mkdir(parents=True, exist_ok=True)
        
        self.alert_rules = []
        self.notification_channels = []
        
        print("🚨 Grafana Alert Manager initialized")

    def create_alert_rule(self, rule_name: str, condition: str, threshold: float, 
                         severity: str = "warning", duration: str = "5m") -> Dict[str, Any]:
        """Create a Grafana alert rule"""
        alert_rule = {
            "alert": {
                "name": rule_name,
                "message": f"{rule_name} threshold exceeded",
                "frequency": "10s",
                "conditions": [
                    {
                        "evaluator": {
                            "params": [threshold],
                            "type": "gt"
                        },
                        "operator": {
                            "type": "and"
                        },
                        "query": {
                            "params": ["A", "5m", "now"]
                        },
                        "reducer": {
                            "params": [],
                            "type": "last"
                        },
                        "type": "query"
                    }
                ],
                "executionErrorState": "alerting",
                "noDataState": "no_data",
                "for": duration
            },
            "dashboards": [],
            "executionErrorState": "alerting",
            "frequency": "10s",
            "handler": 1,
            "name": rule_name,
            "noDataState": "no_data",
            "notifications": [],
            "orgId": 1,
            "rule": {
                "alert": rule_name,
                "condition": condition,
                "data": [
                    {
                        "datasource": "BIST AI Backend",
                        "model": {
                            "expr": condition,
                            "interval": "",
                            "legendFormat": "",
                            "refId": "A"
                        },
                        "queryType": "",
                        "refId": "A"
                    }
                ],
                "executionErrorState": "alerting",
                "for": duration,
                "frequency": "10s",
                "handler": 1,
                "name": rule_name,
                "noDataState": "no_data",
                "notifications": [],
                "orgId": 1
            }
        }
        
        self.alert_rules.append(alert_rule)
        return alert_rule

    def create_system_alerts(self):
        """Create system monitoring alerts"""
        alerts = []
        
        # CPU Usage Alert
        cpu_alert = self.create_alert_rule(
            "High CPU Usage",
            "cpu_usage_percent",
            85.0,
            "critical",
            "2m"
        )
        alerts.append(cpu_alert)
        
        # Memory Usage Alert
        memory_alert = self.create_alert_rule(
            "High Memory Usage",
            "memory_usage_percent",
            90.0,
            "critical",
            "2m"
        )
        alerts.append(memory_alert)
        
        # Disk Usage Alert
        disk_alert = self.create_alert_rule(
            "High Disk Usage",
            "disk_usage_percent",
            95.0,
            "critical",
            "1m"
        )
        alerts.append(disk_alert)
        
        # Response Time Alert
        response_alert = self.create_alert_rule(
            "High Response Time",
            "avg_response_time",
            5.0,
            "warning",
            "3m"
        )
        alerts.append(response_alert)
        
        # Error Rate Alert
        error_alert = self.create_alert_rule(
            "High Error Rate",
            "error_rate",
            0.05,
            "critical",
            "2m"
        )
        alerts.append(error_alert)
        
        return alerts

    def create_ai_alerts(self):
        """Create AI-specific alerts"""
        alerts = []
        
        # Model Accuracy Alert
        accuracy_alert = self.create_alert_rule(
            "Low Model Accuracy",
            "model_accuracy",
            0.80,
            "warning",
            "5m"
        )
        alerts.append(accuracy_alert)
        
        # WebSocket Disconnect Alert
        ws_alert = self.create_alert_rule(
            "WebSocket Disconnections",
            "websocket_disconnects",
            3.0,
            "warning",
            "1m"
        )
        alerts.append(ws_alert)
        
        # Prediction Latency Alert
        latency_alert = self.create_alert_rule(
            "High Prediction Latency",
            "prediction_latency_ms",
            1000.0,
            "warning",
            "3m"
        )
        alerts.append(latency_alert)
        
        # Model Retrain Trigger
        retrain_alert = self.create_alert_rule(
            "Model Retrain Trigger",
            "model_performance_degradation",
            0.15,
            "info",
            "10m"
        )
        alerts.append(retrain_alert)
        
        return alerts

    def create_business_alerts(self):
        """Create business-specific alerts"""
        alerts = []
        
        # Low Signal Count
        signal_alert = self.create_alert_rule(
            "Low Signal Count",
            "active_signals_count",
            1.0,
            "warning",
            "5m"
        )
        alerts.append(signal_alert)
        
        # High Signal Confidence Drop
        confidence_alert = self.create_alert_rule(
            "Low Signal Confidence",
            "avg_signal_confidence",
            0.70,
            "warning",
            "5m"
        )
        alerts.append(confidence_alert)
        
        # Data Freshness Alert
        freshness_alert = self.create_alert_rule(
            "Stale Data",
            "data_age_hours",
            2.0,
            "critical",
            "1m"
        )
        alerts.append(freshness_alert)
        
        return alerts

    def create_notification_channel(self, name: str, channel_type: str, 
                                   settings: Dict[str, Any]) -> Dict[str, Any]:
        """Create notification channel"""
        channel = {
            "id": len(self.notification_channels) + 1,
            "uid": f"{name.lower().replace(' ', '_')}",
            "name": name,
            "type": channel_type,
            "isDefault": False,
            "sendReminder": True,
            "disableResolveMessage": False,
            "settings": settings
        }
        
        self.notification_channels.append(channel)
        return channel

    def create_notification_channels(self):
        """Create notification channels"""
        channels = []
        
        # Email notification
        email_channel = self.create_notification_channel(
            "Email Alerts",
            "email",
            {
                "addresses": "admin@borsailhanos.com",
                "subject": "BIST AI Alert: {{ .GroupLabels.alertname }}",
                "message": "Alert: {{ .GroupLabels.alertname }}\nValue: {{ .Value }}\nTime: {{ .Time }}"
            }
        )
        channels.append(email_channel)
        
        # Slack notification
        slack_channel = self.create_notification_channel(
            "Slack Alerts",
            "slack",
            {
                "url": "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK",
                "channel": "#alerts",
                "title": "BIST AI Alert",
                "text": "Alert: {{ .GroupLabels.alertname }}\nValue: {{ .Value }}"
            }
        )
        channels.append(slack_channel)
        
        # Webhook notification
        webhook_channel = self.create_notification_channel(
            "Webhook Alerts",
            "webhook",
            {
                "url": "http://localhost:8003/api/notifications/alert",
                "httpMethod": "POST",
                "title": "BIST AI Alert",
                "message": "{{ .GroupLabels.alertname }}: {{ .Value }}"
            }
        )
        channels.append(webhook_channel)
        
        return channels

    def generate_alert_rules_config(self) -> str:
        """Generate alert rules configuration file"""
        all_alerts = []
        all_alerts.extend(self.create_system_alerts())
        all_alerts.extend(self.create_ai_alerts())
        all_alerts.extend(self.create_business_alerts())
        
        config = {
            "apiVersion": 1,
            "groups": [
                {
                    "name": "BIST AI System Alerts",
                    "interval": "10s",
                    "rules": all_alerts
                }
            ]
        }
        
        return json.dumps(config, indent=2)

    def generate_notification_channels_config(self) -> str:
        """Generate notification channels configuration file"""
        channels = self.create_notification_channels()
        
        config = {
            "apiVersion": 1,
            "notifiers": channels
        }
        
        return json.dumps(config, indent=2)

    def save_alert_configs(self):
        """Save alert configuration files"""
        try:
            # Save alert rules
            alert_rules_file = self.alerts_path / "alert_rules.yml"
            with open(alert_rules_file, 'w') as f:
                f.write(self.generate_alert_rules_config())
            
            # Save notification channels
            channels_file = self.alerts_path / "notification_channels.yml"
            with open(channels_file, 'w') as f:
                f.write(self.generate_notification_channels_config())
            
            print(f"✅ Alert configurations saved to {self.alerts_path}")
            
        except Exception as e:
            print(f"❌ Failed to save alert configurations: {e}")

    def create_dashboard_alerts(self) -> Dict[str, Any]:
        """Create dashboard with alert panels"""
        dashboard = {
            "dashboard": {
                "id": None,
                "title": "BIST AI Alert Dashboard",
                "tags": ["bist-ai", "alerts", "monitoring"],
                "timezone": "browser",
                "panels": [
                    {
                        "id": 1,
                        "title": "System Health",
                        "type": "stat",
                        "targets": [
                            {
                                "expr": "cpu_usage_percent",
                                "refId": "A"
                            }
                        ],
                        "fieldConfig": {
                            "defaults": {
                                "color": {
                                    "mode": "thresholds"
                                },
                                "thresholds": {
                                    "steps": [
                                        {"color": "green", "value": None},
                                        {"color": "yellow", "value": 70},
                                        {"color": "red", "value": 85}
                                    ]
                                }
                            }
                        },
                        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0}
                    },
                    {
                        "id": 2,
                        "title": "AI Model Performance",
                        "type": "stat",
                        "targets": [
                            {
                                "expr": "model_accuracy",
                                "refId": "A"
                            }
                        ],
                        "fieldConfig": {
                            "defaults": {
                                "color": {
                                    "mode": "thresholds"
                                },
                                "thresholds": {
                                    "steps": [
                                        {"color": "red", "value": None},
                                        {"color": "yellow", "value": 0.80},
                                        {"color": "green", "value": 0.90}
                                    ]
                                }
                            }
                        },
                        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0}
                    },
                    {
                        "id": 3,
                        "title": "Active Alerts",
                        "type": "table",
                        "targets": [
                            {
                                "expr": "ALERTS{alertstate=\"firing\"}",
                                "refId": "A"
                            }
                        ],
                        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8}
                    }
                ],
                "time": {
                    "from": "now-1h",
                    "to": "now"
                },
                "refresh": "5s"
            }
        }
        
        return dashboard

    def save_dashboard_config(self):
        """Save dashboard configuration"""
        try:
            dashboard_file = self.config_path / "dashboards" / "alert_dashboard.json"
            dashboard_file.parent.mkdir(parents=True, exist_ok=True)
            
            with open(dashboard_file, 'w') as f:
                json.dump(self.create_dashboard_alerts(), f, indent=2)
            
            print(f"✅ Alert dashboard saved to {dashboard_file}")
            
        except Exception as e:
            print(f"❌ Failed to save dashboard: {e}")

# Advanced Metrics Collection
class AdvancedMetricsCollector:
    def __init__(self):
        self.metrics = {}
        self.alert_thresholds = {
            'cpu_usage': 85.0,
            'memory_usage': 90.0,
            'disk_usage': 95.0,
            'response_time': 5.0,
            'error_rate': 0.05,
            'model_accuracy': 0.80,
            'websocket_disconnects': 3.0,
            'prediction_latency': 1000.0,
            'signal_confidence': 0.70,
            'data_age_hours': 2.0
        }
        
        print("📊 Advanced Metrics Collector initialized")

    def collect_system_metrics(self) -> Dict[str, Any]:
        """Collect system metrics"""
        import psutil
        
        metrics = {
            'cpu_usage_percent': psutil.cpu_percent(interval=1),
            'memory_usage_percent': psutil.virtual_memory().percent,
            'disk_usage_percent': psutil.disk_usage('/').percent,
            'timestamp': datetime.now().isoformat()
        }
        
        return metrics

    def collect_ai_metrics(self) -> Dict[str, Any]:
        """Collect AI-specific metrics"""
        # This would integrate with your AI models
        metrics = {
            'model_accuracy': 0.87,  # Placeholder
            'prediction_latency_ms': 150.0,  # Placeholder
            'active_models_count': 3,
            'last_retrain_timestamp': datetime.now().isoformat(),
            'timestamp': datetime.now().isoformat()
        }
        
        return metrics

    def collect_business_metrics(self) -> Dict[str, Any]:
        """Collect business-specific metrics"""
        metrics = {
            'active_signals_count': 5,  # Placeholder
            'avg_signal_confidence': 0.82,  # Placeholder
            'data_age_hours': 0.5,  # Placeholder
            'websocket_connections': 2,
            'websocket_disconnects': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        return metrics

    def check_alert_conditions(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Check if any metrics exceed alert thresholds"""
        alerts = []
        
        for metric_name, threshold in self.alert_thresholds.items():
            if metric_name in metrics:
                value = metrics[metric_name]
                if value > threshold:
                    alerts.append({
                        'metric_name': metric_name,
                        'value': value,
                        'threshold': threshold,
                        'severity': 'critical' if value > threshold * 1.2 else 'warning',
                        'timestamp': datetime.now().isoformat()
                    })
        
        return alerts

    def export_metrics_for_grafana(self) -> str:
        """Export metrics in Prometheus format for Grafana"""
        all_metrics = {}
        all_metrics.update(self.collect_system_metrics())
        all_metrics.update(self.collect_ai_metrics())
        all_metrics.update(self.collect_business_metrics())
        
        # Convert to Prometheus format
        prometheus_metrics = []
        for metric_name, value in all_metrics.items():
            if isinstance(value, (int, float)):
                prometheus_metrics.append(f"# HELP {metric_name} {metric_name}")
                prometheus_metrics.append(f"# TYPE {metric_name} gauge")
                prometheus_metrics.append(f"{metric_name} {value}")
        
        return "\n".join(prometheus_metrics)

# Global instances
alert_manager = GrafanaAlertManager()
metrics_collector = AdvancedMetricsCollector()

if __name__ == "__main__":
    # Create alert configurations
    alert_manager.save_alert_configs()
    alert_manager.save_dashboard_config()
    
    # Test metrics collection
    system_metrics = metrics_collector.collect_system_metrics()
    ai_metrics = metrics_collector.collect_ai_metrics()
    business_metrics = metrics_collector.collect_business_metrics()
    
    # Check for alerts
    all_metrics = {**system_metrics, **ai_metrics, **business_metrics}
    alerts = metrics_collector.check_alert_conditions(all_metrics)
    
    print(f"📊 Collected {len(all_metrics)} metrics")
    print(f"🚨 Found {len(alerts)} alerts")
    
    # Export for Grafana
    prometheus_metrics = metrics_collector.export_metrics_for_grafana()
    print("📈 Prometheus metrics:")
    print(prometheus_metrics)
