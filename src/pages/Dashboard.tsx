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
import { ActionButtons } from '@/components/ActionButtons';
import { BottomNavigation } from '@/components/BottomNavigation';
import VipCarousel from '@/components/VipCarousel';
import RecentCommissions from '@/components/RecentCommissions';
import AboutSection from '@/components/AboutSection';
import { Spinner } from '@/components/Spinner';
import dswLogo from '@/assets/dsw-logo.png';

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

  // Filter P-Series levels for display
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P' || !level.series);

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
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={dswLogo} alt="DSW" className="w-10 h-10 object-contain rounded-lg" />
            <h1 className="font-display text-xl font-bold text-foreground">DSW</h1>
          </div>
        </header>

        <BalanceCard
          balance={profile.balance}
          withdrawableBalance={profile.withdrawable_balance}
          vipLevel={profile.current_vip_level}
          userName={profile.name}
          phone={profile.phone}
        />

        <div className="my-6">
          <ActionButtons
            onDeposit={() => setShowDeposit(true)}
            onWithdraw={() => setShowWithdraw(true)}
            onCustomerService={() => navigate('/service')}
            onGift={() => setShowGift(true)}
          />
        </div>

        {/* Auto-scrolling VIP Carousel */}
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-foreground mb-4">{t('Hot Products')}</h2>
          <VipCarousel items={carouselItems} onInvest={handleInvest} />
        </div>

        {/* Recent Commissions Ticker */}
        <RecentCommissions />

        {/* About Us Section with Video */}
        <AboutSection />
      </div>

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
        onClose={() => setShowAnnouncement(false)}
      />
    </div>
  );
};

export default Dashboard;
