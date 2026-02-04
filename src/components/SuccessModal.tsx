import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  
  if (!isOpen) return null;

  // Auto-detect error messages
  const isErrorMessage = isError || 
    message.toLowerCase().includes('error') ||
    message.toLowerCase().includes('failed') ||
    message.toLowerCase().includes('invalid') ||
    message.toLowerCase().includes('insufficient') ||
    message.toLowerCase().includes('do not match') ||
    message.toLowerCase().includes('must be');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-xl w-64 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gray-100 py-3 px-4 border-b border-gray-200">
          <h3 className="text-center text-gray-800 font-medium text-base">{t('Tips')}</h3>
        </div>
        
        {/* Content */}
        <div className="py-6 px-4">
          <p className={`text-center text-base ${isErrorMessage ? 'text-red-600' : 'text-gray-700'}`}>
            {message}
          </p>
        </div>
        
        {/* Button */}
        <div className="px-4 pb-4">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-medium rounded transition-colors"
          >
            {t('OK')}
          </button>
        </div>
      </div>
    </div>
  );
};
