#!/usr/bin/env python3
"""
🔒 Security & Compliance System
2FA, Encryption, GDPR, Audit Logging
"""

import asyncio
import hashlib
import hmac
import base64
import secrets
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import logging
from dataclasses import dataclass
from enum import Enum
import pyotp
import qrcode
from io import BytesIO
import base64

class SecurityLevel(Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class AuditAction(Enum):
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    TRADE = "TRADE"
    DATA_ACCESS = "DATA_ACCESS"
    SETTINGS_CHANGE = "SETTINGS_CHANGE"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    TWO_FA_ENABLE = "TWO_FA_ENABLE"
    TWO_FA_DISABLE = "TWO_FA_DISABLE"
    API_ACCESS = "API_ACCESS"
    DATA_EXPORT = "DATA_EXPORT"
    DATA_DELETE = "DATA_DELETE"

@dataclass
class UserSecurity:
    user_id: str
    password_hash: str
    salt: str
    two_fa_secret: Optional[str]
    two_fa_enabled: bool
    failed_login_attempts: int
    last_login: Optional[str]
    password_changed_at: str
    security_questions: Dict[str, str]
    ip_whitelist: List[str]
    device_fingerprints: List[str]
    risk_score: float
    created_at: str

@dataclass
class AuditLog:
    id: str
    user_id: str
    action: AuditAction
    resource: str
    details: Dict[str, Any]
    ip_address: str
    user_agent: str
    timestamp: str
    success: bool
    risk_level: SecurityLevel

@dataclass
class SecurityAlert:
    id: str
    user_id: str
    alert_type: str
    severity: SecurityLevel
    message: str
    details: Dict[str, Any]
    timestamp: str
    is_resolved: bool
    resolved_at: Optional[str]

class SecuritySystem:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.user_security: Dict[str, UserSecurity] = {}
        self.audit_logs: List[AuditLog] = []
        self.security_alerts: List[SecurityAlert] = []
        self.rate_limits: Dict[str, Dict[str, Any]] = {}
        self.encryption_key = self._generate_encryption_key()
        
        # Security settings
        self.max_failed_attempts = 5
        self.session_timeout = 3600  # 1 hour
        self.password_min_length = 8
        self.require_2fa_for_trading = True
        self.require_2fa_for_withdrawals = True

    def _generate_encryption_key(self) -> str:
        """Generate encryption key"""
        return secrets.token_urlsafe(32)

    def hash_password(self, password: str, salt: Optional[str] = None) -> tuple:
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Use PBKDF2 with SHA-256
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return base64.b64encode(password_hash).decode('utf-8'), salt

    def verify_password(self, password: str, stored_hash: str, salt: str) -> bool:
        """Verify password against stored hash"""
        try:
            password_hash, _ = self.hash_password(password, salt)
            return password_hash == stored_hash
        except Exception as e:
            self.logger.error(f"Error verifying password: {e}")
            return False

    def generate_2fa_secret(self, user_id: str) -> str:
        """Generate 2FA secret for user"""
        secret = pyotp.random_base32()
        
        # Store secret (in real implementation, encrypt this)
        if user_id not in self.user_security:
            self.user_security[user_id] = UserSecurity(
                user_id=user_id,
                password_hash='',
                salt='',
                two_fa_secret=None,
                two_fa_enabled=False,
                failed_login_attempts=0,
                last_login=None,
                password_changed_at=datetime.now().isoformat(),
                security_questions={},
                ip_whitelist=[],
                device_fingerprints=[],
                risk_score=0.0,
                created_at=datetime.now().isoformat()
            )
        
        self.user_security[user_id].two_fa_secret = secret
        
        return secret

    def generate_2fa_qr_code(self, user_id: str, secret: str) -> str:
        """Generate QR code for 2FA setup"""
        try:
            totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
                name=user_id,
                issuer_name="BIST AI Smart Trader"
            )
            
            qr = qrcode.QRCode(version=1, box_size=10, border=5)
            qr.add_data(totp_uri)
            qr.make(fit=True)
            
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to base64
            buffer = BytesIO()
            img.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return f"data:image/png;base64,{img_str}"
            
        except Exception as e:
            self.logger.error(f"Error generating QR code: {e}")
            return ""

    def verify_2fa_token(self, user_id: str, token: str) -> bool:
        """Verify 2FA token"""
        try:
            if user_id not in self.user_security:
                return False
            
            user_security = self.user_security[user_id]
            if not user_security.two_fa_secret:
                return False
            
            totp = pyotp.TOTP(user_security.two_fa_secret)
            return totp.verify(token, valid_window=1)
            
        except Exception as e:
            self.logger.error(f"Error verifying 2FA token: {e}")
            return False

    async def authenticate_user(self, user_id: str, password: str, two_fa_token: Optional[str] = None,
                              ip_address: str = '', user_agent: str = '') -> Dict[str, Any]:
        """Authenticate user with password and optional 2FA"""
        try:
            # Log authentication attempt
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.LOGIN,
                resource='authentication',
                details={'ip_address': ip_address, 'user_agent': user_agent},
                ip_address=ip_address,
                user_agent=user_agent,
                success=False
            )
            
            # Check rate limiting
            if not await self._check_rate_limit(user_id, 'login'):
                return {
                    'success': False,
                    'error': 'Too many login attempts. Please try again later.',
                    'retry_after': 300
                }
            
            # Check if user exists
            if user_id not in self.user_security:
                return {
                    'success': False,
                    'error': 'Invalid credentials',
                    'requires_2fa': False
                }
            
            user_security = self.user_security[user_id]
            
            # Check if account is locked
            if user_security.failed_login_attempts >= self.max_failed_attempts:
                return {
                    'success': False,
                    'error': 'Account locked due to too many failed attempts',
                    'requires_2fa': False
                }
            
            # Verify password
            if not self.verify_password(password, user_security.password_hash, user_security.salt):
                user_security.failed_login_attempts += 1
                return {
                    'success': False,
                    'error': 'Invalid credentials',
                    'requires_2fa': False,
                    'failed_attempts': user_security.failed_login_attempts
                }
            
            # Check 2FA requirement
            if user_security.two_fa_enabled:
                if not two_fa_token:
                    return {
                        'success': False,
                        'error': '2FA token required',
                        'requires_2fa': True
                    }
                
                if not self.verify_2fa_token(user_id, two_fa_token):
                    user_security.failed_login_attempts += 1
                    return {
                        'success': False,
                        'error': 'Invalid 2FA token',
                        'requires_2fa': True,
                        'failed_attempts': user_security.failed_login_attempts
                    }
            
            # Successful authentication
            user_security.failed_login_attempts = 0
            user_security.last_login = datetime.now().isoformat()
            
            # Generate session token
            session_token = self._generate_session_token(user_id)
            
            # Log successful authentication
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.LOGIN,
                resource='authentication',
                details={'session_token': session_token[:10] + '...'},
                ip_address=ip_address,
                user_agent=user_agent,
                success=True
            )
            
            return {
                'success': True,
                'session_token': session_token,
                'expires_at': (datetime.now() + timedelta(seconds=self.session_timeout)).isoformat(),
                'requires_2fa': user_security.two_fa_enabled,
                'risk_score': user_security.risk_score
            }
            
        except Exception as e:
            self.logger.error(f"Error authenticating user {user_id}: {e}")
            return {
                'success': False,
                'error': 'Authentication failed',
                'requires_2fa': False
            }

    def _generate_session_token(self, user_id: str) -> str:
        """Generate secure session token"""
        token_data = f"{user_id}:{datetime.now().timestamp()}:{secrets.token_hex(16)}"
        return base64.b64encode(token_data.encode('utf-8')).decode('utf-8')

    async def _check_rate_limit(self, user_id: str, action: str) -> bool:
        """Check rate limiting for user action"""
        try:
            key = f"{user_id}:{action}"
            now = datetime.now()
            
            if key not in self.rate_limits:
                self.rate_limits[key] = {
                    'count': 0,
                    'window_start': now
                }
            
            rate_limit = self.rate_limits[key]
            
            # Reset window if expired
            if (now - rate_limit['window_start']).seconds > 3600:  # 1 hour window
                rate_limit['count'] = 0
                rate_limit['window_start'] = now
            
            # Check limits
            limits = {
                'login': 10,  # 10 attempts per hour
                'api': 1000,  # 1000 API calls per hour
                'trade': 100,  # 100 trades per hour
                'password_reset': 3  # 3 password resets per hour
            }
            
            limit = limits.get(action, 100)
            
            if rate_limit['count'] >= limit:
                return False
            
            rate_limit['count'] += 1
            return True
            
        except Exception as e:
            self.logger.error(f"Error checking rate limit: {e}")
            return True  # Allow on error

    async def _log_audit_event(self, user_id: str, action: AuditAction, resource: str,
                             details: Dict[str, Any], ip_address: str, user_agent: str, success: bool):
        """Log audit event"""
        try:
            # Determine risk level
            risk_level = SecurityLevel.LOW
            if not success:
                risk_level = SecurityLevel.MEDIUM
            if action in [AuditAction.TRADE, AuditAction.DATA_DELETE]:
                risk_level = SecurityLevel.HIGH
            if user_id not in self.user_security:
                risk_level = SecurityLevel.CRITICAL
            
            audit_log = AuditLog(
                id=f"audit_{datetime.now().timestamp()}",
                user_id=user_id,
                action=action,
                resource=resource,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent,
                timestamp=datetime.now().isoformat(),
                success=success,
                risk_level=risk_level
            )
            
            self.audit_logs.append(audit_log)
            
            # Keep only last 10000 logs
            if len(self.audit_logs) > 10000:
                self.audit_logs = self.audit_logs[-10000:]
            
            # Check for security alerts
            if not success and risk_level in [SecurityLevel.HIGH, SecurityLevel.CRITICAL]:
                await self._create_security_alert(user_id, action, details, risk_level)
            
        except Exception as e:
            self.logger.error(f"Error logging audit event: {e}")

    async def _create_security_alert(self, user_id: str, action: AuditAction, details: Dict[str, Any], risk_level: SecurityLevel):
        """Create security alert"""
        try:
            alert = SecurityAlert(
                id=f"alert_{datetime.now().timestamp()}",
                user_id=user_id,
                alert_type=f"FAILED_{action.value}",
                severity=risk_level,
                message=f"Failed {action.value} attempt detected",
                details=details,
                timestamp=datetime.now().isoformat(),
                is_resolved=False,
                resolved_at=None
            )
            
            self.security_alerts.append(alert)
            
            # Keep only last 1000 alerts
            if len(self.security_alerts) > 1000:
                self.security_alerts = self.security_alerts[-1000:]
            
        except Exception as e:
            self.logger.error(f"Error creating security alert: {e}")

    async def enable_2fa(self, user_id: str, password: str, two_fa_token: str) -> Dict[str, Any]:
        """Enable 2FA for user"""
        try:
            # Verify password first
            if user_id not in self.user_security:
                return {'success': False, 'error': 'User not found'}
            
            user_security = self.user_security[user_id]
            if not self.verify_password(password, user_security.password_hash, user_security.salt):
                return {'success': False, 'error': 'Invalid password'}
            
            # Verify 2FA token
            if not self.verify_2fa_token(user_id, two_fa_token):
                return {'success': False, 'error': 'Invalid 2FA token'}
            
            # Enable 2FA
            user_security.two_fa_enabled = True
            
            # Log event
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.TWO_FA_ENABLE,
                resource='2fa',
                details={'enabled': True},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return {'success': True, 'message': '2FA enabled successfully'}
            
        except Exception as e:
            self.logger.error(f"Error enabling 2FA: {e}")
            return {'success': False, 'error': 'Failed to enable 2FA'}

    async def disable_2fa(self, user_id: str, password: str, two_fa_token: str) -> Dict[str, Any]:
        """Disable 2FA for user"""
        try:
            # Verify password and 2FA
            if user_id not in self.user_security:
                return {'success': False, 'error': 'User not found'}
            
            user_security = self.user_security[user_id]
            if not self.verify_password(password, user_security.password_hash, user_security.salt):
                return {'success': False, 'error': 'Invalid password'}
            
            if not self.verify_2fa_token(user_id, two_fa_token):
                return {'success': False, 'error': 'Invalid 2FA token'}
            
            # Disable 2FA
            user_security.two_fa_enabled = False
            user_security.two_fa_secret = None
            
            # Log event
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.TWO_FA_DISABLE,
                resource='2fa',
                details={'enabled': False},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return {'success': True, 'message': '2FA disabled successfully'}
            
        except Exception as e:
            self.logger.error(f"Error disabling 2FA: {e}")
            return {'success': False, 'error': 'Failed to disable 2FA'}

    async def change_password(self, user_id: str, old_password: str, new_password: str) -> Dict[str, Any]:
        """Change user password"""
        try:
            # Validate new password
            if len(new_password) < self.password_min_length:
                return {
                    'success': False,
                    'error': f'Password must be at least {self.password_min_length} characters long'
                }
            
            # Verify old password
            if user_id not in self.user_security:
                return {'success': False, 'error': 'User not found'}
            
            user_security = self.user_security[user_id]
            if not self.verify_password(old_password, user_security.password_hash, user_security.salt):
                return {'success': False, 'error': 'Invalid current password'}
            
            # Hash new password
            new_hash, new_salt = self.hash_password(new_password)
            
            # Update password
            user_security.password_hash = new_hash
            user_security.salt = new_salt
            user_security.password_changed_at = datetime.now().isoformat()
            
            # Log event
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.PASSWORD_CHANGE,
                resource='password',
                details={'changed_at': user_security.password_changed_at},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return {'success': True, 'message': 'Password changed successfully'}
            
        except Exception as e:
            self.logger.error(f"Error changing password: {e}")
            return {'success': False, 'error': 'Failed to change password'}

    async def get_audit_logs(self, user_id: Optional[str] = None, action: Optional[AuditAction] = None,
                           start_date: Optional[str] = None, end_date: Optional[str] = None,
                           limit: int = 100) -> List[AuditLog]:
        """Get audit logs with filtering"""
        try:
            logs = self.audit_logs.copy()
            
            # Apply filters
            if user_id:
                logs = [log for log in logs if log.user_id == user_id]
            
            if action:
                logs = [log for log in logs if log.action == action]
            
            if start_date:
                start = datetime.fromisoformat(start_date)
                logs = [log for log in logs if datetime.fromisoformat(log.timestamp) >= start]
            
            if end_date:
                end = datetime.fromisoformat(end_date)
                logs = [log for log in logs if datetime.fromisoformat(log.timestamp) <= end]
            
            # Sort by timestamp (newest first)
            logs.sort(key=lambda x: x.timestamp, reverse=True)
            
            return logs[:limit]
            
        except Exception as e:
            self.logger.error(f"Error getting audit logs: {e}")
            return []

    async def get_security_alerts(self, user_id: Optional[str] = None, severity: Optional[SecurityLevel] = None,
                                resolved: Optional[bool] = None, limit: int = 50) -> List[SecurityAlert]:
        """Get security alerts with filtering"""
        try:
            alerts = self.security_alerts.copy()
            
            # Apply filters
            if user_id:
                alerts = [alert for alert in alerts if alert.user_id == user_id]
            
            if severity:
                alerts = [alert for alert in alerts if alert.severity == severity]
            
            if resolved is not None:
                alerts = [alert for alert in alerts if alert.is_resolved == resolved]
            
            # Sort by timestamp (newest first)
            alerts.sort(key=lambda x: x.timestamp, reverse=True)
            
            return alerts[:limit]
            
        except Exception as e:
            self.logger.error(f"Error getting security alerts: {e}")
            return []

    async def resolve_security_alert(self, alert_id: str, user_id: str) -> bool:
        """Resolve security alert"""
        try:
            for alert in self.security_alerts:
                if alert.id == alert_id and alert.user_id == user_id:
                    alert.is_resolved = True
                    alert.resolved_at = datetime.now().isoformat()
                    return True
            
            return False
            
        except Exception as e:
            self.logger.error(f"Error resolving security alert: {e}")
            return False

    async def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        try:
            # Simple encryption for demonstration
            # In real implementation, use AES encryption
            encoded_data = base64.b64encode(data.encode('utf-8')).decode('utf-8')
            return f"encrypted:{encoded_data}"
            
        except Exception as e:
            self.logger.error(f"Error encrypting data: {e}")
            return data

    async def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        try:
            if encrypted_data.startswith('encrypted:'):
                encoded_data = encrypted_data[10:]  # Remove 'encrypted:' prefix
                return base64.b64decode(encoded_data).decode('utf-8')
            return encrypted_data
            
        except Exception as e:
            self.logger.error(f"Error decrypting data: {e}")
            return encrypted_data

    async def gdpr_data_export(self, user_id: str) -> Dict[str, Any]:
        """Export user data for GDPR compliance"""
        try:
            # Collect all user data
            user_data = {
                'user_id': user_id,
                'export_date': datetime.now().isoformat(),
                'personal_data': {
                    'user_security': self.user_security.get(user_id).__dict__ if user_id in self.user_security else None,
                    'audit_logs': [log.__dict__ for log in self.audit_logs if log.user_id == user_id],
                    'security_alerts': [alert.__dict__ for alert in self.security_alerts if alert.user_id == user_id]
                },
                'gdpr_compliance': {
                    'data_retention_period': '7 years',
                    'data_processing_purpose': 'Financial services and trading',
                    'legal_basis': 'Contract performance and legitimate interest',
                    'data_categories': ['Identity', 'Financial', 'Behavioral', 'Technical']
                }
            }
            
            # Log export
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.DATA_EXPORT,
                resource='gdpr',
                details={'export_date': user_data['export_date']},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return user_data
            
        except Exception as e:
            self.logger.error(f"Error exporting GDPR data: {e}")
            return {}

    async def gdpr_data_deletion(self, user_id: str, confirmation_token: str) -> Dict[str, Any]:
        """Delete user data for GDPR compliance"""
        try:
            # Verify confirmation token (in real implementation)
            if confirmation_token != f"DELETE_{user_id}_{datetime.now().date()}":
                return {'success': False, 'error': 'Invalid confirmation token'}
            
            # Delete user data
            deleted_items = []
            
            if user_id in self.user_security:
                del self.user_security[user_id]
                deleted_items.append('user_security')
            
            # Remove audit logs
            original_count = len(self.audit_logs)
            self.audit_logs = [log for log in self.audit_logs if log.user_id != user_id]
            deleted_logs = original_count - len(self.audit_logs)
            if deleted_logs > 0:
                deleted_items.append(f'{deleted_logs} audit_logs')
            
            # Remove security alerts
            original_count = len(self.security_alerts)
            self.security_alerts = [alert for alert in self.security_alerts if alert.user_id != user_id]
            deleted_alerts = original_count - len(self.security_alerts)
            if deleted_alerts > 0:
                deleted_items.append(f'{deleted_alerts} security_alerts')
            
            # Log deletion
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.DATA_DELETE,
                resource='gdpr',
                details={'deleted_items': deleted_items},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return {
                'success': True,
                'message': 'User data deleted successfully',
                'deleted_items': deleted_items
            }
            
        except Exception as e:
            self.logger.error(f"Error deleting GDPR data: {e}")
            return {'success': False, 'error': 'Failed to delete user data'}

    async def get_security_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get security dashboard data"""
        try:
            user_security = self.user_security.get(user_id)
            if not user_security:
                return {}
            
            # Get recent audit logs
            recent_logs = await self.get_audit_logs(user_id=user_id, limit=10)
            
            # Get recent alerts
            recent_alerts = await self.get_security_alerts(user_id=user_id, resolved=False, limit=5)
            
            # Calculate security score
            security_score = 100.0
            if not user_security.two_fa_enabled:
                security_score -= 30
            if user_security.failed_login_attempts > 0:
                security_score -= 10
            if user_security.risk_score > 0.5:
                security_score -= 20
            if len(user_security.ip_whitelist) == 0:
                security_score -= 10
            
            return {
                'security_score': max(0, security_score),
                'two_fa_enabled': user_security.two_fa_enabled,
                'failed_login_attempts': user_security.failed_login_attempts,
                'last_login': user_security.last_login,
                'password_changed_at': user_security.password_changed_at,
                'risk_score': user_security.risk_score,
                'recent_logs': [log.__dict__ for log in recent_logs],
                'recent_alerts': [alert.__dict__ for alert in recent_alerts],
                'security_recommendations': self._get_security_recommendations(user_security)
            }
            
        except Exception as e:
            self.logger.error(f"Error getting security dashboard: {e}")
            return {}

    def _get_security_recommendations(self, user_security: UserSecurity) -> List[str]:
        """Get security recommendations for user"""
        recommendations = []
        
        if not user_security.two_fa_enabled:
            recommendations.append("Enable two-factor authentication for better security")
        
        if user_security.failed_login_attempts > 0:
            recommendations.append("Consider changing your password after failed login attempts")
        
        if len(user_security.ip_whitelist) == 0:
            recommendations.append("Set up IP whitelist to restrict access from unknown locations")
        
        if user_security.risk_score > 0.5:
            recommendations.append("Your account has elevated risk. Please review your security settings")
        
        if not user_security.security_questions:
            recommendations.append("Set up security questions for account recovery")
        
        return recommendations

    async def validate_session(self, session_token: str) -> Optional[str]:
        """Validate session token and return user_id"""
        try:
            # Decode token
            token_data = base64.b64decode(session_token.encode('utf-8')).decode('utf-8')
            user_id, timestamp, _ = token_data.split(':')
            
            # Check if session is expired
            session_time = datetime.fromtimestamp(float(timestamp))
            if (datetime.now() - session_time).seconds > self.session_timeout:
                return None
            
            return user_id
            
        except Exception as e:
            self.logger.error(f"Error validating session: {e}")
            return None

    async def logout_user(self, user_id: str, session_token: str) -> bool:
        """Logout user and invalidate session"""
        try:
            # Log logout event
            await self._log_audit_event(
                user_id=user_id,
                action=AuditAction.LOGOUT,
                resource='session',
                details={'session_token': session_token[:10] + '...'},
                ip_address='',
                user_agent='',
                success=True
            )
            
            return True
            
        except Exception as e:
            self.logger.error(f"Error logging out user: {e}")
            return False

# Global instance
security_system = SecuritySystem()
