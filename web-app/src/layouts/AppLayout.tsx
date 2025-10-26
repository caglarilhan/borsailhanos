import React from 'react';
import { clsx } from 'clsx';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <html lang="tr" className="dark">
      <head>
        <title>BIST AI Smart Trader</title>
        <meta name="description" content="AI-powered Turkish stock trading platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={clsx(
        "min-h-screen bg-gradient-graphite text-gray-100 font-sans antialiased",
        "selection:bg-electric-500/20 selection:text-electric-100"
      )}>
        <div className="min-h-screen bg-[#0B0C10] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,198,0.03),transparent_50%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(0,255,198,0.02)_50%,transparent_51%)] pointer-events-none" />
          
          {/* Main Content */}
          <main className="relative z-10">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="relative z-10 border-t border-white/10 bg-[rgba(11,12,16,0.8)] backdrop-blur-xl">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>BIST AI Smart Trader v3.7</span>
                  <span className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#00FFC6] animate-pulse"></div>
                    <span>System Online</span>
                  </span>
                </div>
                <div className="text-xs">
                  Last refresh: {new Date().toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};

export default AppLayout;

