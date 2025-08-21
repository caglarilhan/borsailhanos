#!/usr/bin/env python3
"""
BIST AI Smart Trader - Production Performance Testing
"""

import time
import asyncio
import aiohttp
import statistics
from typing import Dict, List
import psutil
import os

class PerformanceTester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.performance_metrics = {}
        
    def get_system_metrics(self) -> Dict:
        """Get current system performance metrics"""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            return {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_available_gb': memory.available / (1024**3),
                'disk_percent': disk.percent,
                'disk_free_gb': disk.free / (1024**3)
            }
        except ImportError:
            return {'error': 'psutil not available'}
    
    async def test_endpoint_performance(self, session: aiohttp.ClientSession, endpoint: str, iterations: int = 10) -> Dict:
        """Test single endpoint performance"""
        response_times = []
        success_count = 0
        
        for i in range(iterations):
            start_time = time.time()
            try:
                async with session.get(f"{self.base_url}{endpoint}") as response:
                    response_time = time.time() - start_time
                    response_times.append(response_time)
                    
                    if response.status == 200:
                        success_count += 1
                        
            except Exception as e:
                response_time = time.time() - start_time
                response_times.append(response_time)
        
        if response_times:
            return {
                'endpoint': endpoint,
                'iterations': iterations,
                'success_rate': (success_count / iterations) * 100,
                'avg_response_time': statistics.mean(response_times),
                'min_response_time': min(response_times),
                'max_response_time': max(response_times),
                'std_response_time': statistics.stdev(response_times) if len(response_times) > 1 else 0,
                'p95_response_time': statistics.quantiles(response_times, n=20)[18] if len(response_times) > 20 else max(response_times)
            }
        else:
            return {'endpoint': endpoint, 'error': 'No successful requests'}
    
    async def run_performance_test(self, endpoints: List[str], iterations: int = 20) -> Dict:
        """Run comprehensive performance test"""
        print(f"🚀 Performance Testing başlıyor: {iterations} iterations per endpoint")
        print("=" * 60)
        
        # Initial system metrics
        initial_metrics = self.get_system_metrics()
        print(f"💻 Initial System Metrics:")
        if 'error' not in initial_metrics:
            print(f"   CPU: {initial_metrics['cpu_percent']:.1f}%")
            print(f"   Memory: {initial_metrics['memory_percent']:.1f}% ({initial_metrics['memory_available_gb']:.1f}GB free)")
            print(f"   Disk: {initial_metrics['disk_percent']:.1f}% ({initial_metrics['disk_free_gb']:.1f}GB free)")
        print()
        
        async with aiohttp.ClientSession() as session:
            all_results = []
            
            for endpoint in endpoints:
                print(f"📊 Testing: {endpoint}")
                result = await self.test_endpoint_performance(session, endpoint, iterations)
                all_results.append(result)
                
                if 'error' not in result:
                    print(f"   ✅ Success Rate: {result['success_rate']:.1f}%")
                    print(f"   ⏱️  Avg Response: {result['avg_response_time']:.3f}s")
                    print(f"   📈 P95 Response: {result['p95_response_time']:.3f}s")
                    print(f"   📊 Std Dev: {result['std_response_time']:.3f}s")
                else:
                    print(f"   ❌ Error: {result['error']}")
                print()
        
        # Final system metrics
        final_metrics = self.get_system_metrics()
        print(f"💻 Final System Metrics:")
        if 'error' not in final_metrics:
            print(f"   CPU: {final_metrics['cpu_percent']:.1f}%")
            print(f"   Memory: {final_metrics['memory_percent']:.1f}% ({final_metrics['memory_available_gb']:.1f}GB free)")
            print(f"   Disk: {final_metrics['disk_percent']:.1f}% ({final_metrics['disk_free_gb']:.1f}GB free)")
        print()
        
        # Performance analysis
        successful_results = [r for r in all_results if 'error' not in r]
        
        if successful_results:
            avg_response_times = [r['avg_response_time'] for r in successful_results]
            success_rates = [r['success_rate'] for r in successful_results]
            
            overall_avg_response = statistics.mean(avg_response_times)
            overall_success_rate = statistics.mean(success_rates)
            
            # Performance grading
            if overall_avg_response < 0.5:
                performance_grade = "🚀 EXCELLENT"
            elif overall_avg_response < 1.0:
                performance_grade = "✅ GOOD"
            elif overall_avg_response < 2.0:
                performance_grade = "⚠️  ACCEPTABLE"
            else:
                performance_grade = "❌ POOR"
            
            print("🎯 PERFORMANCE TEST SONUÇLARI:")
            print("=" * 60)
            print(f"📊 Overall Performance: {performance_grade}")
            print(f"⏱️  Average Response Time: {overall_avg_response:.3f}s")
            print(f"✅ Average Success Rate: {overall_success_rate:.1f}%")
            print(f"🌐 Endpoints Tested: {len(successful_results)}")
            print(f"🔄 Total Iterations: {len(successful_results) * iterations}")
            
            # Performance thresholds
            if overall_avg_response > 2.0:
                print("\n⚠️  WARNING: Response time above 2s threshold!")
            if overall_success_rate < 95:
                print("\n⚠️  WARNING: Success rate below 95% threshold!")
            
            return {
                'performance_grade': performance_grade,
                'overall_avg_response': overall_avg_response,
                'overall_success_rate': overall_success_rate,
                'endpoints_tested': len(successful_results),
                'total_iterations': len(successful_results) * iterations,
                'initial_metrics': initial_metrics,
                'final_metrics': final_metrics,
                'detailed_results': all_results
            }
        else:
            print("❌ No successful performance tests!")
            return {'error': 'All tests failed'}

async def main():
    """Main performance testing function"""
    tester = PerformanceTester()
    
    # Test endpoints with different complexity
    endpoints = [
        "/health",                                    # Simple health check
        "/bist100/symbols",                          # Data retrieval
        "/analysis/health/summary",                  # Analysis computation
        "/ai/ensemble/prediction/SISE.IS",          # AI model inference
        "/ai/macro/regime",                          # Complex AI computation
        "/analysis/patterns/scan/bist100"            # Heavy computation
    ]
    
    # Run performance tests
    results = await tester.run_performance_test(endpoints, iterations=25)
    
    if 'error' not in results:
        print(f"\n🎉 Performance testing completed successfully!")
        print(f"🏆 Grade: {results['performance_grade']}")
    else:
        print(f"\n❌ Performance testing failed: {results['error']}")

if __name__ == "__main__":
    asyncio.run(main())
