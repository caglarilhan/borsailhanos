"use client";
import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface RefreshButtonProps {
  onClick?: () => void;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RefreshButton({ 
  onClick, 
  isLoading = false, 
  size = 'md',
  className = ''
}: RefreshButtonProps) {
  const sizeMap = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        ${sizeMap[size]} rounded-full 
        bg-accent/10 hover:bg-accent/30 
        border border-accent/20 hover:border-accent/40
        shadow-glow-smart hover:shadow-glow-smart
        transition-all duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        group
        ${className}
      `}
    >
      <ArrowPathIcon 
        className={`
          ${iconSizeMap[size]} text-accent
          transition-transform duration-300
          ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}
        `} 
      />
    </button>
  );
}

export default RefreshButton;

