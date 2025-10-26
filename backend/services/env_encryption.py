#!/usr/bin/env python3
"""
BIST AI Smart Trader - Environment Variables Encryption
Encrypt sensitive environment variables
"""

import os
import base64
import logging
from typing import Dict, Any
from cryptography.fernet import Fernet

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnvironmentEncryption:
    """Environment variables encryption service"""
    
    def __init__(self):
        self.master_key = self._get_master_key()
        self.fernet = Fernet(self.master_key)
        
        logger.info("✅ Environment encryption initialized")
    
    def _get_master_key(self) -> bytes:
        """Get or create master encryption key"""
        # Check if key exists in environment
        master_key_env = os.getenv("MASTER_ENCRYPTION_KEY")
        
        if master_key_env:
            try:
                # Use existing key
                return master_key_env.encode()
            except Exception:
                logger.warning("⚠️ Invalid master key in environment")
        
        # Generate new key
        new_key = Fernet.generate_key()
        logger.warning(f"⚠️ Generated new master key. Save this securely: {new_key.decode()}")
        return new_key
    
    def encrypt_value(self, value: str) -> str:
        """Encrypt a value"""
        try:
            encrypted = self.fernet.encrypt(value.encode())
            return base64.b64encode(encrypted).decode()
        except Exception as e:
            logger.error(f"❌ Encryption failed: {e}")
            return value  # Return original if encryption fails
    
    def decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt a value"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_value)
            decrypted = self.fernet.decrypt(encrypted_bytes)
            return decrypted.decode()
        except Exception as e:
            logger.error(f"❌ Decryption failed: {e}")
            return encrypted_value  # Return original if decryption fails
    
    def encrypt_env_file(self, env_file: str = ".env"):
        """Encrypt sensitive values in env file"""
        try:
            # Read env file
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            encrypted_lines = []
            sensitive_keys = [
                "API_KEY", "SECRET", "PASSWORD", "TOKEN",
                "DATABASE_URL", "SENTRY_DSN", "REDIS_URL"
            ]
            
            for line in lines:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.split('=', 1)
                    value = value.strip()
                    
                    # Check if sensitive
                    if any(sensitive in key.upper() for sensitive in sensitive_keys):
                        encrypted = self.encrypt_value(value)
                        line = f"{key}=encrypted:{encrypted}\n"
                    
                    encrypted_lines.append(line)
                else:
                    encrypted_lines.append(line)
            
            # Write encrypted file
            encrypted_file = f"{env_file}.encrypted"
            with open(encrypted_file, 'w') as f:
                f.writelines(encrypted_lines)
            
            logger.info(f"✅ Environment file encrypted: {encrypted_file}")
            
        except Exception as e:
            logger.error(f"❌ Environment file encryption failed: {e}")
    
    def decrypt_env_file(self, env_file: str = ".env.encrypted"):
        """Decrypt env file for use"""
        try:
            # Read encrypted file
            with open(env_file, 'r') as f:
                lines = f.readlines()
            
            decrypted_lines = []
            
            for line in lines:
                if '=' in line and not line.strip().startswith('#'):
                    key, value = line.split('=', 1)
                    value = value.strip()
                    
                    # Check if encrypted
                    if value.startswith('encrypted:'):
                        encrypted_value = value.replace('encrypted:', '')
                        decrypted = self.decrypt_value(encrypted_value)
                        line = f"{key}={decrypted}\n"
                    
                    decrypted_lines.append(line)
                else:
                    decrypted_lines.append(line)
            
            # Write decrypted file
            decrypted_file = env_file.replace('.encrypted', '')
            with open(decrypted_file, 'w') as f:
                f.writelines(decrypted_lines)
            
            logger.info(f"✅ Environment file decrypted: {decrypted_file}")
            
        except Exception as e:
            logger.error(f"❌ Environment file decryption failed: {e}")
    
    def get_safe_env(self, key: str, default: Any = None) -> str:
        """Get environment variable with automatic decryption"""
        value = os.getenv(key, default)
        
        if value and value.startswith('encrypted:'):
            encrypted = value.replace('encrypted:', '')
            return self.decrypt_value(encrypted)
        
        return value

# Global instance
env_encryption = EnvironmentEncryption()

# Test function
if __name__ == "__main__":
    print("🧪 Testing Environment Encryption...")
    
    # Test encryption
    test_value = "my_secret_api_key_12345"
    encrypted = env_encryption.encrypt_value(test_value)
    decrypted = env_encryption.decrypt_value(encrypted)
    
    print(f"Original: {test_value}")
    print(f"Encrypted: {encrypted}")
    print(f"Decrypted: {decrypted}")
    print(f"✅ Test passed: {test_value == decrypted}")
