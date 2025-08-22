#!/usr/bin/env python3
"""
Load Testing for BIST AI Smart Trader
Apache Bench ve Python ile performance testing
"""

import asyncio
import aiohttp
import time
import statistics
import json
import subprocess
import sys
from datetime import datetime
from typing import List, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LoadTester:
    """Load testing sınıfı"""
    
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.results = {}
        
    async def test_endpoint(self, endpoint: str, concurrent: int = 10, requests: int = 100) -> Dict:
        """Async endpoint testi"""
        url = f"{self.base_url}{endpoint}"
        response_times = []
        errors = 0
        status_codes = {}
        
        connector = aiohttp.TCPConnector(limit=concurrent)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            start_time = time.time()
            
            # Concurrent requests
            tasks = []
            for _ in range(requests):
                tasks.append(self.make_request(session, url, response_times, status_codes))
            
            # Execute requests
            await asyncio.gather(*tasks, return_exceptions=True)
            
            end_time = time.time()
            total_time = end_time - start_time
        
        # Calculate metrics
        successful_requests = len(response_times)
        error_rate = (requests - successful_requests) / requests * 100
        
        metrics = {
            'endpoint': endpoint,
            'total_requests': requests,
            'concurrent_users': concurrent,
            'successful_requests': successful_requests,
            'failed_requests': requests - successful_requests,
            'error_rate_percent': round(error_rate, 2),
            'total_time_seconds': round(total_time, 2),
            'requests_per_second': round(requests / total_time, 2),
            'status_codes': status_codes
        }
        
        if response_times:
            metrics.update({
                'avg_response_time': round(statistics.mean(response_times), 4),
                'min_response_time': round(min(response_times), 4),
                'max_response_time': round(max(response_times), 4),
                'median_response_time': round(statistics.median(response_times), 4),
                'p95_response_time': round(self.percentile(response_times, 95), 4),
                'p99_response_time': round(self.percentile(response_times, 99), 4)
            })
        
        return metrics
    
    async def make_request(self, session: aiohttp.ClientSession, url: str, 
                          response_times: List[float], status_codes: Dict):
        """Tek request yapma"""
        try:
            start_time = time.time()
            async with session.get(url) as response:
                await response.text()
                end_time = time.time()
                
                response_time = end_time - start_time
                response_times.append(response_time)
                
                # Status code tracking
                status = response.status
                status_codes[status] = status_codes.get(status, 0) + 1
                
        except Exception as e:
            logger.warning(f"Request failed: {e}")
            status_codes['error'] = status_codes.get('error', 0) + 1
    
    def percentile(self, data: List[float], p: int) -> float:
        """Percentile hesaplama"""
        if not data:
            return 0.0
        sorted_data = sorted(data)
        index = (p / 100) * (len(sorted_data) - 1)
        if index.is_integer():
            return sorted_data[int(index)]
        else:
            lower = sorted_data[int(index)]
            upper = sorted_data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def run_apache_bench(self, endpoint: str, requests: int = 1000, concurrent: int = 50) -> Dict:
        """Apache Bench ile test"""
        url = f"{self.base_url}{endpoint}"
        
        try:
            # Apache bench komutu
            cmd = [
                'ab',
                '-n', str(requests),
                '-c', str(concurrent),
                '-r',  # Don't exit on socket receive errors
                '-s', '30',  # Timeout
                url
            ]
            
            logger.info(f"Running Apache Bench: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode != 0:
                return {
                    'error': f"Apache Bench failed: {result.stderr}",
                    'endpoint': endpoint
                }
            
            # Parse results
            output = result.stdout
            metrics = self.parse_ab_output(output, endpoint, requests, concurrent)
            return metrics
            
        except subprocess.TimeoutExpired:
            return {
                'error': 'Apache Bench timeout',
                'endpoint': endpoint
            }
        except FileNotFoundError:
            return {
                'error': 'Apache Bench not installed. Install with: brew install apache2 (macOS) or apt-get install apache2-utils (Ubuntu)',
                'endpoint': endpoint
            }
        except Exception as e:
            return {
                'error': f"Apache Bench error: {str(e)}",
                'endpoint': endpoint
            }
    
    def parse_ab_output(self, output: str, endpoint: str, requests: int, concurrent: int) -> Dict:
        """Apache Bench output parsing"""
        metrics = {
            'endpoint': endpoint,
            'tool': 'Apache Bench',
            'total_requests': requests,
            'concurrent_users': concurrent
        }
        
        lines = output.split('\n')
        for line in lines:
            line = line.strip()
            
            if 'Requests per second:' in line:
                rps = float(line.split(':')[1].strip().split()[0])
                metrics['requests_per_second'] = rps
            
            elif 'Time taken for tests:' in line:
                total_time = float(line.split(':')[1].strip().split()[0])
                metrics['total_time_seconds'] = total_time
            
            elif 'Failed requests:' in line:
                failed = int(line.split(':')[1].strip())
                metrics['failed_requests'] = failed
                metrics['successful_requests'] = requests - failed
                metrics['error_rate_percent'] = (failed / requests) * 100
            
            elif 'Total:' in line and 'mean' in line:
                # Connection Times parsing
                parts = line.split()
                if len(parts) >= 5:
                    metrics['avg_response_time'] = float(parts[1]) / 1000  # Convert ms to seconds
                    metrics['median_response_time'] = float(parts[2]) / 1000
                    metrics['max_response_time'] = float(parts[4]) / 1000
            
            elif '95%' in line:
                p95 = int(line.split()[1])
                metrics['p95_response_time'] = p95 / 1000  # Convert ms to seconds
            
            elif '99%' in line:
                p99 = int(line.split()[1])
                metrics['p99_response_time'] = p99 / 1000  # Convert ms to seconds
        
        return metrics
    
    async def stress_test(self, endpoints: List[str], duration_seconds: int = 60, 
                         concurrent: int = 20) -> Dict:
        """Stress test - belirli süre boyunca yük"""
        logger.info(f"Starting stress test for {duration_seconds}s with {concurrent} concurrent users")
        
        start_time = time.time()
        end_time = start_time + duration_seconds
        
        tasks = []
        results = {
            'start_time': datetime.now().isoformat(),
            'duration_seconds': duration_seconds,
            'concurrent_users': concurrent,
            'endpoints': endpoints,
            'total_requests': 0,
            'total_errors': 0,
            'response_times': []
        }
        
        # Create tasks for continuous requests
        connector = aiohttp.TCPConnector(limit=concurrent * 2)
        timeout = aiohttp.ClientTimeout(total=30)
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            while time.time() < end_time:
                for endpoint in endpoints:
                    if time.time() >= end_time:
                        break
                    
                    url = f"{self.base_url}{endpoint}"
                    task = asyncio.create_task(self.stress_request(session, url, results))
                    tasks.append(task)
                    
                    if len(tasks) >= concurrent:
                        # Wait for some tasks to complete
                        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
                        tasks = list(pending)
            
            # Wait for remaining tasks
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
        
        # Calculate final metrics
        total_time = time.time() - start_time
        results['actual_duration'] = round(total_time, 2)
        
        if results['total_requests'] > 0:
            results['requests_per_second'] = round(results['total_requests'] / total_time, 2)
            results['error_rate_percent'] = round((results['total_errors'] / results['total_requests']) * 100, 2)
        
        if results['response_times']:
            results['avg_response_time'] = round(statistics.mean(results['response_times']), 4)
            results['max_response_time'] = round(max(results['response_times']), 4)
            results['p95_response_time'] = round(self.percentile(results['response_times'], 95), 4)
        
        return results
    
    async def stress_request(self, session: aiohttp.ClientSession, url: str, results: Dict):
        """Stress test için tek request"""
        try:
            start_time = time.time()
            async with session.get(url) as response:
                await response.text()
                end_time = time.time()
                
                results['total_requests'] += 1
                results['response_times'].append(end_time - start_time)
                
                if response.status >= 400:
                    results['total_errors'] += 1
                    
        except Exception:
            results['total_errors'] += 1
    
    async def run_comprehensive_test(self) -> Dict:
        """Kapsamlı test suite"""
        logger.info("🚀 Starting comprehensive load testing...")
        
        test_results = {
            'test_start': datetime.now().isoformat(),
            'base_url': self.base_url,
            'tests': {}
        }
        
        # Test endpoints
        endpoints = [
            '/health',
            '/ai/models/status',
            '/ai/macro/regime',
            '/dashboard'
        ]
        
        # 1. Light load test
        logger.info("1️⃣ Light load test (10 concurrent, 100 requests)...")
        for endpoint in endpoints:
            test_results['tests'][f'light_{endpoint.replace("/", "_")}'] = await self.test_endpoint(
                endpoint, concurrent=10, requests=100
            )
        
        # 2. Medium load test
        logger.info("2️⃣ Medium load test (25 concurrent, 250 requests)...")
        for endpoint in endpoints[:2]:  # Test critical endpoints
            test_results['tests'][f'medium_{endpoint.replace("/", "_")}'] = await self.test_endpoint(
                endpoint, concurrent=25, requests=250
            )
        
        # 3. Heavy load test
        logger.info("3️⃣ Heavy load test (50 concurrent, 500 requests)...")
        test_results['tests']['heavy_health'] = await self.test_endpoint(
            '/health', concurrent=50, requests=500
        )
        
        # 4. Apache Bench test (if available)
        logger.info("4️⃣ Apache Bench test...")
        ab_result = self.run_apache_bench('/health', requests=1000, concurrent=50)
        test_results['tests']['apache_bench_health'] = ab_result
        
        # 5. Stress test
        logger.info("5️⃣ Stress test (30 seconds)...")
        stress_result = await self.stress_test(['/health', '/ai/models/status'], 
                                              duration_seconds=30, concurrent=15)
        test_results['tests']['stress_test'] = stress_result
        
        test_results['test_end'] = datetime.now().isoformat()
        test_results['total_duration'] = round(time.time() - time.mktime(
            datetime.fromisoformat(test_results['test_start']).timetuple()
        ), 2)
        
        return test_results
    
    def generate_report(self, results: Dict) -> str:
        """Test raporu oluştur"""
        report = []
        report.append("🎯 LOAD TESTING REPORT")
        report.append("=" * 50)
        report.append(f"Test Start: {results['test_start']}")
        report.append(f"Test End: {results['test_end']}")
        report.append(f"Total Duration: {results['total_duration']}s")
        report.append(f"Base URL: {results['base_url']}")
        report.append("")
        
        # Test results
        for test_name, test_data in results['tests'].items():
            if 'error' in test_data:
                report.append(f"❌ {test_name}: {test_data['error']}")
                continue
                
            report.append(f"📊 {test_name.upper()}")
            report.append("-" * 30)
            
            if 'endpoint' in test_data:
                report.append(f"Endpoint: {test_data['endpoint']}")
            
            if 'requests_per_second' in test_data:
                report.append(f"RPS: {test_data['requests_per_second']}")
            
            if 'avg_response_time' in test_data:
                report.append(f"Avg Response: {test_data['avg_response_time']}s")
            
            if 'p95_response_time' in test_data:
                report.append(f"P95 Response: {test_data['p95_response_time']}s")
            
            if 'error_rate_percent' in test_data:
                report.append(f"Error Rate: {test_data['error_rate_percent']}%")
            
            # Performance grade
            if 'avg_response_time' in test_data:
                avg_time = test_data['avg_response_time']
                if avg_time < 0.1:
                    grade = "🟢 EXCELLENT"
                elif avg_time < 0.5:
                    grade = "🟡 GOOD"
                elif avg_time < 1.0:
                    grade = "🟠 ACCEPTABLE"
                else:
                    grade = "🔴 POOR"
                report.append(f"Grade: {grade}")
            
            report.append("")
        
        # Summary
        successful_tests = sum(1 for test in results['tests'].values() 
                             if 'error' not in test and test.get('error_rate_percent', 0) < 5)
        total_tests = len(results['tests'])
        
        report.append("📈 SUMMARY")
        report.append("-" * 20)
        report.append(f"Successful Tests: {successful_tests}/{total_tests}")
        report.append(f"Success Rate: {(successful_tests/total_tests)*100:.1f}%")
        
        if successful_tests == total_tests:
            report.append("🎉 All tests passed!")
        elif successful_tests > total_tests * 0.8:
            report.append("✅ Most tests passed")
        else:
            report.append("⚠️ Performance issues detected")
        
        return "\n".join(report)

async def main():
    """Ana test fonksiyonu"""
    if len(sys.argv) > 1:
        base_url = sys.argv[1]
    else:
        base_url = "http://localhost:8001"
    
    tester = LoadTester(base_url)
    
    # Run comprehensive tests
    results = await tester.run_comprehensive_test()
    
    # Generate report
    report = tester.generate_report(results)
    print(report)
    
    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"load_test_results_{timestamp}.json"
    report_file = f"load_test_report_{timestamp}.txt"
    
    with open(results_file, 'w') as f:
        json.dump(results, f, indent=2)
    
    with open(report_file, 'w') as f:
        f.write(report)
    
    print(f"\n💾 Results saved:")
    print(f"   - {results_file}")
    print(f"   - {report_file}")

if __name__ == "__main__":
    asyncio.run(main())
