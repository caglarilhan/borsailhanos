'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface HoverCardProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function HoverCard({ 
  trigger, 
  content, 
  side = 'bottom',
  delay = 300,
  className = '' 
}: HoverCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showCard = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      updatePosition();
    }, delay);
  };

  const hideCard = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !cardRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = 0;
    let left = 0;
    const gap = 8;

    switch (side) {
      case 'top':
        top = triggerRect.top + scrollTop - cardRect.height - gap;
        left = triggerRect.left + scrollLeft + (triggerRect.width - cardRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + scrollTop + gap;
        left = triggerRect.left + scrollLeft + (triggerRect.width - cardRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + scrollTop + (triggerRect.height - cardRect.height) / 2;
        left = triggerRect.left + scrollLeft - cardRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + scrollTop + (triggerRect.height - cardRect.height) / 2;
        left = triggerRect.right + scrollLeft + gap;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 8) left = 8;
    if (left + cardRect.width > viewportWidth) left = viewportWidth - cardRect.width - 8;
    if (top < 8) top = 8;
    if (top + cardRect.height > viewportHeight) top = viewportHeight - cardRect.height - 8;

    setPosition({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, side]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showCard}
        onMouseLeave={hideCard}
        className="inline-block"
      >
        {trigger}
      </div>
      
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          ref={cardRef}
          className={`fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 min-w-[200px] max-w-[300px] transition-opacity duration-200 ${className}`}
          style={{
            top: position.top,
            left: position.left,
            opacity: isVisible ? 1 : 0
          }}
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}

