#!/usr/bin/env python3
"""
BIST AI Smart Trader - API Key Rotation System
Automatic API key rotation for security
"""

import secrets
import hashlib
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class APIKey:
    """API Key data structure"""
    key: str
    user_id: str
    created_at: datetime
    last_used: datetime
    expires_at: datetime
    is_active: bool
    permissions: List[str]
    rotation_count: int = 0

class APIKeyRotation:
    """API Key rotation manager"""
    
    def __init__(self):
        self.keys = {}  # In production, use database
        self.key_history = {}  # Track old keys
        self.rotation_period_days = 90  # Rotate every 90 days
        self.grace_period_days = 7  # Allow old key for 7 days after rotation
        
        logger.info("✅ API Key Rotation System initialized")
    
    def generate_api_key(self, length: int = 32) -> str:
        """Generate a secure API key"""
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        key = ''.join(secrets.choice(characters) for _ in range(length))
        return key
    
    def create_api_key(self, user_id: str, permissions: List[str] = None) -> str:
        """Create a new API key"""
        if permissions is None:
            permissions = ["read", "write"]
        
        # Generate key
        api_key = self.generate_api_key()
        
        # Hash for storage
        key_hash = self._hash_key(api_key)
        
        # Create key object
        now = datetime.now()
        expires_at = now + timedelta(days=self.rotation_period_days)
        
        key_obj = APIKey(
            key=key_hash,
            user_id=user_id,
            created_at=now,
            last_used=now,
            expires_at=expires_at,
            is_active=True,
            permissions=permissions,
            rotation_count=0
        )
        
        # Store
        self.keys[key_hash] = key_obj
        self.keys[key_hash].key = api_key  # Store plain key temporarily for response
        
        logger.info(f"✅ API key created for user {user_id}")
        
        # Return plain key for user
        return api_key
    
    def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """Verify an API key"""
        key_hash = self._hash_key(api_key)
        
        # Check current keys
        if key_hash in self.keys:
            key_obj = self.keys[key_hash]
            
            if not key_obj.is_active:
                logger.warning(f"⚠️ Inactive API key used")
                return None
            
            # Check expiration
            if datetime.now() > key_obj.expires_at:
                logger.warning(f"⚠️ Expired API key used")
                return None
            
            # Update last used
            key_obj.last_used = datetime.now()
            
            return {
                'user_id': key_obj.user_id,
                'permissions': key_obj.permissions,
                'created_at': key_obj.created_at.isoformat(),
                'expires_at': key_obj.expires_at.isoformat()
            }
        
        # Check old keys (grace period)
        if key_hash in self.key_history:
            old_key = self.key_history[key_hash]
            
            if datetime.now() <= old_key['expires_at']:
                logger.warning(f"⚠️ Old API key used (grace period)")
                return old_key
        
        logger.warning(f"⚠️ Invalid API key used")
        return None
    
    def rotate_api_key(self, user_id: str) -> str:
        """Rotate API key for a user"""
        try:
            # Find existing keys for user
            existing_keys = [k for k, v in self.keys.items() if v.user_id == user_id and v.is_active]
            
            if not existing_keys:
                logger.warning(f"⚠️ No keys found for user {user_id}")
                return self.create_api_key(user_id)
            
            # Deactivate old keys
            for old_key_hash in existing_keys:
                old_key = self.keys[old_key_hash]
                old_key.is_active = False
                
                # Move to history
                self.key_history[old_key_hash] = {
                    'user_id': old_key.user_id,
                    'permissions': old_key.permissions,
                    'created_at': old_key.created_at,
                    'expires_at': datetime.now() + timedelta(days=self.grace_period_days)
                }
                
                logger.info(f"✅ Old API key deactivated for user {user_id}")
            
            # Create new key
            new_key = self.create_api_key(user_id, permissions=old_key.permissions)
            
            logger.info(f"✅ API key rotated for user {user_id}")
            
            return new_key
            
        except Exception as e:
            logger.error(f"❌ API key rotation failed: {e}")
            return None
    
    def revoke_api_key(self, user_id: str, key_hash: Optional[str] = None) -> bool:
        """Revoke API keys for a user"""
        try:
            if key_hash:
                # Revoke specific key
                if key_hash in self.keys:
                    self.keys[key_hash].is_active = False
                    logger.info(f"✅ API key revoked: {key_hash}")
                    return True
            else:
                # Revoke all keys for user
                revoked_count = 0
                for k, v in self.keys.items():
                    if v.user_id == user_id and v.is_active:
                        v.is_active = False
                        revoked_count += 1
                
                logger.info(f"✅ Revoked {revoked_count} API keys for user {user_id}")
                return revoked_count > 0
            
            return False
            
        except Exception as e:
            logger.error(f"❌ API key revocation failed: {e}")
            return False
    
    def check_rotation_needed(self) -> List[Dict[str, Any]]:
        """Check which keys need rotation"""
        keys_needing_rotation = []
        
        for key_hash, key_obj in self.keys.items():
            if key_obj.is_active:
                days_until_expiry = (key_obj.expires_at - datetime.now()).days
                
                if days_until_expiry <= 7:  # Rotate within 7 days of expiry
                    keys_needing_rotation.append({
                        'user_id': key_obj.user_id,
                        'key_hash': key_hash,
                        'days_until_expiry': days_until_expiry,
                        'expires_at': key_obj.expires_at.isoformat()
                    })
        
        return keys_needing_rotation
    
    def auto_rotate_keys(self) -> Dict[str, Any]:
        """Automatically rotate keys that need rotation"""
        keys_to_rotate = self.check_rotation_needed()
        
        rotated_count = 0
        failed_count = 0
        
        for key_info in keys_to_rotate:
            try:
                new_key = self.rotate_api_key(key_info['user_id'])
                if new_key:
                    rotated_count += 1
                    logger.info(f"✅ Auto-rotated key for user {key_info['user_id']}")
                else:
                    failed_count += 1
                    logger.error(f"❌ Auto-rotation failed for user {key_info['user_id']}")
            except Exception as e:
                logger.error(f"❌ Auto-rotation error: {e}")
                failed_count += 1
        
        return {
            'total_keys_checked': len(keys_to_rotate),
            'rotated_count': rotated_count,
            'failed_count': failed_count,
            'timestamp': datetime.now().isoformat()
        }
    
    def _hash_key(self, key: str) -> str:
        """Hash API key for storage"""
        return hashlib.sha256(key.encode()).hexdigest()
    
    def get_stats(self) -> Dict[str, Any]:
        """Get API key rotation statistics"""
        active_keys = [k for k, v in self.keys.items() if v.is_active]
        expired_keys = [k for k, v in self.keys.items() if v.expires_at < datetime.now()]
        keys_needing_rotation = self.check_rotation_needed()
        
        return {
            'total_keys': len(self.keys),
            'active_keys': len(active_keys),
            'expired_keys': len(expired_keys),
            'keys_needing_rotation': len(keys_needing_rotation),
            'rotation_period_days': self.rotation_period_days,
            'grace_period_days': self.grace_period_days,
            'timestamp': datetime.now().isoformat()
        }

# Global instance
api_key_rotation = APIKeyRotation()

# Test function
if __name__ == "__main__":
    print("🧪 Testing API Key Rotation...")
    
    # Create key
    user_id = "test_user"
    key = api_key_rotation.create_api_key(user_id, ["read", "write"])
    print(f"✅ Created API key: {key[:10]}...")
    
    # Verify key
    result = api_key_rotation.verify_api_key(key)
    print(f"✅ Verified API key: {result}")
    
    # Check rotation needed
    keys_needing_rotation = api_key_rotation.check_rotation_needed()
    print(f"✅ Keys needing rotation: {len(keys_needing_rotation)}")
    
    # Get stats
    stats = api_key_rotation.get_stats()
    print(f"✅ API Key stats: {stats}")
    
    print("✅ API Key rotation test completed")
