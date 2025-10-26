import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'neon' | 'gold' | 'electric';
  delay?: number;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  glowColor = 'cyan', 
  delay = 0,
  hover = true 
}) => {
  const glowClass = {
    'cyan': 'shadow-glow-cyan',
    'neon': 'shadow-glow-neon', 
    'gold': 'shadow-glow-gold',
    'electric': 'shadow-glow-electric',
  }[glowColor];

  return (
    <div
      className={clsx(
        "glass-graphite rounded-xl shadow-2xl border border-white/10 p-6 relative overflow-hidden",
        glowClass,
        hover && "hover:scale-[1.02] hover:shadow-glow-cyan transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;
