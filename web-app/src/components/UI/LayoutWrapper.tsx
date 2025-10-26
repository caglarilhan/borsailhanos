import React from 'react';

interface LayoutWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function LayoutWrapper({ 
  children, 
  className = '' 
}: LayoutWrapperProps) {
  return (
    <div className={`
      min-h-screen bg-bg text-text font-sans
      ${className}
    `}>
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {children}
      </div>
    </div>
  );
}


