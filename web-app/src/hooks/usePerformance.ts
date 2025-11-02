/**
 * Performance Profiling Hook
 */

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  mountTime: number;
  updateCount: number;
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });
  const mountTimeRef = useRef<number>(0);
  const renderStartRef = useRef<number>(0);
  const updateCountRef = useRef<number>(0);

  useEffect(() => {
    mountTimeRef.current = performance.now();
    return () => {
      const mountTime = performance.now() - mountTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName} mount time: ${mountTime.toFixed(2)}ms`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    renderStartRef.current = performance.now();
    updateCountRef.current += 1;
    
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStartRef.current;
      setMetrics({
        renderTime,
        mountTime: performance.now() - mountTimeRef.current,
        updateCount: updateCountRef.current,
      });
      
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`[Performance] ${componentName} slow render: ${renderTime.toFixed(2)}ms (>16ms)`);
      }
    });
  });

  return metrics;
}

