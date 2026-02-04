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
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 p-6 text-white shadow-lg">
      {/* Wave patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 200" preserveAspectRatio="none">
        <path
          d="M0,100 C100,150 200,50 300,100 C350,125 400,100 400,100 L400,200 L0,200 Z"
          fill="currentColor"
        />
        <path
          d="M0,120 C80,170 180,80 280,130 C340,160 400,120 400,120 L400,200 L0,200 Z"
          fill="currentColor"
          opacity="0.5"
        />
      </svg>
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-2 border-white/30">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">{userName}</h2>
            <p className="text-sm text-white/70">{maskPhone(phone)}</p>
          </div>
        </div>
        
        {vipLevel > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20">
            <span className="text-sm font-bold text-white">VIP {vipLevel}</span>
          </div>
        )}
      </div>

      <div className="relative grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-white/70 mb-1">{t('Total Balance')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-white">
              {balance.toLocaleString()} ETB
            </span>
            <TrendingUp className="w-4 h-4 text-white/70" />
          </div>
        </div>
        <div>
          <p className="text-sm text-white/70 mb-1">{t('Withdrawable')}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-bold text-green-400">
              {withdrawableBalance.toLocaleString()} ETB
            </span>
            <Banknote className="w-4 h-4 text-green-400/70" />
          </div>
        </div>
      </div>
    </div>
  );
};
