import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  className 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={clsx(
      'min-h-screen bg-graphite-950 text-white',
      'font-sans antialiased',
      className
    )}>
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-gradient-graphite opacity-50" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_50%)]" />
      
      {/* Main Container */}
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out',
          'bg-graphite-950/95 backdrop-blur-xl border-r border-white/10',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:inset-0'
        )}>
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex h-16 items-center justify-center border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-electric flex items-center justify-center">
                  <span className="text-sm font-bold text-white">AI</span>
                </div>
                <span className="text-lg font-semibold text-white">BIST Trader</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-4">
              <a
                href="#"
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-electric-100 hover:bg-electric-500/20 hover:text-white transition-all duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Dashboard
              </a>
              <a
                href="#"
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-electric-500/20 hover:text-white transition-all duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Signals
              </a>
              <a
                href="#"
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-electric-500/20 hover:text-white transition-all duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Charts
              </a>
              <a
                href="#"
                className="group flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-300 hover:bg-electric-500/20 hover:text-white transition-all duration-200"
              >
                <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Lab
              </a>
            </nav>

            {/* System Status */}
            <div className="border-t border-white/10 p-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
                <span className="text-xs text-gray-400">System Online</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col lg:ml-0">
          {/* Top Bar */}
          <header className="flex h-16 items-center justify-between border-b border-white/10 bg-graphite-950/95 backdrop-blur-xl px-4 lg:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-300 hover:text-white transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-white">AI Trading Dashboard</h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Live Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-neon-500 animate-pulse-electric"></div>
                <span className="text-sm text-gray-300">Live Data</span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-electric flex items-center justify-center">
                  <span className="text-sm font-medium text-white">U</span>
                </div>
                <span className="text-sm text-gray-300">User</span>
              </div>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;