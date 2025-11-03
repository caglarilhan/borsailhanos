/**
 * Tooltip Component
 * Sprint 5: UI/UX - Tooltip bileşeni
 * Hover'da açıklama gösterir
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ text, children, position = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && tooltipRef.current && triggerRef.current) {
      const tooltip = tooltipRef.current;
      const trigger = triggerRef.current;
      const rect = trigger.getBoundingClientRect();

      // Position calculation
      switch (position) {
        case 'top':
          tooltip.style.bottom = `${rect.height + 8}px`;
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';
          break;
        case 'bottom':
          tooltip.style.top = `${rect.height + 8}px`;
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';
          break;
        case 'left':
          tooltip.style.right = `${rect.width + 8}px`;
          tooltip.style.top = '50%';
          tooltip.style.transform = 'translateY(-50%)';
          break;
        case 'right':
          tooltip.style.left = `${rect.width + 8}px`;
          tooltip.style.top = '50%';
          tooltip.style.transform = 'translateY(-50%)';
          break;
      }
    }
  }, [isVisible, position]);

  return (
    <div
      ref={triggerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 px-3 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${
            position === 'top' ? 'bottom-full mb-2' :
            position === 'bottom' ? 'top-full mt-2' :
            position === 'left' ? 'right-full mr-2' :
            'left-full ml-2'
          }`}
        >
          {text}
          <div
            className={`absolute w-2 h-2 bg-slate-900 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
}
