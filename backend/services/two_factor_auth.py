#!/usr/bin/env python3
"""
BIST AI Smart Trader - Two-Factor Authentication (2FA)
TOTP-based two-factor authentication system
"""

import hashlib
import hmac
import struct
import time
import secrets
import base64
import qrcode
from io import BytesIO
from typing import Dict, Any, Optional, Tuple
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TOTPGenerator:
    """Time-based One-Time Password (TOTP) generator"""
    
    def __init__(self):
        # Default TOTP parameters
        self.timestep = 30  # 30 seconds window
        self.digits = 6
        self.hash_algorithm = hashlib.sha1
        
        logger.info("✅ TOTP Generator initialized")
    
    def generate_secret(self) -> str:
        """Generate a random secret key for TOTP"""
        secret = secrets.token_bytes(20)  # 160-bit secret
        return base64.b32encode(secret).decode('utf-8')
    
    def generate_totp(self, secret: str, timestamp: Optional[int] = None) -> str:
        """Generate TOTP code from secret"""
        if timestamp is None:
            timestamp = int(time.time())
        
        # Convert secret from base32
        try:
            key = base32_decode(secret)
        except Exception:
            logger.error(f"❌ Invalid secret key format")
            return "000000"
        
        # Calculate time counter
        time_counter = timestamp // self.timestep
        
        # Generate HOTP
        hotp = self._generate_hotp(key, time_counter)
        
        # Convert to 6-digit code
        code = str(hotp).zfill(self.digits)
        
        return code
    
    def _generate_hotp(self, key: bytes, counter: int) -> int:
        """Generate HMAC-based One-Time Password"""
        # Convert counter to bytes
        counter_bytes = struct.pack(">Q", counter)
        
        # Generate HMAC
        hmac_result = hmac.new(key, counter_bytes, self.hash_algorithm).digest()
        
        # Dynamic truncation
        offset = hmac_result[-1] & 0x0F
        binary_code = struct.unpack(">I", hmac_result[offset:offset+4])[0]
        hotp = binary_code & 0x7FFFFFFF
        
        # Return last digits
        return hotp % (10 ** self.digits)
    
    def verify_totp(self, code: str, secret: str, window: int = 1) -> bool:
        """Verify TOTP code with tolerance window"""
        current_timestamp = int(time.time())
        
        # Check current and adjacent time windows
        for i in range(-window, window + 1):
            timestamp = current_timestamp + (i * self.timestep)
            expected_code = self.generate_totp(secret, timestamp)
            
            if hmac.compare_digest(code, expected_code):
                return True
        
        return False
    
    def generate_qr_code(self, secret: str, user_email: str, issuer: str = "BIST AI Smart Trader") -> BytesIO:
        """Generate QR code for authenticator apps"""
        try:
            # Create OTP Auth URI
            otp_auth_uri = f"otpauth://totp/{issuer}:{user_email}?secret={secret}&issuer={issuer}&digits={self.digits}&period={self.timestep}"
            
            # Generate QR code
            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(otp_auth_uri)
            qr.make(fit=True)
            
            # Create image
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Convert to BytesIO
            qr_buffer = BytesIO()
            img.save(qr_buffer, format='PNG')
            qr_buffer.seek(0)
            
            logger.info(f"✅ QR code generated for {user_email}")
            return qr_buffer
            
        except Exception as e:
            logger.error(f"❌ QR code generation failed: {e}")
            return None

def base32_decode(encoded: str) -> bytes:
    """Base32 decode helper"""
    # Remove padding
    encoded = encoded.upper().rstrip('=')
    
    # Add padding back if needed
    missing_padding = len(encoded) % 8
    if missing_padding:
        encoded += '=' * (8 - missing_padding)
    
    return base64.b32decode(encoded)

