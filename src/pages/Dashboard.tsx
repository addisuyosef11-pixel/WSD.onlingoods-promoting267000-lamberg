import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
<<<<<<< HEAD
=======
import { DepositModal } from '@/components/DepositModal';
import { WithdrawModal } from '@/components/WithdrawModal';
import { GiftModal } from '@/components/GiftModal';
import { SuccessModal } from '@/components/SuccessModal';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { TelegramModal } from '@/components/TelegramModal';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
import { BottomNavigation } from '@/components/BottomNavigation';
import VipCarousel from '@/components/VipCarousel';
import AboutSection from '@/components/AboutSection';
import { Spinner } from '@/components/Spinner';
<<<<<<< HEAD
import { SuccessModal } from '@/components/SuccessModal';
import { GiftModal } from '@/components/GiftModal';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { TelegramModal } from '@/components/TelegramModal';
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

import dswLogo from '@/assets/dsw-logo.png';
import withdrawImage from '@/assets/withdraw.png';
import depositImage from '@/assets/deposit.png';
import giftCodeImage from '@/assets/gift-code.png';
import addsImage from '@/assets/adds.png';
import walletImage from '@/assets/wallet_1.png';
import customerServiceImage from '@/assets/custumer_service.png';
import { 
  MessageCircle, Send, Users, ExternalLink, X, 
  Sparkles, TrendingUp, Award, Eye, EyeOff,
<<<<<<< HEAD
  Calendar, ArrowLeft, CreditCard, History
=======
  Calendar
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
} from 'lucide-react';

interface VipLevel {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  series?: string;
  daily_income?: number;
  cycle_days?: number;
  total_income?: number;
  purchase_limit?: number;
}

<<<<<<< HEAD
// Telegram Channel Data
=======
// Telegram Channel Data with updated username
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
const telegramChannels = [
  { label: 'Official Support', url: 'https://t.me/DSWonline_suport', handle: '@DSWonline_suport' },
  { label: 'Public Channel', url: 'https://t.me/etonlinejob1', handle: 'DSW Channel' },
  { label: 'Discussion Group', url: 'https://t.me/+Jihv4uEOv0o0M2U0', handle: 'DSW Group' },
];

// Loading Overlay Component
const LoadingOverlay = ({ message = "Processing..." }: { message?: string }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-6 shadow-xl flex flex-col items-center gap-3">
      <Spinner />
      <p className="text-gray-700 font-medium">{message}</p>
    </div>
  </div>
);

<<<<<<< HEAD
// Enhanced Balance Card with green theme
=======
// Enhanced Balance Card with Telebirr-style design and wave patterns
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
const EnhancedBalanceCard = ({ 
  balance, 
  withdrawableBalance,
  dailyIncome,
  timeUntilNextTransfer
}: { 
  balance: number; 
  withdrawableBalance: number;
  dailyIncome?: number;
  timeUntilNextTransfer?: string;
}) => {
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawable, setShowWithdrawable] = useState(true);
  const [showDailyIncome, setShowDailyIncome] = useState(true);

