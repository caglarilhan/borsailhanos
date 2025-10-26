import React from 'react';
import { clsx } from 'clsx';

interface NeonCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'neon' | 'gold' | 'success';
  hover?: boolean;
}

const NeonCard: React.FC<NeonCardProps> = ({ 
  children, 
  className, 
  glowColor = 'cyan',
  hover = true 
}) => {
  const glowClasses = {
    cyan: 'shadow-glow-cyan hover:shadow-[0_0_30px_rgba(0,224,255,0.4)]',
    neon: 'shadow-glow-neon hover:shadow-[0_0_30px_rgba(0,255,198,0.4)]',
    gold: 'shadow-glow-gold hover:shadow-[0_0_30px_rgba(255,182,0,0.4)]',
    success: 'shadow-glow-success hover:shadow-[0_0_30px_rgba(0,255,136,0.4)]'
  };

  return (
    <div 
      className={clsx(
        'bg-[rgba(25,25,25,0.65)] backdrop-blur-xl',
        'border border-[rgba(255,255,255,0.05)]',
        'rounded-2xl p-6',
        'transition-all duration-300 ease-out',
        hover && 'hover:border-[rgba(0,224,255,0.3)] hover:scale-[1.02]',
        glowClasses[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
};

export default NeonCard;


