import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hover?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.3,
  hover = true
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration }}
      whileHover={hover ? { 
        scale: 1.02,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      } : {}}
      className={clsx(className)}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1,
  className,
  prefix = '',
  suffix = ''
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={clsx(className)}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {value.toLocaleString()}
        </motion.span>
        {suffix}
      </motion.span>
    </motion.div>
  );
};

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  color?: 'electric' | 'neon' | 'red' | 'yellow';
  duration?: number;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({
  value,
  max = 100,
  className,
  color = 'electric',
  duration = 1
}) => {
  const percentage = (value / max) * 100;
  
  const getColorClass = () => {
    switch (color) {
      case 'electric': return 'bg-electric-500';
      case 'neon': return 'bg-neon-500';
      case 'red': return 'bg-red-500';
      case 'yellow': return 'bg-yellow-500';
      default: return 'bg-electric-500';
    }
  };

  return (
    <div className={clsx('w-full bg-gray-700 rounded-full h-2 overflow-hidden', className)}>
      <motion.div
        className={clsx('h-full rounded-full', getColorClass())}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration, ease: 'easeOut' }}
      />
    </div>
  );
};

interface AnimatedIconProps {
  icon: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon,
  className,
  delay = 0,
  hover = true
}) => {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={hover ? { 
        scale: 1.1, 
        rotate: 5,
        transition: { duration: 0.2 }
      } : {}}
      className={clsx(className)}
    >
      {icon}
    </motion.div>
  );
};

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
}

const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  className,
  delay = 0,
  duration = 0.5
}) => {
  const words = text.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={clsx(className)}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + index * 0.1, duration: 0.3 }}
          className="inline-block mr-1"
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

interface AnimatedChartProps {
  data: number[];
  className?: string;
  delay?: number;
  duration?: number;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({
  data,
  className,
  delay = 0,
  duration = 1
}) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue;

  return (
    <div className={clsx('flex items-end justify-between space-x-1', className)}>
      {data.map((value, index) => {
        const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
        
        return (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: `${height}%` }}
            transition={{ 
              delay: delay + index * 0.05, 
              duration: duration,
              ease: 'easeOut'
            }}
            className="flex-1 bg-gradient-electric rounded-t hover:bg-gradient-neon transition-colors duration-200"
          />
        );
      })}
    </div>
  );
};

interface AnimatedNotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}

const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  message,
  type,
  onClose,
  duration = 3000
}) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-neon-500/10 border-neon-500/20 text-neon-500';
      case 'error':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      case 'info':
        return 'bg-electric-500/10 border-electric-500/20 text-electric-500';
      default:
        return 'bg-gray-500/10 border-gray-500/20 text-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={clsx(
        'fixed top-4 right-4 z-50 p-4 rounded-lg border backdrop-blur-sm',
        'max-w-sm shadow-lg',
        getTypeStyles()
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export {
  AnimatedCard,
  AnimatedCounter,
  AnimatedProgressBar,
  AnimatedIcon,
  AnimatedText,
  AnimatedChart,
  AnimatedNotification
};

