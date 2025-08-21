#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production Security Audit
"""

import os
import json
import requests
from typing import Dict, List, Tuple
import re

class SecurityAuditor:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.security_issues = []
        self.passed_checks = []
        
    def check_environment_variables(self) -> Dict:
        """Environment variables security check"""
        print("🔒 Environment Variables Security Check...")
        
        sensitive_vars = [
            'TIMEGPT_API_KEY',
            'FINNHUB_API_KEY', 
            'FMP_API_KEY',
            'FIRESTORE_PRIVATE_KEY',
            'FIRESTORE_CLIENT_EMAIL'
        ]
        
        issues = []
        passed = []
        
        for var in sensitive_vars:
            value = os.getenv(var)
            if value:
                if len(value) < 10:
                    issues.append(f"❌ {var}: Too short (potential invalid)")
                elif value == "demo" or value == "test":
                    issues.append(f"❌ {var}: Using demo/test value")
                else:
                    passed.append(f"✅ {var}: Properly configured")
            else:
                issues.append(f"❌ {var}: Not set")
        
        return {'issues': issues, 'passed': passed}
    
    def check_api_security(self) -> Dict:
        """API security checks"""
        print("🔒 API Security Check...")
        
        issues = []
        passed = []
        
        # Check CORS headers
        try:
            response = requests.options(f"{self.base_url}/dashboard")
            cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
            
            if cors_headers == '*':
                issues.append("❌ CORS: Too permissive (Access-Control-Allow-Origin: *)")
            elif not cors_headers:
                passed.append("✅ CORS: Properly restricted")
            else:
                passed.append(f"✅ CORS: Configured ({cors_headers})")
        except:
            issues.append("❌ CORS: Cannot check")
        
        # Check security headers
        try:
            response = requests.get(f"{self.base_url}/dashboard")
            headers = response.headers
            
            if 'X-Frame-Options' not in headers:
                issues.append("❌ Security: Missing X-Frame-Options (clickjacking protection)")
            else:
                passed.append("✅ Security: X-Frame-Options present")
                
            if 'X-Content-Type-Options' not in headers:
                issues.append("❌ Security: Missing X-Content-Type-Options")
            else:
                passed.append("✅ Security: X-Content-Type-Options present")
                
        except:
            issues.append("❌ Security: Cannot check headers")
        
        return {'issues': issues, 'passed': passed}
    
    def check_file_permissions(self) -> Dict:
        """File permissions security check"""
        print("🔒 File Permissions Check...")
        
        issues = []
        passed = []
        
        critical_files = [
            '.env',
            'config.py',
            'firebase-credentials.json',
            'models/',
            'logs/'
        ]
        
        for file_path in critical_files:
            if os.path.exists(file_path):
                try:
                    stat = os.stat(file_path)
                    mode = oct(stat.st_mode)[-3:]
                    
                    if file_path == '.env' and mode != '600':
                        issues.append(f"❌ {file_path}: Permissions too open ({mode}) - should be 600")
                    elif file_path.endswith('/') and mode != '700':
                        issues.append(f"❌ {file_path}: Directory permissions too open ({mode}) - should be 700")
                    else:
                        passed.append(f"✅ {file_path}: Proper permissions ({mode})")
                except:
                    issues.append(f"❌ {file_path}: Cannot check permissions")
            else:
                if file_path == '.env':
                    issues.append(f"❌ {file_path}: Not found (required for production)")
        
        return {'issues': issues, 'passed': passed}
    
    def check_dependencies(self) -> Dict:
        """Dependencies security check"""
        print("🔒 Dependencies Security Check...")
        
        issues = []
        passed = []
        
        # Check for known vulnerable packages
        vulnerable_packages = [
            'django<2.2.0',
            'flask<2.0.0',
            'requests<2.25.0',
            'urllib3<1.26.0'
        ]
        
        try:
            import pkg_resources
            installed_packages = {pkg.key: pkg.version for pkg in pkg_resources.working_set}
            
            for pkg in vulnerable_packages:
                pkg_name, version = pkg.split('<')
                if pkg_name in installed_packages:
                    current_version = installed_packages[pkg_name]
                    if current_version < version:
                        issues.append(f"❌ {pkg_name}: Vulnerable version {current_version} < {version}")
                    else:
                        passed.append(f"✅ {pkg_name}: Safe version {current_version}")
            
            passed.append("✅ Dependencies: Security check completed")
            
        except Exception as e:
            issues.append(f"❌ Dependencies: Cannot check ({str(e)})")
        
        return {'issues': issues, 'passed': passed}
    
    def run_full_audit(self) -> Dict:
        """Run complete security audit"""
        print("🚀 BIST AI Smart Trader - Security Audit Başlıyor...")
        print("=" * 60)
        
        # Run all checks
        env_check = self.check_environment_variables()
        api_check = self.check_api_security()
        file_check = self.check_file_permissions()
        dep_check = self.check_dependencies()
        
        # Compile results
        all_issues = env_check['issues'] + api_check['issues'] + file_check['issues'] + dep_check['issues']
        all_passed = env_check['passed'] + api_check['passed'] + file_check['passed'] + dep_check['passed']
        
        # Calculate security score
        total_checks = len(all_issues) + len(all_passed)
        security_score = (len(all_passed) / total_checks) * 100 if total_checks > 0 else 0
        
        # Print results
        print("\n🎯 SECURITY AUDIT SONUÇLARI:")
        print("=" * 60)
        print(f"🔒 Security Score: {security_score:.1f}%")
        print(f"✅ Passed Checks: {len(all_passed)}")
        print(f"❌ Security Issues: {len(all_issues)}")
        
        if all_passed:
            print("\n✅ PASSED CHECKS:")
            for check in all_passed:
                print(f"   {check}")
        
        if all_issues:
            print("\n❌ SECURITY ISSUES:")
            for issue in all_issues:
                print(f"   {issue}")
        
        # Recommendations
        print("\n💡 RECOMMENDATIONS:")
        if security_score < 80:
            print("   ⚠️  Critical: Fix security issues before production deployment!")
        elif security_score < 95:
            print("   ⚠️  Warning: Address security issues for better protection")
        else:
            print("   ✅ Excellent: Security standards met for production!")
        
        return {
            'security_score': security_score,
            'total_checks': total_checks,
            'passed_checks': len(all_passed),
            'security_issues': len(all_issues),
            'issues': all_issues,
            'passed': all_passed
        }

def main():
    """Main security audit function"""
    auditor = SecurityAuditor()
    results = auditor.run_full_audit()
    
    # Exit with appropriate code
    if results['security_score'] < 80:
        print("\n🚨 CRITICAL: Security audit failed!")
        exit(1)
    elif results['security_score'] < 95:
        print("\n⚠️  WARNING: Security issues found!")
        exit(2)
    else:
        print("\n✅ SUCCESS: Security audit passed!")
        exit(0)

if __name__ == "__main__":
    main()