class TwoFactorAuth:
    """Two-Factor Authentication manager"""
    
    def __init__(self):
        self.totp = TOTPGenerator()
        self.user_secrets = {}  # In production, store in database
        self.backup_codes = {}  # Backup codes for recovery
        self.setup_in_progress = {}
        
        logger.info("✅ 2FA Manager initialized")
    
    def setup_2fa(self, user_id: str, user_email: str) -> Dict[str, Any]:
        """Setup 2FA for a user"""
        try:
            # Generate secret
            secret = self.totp.generate_secret()
            
            # Store secret (in production, encrypt this!)
            self.user_secrets[user_id] = secret
            
            # Generate backup codes
            backup_codes = self._generate_backup_codes(user_id)
            
            # Generate QR code
            qr_code = self.totp.generate_qr_code(secret, user_email)
            
            # Mark as in progress
            self.setup_in_progress[user_id] = {
                'secret': secret,
                'timestamp': time.time()
            }
            
            result = {
                'secret': secret,
                'qr_code': qr_code,
                'backup_codes': backup_codes,
                'message': f"Scan QR code in authenticator app (Google Authenticator, Authy, etc.)"
            }
            
            logger.info(f"✅ 2FA setup initiated for user {user_id}")
            return result
            
        except Exception as e:
            logger.error(f"❌ 2FA setup failed: {e}")
            return {'error': str(e)}
    
    def verify_2fa_setup(self, user_id: str, code: str) -> bool:
        """Verify 2FA setup code"""
        try:
            if user_id not in self.setup_in_progress:
                logger.error(f"❌ No setup in progress for user {user_id}")
                return False
            
            secret = self.setup_in_progress[user_id]['secret']
            
            # Verify code
            if self.totp.verify_totp(code, secret):
                # Setup complete
                del self.setup_in_progress[user_id]
                logger.info(f"✅ 2FA setup verified for user {user_id}")
                return True
            else:
                logger.warning(f"⚠️ Invalid 2FA setup code for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"❌ 2FA setup verification failed: {e}")
            return False
    
    def verify_2fa(self, user_id: str, code: str, backup_code: Optional[str] = None) -> bool:
        """Verify 2FA code for login"""
        try:
            if user_id not in self.user_secrets:
                logger.error(f"❌ 2FA not enabled for user {user_id}")
                return False
            
            secret = self.user_secrets[user_id]
            
            # Check regular TOTP code
            if self.totp.verify_totp(code, secret):
                logger.info(f"✅ 2FA verified for user {user_id}")
                return True
            
            # Check backup code
            if backup_code and user_id in self.backup_codes:
                if backup_code in self.backup_codes[user_id]:
                    # Remove used backup code
                    self.backup_codes[user_id].remove(backup_code)
                    logger.info(f"✅ 2FA verified with backup code for user {user_id}")
                    return True
            
            logger.warning(f"⚠️ Invalid 2FA code for user {user_id}")
            return False
            
        except Exception as e:
            logger.error(f"❌ 2FA verification failed: {e}")
            return False
    
    def disable_2fa(self, user_id: str) -> bool:
        """Disable 2FA for a user"""
        try:
            if user_id in self.user_secrets:
                del self.user_secrets[user_id]
            if user_id in self.backup_codes:
                del self.backup_codes[user_id]
            
            logger.info(f"✅ 2FA disabled for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to disable 2FA: {e}")
            return False
    
    def is_2fa_enabled(self, user_id: str) -> bool:
        """Check if 2FA is enabled for user"""
        return user_id in self.user_secrets
    
    def _generate_backup_codes(self, user_id: str, count: int = 10) -> list:
        """Generate backup codes for recovery"""
        codes = []
        for _ in range(count):
            code = f"{secrets.randbelow(9999):04d}-{secrets.randbelow(9999):04d}"
            codes.append(code)
        
        self.backup_codes[user_id] = codes
        
        logger.info(f"✅ Generated {count} backup codes for user {user_id}")
        return codes
    
    def get_stats(self) -> Dict[str, Any]:
        """Get 2FA statistics"""
        return {
            'total_users': len(self.user_secrets),
            'users_with_2fa': len([uid for uid in self.user_secrets if uid in self.user_secrets]),
            'setup_in_progress': len(self.setup_in_progress),
            'timestamp': time.time()
        }

# Global 2FA instance
two_factor_auth = TwoFactorAuth()

# FastAPI helper
def require_2fa(user_id: str, code: str) -> bool:
    """Check if 2FA is required and verify code"""
    if two_factor_auth.is_2fa_enabled(user_id):
        return two_factor_auth.verify_2fa(user_id, code)
    return True  # No 2FA required

# Test function
def test_2fa():
    """Test 2FA implementation"""
    print("🧪 Testing 2FA implementation...")
    
    # Setup
    user_id = "test_user"
    user_email = "test@example.com"
    
    result = two_factor_auth.setup_2fa(user_id, user_email)
    print(f"✅ 2FA setup: {result['message']}")
    
    # Verify setup
    secret = result['secret']
    test_code = two_factor_auth.totp.generate_totp(secret)
    print(f"Generated code: {test_code}")
    
    verified = two_factor_auth.verify_2fa_setup(user_id, test_code)
    print(f"✅ Setup verified: {verified}")
    
    # Test login
    new_code = two_factor_auth.totp.generate_totp(secret)
    login_verified = two_factor_auth.verify_2fa(user_id, new_code)
    print(f"✅ Login verified: {login_verified}")
    
    print("✅ 2FA test completed")

if __name__ == "__main__":
    test_2fa()
