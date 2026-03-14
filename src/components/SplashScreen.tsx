import React, { useEffect } from 'react';
import dswLogo from '@/assets/dsw-logo.png';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Auto-hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image - Full screen */}
      <div className="absolute inset-0">
        <img 
          src={dswLogo} 
          alt="DSW Logo" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* TESLA Name and Loading dots - centered over image */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
        <h1 className="text-5xl font-bold text-white mb-6 tracking-wider drop-shadow-lg">TESLA</h1>
        
        {/* Loading dots - Binance style */}
        <div className="flex space-x-4">
          <div className="h-3 w-3 animate-pulse rounded-full bg-white [animation-delay:-0.3s] drop-shadow-lg"></div>
          <div className="h-3 w-3 animate-pulse rounded-full bg-white [animation-delay:-0.15s] drop-shadow-lg"></div>
          <div className="h-3 w-3 animate-pulse rounded-full bg-white drop-shadow-lg"></div>
        </div>
      </div>

      {/* Version number - subtle overlay */}
      <p className="absolute bottom-4 text-white/60 text-xs drop-shadow-md">
        Version 1.0.0
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
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