'use client';

import React from 'react';
import { 
  HomeIcon,
  SparklesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { useAppStore } from '@/store/store';

const NavigationBar: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'signals', label: 'AI Sinyalleri', icon: SparklesIcon },
    { id: 'analysis', label: 'Analiz', icon: ChartBarIcon },
    { id: 'operations', label: 'Operasyon', icon: Cog6ToothIcon },
    { id: 'advanced', label: 'Gelişmiş', icon: CpuChipIcon },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-bg/95 backdrop-blur-xl border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold text-accent">
              Borsailhanos AI Smart Trader
            </h1>
            <span className="text-sm text-text/60">v3.4 Hybrid</span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-semibold
                    transition-all duration-200 hover:scale-105
                    ${
                      isActive
                        ? 'bg-accent/20 text-accent border border-accent/30 shadow-glow-smart'
                        : 'text-text/70 hover:text-text hover:bg-white/5'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
