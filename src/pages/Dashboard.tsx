import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import VipCarousel from '@/components/VipCarousel';
import AboutSection from '@/components/AboutSection';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { GiftModal } from '@/components/GiftModal';
import { AnnouncementModal } from '@/components/AnnouncementModal';
import { TelegramModal } from '@/components/TelegramModal';

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
  Calendar, ArrowLeft, CreditCard, History
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

// Telegram Channel Data
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

// Enhanced Balance Card with green theme
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
              <img src={walletImage} alt="Wallet" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-white font-medium text-lg">My Wallet</span>
          </div>
        </div>

        {/* Main Balance */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-white/80">Main Balance</span>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              {showBalance ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
            </button>
          </div>
          <p className="text-3xl font-bold text-white">
            {showBalance ? balance.toLocaleString() : '****'}
            <span className="text-base font-normal text-white/70 ml-2">ETB</span>
          </p>
        </div>

        {/* Withdrawable Balance */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Action Button with green theme
const ActionButton = ({ 
  image, 
  label, 
  onClick,
  isLoading = false
}: { 
  image: string; 
  label: string; 
  onClick: () => void;
  isLoading?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={isLoading}
    className="flex-1 flex flex-col items-center gap-2 py-4 px-2 rounded-xl bg-white border-2 border-[#e2e8e2] hover:border-[#7acc00] transition-all disabled:opacity-50 shadow-sm"
  >
    <img src={image} alt={label} className="w-10 h-10 object-contain" />
    <span className="text-sm font-medium text-[#2d3a2d]">{isLoading ? 'Please wait...' : label}</span>
  </button>
);

// Welcome Banner Component
const WelcomeBanner = () => {
  const messages = [
    "🚀 Welcome to Digital Smart Work!",
    "💰 Increase Your Salary Through Smart Investments",
    "🏆 Invest in Gold, AirPods & Crypto Products",
    "💎 Start Earning Passive Income Today",
    "📈 Your Financial Freedom Starts Here",
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
    </div>
  );
};

// Customer Service Modal
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Green Header */}
        <div className="relative p-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <img src={customerServiceImage} alt="Customer Service" className="w-8 h-8 object-contain" />
              </div>
              <h2 className="text-xl font-bold text-white">Customer Support</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="mt-3 text-white/80 text-sm">Connect with us on Telegram for instant support</p>
        </div>

        {/* Channels List */}
        <div className="p-6 space-y-3">
          {telegramChannels.map((channel, index) => (
            <a
              key={index}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
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
        </div>
      </div>
    </div>
  );
};

// Customer Service Button
const CustomerServiceButton = ({ onClick, isLoading }: { onClick: () => void; isLoading?: boolean }) => (
  <button
    onClick={onClick}
    disabled={isLoading}
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
    </div>
  </div>
);

const Dashboard = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [showGift, setShowGift] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasCompletedVipLevel, setHasCompletedVipLevel] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<number>(0);
  const [timeUntilNextTransfer, setTimeUntilNextTransfer] = useState('');
  
  // Loading states
  const [isGiftLoading, setIsGiftLoading] = useState(false);
  const [isInvestLoading, setIsInvestLoading] = useState(false);
  const [isCustomerServiceLoading, setIsCustomerServiceLoading] = useState(false);
  const [investLevelId, setInvestLevelId] = useState<number | null>(null);

  // Show announcement on login
  useEffect(() => {
    const fromLogin = location.state?.fromLogin;
    if (fromLogin && !loading && user) {
      setShowAnnouncement(true);
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

  const handleInvest = async (levelId: number) => {
    setInvestLevelId(levelId);
    setIsInvestLoading(true);
    
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
      setSuccessMessage('Purchase successful!');
      setShowSuccess(true);
      await refreshProfile();
      await fetchDailyIncome();
    } else {
      setSuccessMessage('Purchase failed. Insufficient balance.');
      setShowSuccess(true);
    }
    
    setIsInvestLoading(false);
    setInvestLevelId(null);
  };

  const handleGiftClick = async () => {
    setIsGiftLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowGift(true);
    setIsGiftLoading(false);
  };

  const handleCustomerService = async () => {
    setIsCustomerServiceLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowCustomerService(true);
    setIsCustomerServiceLoading(false);
  };

  // Filter VIP levels
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P' || !level.series);
  
  // Carousel items
  const carouselItems = pSeriesLevels.slice(0, 3).map((level) => {
    const dailyIncome = level.daily_income || Math.round(level.price * 0.09);
    const validityDays = level.cycle_days || 60;
    const totalIncome = level.total_income || dailyIncome * validityDays;
    
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
      discountPercent: 50,
      image: dswLogo,
      imageUrl: level.image_url,
      soldOutTime,
    };
  });

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      <div className="relative max-w-md mx-auto px-4 py-4">
        {/* Welcome Banner */}
        <WelcomeBanner />

        {/* Balance Card */}
        <div className="mb-4">
          <EnhancedBalanceCard 
            balance={profile.balance}
            withdrawableBalance={profile.withdrawable_balance}
            dailyIncome={dailyIncome}
            timeUntilNextTransfer={timeUntilNextTransfer}
          />
        </div>

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
              isLoading={isGiftLoading}
            />
          </div>
        </div>

        {/* Promotional Video Section */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-[#2d3a2d] mb-3">Watch & Earn</h2>
          <div className="relative rounded-xl overflow-hidden shadow-lg bg-black aspect-video border-2 border-[#7acc00]">
            <iframe
              src="https://www.youtube.com/embed/UQjQMGTG1Vg?autoplay=1&mute=1&loop=1&playlist=UQjQMGTG1Vg&controls=0&showinfo=0&rel=0&modestbranding=1"
              title="Promotional Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        </div>

        {/* VIP Carousel */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-[#2d3a2d] mb-4">{t('Hot Products')}</h2>
          <VipCarousel 
            items={carouselItems} 
            onInvest={handleInvest}
            isLoading={isInvestLoading}
            loadingLevelId={investLevelId}
          />
        </div>

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

      {/* Gift Modal */}
      <GiftModal
        isOpen={showGift}
        onClose={() => setShowGift(false)}
      />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncement}
        onClose={() => {
          setShowAnnouncement(false);
          setShowTelegram(true);
        }}
      />

      {/* Telegram Modal */}
      <TelegramModal
        isOpen={showTelegram}
        onClose={() => setShowTelegram(false)}
      />
    </div>
  );
};

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

export default Dashboard;