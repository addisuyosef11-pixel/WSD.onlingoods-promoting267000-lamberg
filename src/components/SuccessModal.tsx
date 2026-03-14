import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X, Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  isError?: boolean;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  message = 'Success',
  isError = false
}) => {
  const { t } = useLanguage();
  const [showIcon, setShowIcon] = useState(false);

  // Auto-detect error messages
  const isErrorMessage = isError || 
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('failed') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('insufficient') ||
    message.toLowerCase().includes('do not match') ||
    message.toLowerCase().includes('must be');

  useEffect(() => {
    if (isOpen) {
      setShowIcon(false);
      const timer = setTimeout(() => setShowIcon(true), 600);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-72 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gray-100 py-3 px-4 border-b border-gray-200">
          <h3 className="text-center text-gray-800 font-medium text-base">{t('Tips')}</h3>
        </div>
        
        {/* Icon Area */}
        <div className="flex justify-center pt-6 pb-2">
          <div className="relative w-16 h-16">
            {/* Smooth spinning ring */}
            {!showIcon && (
              <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke={isErrorMessage ? '#ef4444' : '#6b7280'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="120 60"
                />
              </svg>
            )}
            
            {/* Result icon */}
            {showIcon && (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isErrorMessage 
                  ? 'bg-red-50 border-2 border-red-200' 
                  : 'bg-gray-50 border-2 border-gray-200'
              }`}
              style={{ animation: 'pop-in 0.3s ease-out' }}
              >
                {isErrorMessage ? (
                  <X className="w-8 h-8 text-red-500" strokeWidth={2.5} />
                ) : (
                  <Check className="w-8 h-8 text-gray-500" strokeWidth={2.5} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="py-3 px-5">
          <p className={`text-center text-sm leading-relaxed ${isErrorMessage ? 'text-red-600' : 'text-gray-700'}`}>
            {message}
          </p>
        </div>
        
        {/* Button */}
        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {t('OK')}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pop-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scale-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};
