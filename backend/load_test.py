#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production Load Testing
"""

import asyncio
import aiohttp
import time
import statistics
from typing import List, Dict
import json

class LoadTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.results = []
        
    async def test_endpoint(self, session: aiohttp.ClientSession, endpoint: str, method: str = "GET") -> Dict:
        """Single endpoint test"""
        start_time = time.time()
        try:
            if method == "GET":
                async with session.get(f"{self.base_url}{endpoint}") as response:
                    response_time = time.time() - start_time
                    return {
                        'endpoint': endpoint,
                        'status': response.status,
                        'response_time': response_time,
                        'success': response.status == 200
                    }
        except Exception as e:
            response_time = time.time() - start_time
            return {
                'endpoint': endpoint,
                'status': 0,
                'response_time': response_time,
                'success': False,
                'error': str(e)
            }
    
    async def concurrent_test(self, endpoint: str, concurrent_users: int = 10) -> List[Dict]:
        """Concurrent load test"""
        async with aiohttp.ClientSession() as session:
            tasks = [self.test_endpoint(session, endpoint) for _ in range(concurrent_users)]
            results = await asyncio.gather(*tasks)
            return results
    
    async def run_load_test(self, endpoints: List[str], concurrent_users: int = 20) -> Dict:
        """Full load test"""
        print(f"🚀 Load Testing başlıyor: {concurrent_users} concurrent users")
        print("=" * 50)
        
        all_results = []
        
        for endpoint in endpoints:
            print(f"📊 Testing: {endpoint}")
            results = await self.concurrent_test(endpoint, concurrent_users)
            all_results.extend(results)
            
            # Endpoint summary
            success_count = sum(1 for r in results if r['success'])
            avg_response_time = statistics.mean([r['response_time'] for r in results if r['success']])
            
            print(f"   ✅ Success: {success_count}/{len(results)}")
            print(f"   ⏱️  Avg Response: {avg_response_time:.3f}s")
            print()
        
        # Overall summary
        total_requests = len(all_results)
        total_success = sum(1 for r in all_results if r['success'])
        success_rate = (total_success / total_requests) * 100
        avg_response_time = statistics.mean([r['response_time'] for r in all_results if r['success']])
        
        summary = {
            'total_requests': total_requests,
            'total_success': total_success,
            'success_rate': success_rate,
            'avg_response_time': avg_response_time,
            'endpoints_tested': len(endpoints),
            'concurrent_users': concurrent_users
        }
        
        print("🎯 LOAD TEST SONUÇLARI:")
        print("=" * 50)
        print(f"📊 Total Requests: {total_requests}")
        print(f"✅ Success Rate: {success_rate:.1f}%")
        print(f"⏱️  Avg Response Time: {avg_response_time:.3f}s")
        print(f"🌐 Endpoints Tested: {len(endpoints)}")
        print(f"👥 Concurrent Users: {concurrent_users}")
        
        return summary

async def main():
    """Main load testing function"""
    tester = LoadTester()
    
    # Test endpoints
    endpoints = [
        "/health",
        "/dashboard", 
        "/bist100/symbols",
        "/ai/ensemble/prediction/SISE.IS",
        "/ai/macro/regime",
        "/analysis/health/summary",
        "/analysis/topsis/ranking",
        "/analysis/patterns/scan/bist100"
    ]
    
    # Run tests with different load levels
    load_levels = [10, 25, 50]
    
    for load in load_levels:
        print(f"\n🔥 LOAD LEVEL: {load} concurrent users")
        print("=" * 50)
        
        results = await tester.run_load_test(endpoints, load)
        
        # Performance thresholds
        if results['success_rate'] < 95:
            print(f"⚠️  WARNING: Success rate below 95% ({results['success_rate']:.1f}%)")
        
        if results['avg_response_time'] > 2.0:
            print(f"⚠️  WARNING: Response time above 2s ({results['avg_response_time']:.3f}s)")
        
        print(f"✅ Load level {load} completed")
        print()

if __name__ == "__main__":
    asyncio.run(main())
