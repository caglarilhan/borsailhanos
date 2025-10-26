import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ 
  title, 
  subtitle, 
  icon, 
  className = '' 
}: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center gap-3 mb-2">
        {icon && (
          <div className="text-accent">
            {icon}
          </div>
        )}
        <h2 className="text-xl font-bold text-accent border-l-4 border-accent pl-3">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-text/60 text-sm ml-7">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default SectionHeader;

