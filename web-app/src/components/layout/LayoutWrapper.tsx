'use client';

import React, { useEffect } from 'react';
import NavigationBar from './NavigationBar';
import { useAppStore } from '@/store/store';
import DashboardModule from '@/components/modules/DashboardModule';
import SignalsModule from '@/components/modules/SignalsModule';
import AnalysisModule from '@/components/modules/AnalysisModule';
import OperationsModule from '@/components/modules/OperationsModule';
import AdvancedModule from '@/components/modules/AdvancedModule';

interface LayoutWrapperProps {
  children?: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { activeTab, setMetrics, setSignals, setIsLoading } = useAppStore();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      
      try {
        // Fetch metrics
        const metricsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/metrics`);
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json();
          setMetrics(metricsData);
        }

        // Fetch signals
        const signalsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/signals`);
        if (signalsResponse.ok) {
          const signalsData = await signalsResponse.json();
          setSignals(signalsData.signals || []);
        }
      } catch (error) {
        console.error('❌ Error fetching initial data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchInitialData, 30000);
    return () => clearInterval(interval);
  }, [setMetrics, setSignals, setIsLoading]);

  // Render module based on active tab
  const renderModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardModule />;
      case 'signals':
        return <SignalsModule />;
      case 'analysis':
        return <AnalysisModule />;
      case 'operations':
        return <OperationsModule />;
      case 'advanced':
        return <AdvancedModule />;
      default:
        return <DashboardModule />;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans">
      <NavigationBar />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderModule()}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-text/50 text-sm">
        <p>Borsailhanos AI Smart Trader v3.4 Hybrid Fix Edition • Production Ready</p>
      </footer>
    </div>
  );
};

export default LayoutWrapper;
