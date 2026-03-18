import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Check, AlertCircle, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  title?: string;
  isError?: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showCloseButton?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message = 'Success',
  title,
  isError = false,
  type = 'success',
  duration = 3000,
  showCloseButton = true
}) => {
  const { t } = useLanguage();
  const [showIcon, setShowIcon] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Determine modal type based on props
  const modalType = isError ? 'error' : type;
  
  // Auto-detect error/warning messages
  const detectedType = (() => {
    const msg = message.toLowerCase();
    if (msg.includes('error') || msg.includes('failed') || msg.includes('invalid') || msg.includes('insufficient')) {
      return 'error';
    }
    if (msg.includes('warning') || msg.includes('careful') || msg.includes('attention')) {
      return 'warning';
    }
    if (msg.includes('info') || msg.includes('note')) {
      return 'info';
    }
    return modalType;
  })();

  const finalType = detectedType;

  // Configuration for different modal types
  const config = {
    success: {
      icon: CheckCircle,
      bgGradient: 'from-emerald-500 to-green-500',
      lightBg: 'bg-emerald-50',
      border: 'border-emerald-200',
      textColor: 'text-emerald-700',
      iconColor: 'text-emerald-500',
      title: title || t('Success')
    },
    error: {
      icon: XCircle,
      bgGradient: 'from-rose-500 to-red-500',
      lightBg: 'bg-rose-50',
      border: 'border-rose-200',
      textColor: 'text-rose-700',
      iconColor: 'text-rose-500',
      title: title || t('Error')
    },
    warning: {
      icon: AlertTriangle,
      bgGradient: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50',
      border: 'border-amber-200',
      textColor: 'text-amber-700',
      iconColor: 'text-amber-500',
      title: title || t('Warning')
    },
    info: {
      icon: Info,
      bgGradient: 'from-blue-500 to-indigo-500',
      lightBg: 'bg-blue-50',
      border: 'border-blue-200',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-500',
      title: title || t('Information')
    }
  };

  const currentConfig = config[finalType];
  const IconComponent = currentConfig.icon;

  // Auto-close after duration
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  // Animation on open
  useEffect(() => {
    if (isOpen) {
      setShowIcon(false);
      setIsExiting(false);
      const timer = setTimeout(() => setShowIcon(true), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExiting(false);
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isExiting ? 'opacity-0' : 'opacity-100'
        }`} 
        onClick={handleClose} 
      />
      
      {/* Modal */}
      <div 
        className={`relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isExiting ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          animation: 'modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        {/* Top gradient bar */}
        <div className={`h-2 w-full bg-gradient-to-r ${currentConfig.bgGradient}`} />

        {/* Close button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10 group"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        )}

        {/* Icon with animated background */}
        <div className="flex justify-center pt-8 pb-2">
          <div className="relative">
            {/* Pulsing ring animation */}
            {!showIcon && (
              <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-gray-400" />
            )}
            
            {/* Main icon container */}
            <div 
              className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
                finalType === 'success' ? 'bg-emerald-50' :
                finalType === 'error' ? 'bg-rose-50' :
                finalType === 'warning' ? 'bg-amber-50' :
                'bg-blue-50'
              }`}
            >
              {/* Animated rings */}
              {showIcon && (
                <>
                  <div className={`absolute inset-0 rounded-full animate-pulse opacity-30 ${
                    finalType === 'success' ? 'bg-emerald-400' :
                    finalType === 'error' ? 'bg-rose-400' :
                    finalType === 'warning' ? 'bg-amber-400' :
                    'bg-blue-400'
                  }`} />
                  <div className={`absolute inset-2 rounded-full animate-pulse opacity-20 ${
                    finalType === 'success' ? 'bg-emerald-300' :
                    finalType === 'error' ? 'bg-rose-300' :
                    finalType === 'warning' ? 'bg-amber-300' :
                    'bg-blue-300'
                  }`} style={{ animationDelay: '0.2s' }} />
                </>
              )}
              
              {/* Icon */}
              <IconComponent 
                className={`w-10 h-10 transition-all duration-300 ${
                  finalType === 'success' ? 'text-emerald-500' :
                  finalType === 'error' ? 'text-rose-500' :
                  finalType === 'warning' ? 'text-amber-500' :
                  'text-blue-500'
                }`}
                style={{
                  animation: showIcon ? 'iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
                }}
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Title */}
        {currentConfig.title && (
          <h3 className={`text-center text-lg font-semibold mt-4 ${
            finalType === 'success' ? 'text-emerald-700' :
            finalType === 'error' ? 'text-rose-700' :
            finalType === 'warning' ? 'text-amber-700' :
            'text-blue-700'
          }`}>
            {currentConfig.title}
          </h3>
        )}

        {/* Message */}
        <div className="py-4 px-6">
          <p className={`text-center text-sm leading-relaxed ${
            finalType === 'success' ? 'text-gray-600' :
            finalType === 'error' ? 'text-rose-600' :
            finalType === 'warning' ? 'text-amber-600' :
            'text-blue-600'
          }`}>
            {message}
          </p>
        </div>
        
        {/* Action Button */}
        <div className="px-6 pb-6">
          <button
            onClick={handleClose}
            className={`w-full py-3 px-4 rounded-xl text-white font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl ${
              finalType === 'success' ? 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600' :
              finalType === 'error' ? 'bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600' :
              finalType === 'warning' ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' :
              'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
            }`}
          >
            {t('OK')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalSlideIn {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes iconPop {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-90deg);
          }
          50% {
            transform: scale(1.2) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes ringPulse {
          0% {
            transform: scale(0.95);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.2;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.5;
          }
        }

        .animate-modal-slide {
          animation: modalSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-icon-pop {
          animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  );
};