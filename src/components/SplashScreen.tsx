import React, { useEffect } from 'react';
import dswLogo from '@/assets/dsw-logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Auto-hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
      {/* Main content - full screen image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={dswLogo} 
          alt="DSW Logo" 
          className="w-full h-full object-contain p-8"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      {/* TESLA Name and Loading dots - centered */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-4 tracking-wider">TESLA</h1>
        
        {/* Loading dots - Binance style */}
        <div className="flex space-x-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/60 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-white/80 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-pulse rounded-full bg-white"></div>
        </div>
      </div>

      {/* Version number */}
      <p className="absolute bottom-4 text-white/30 text-xs">
        Version 1.0.0
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-pulse {
          animation: pulse 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;