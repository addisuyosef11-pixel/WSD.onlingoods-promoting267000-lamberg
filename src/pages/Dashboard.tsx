import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { WithdrawModal } from '@/components/WithdrawModal';
import { GiftModal } from '@/components/GiftModal';
import { SuccessModal } from '@/components/SuccessModal';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { TelegramModal } from '@/components/TelegramModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import VipCarousel from '@/components/VipCarousel';
import RecentCommissions from '@/components/RecentCommissions';
import AboutSection from '@/components/AboutSection';
import { Spinner } from '@/components/Spinner';

import dswLogo from '@/assets/dsw-logo.png';
import withdrawImage from '@/assets/withdraw.png';
import depositImage from '@/assets/deposit.png';
import giftCodeImage from '@/assets/gift-code.png';
import addsImage from '@/assets/adds.png';
import { 
  Headset, MessageCircle, Send, Users, ExternalLink, X, 
  Sparkles, TrendingUp, Award, Eye, EyeOff, Wallet,
  Loader
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

// Telegram Channel Data with updated username
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

// Minimized Balance Card with Eye Toggle - Matching deposit button color (#E3F2FD)
const MinimizedBalanceCard = ({ 
  balance, 
  withdrawableBalance 
}: { 
  balance: number; 
  withdrawableBalance: number;
}) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatBalance = (value: number) => {
    if (showBalance) {
      return value.toLocaleString() + ' ETB';
    }
    return '**** ETB';
  };

  return (
    <div className="rounded-2xl p-4 shadow-lg" style={{ backgroundColor: '#E3F2FD' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-blue-600" />
          <span className="text-blue-700 text-sm font-medium">My Wallet</span>
        </div>
        <button
          onClick={() => setShowBalance(!showBalance)}
          className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
        >
          {showBalance ? (
            <EyeOff className="w-4 h-4 text-blue-600" />
          ) : (
            <Eye className="w-4 h-4 text-blue-600" />
          )}
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-xs text-blue-600/70">Main Balance</p>
          <p className="text-xl font-bold text-blue-800">{formatBalance(balance)}</p>
        </div>
        <div>
          <p className="text-xs text-blue-600/70">Withdrawable</p>
          <p className="text-lg font-semibold text-green-600">{formatBalance(withdrawableBalance)}</p>
        </div>
      </div>
    </div>
  );
};

// Welcome Banner Component (unchanged)
const WelcomeBanner = () => {
  // Array of messages to scroll
  const messages = [
    "🚀 Welcome to Digital Smart Work!",
    "💰 Increase Your Salary Through Smart Investments",
    "🏆 Invest in Gold, AirPods & Crypto Products",
    "💎 Start Earning Passive Income Today",
    "📈 Your Financial Freedom Starts Here",
    "✨ Join Thousands of Successful Investors",
    "🎯 Turn Your Savings into Wealth",
    "⭐ VIP Members Earn Up to 300% Returns"
  ];

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
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
    </div>
  );
};

// Customer Service Modal Component
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
                <Headset className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Customer Support</h2>
            </div>
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
        <div className="p-6 space-y-4 bg-white">
          {telegramChannels.map((channel, index) => (
            <a
              key={index}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all transform hover:scale-102 hover:shadow-md border border-blue-100 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-xl shadow-md">
                  {index === 0 ? (
                    <Headset className="w-5 h-5 text-white" />
                  ) : index === 1 ? (
                    <Users className="w-5 h-5 text-white" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{channel.label}</h3>
                  <p className="text-sm text-blue-600 flex items-center gap-1">
                    <Send className="w-3 h-3" />
                    {channel.handle}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
          
          {/* Highlighted Official Support */}
          <div className="mt-2 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-xs text-yellow-700 flex items-center gap-1">
              <span className="font-medium">✨ Official Support:</span> 
              <a 
                href="https://t.me/DSWonline_suport" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 underline ml-1"
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
        </div>
      </div>
    </div>
  );
};

// Custom Action Button Component
const ActionButton = ({ 
  image, 
  label, 
  onClick,
  bgColor = 'bg-white',
  isLoading = false
}: { 
  image: string; 
  label: string; 
  onClick: () => void;
  bgColor?: string;
  isLoading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ backgroundColor: bgColor }}
  >
    {isLoading ? (
      <Loader className="w-6 h-6 text-blue-600 animate-spin" />
    ) : (
      <img src={image} alt={label} className="w-10 h-10 object-contain" />
    )}
    <span className="text-sm font-medium text-gray-700">{isLoading ? 'Loading...' : label}</span>
  </button>
);

// Customer Service Button Component
const CustomerServiceButton = ({ onClick, isLoading }: { onClick: () => void; isLoading?: boolean }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="fixed right-4 bottom-20 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? (
      <Loader className="w-5 h-5 animate-spin" />
    ) : (
      <Headset className="w-5 h-5" />
    )}
    <span className="font-medium text-sm">{isLoading ? 'Please wait...' : 'DSW Support'}</span>
    {!isLoading && (
      <span className="flex h-3 w-3 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
    )}
  </button>
);

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

const Dashboard = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasCompletedVipLevel, setHasCompletedVipLevel] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  
  // Loading states for actions
  const [isDepositLoading, setIsDepositLoading] = useState(false);
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [isGiftLoading, setIsGiftLoading] = useState(false);
  const [isInvestLoading, setIsInvestLoading] = useState(false);
  const [isCustomerServiceLoading, setIsCustomerServiceLoading] = useState(false);
  const [investLevelId, setInvestLevelId] = useState<number | null>(null);
  
  // Add animation styles
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = waveAnimations;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Show announcement on login
  useEffect(() => {
    const fromLogin = location.state?.fromLogin;
    if (fromLogin && !loading && user) {
      setShowAnnouncement(true);
      // Clear the state to prevent showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loading, user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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

  const handleInvest = async (levelId: number) => {
    setInvestLevelId(levelId);
    setIsInvestLoading(true);
    
    // 1 second delay
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
      setShowDeposit(true);
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
      setSuccessMessage('Success');
      setShowSuccess(true);
      await refreshProfile();
    } else {
      setSuccessMessage('Purchase failed. Insufficient balance.');
      setShowSuccess(true);
    }
    
    setIsInvestLoading(false);
    setInvestLevelId(null);
  };

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
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowGift(true);
    setIsGiftLoading(false);
  };

  const handleCustomerService = async () => {
    setIsCustomerServiceLoading(true);
    // 1 second delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCustomerService(true);
    setIsCustomerServiceLoading(false);
  };

  const handleDepositSubmitted = () => {
    // Success is already shown by DepositModal
  };

  // Filter P-Series and B-Series levels for display
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P' || !level.series);
  const bSeriesLevels = vipLevels.filter(level => level.series === 'B');

  // Generate carousel items from P-Series VIP levels (first 3 for carousel)
  const carouselItems = pSeriesLevels.slice(0, 3).map((level) => {
    const dailyIncome = level.daily_income || Math.round(level.price * 0.09);
    const validityDays = level.cycle_days || 60;
    const totalIncome = level.total_income || dailyIncome * validityDays;
    const discountPercent = 50 + level.id * 5;
    
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
      discountPercent,
      image: dswLogo,
      imageUrl: level.image_url,
      soldOutTime,
    };
  });

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 pb-24 relative">
      <div className="max-w-md mx-auto">
        {/* Animated Welcome Banner */}
        <WelcomeBanner />

        {/* Minimized Balance Card with Eye Toggle - Matching deposit button color (#E3F2FD) */}
        <div className="mb-6">
          <MinimizedBalanceCard 
            balance={profile.balance}
            withdrawableBalance={profile.withdrawable_balance}
          />
        </div>

        {/* Quick Action Buttons */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <ActionButton
              image={depositImage}
              label="Deposit"
              onClick={handleDepositClick}
              bgColor="#E3F2FD"
              isLoading={isDepositLoading}
            />
            <ActionButton
              image={withdrawImage}
              label="Withdraw"
              onClick={handleWithdrawClick}
              bgColor="#FFF3E0"
              isLoading={isWithdrawLoading}
            />
            <ActionButton
              image={giftCodeImage}
              label="Gift Code"
              onClick={handleGiftClick}
              bgColor="#F3E5F5"
              isLoading={isGiftLoading}
            />
          </div>
        </div>

        {/* Promotional Video Section */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">Watch & Earn</h2>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video">
            <iframe
              src="https://www.youtube.com/embed/UQjQMGTG1Vg?autoplay=1&mute=1&loop=1&playlist=UQjQMGTG1Vg&controls=0&showinfo=0&rel=0&modestbranding=1"
              title="Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 'none' }}
            />
            
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
          <VipCarousel 
            items={carouselItems} 
            onInvest={handleInvest}
            isLoading={isInvestLoading}
            loadingLevelId={investLevelId}
          />
        </div>

        {/* Recent Commissions Ticker */}
        <RecentCommissions />

        {/* About Us Section with Video */}
        <AboutSection />
      </div>

      {/* Customer Service Button - Fixed on right side above bottom navigation */}
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

      <GiftModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={() => {
          setShowAnnouncement(false);
          setShowTelegram(true);
        }}
      />

      <TelegramModal
        isOpen={showTelegram}
        onClose={() => setShowTelegram(false)}
      />
    </div>
  );
};

export default Dashboard;