<<<<<<< HEAD
  return (
    <div className="relative overflow-hidden rounded-xl shadow-lg" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-10 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
=======
  const formatBalance = (value: number, show: boolean) => {
    if (show) {
      return value.toLocaleString() + ' ETB';
    }
    return '**** ETB';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-lg" style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}>
      {/* Filled wave patterns like Profile page */}
      <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0,120 C100,170 200,70 300,120 C350,145 400,120 400,120 L400,300 L0,300 Z" fill="white" />
        <path d="M0,160 C80,210 180,110 280,170 C340,200 400,160 400,160 L400,300 L0,300 Z" fill="white" opacity="0.5" />
      </svg>
      
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-10 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 p-5">
        {/* Header with larger wallet image */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              <img src={walletImage} alt="Wallet" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-medium text-lg">My Wallet</span>
          </div>
        </div>

<<<<<<< HEAD
        {/* Main Balance */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-white/80">Main Balance</span>
=======
        {/* Main Balance - centered with eye toggle inside */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-white/80">Main Balance (ETB)</span>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              {showBalance ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
            </button>
          </div>
<<<<<<< HEAD
          <p className="text-3xl font-bold text-white">
=======
          <p className="text-4xl font-bold text-white tracking-wider">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            {showBalance ? balance.toLocaleString() : '****'}
            <span className="text-base font-normal text-white/70 ml-2">ETB</span>
          </p>
        </div>

<<<<<<< HEAD
        {/* Withdrawable Balance */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
=======
        {/* Withdrawable Balance - designed like main balance (no background rectangle) */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-1">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            <span className="text-sm text-white/80">Withdrawable Balance</span>
            <button onClick={() => setShowWithdrawable(!showWithdrawable)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              {showWithdrawable ? <Eye className="w-3.5 h-3.5 text-white" /> : <EyeOff className="w-3.5 h-3.5 text-white" />}
            </button>
          </div>
          <p className="text-2xl font-bold text-white">
            {showWithdrawable ? withdrawableBalance.toLocaleString() : '****'}
            <span className="text-sm font-normal text-white/60 ml-1">ETB</span>
          </p>
        </div>

<<<<<<< HEAD
        {/* Today's Income */}
        {dailyIncome !== undefined && dailyIncome > 0 && (
          <div className="pt-3 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="text-sm text-white/80">Today's Income:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {showDailyIncome ? dailyIncome.toLocaleString() : '****'} ETB
                </span>
                <button onClick={() => setShowDailyIncome(!showDailyIncome)} className="p-0.5 hover:bg-white/10 rounded">
                  {showDailyIncome ? <Eye className="w-3 h-3 text-white/80" /> : <EyeOff className="w-3 h-3 text-white/80" />}
                </button>
              </div>
            </div>
            {timeUntilNextTransfer && (
              <p className="text-xs text-white/60 mt-1">⏳ Next transfer in {timeUntilNextTransfer}</p>
=======
        {/* Today's Income - simple text line */}
        {dailyIncome !== undefined && dailyIncome > 0 && (
          <div className="text-center pt-3 border-t border-white/20">
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-white/80" />
              <span className="text-sm text-white/80">Today's Income:</span>
              <span className="text-sm font-bold text-yellow-300">
                {showDailyIncome ? dailyIncome.toLocaleString() : '****'} ETB
              </span>
              <button onClick={() => setShowDailyIncome(!showDailyIncome)} className="p-0.5 hover:bg-white/10 rounded">
                {showDailyIncome ? <Eye className="w-3 h-3 text-white/80" /> : <EyeOff className="w-3 h-3 text-white/80" />}
              </button>
            </div>
            {timeUntilNextTransfer && (
              <p className="text-[10px] text-white/60 mt-1">⏳ Next transfer in {timeUntilNextTransfer}</p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            )}
          </div>
        )}
      </div>
<<<<<<< HEAD
=======

      {/* Bottom wave separator */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: '20px' }}>
        <path d="M0,20 C360,40 720,0 1080,25 C1260,32 1380,15 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
      </svg>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  );
};

<<<<<<< HEAD
// Action Button with green theme
const ActionButton = ({ 
  image, 
  label, 
  onClick,
  isLoading = false
=======
// Enhanced Action Button with border line like Profile page cards - Spinner removed
const EnhancedActionButton = ({ 
  image, 
  label, 
  onClick,
  bgColor = 'bg-white',
  isLoading = false,
  borderColor = '#B0FC38'
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
}: { 
  image: string; 
  label: string; 
  onClick: () => void;
<<<<<<< HEAD
  isLoading?: boolean;
=======
  bgColor?: string;
  isLoading?: boolean;
  borderColor?: string;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
<<<<<<< HEAD
    className="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-white border-2 border-[#e2e8e2] hover:border-[#7acc00] transition-all disabled:opacity-50 shadow-sm"
  >
    <img src={image} alt={label} className="w-10 h-10 object-contain" />
    <span className="text-sm font-medium text-[#2d3a2d]">{isLoading ? 'Please wait...' : label}</span>
  </button>
);

// Welcome Banner Component
const WelcomeBanner = () => {
=======
    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2"
    style={{ borderColor: borderColor }}
  >
    <img src={image} alt={label} className="w-10 h-10 object-contain" />
    <span className="text-sm font-bold text-gray-700">{isLoading ? 'Please wait...' : label}</span>
  </button>
);

// Welcome Banner Component (unchanged)
const WelcomeBanner = () => {
  // Array of messages to scroll
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const messages = [
    "🚀 Welcome to Digital Smart Work!",
    "💰 Increase Your Salary Through Smart Investments",
    "🏆 Invest in Gold, AirPods & Crypto Products",
    "💎 Start Earning Passive Income Today",
    "📈 Your Financial Freedom Starts Here",
<<<<<<< HEAD
  ];

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-[#7acc00] to-[#B0FC38] shadow-lg">
      <div className="relative flex items-center p-3">
        <div className="flex-shrink-0">
          <img src={addsImage} alt="DSW Promo" className="w-14 h-14 object-contain" />
        </div>
        <div className="flex-1 ml-3 overflow-hidden">
          <div className="overflow-hidden">
            <div className="flex animate-marquee whitespace-nowrap">
              {messages.map((msg, index) => (
                <div key={index} className="flex items-center mx-4 text-white">
                  <span className="text-sm font-medium">{msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
=======
    "✨ Join Thousands of Successful Investors",
    "🎯 Turn Your Savings into Wealth",
    "⭐ VIP Members Earn Up to 300% Returns"
  ];

  return (
    <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
      {/* Animated background particles */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-full animate-float-slow"
            style={{
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          />
        ))}
      </div>

      <div className="relative flex items-center p-3">
        {/* Left side - Fixed Image */}
        <div className="flex-shrink-0 relative z-10">
          <div className="relative">
            {/* Glowing effect around image */}
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
            <img 
              src={addsImage} 
              alt="DSW Promo" 
              className="relative w-14 h-14 object-contain rounded-full border-2 border-white/50 shadow-xl"
            />
          </div>
        </div>

        {/* Right side - Animated Text Container */}
        <div className="flex-1 ml-4 overflow-hidden">
          <div className="relative">
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-purple-600 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-indigo-600 to-transparent z-10" />
            
            {/* Animated text marquee */}
            <div className="overflow-hidden">
              <div className="flex animate-marquee whitespace-nowrap">
                {/* First set of messages */}
                {messages.map((msg, index) => (
                  <div
                    key={`first-${index}`}
                    className="flex items-center mx-4 text-white"
                  >
                    {index === 0 && <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />}
                    {index === 1 && <TrendingUp className="w-4 h-4 mr-2 text-green-300" />}
                    {index === 2 && <Award className="w-4 h-4 mr-2 text-yellow-300" />}
                    <span className="text-sm font-medium drop-shadow-lg">{msg}</span>
                  </div>
                ))}
                {/* Duplicate set for seamless loop */}
                {messages.map((msg, index) => (
                  <div
                    key={`second-${index}`}
                    className="flex items-center mx-4 text-white"
                  >
                    {index === 0 && <Sparkles className="w-4 h-4 mr-2 text-yellow-300" />}
                    {index === 1 && <TrendingUp className="w-4 h-4 mr-2 text-green-300" />}
                    {index === 2 && <Award className="w-4 h-4 mr-2 text-yellow-300" />}
                    <span className="text-sm font-medium drop-shadow-lg">{msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Static welcome text below animation */}
          <div className="mt-1 text-xs text-white/80 flex items-center gap-2">
            <span className="bg-white/20 px-2 py-0.5 rounded-full">🎯 24/7 Active</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full">⭐ 1000+ Investors</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-10px) translateX(5px); }
          50% { transform: translateY(-20px) translateX(-5px); }
          75% { transform: translateY(-10px) translateX(5px); }
        }
        
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  );
};

<<<<<<< HEAD
// Customer Service Modal
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
=======
// Customer Service Modal Component
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useLanguage();
  
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
<<<<<<< HEAD
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Green Header */}
        <div className="relative p-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
=======
      <div className="relative w-full max-w-md bg-gradient-to-b from-blue-600 to-blue-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header with wave pattern */}
        <div className="relative p-6 border-b border-white/20">
          <div className="absolute inset-0 opacity-20">
            <svg
              className="absolute bottom-0 left-0 w-full"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ height: '100%' }}
            >
              <path
                fill="#ffffff"
                fillOpacity="0.3"
                d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,170.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                <img src={customerServiceImage} alt="Customer Service" className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-white">Customer Support</h2>
            </div>
<<<<<<< HEAD
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="mt-3 text-white/80 text-sm">Connect with us on Telegram for instant support</p>
        </div>

        {/* Channels List */}
        <div className="p-6 space-y-3">
=======
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <p className="relative mt-3 text-white/80 text-sm">
            Connect with us on Telegram for instant support and updates
          </p>
        </div>

        {/* Channels List */}
        <div className="p-6 space-y-4" style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          {telegramChannels.map((channel, index) => (
            <a
              key={index}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
<<<<<<< HEAD
              className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-xl hover:bg-[#f1f5f1] transition-all border border-[#e2e8e2] group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-[#e2e8e2]">
                  {index === 0 ? (
                    <MessageCircle className="w-5 h-5 text-[#7acc00]" />
                  ) : index === 1 ? (
                    <Users className="w-5 h-5 text-[#7acc00]" />
                  ) : (
                    <Send className="w-5 h-5 text-[#7acc00]" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d3a2d]">{channel.label}</h3>
                  <p className="text-sm text-[#6b7b6b]">{channel.handle}</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-[#7acc00] opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
=======
              className="flex items-center justify-between p-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-102 hover:shadow-md border border-blue-400 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl shadow-md">
                  {index === 0 ? (
                    <img src={customerServiceImage} alt="Support" className="w-5 h-5 object-contain" />
                  ) : index === 1 ? (
                    <Users className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{channel.label}</h3>
                  <p className="text-sm text-blue-200 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    {channel.handle}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
          
          {/* Highlighted Official Support */}
          <div className="mt-2 p-3 bg-yellow-500 rounded-xl border border-yellow-600">
            <p className="text-xs text-white flex items-center gap-1">
              <span className="font-medium">✨ Official Support:</span> 
              <a 
                href="https://t.me/DSWonline_suport" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white underline ml-1"
              >
                @DSWonline_suport
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-center">
          <p className="text-white/80 text-xs">
            Our support team is available 24/7 to assist you
          </p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        </div>
      </div>
    </div>
  );
};

<<<<<<< HEAD
// Customer Service Button
=======
// Customer Service Button Component - Only image with small red glow
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
const CustomerServiceButton = ({ onClick, isLoading }: { onClick: () => void; isLoading?: boolean }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
<<<<<<< HEAD
    className="fixed right-4 bottom-20 z-50 p-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
    style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
  >
    <img src={customerServiceImage} alt="Support" className="w-8 h-8 object-contain" />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
  </button>
);

// Yellow Moving Card
const YellowMovingCard = () => (
  <div className="bg-[#FFD700] overflow-hidden py-2.5 px-3 rounded-lg mb-4 shadow-md">
    <div className="whitespace-nowrap animate-marquee inline-block text-sm font-bold text-[#856404]">
      🎉 WELCOME TO DSW! EARN DAILY INCOME WITH YOUR VIP MEMBERSHIP! &nbsp;&nbsp;&nbsp; ⭐ UPGRADE YOUR VIP LEVEL TODAY! &nbsp;&nbsp;&nbsp;
=======
    className="fixed right-4 bottom-20 z-50 flex items-center justify-center p-0 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}
  >
    <div className="relative p-3">
      <img src={customerServiceImage} alt="Support" className="w-10 h-10 object-contain" />
      {/* Small red glow animation */}
      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full animate-ping opacity-75" style={{ backgroundColor: '#ef4444' }}></span>
      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#ef4444', opacity: 0.5 }}></span>
    </div>
  </button>
);

// Yellow Moving Card - Now positioned closer to balance card
const YellowMovingCard = () => (
  <div className="bg-yellow-400 overflow-hidden py-2.5 px-3 rounded-lg mb-4 shadow-md">
    <div className="whitespace-nowrap animate-marquee inline-block text-sm font-bold text-yellow-900">
      🎉 WELCOME TO DSW! EARN DAILY INCOME WITH YOUR VIP MEMBERSHIP! &nbsp;&nbsp;&nbsp; ⭐ ONE APP FOR ALL YOUR NEEDS! &nbsp;&nbsp;&nbsp; 🚀 UPGRADE YOUR VIP LEVEL TODAY! &nbsp;&nbsp;&nbsp; 💰 INVEST SMART, EARN PASSIVE INCOME! &nbsp;&nbsp;&nbsp;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  </div>
);

<<<<<<< HEAD
=======
// Add these styles to your global CSS file or create a style tag
const waveAnimations = `
@keyframes wave-slow {
  0%, 100% { transform: translateX(0) scaleX(1.2); }
  50% { transform: translateX(-10px) scaleX(1.2); }
}

@keyframes wave-medium {
  0%, 100% { transform: translateX(0) scaleX(1.1); }
  50% { transform: translateX(10px) scaleX(1.1); }
}

@keyframes wave-fast {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(-5px); }
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.animate-wave-slow {
  animation: wave-slow 8s ease-in-out infinite;
}

.animate-wave-medium {
  animation: wave-medium 6s ease-in-out infinite;
}

.animate-wave-fast {
  animation: wave-fast 4s ease-in-out infinite;
}

.animate-float {
  animation: float 10s ease-in-out infinite;
}
`;

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
const Dashboard = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
<<<<<<< HEAD
=======
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const [showGift, setShowGift] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasCompletedVipLevel, setHasCompletedVipLevel] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<number>(0);
  const [timeUntilNextTransfer, setTimeUntilNextTransfer] = useState('');
  
<<<<<<< HEAD
  // Loading states
=======
  // Loading states for actions
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const [isGiftLoading, setIsGiftLoading] = useState(false);
  const [isInvestLoading, setIsInvestLoading] = useState(false);
  const [isCustomerServiceLoading, setIsCustomerServiceLoading] = useState(false);
  const [investLevelId, setInvestLevelId] = useState<number | null>(null);
<<<<<<< HEAD
=======
  
  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = waveAnimations;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

  // Show announcement on login
  useEffect(() => {
    const fromLogin = location.state?.fromLogin;
    if (fromLogin && !loading && user) {
      setShowAnnouncement(true);
<<<<<<< HEAD
=======
      // Clear the state to prevent showing again on refresh
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loading, user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch daily income
  const fetchDailyIncome = async () => {
    if (!user) return;

    try {
      await supabase.functions.invoke('transfer-income');
    } catch (e) {
      console.log('Income transfer check:', e);
    }

    const { data } = await supabase
      .from('user_daily_income')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setDailyIncome(data.today_income || 0);
      
<<<<<<< HEAD
=======
      // Calculate time until next transfer
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      if (data.last_income_transfer_at) {
        const now = new Date();
        const lastTransfer = new Date(data.last_income_transfer_at);
        const hoursSince = (now.getTime() - lastTransfer.getTime()) / (1000 * 60 * 60);

        if (hoursSince < 24 && data.today_income > 0) {
          const hoursLeft = 24 - hoursSince;
          const h = Math.floor(hoursLeft);
          const m = Math.floor((hoursLeft % 1) * 60);
          setTimeUntilNextTransfer(`${h}h ${m}m`);
        } else {
          setTimeUntilNextTransfer('');
        }
      }
    }
  };

  useEffect(() => {
    fetchDailyIncome();
<<<<<<< HEAD
=======
    
    // Refresh daily income every minute
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    const interval = setInterval(fetchDailyIncome, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchVipLevels = async () => {
      const { data } = await supabase
        .from('vip_levels')
        .select('*')
        .order('id');
      
      if (data) {
        setVipLevels(data);
      }
    };

    fetchVipLevels();
  }, []);

<<<<<<< HEAD
=======
  useEffect(() => {
    const checkCompletedVipLevels = async () => {
      if (!user) return;

      const vipLevelsToCheck = [1, 2, 3, 4, 5, 6];
      
      for (const vipLevel of vipLevelsToCheck) {
        const { data: tasks } = await supabase
          .from('tasks')
          .select('id')
          .eq('vip_level', vipLevel);

        const { data: completed } = await supabase
          .from('user_task_progress')
          .select('task_id')
          .eq('user_id', user.id)
          .eq('vip_level', vipLevel)
          .eq('completed', true);

        const totalCount = tasks?.length || 0;
        const completedCount = completed?.length || 0;

        if (totalCount > 0 && completedCount >= totalCount) {
          setHasCompletedVipLevel(true);
          return;
        }
      }
      
      setHasCompletedVipLevel(false);
    };

    checkCompletedVipLevels();
  }, [user, profile?.current_vip_level]);

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const handleInvest = async (levelId: number) => {
    setInvestLevelId(levelId);
    setIsInvestLoading(true);
    
<<<<<<< HEAD
=======
    // 1 second delay
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const level = vipLevels.find(l => l.id === levelId);
    if (!level || !profile || !user) {
      setIsInvestLoading(false);
      setInvestLevelId(null);
      return;
    }

    if (profile.balance < level.price) {
      setSuccessMessage('Insufficient balance');
      setShowSuccess(true);
<<<<<<< HEAD
=======
      setShowDeposit(true);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      setIsInvestLoading(false);
      setInvestLevelId(null);
      return;
    }

    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: level.id,
      p_amount: level.price,
    });

    if (error) {
      setSuccessMessage('Purchase failed. Please try again.');
      setShowSuccess(true);
      setIsInvestLoading(false);
      setInvestLevelId(null);
      return;
    }

    if (data) {
<<<<<<< HEAD
      setSuccessMessage('Purchase successful!');
      setShowSuccess(true);
      await refreshProfile();
      await fetchDailyIncome();
=======
      setSuccessMessage('Success');
      setShowSuccess(true);
      await refreshProfile();
      await fetchDailyIncome(); // Refresh daily income after purchase
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    } else {
      setSuccessMessage('Purchase failed. Insufficient balance.');
      setShowSuccess(true);
    }
    
    setIsInvestLoading(false);
    setInvestLevelId(null);
  };

<<<<<<< HEAD
  const handleGiftClick = async () => {
    setIsGiftLoading(true);
=======
  const handleDepositClick = async () => {
    setIsDepositLoading(true);
    // 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowDeposit(true);
    setIsDepositLoading(false);
  };

  const handleWithdrawClick = async () => {
    setIsWithdrawLoading(true);
    // 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowWithdraw(true);
    setIsWithdrawLoading(false);
  };

  const handleGiftClick = async () => {
    setIsGiftLoading(true);
    // 1 second delay
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowGift(true);
    setIsGiftLoading(false);
  };

  const handleCustomerService = async () => {
    setIsCustomerServiceLoading(true);
<<<<<<< HEAD
=======
    // 1 second delay
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCustomerService(true);
    setIsCustomerServiceLoading(false);
  };

<<<<<<< HEAD
  // Filter VIP levels
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P' || !level.series);
  
  // Carousel items
=======
  const handleDepositSubmitted = () => {
    // Success is already shown by DepositModal
  };

  // Filter P-Series and B-Series levels for display
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P' || !level.series);
  const bSeriesLevels = vipLevels.filter(level => level.series === 'B');

  // Generate carousel items from P-Series VIP levels (first 3 for carousel)
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const carouselItems = pSeriesLevels.slice(0, 3).map((level) => {
    const dailyIncome = level.daily_income || Math.round(level.price * 0.09);
    const validityDays = level.cycle_days || 60;
    const totalIncome = level.total_income || dailyIncome * validityDays;
<<<<<<< HEAD
=======
    const discountPercent = 50 + level.id * 5;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    
    const soldOutTime = new Date();
    soldOutTime.setHours(soldOutTime.getHours() + level.id * 8);

    return {
      id: level.id,
      name: level.name,
      price: level.price,
      dailyIncome,
      validityDays,
      totalIncome,
      purchaseLimit: level.purchase_limit || 2,
<<<<<<< HEAD
      discountPercent: 50,
=======
      discountPercent,
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      image: dswLogo,
      imageUrl: level.image_url,
      soldOutTime,
    };
  });

  if (loading || !profile) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
=======
      <div className="min-h-screen flex items-center justify-center bg-background">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        <Spinner size="lg" />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-md mx-auto px-4 py-4">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Balance Card */}
        <div className="mb-4">
=======
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-24 relative">
      <div className="max-w-md mx-auto">
        {/* Animated Welcome Banner */}
        <WelcomeBanner />

        {/* Enhanced Balance Card with Telebirr-style design and larger wallet image */}
        <div className="mb-3">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          <EnhancedBalanceCard 
            balance={profile.balance}
            withdrawableBalance={profile.withdrawable_balance}
            dailyIncome={dailyIncome}
            timeUntilNextTransfer={timeUntilNextTransfer}
          />
        </div>

<<<<<<< HEAD
        {/* Yellow Moving Card */}
        <YellowMovingCard />

        {/* Quick Action Buttons */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-[#2d3a2d] mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <ActionButton
              image={depositImage}
              label="Deposit"
              onClick={() => navigate('/deposit')}
            />
            <ActionButton
              image={withdrawImage}
              label="Withdraw"
              onClick={() => navigate('/withdraw')}
            />
            <ActionButton
              image={giftCodeImage}
              label="Gift Code"
              onClick={handleGiftClick}
=======
        {/* Yellow Moving Card - Positioned close to balance card */}
        <YellowMovingCard />

        {/* Quick Action Buttons with border line like Profile page - Spinners removed */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="flex gap-3">
            <EnhancedActionButton
              image={depositImage}
              label="Deposit"
              onClick={handleDepositClick}
              borderColor="#B0FC38"
              isLoading={isDepositLoading}
            />
            <EnhancedActionButton
              image={withdrawImage}
              label="Withdraw"
              onClick={handleWithdrawClick}
              borderColor="#B0FC38"
              isLoading={isWithdrawLoading}
            />
            <EnhancedActionButton
              image={giftCodeImage}
              label="Gift Code"
              onClick={handleGiftClick}
              borderColor="#B0FC38"
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              isLoading={isGiftLoading}
            />
          </div>
        </div>

        {/* Promotional Video Section */}
        <div className="mb-6">
<<<<<<< HEAD
          <h2 className="font-display text-lg font-bold text-[#2d3a2d] mb-3">Watch & Earn</h2>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video border-2 border-[#7acc00]">
=======
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">Watch & Earn</h2>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video border-2" style={{ borderColor: '#B0FC38' }}>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            <iframe
              src="https://www.youtube.com/embed/UQjQMGTG1Vg?autoplay=1&mute=1&loop=1&playlist=UQjQMGTG1Vg&controls=0&showinfo=0&rel=0&modestbranding=1"
              title="Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 'none' }}
            />
<<<<<<< HEAD
          </div>
        </div>

        {/* VIP Carousel */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-[#2d3a2d] mb-4">{t('Hot Products')}</h2>
=======
            
            {/* Optional overlay to prevent accidental navigation */}
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              Watch & Earn
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Watch this video to learn more about earning opportunities
          </p>
        </div>

        {/* Auto-scrolling VIP Carousel */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-4">{t('Hot Products')}</h2>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          <VipCarousel 
            items={carouselItems} 
            onInvest={handleInvest}
            isLoading={isInvestLoading}
            loadingLevelId={investLevelId}
          />
        </div>

<<<<<<< HEAD
        {/* About Section */}
        <div className="mb-6 rounded-xl overflow-hidden bg-white border border-[#e2e8e2]">
          <AboutSection />
        </div>

        {/* Transaction History Link */}
        <button
          onClick={() => navigate('/transactions')}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm text-[#6b7b6b] hover:text-[#2d3a2d] transition-colors"
        >
          <History className="w-4 h-4" />
          View Transaction History
        </button>
      </div>

      {/* Customer Service Button */}
=======
        {/* About Us Section with Video - Now with balance card background */}
        <div className="mb-6 rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}>
          <AboutSection />
        </div>
      </div>

      {/* Customer Service Button - Only image with balance card background and small red glow */}
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <CustomerServiceButton 
        onClick={handleCustomerService} 
        isLoading={isCustomerServiceLoading}
      />

      {/* Customer Service Modal */}
      <CustomerServiceModal 
        isOpen={showCustomerService} 
        onClose={() => setShowCustomerService(false)} 
      />

      <BottomNavigation />

<<<<<<< HEAD
      {/* Gift Modal */}
=======
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSubmitted={handleDepositSubmitted}
      />

      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        withdrawableBalance={profile.withdrawable_balance}
        hasCompletedVipLevel={hasCompletedVipLevel}
      />

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <GiftModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
      />

<<<<<<< HEAD
      {/* Success Modal */}
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

<<<<<<< HEAD
      {/* Announcement Modal */}
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={() => {
          setShowAnnouncement(false);
          setShowTelegram(true);
        }}
      />

<<<<<<< HEAD
      {/* Telegram Modal */}
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <TelegramModal
        isOpen={showTelegram}
        onClose={() => setShowTelegram(false)}
      />
    </div>
  );
};

<<<<<<< HEAD
// Add marquee animation
const style = document.createElement('style');
style.textContent = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }
`;
document.head.appendChild(style);

=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
export default Dashboard;