'use client';

import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onTabChange, className = '' }: TabsProps) {
  return (
    <div className={`flex gap-2 border-b border-slate-200 mb-4 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'border-blue-600 text-blue-700 bg-blue-50'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
          }`}
          title={`${tab.label} sekmesine geç`}
          aria-label={tab.label}
        >
          {tab.icon && <span className="mr-1">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}

