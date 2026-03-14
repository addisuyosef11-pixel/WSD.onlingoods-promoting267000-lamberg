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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700">
      {/* Animated background waves */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <svg
          className="absolute bottom-0 left-0 w-full animate-wave-slow"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: '60%' }}
        >
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,181.3C672,181,768,203,864,213.3C960,224,1056,224,1152,197.3C1248,171,1344,117,1392,90.7L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 w-full animate-wave-medium"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={{ height: '70%' }}
        >
          <path
            fill="#ffffff"
            fillOpacity="0.2"
            d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated logo container */}
        <div className="relative">
          {/* Pulsing rings */}
          <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />
          <div className="absolute inset-0 animate-pulse rounded-full bg-white/20" style={{ animationDelay: '0.3s' }} />
          
          {/* Logo with bounce animation */}
          <div className="animate-bounce-slow">
            <img 
              src={dswLogo} 
              alt="DSW Logo" 
              className="w-32 h-32 object-contain rounded-2xl shadow-2xl border-4 border-white/30"
            />
          </div>
        </div>
        
        {/* App name with fade-in */}
        <h1 className="mt-6 text-4xl font-bold text-white animate-fade-in drop-shadow-lg">
          DSW
        </h1>
        
        {/* Tagline */}
        <p className="mt-2 text-white/80 text-sm animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Digital Smart Work
        </p>
        
        {/* Loading dots */}
        <div className="mt-8 flex space-x-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-white [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-white [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 animate-bounce rounded-full bg-white"></div>
        </div>
      </div>

      {/* Version number */}
      <p className="absolute bottom-8 text-white/40 text-xs animate-fade-in">
        Version 1.0.0
      </p>

      <style>{`
        @keyframes wave-slow {
          0%, 100% { transform: translateX(0) scaleX(1.2); }
          50% { transform: translateX(-15px) scaleX(1.2); }
        }
        @keyframes wave-medium {
          0%, 100% { transform: translateX(0) scaleX(1.1); }
          50% { transform: translateX(10px) scaleX(1.1); }
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-wave-slow {
          animation: wave-slow 8s ease-in-out infinite;
        }
        .animate-wave-medium {
          animation: wave-medium 6s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;