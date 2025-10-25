import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon
} from '@heroicons/react/24/outline';

interface LoadingStateProps {
  type?: 'signals' | 'prices' | 'general';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingState: React.FC<LoadingStateProps> = ({ 
  type = 'general', 
  message, 
  size = 'md' 
}) => {
  const getLoadingConfig = () => {
    switch (type) {
      case 'signals':
        return {
          icon: <ChartBarIcon className="w-8 h-8 text-blue-600" />,
          title: 'AI Sinyalleri Yükleniyor',
          description: 'Yapay zeka modelleri analiz yapıyor...',
          defaultMessage: message || 'Sinyaller hazırlanıyor, lütfen bekleyin.'
        };
      case 'prices':
        return {
          icon: <ArrowTrendingUpIcon className="w-8 h-8 text-green-600" />,
          title: 'Fiyat Verileri Yükleniyor',
          description: 'Piyasa verileri güncelleniyor...',
          defaultMessage: message || 'Fiyat verileri alınıyor.'
        };
      default:
        return {
          icon: <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />,
          title: 'Yükleniyor',
          description: 'Veriler hazırlanıyor...',
          defaultMessage: message || 'Lütfen bekleyin.'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'py-4',
          spinner: 'h-8 w-8',
          title: 'text-lg',
          description: 'text-sm'
        };
      case 'lg':
        return {
          container: 'py-12',
          spinner: 'h-16 w-16',
          title: 'text-2xl',
          description: 'text-lg'
        };
      default:
        return {
          container: 'py-8',
          spinner: 'h-12 w-12',
          title: 'text-xl',
          description: 'text-base'
        };
    }
  };

  const config = getLoadingConfig();
  const sizeClasses = getSizeClasses();

  return (
    <div className={`text-center ${sizeClasses.container}`}>
      {/* Animated Icon */}
      <div className="flex justify-center mb-4">
        <div className="relative">
          {config.icon}
          <div className={`absolute inset-0 ${sizeClasses.spinner} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`}></div>
        </div>
      </div>

      {/* Loading Text */}
      <div className="space-y-2">
        <h3 className={`font-semibold text-gray-900 ${sizeClasses.title}`}>
          {config.title}
        </h3>
        <p className={`text-gray-600 ${sizeClasses.description}`}>
          {config.defaultMessage}
        </p>
        {config.description && (
          <p className="text-sm text-gray-500">
            {config.description}
          </p>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
};

export default LoadingState;
