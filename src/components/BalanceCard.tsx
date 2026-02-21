import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { TrendingUp, Banknote } from 'lucide-react';

interface BalanceCardProps {
  balance: number;
  withdrawableBalance: number;
  vipLevel: number;
  userName: string;
  phone?: string;
}

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone || '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  const lastNine = cleaned.slice(-9);
  return '+251' + lastNine.slice(0, 1) + '**' + lastNine.slice(-4);
};

export const BalanceCard: React.FC<BalanceCardProps> = ({ 
  balance, 
  withdrawableBalance, 
  vipLevel, 
  userName,
  phone = '',
}) => {
  const { t } = useLanguage();
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 p-6 text-white shadow-lg">
      {/* Enhanced wave patterns - more wavy and dynamic */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 200" preserveAspectRatio="none">
        {/* First wave layer - large waves */}
        <path
          d="M0,120 C50,140 100,100 150,120 C200,140 250,100 300,120 C350,140 400,120 400,120 L400,200 L0,200 Z"
          fill="currentColor"
          opacity="0.3"
        />
        {/* Second wave layer - medium waves */}
        <path
          d="M0,150 C70,170 140,130 210,150 C280,170 350,130 400,150 L400,200 L0,200 Z"
          fill="currentColor"
          opacity="0.2"
        />
        {/* Third wave layer - small waves */}
        <path
          d="M0,180 C60,190 120,170 180,180 C240,190 300,170 360,180 L400,190 L400,200 L0,200 Z"
          fill="currentColor"
          opacity="0.1"
        />
        {/* Additional wave patterns for more wavy effect */}
        <path
          d="M-50,100 C0,130 50,70 100,100 C150,130 200,70 250,100 C300,130 350,70 400,100 L450,120 L450,200 L-50,200 Z"
          fill="currentColor"
          opacity="0.15"
        />
      </svg>
      
      {/* Decorative circles with blue tint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      {/* Floating bubbles for extra wave effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-float"
            style={{
              width: `${15 + i * 8}px`,
              height: `${15 + i * 8}px`,
              left: `${5 + i * 20}%`,
              bottom: `${10 + i * 15}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${6 + i}s`,
            }}
          />
        ))}
      </div>
      
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30 backdrop-blur-sm">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white drop-shadow-md">{userName}</h2>
            <p className="text-sm text-white/80 drop-shadow">{maskPhone(phone)}</p>
          </div>
        </div>
        
        {vipLevel > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-sm font-bold text-white drop-shadow">VIP {vipLevel}</span>
          </div>
        )}
      </div>

      <div className="relative grid grid-cols-2 gap-4">
        <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-sm text-white/80 mb-1 drop-shadow">{t('Total Balance')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white drop-shadow-lg">
              {balance.toLocaleString()} ETB
            </span>
            <TrendingUp className="w-4 h-4 text-white/90" />
          </div>
        </div>
        <div className="backdrop-blur-sm bg-white/5 rounded-lg p-3 border border-white/10">
          <p className="text-sm text-white/80 mb-1 drop-shadow">{t('Withdrawable')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-green-300 drop-shadow-lg">
              {withdrawableBalance.toLocaleString()} ETB
            </span>
            <Banknote className="w-4 h-4 text-green-300/90" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-8px) translateX(4px);
          }
          50% {
            transform: translateY(-12px) translateX(-2px);
          }
          75% {
            transform: translateY(-4px) translateX(-6px);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};