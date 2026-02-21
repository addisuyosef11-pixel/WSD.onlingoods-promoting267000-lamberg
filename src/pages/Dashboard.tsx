import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BalanceCard } from '@/components/BalanceCard';
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
import { Headset, MessageCircle, Send, Users, ExternalLink, X } from 'lucide-react';

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
  bgColor = 'bg-white'
}: { 
  image: string; 
  label: string; 
  onClick: () => void;
  bgColor?: string;
}) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center justify-center gap-2 py-4 px-2 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
    style={{ backgroundColor: bgColor }}
  >
    <img src={image} alt={label} className="w-10 h-10 object-contain" />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

// Customer Service Button Component
const CustomerServiceButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="fixed right-4 bottom-20 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20"
  >
    <Headset className="w-5 h-5" />
    <span className="font-medium text-sm">Customer Service</span>
    <span className="flex h-3 w-3 relative">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
    </span>
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
    const level = vipLevels.find(l => l.id === levelId);
    if (!level || !profile || !user) return;

    if (profile.balance < level.price) {
      setSuccessMessage('Insufficient balance');
      setShowSuccess(true);
      setShowDeposit(true);
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
  };

  const handleDepositSubmitted = () => {
    // Success is already shown by DepositModal
  };

  const handleCustomerService = () => {
    setShowCustomerService(true);
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
        {/* Header removed - no logo or welcome text */}

        {/* Balance Card with Blue Background and Enhanced Waves */}
        <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 shadow-lg">
          {/* Animated Wave decorations - More prominent and wavy */}
          <div className="absolute inset-0 opacity-40">
            {/* First wave layer - slow and wide */}
            <svg
              className="absolute bottom-0 left-0 w-full animate-wave-slow"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ height: '80%', transform: 'scaleX(1.3)' }}
            >
              <path
                fill="#ffffff"
                fillOpacity="0.25"
                d="M0,224L60,213.3C120,203,240,181,360,181.3C480,181,600,203,720,213.3C840,224,960,224,1080,208C1200,192,1320,160,1380,144L1440,128L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
              ></path>
            </svg>
            
            {/* Second wave layer - medium speed, different pattern */}
            <svg
              className="absolute bottom-0 left-0 w-full animate-wave-medium"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ height: '75%', transform: 'scaleX(1.2)' }}
            >
              <path
                fill="#ffffff"
                fillOpacity="0.2"
                d="M0,96L48,122.7C96,149,192,203,288,213.3C384,224,480,192,576,170.7C672,149,768,139,864,149.3C960,160,1056,192,1152,197.3C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
            
            {/* Third wave layer - fast, sharp waves */}
            <svg
              className="absolute bottom-0 left-0 w-full animate-wave-fast"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1440 320"
              preserveAspectRatio="none"
              style={{ height: '70%' }}
            >
              <path
                fill="#ffffff"
                fillOpacity="0.15"
                d="M0,256L48,234.7C96,213,192,171,288,165.3C384,160,480,192,576,208C672,224,768,224,864,208C960,192,1056,160,1152,154.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ></path>
            </svg>
          </div>
          
          {/* Floating bubbles for extra wave effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/10 animate-float"
                style={{
                  width: `${20 + i * 5}px`,
                  height: `${20 + i * 5}px`,
                  left: `${10 + i * 12}%`,
                  bottom: `${10 + i * 8}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${8 + i}s`,
                }}
              />
            ))}
          </div>
          
          {/* Balance Card Content */}
          <div className="relative z-10">
            <BalanceCard
              balance={profile.balance}
              withdrawableBalance={profile.withdrawable_balance}
              vipLevel={profile.current_vip_level}
              userName={profile.name}
              phone={profile.phone}
            />
          </div>
        </div>

        {/* Quick Action Buttons - Right after Balance Card */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-gray-800 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <ActionButton
              image={depositImage}
              label="Deposit"
              onClick={() => setShowDeposit(true)}
              bgColor="#E3F2FD"
            />
            <ActionButton
              image={withdrawImage}
              label="Withdraw"
              onClick={() => setShowWithdraw(true)}
              bgColor="#FFF3E0"
            />
            <ActionButton
              image={giftCodeImage}
              label="Gift Code"
              onClick={() => setShowGift(true)}
              bgColor="#F3E5F5"
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
          <VipCarousel items={carouselItems} onInvest={handleInvest} />
        </div>

        {/* Recent Commissions Ticker */}
        <RecentCommissions />

        {/* About Us Section with Video */}
        <AboutSection />
      </div>

      {/* Customer Service Button - Fixed on right side above bottom navigation */}
      <CustomerServiceButton onClick={handleCustomerService} />

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