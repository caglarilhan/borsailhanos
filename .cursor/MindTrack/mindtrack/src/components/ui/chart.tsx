import { ResponsiveContainer } from 'recharts';
import { Suspense } from 'react';

interface ChartProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export function Chart({ children, className, fallback }: ChartProps) {
  const defaultFallback = (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse bg-gray-200 rounded-lg h-8 w-24 mx-auto mb-2"></div>
        <div className="animate-pulse bg-gray-200 rounded-lg h-6 w-32 mx-auto"></div>
      </div>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={350} className={className}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ResponsiveContainer>
  );
}
