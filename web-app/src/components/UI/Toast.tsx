"use client";
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
  visible?: boolean;
}

export function Toast({ 
  message, 
  type = 'info', 
  duration = 5000,
  onClose,
  visible = true
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const typeConfig = {
    success: {
      icon: <CheckCircleIcon className="w-5 h-5 text-success" />,
      bg: 'bg-success/10',
      border: 'border-success/30',
      text: 'text-success'
    },
    error: {
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-danger" />,
      bg: 'bg-danger/10',
      border: 'border-danger/30',
      text: 'text-danger'
    },
    warning: {
      icon: <ExclamationTriangleIcon className="w-5 h-5 text-warning" />,
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      text: 'text-warning'
    },
    info: {
      icon: <InformationCircleIcon className="w-5 h-5 text-accent" />,
      bg: 'bg-accent/10',
      border: 'border-accent/30',
      text: 'text-accent'
    }
  };

  const config = typeConfig[type];

  if (!isVisible) return null;

  return (
    <div className={`
      fixed bottom-6 right-6 z-50
      ${config.bg} ${config.border} border
      backdrop-blur-glass rounded-xl
      shadow-glow-smart
      p-4 max-w-sm
      transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        <div className="flex-1">
          <p className={`text-sm font-medium ${config.text}`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-text/50 hover:text-text transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Manager for global usage
interface ToastManagerProps {
  toasts: Array<ToastProps & { id: string }>;
  onRemove: (id: string) => void;
}

export function ToastManager({ toasts, onRemove }: ToastManagerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}

export default Toast;


