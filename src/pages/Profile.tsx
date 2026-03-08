import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import {
  Crown, LogOut, ChevronRight, Settings, HelpCircle,
  FileText, MessageCircle, Send, Calendar, Clock,
  History, Copy, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';

interface DailyIncome {
  today_income: number;
  yesterday_income: number;
  last_income_transfer_at: string | null;
  last_yesterday_claim_at: string | null;
}

const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            {t('Help Center')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-3">
          <button
            onClick={() => window.open('https://t.me/Tiktokshoponline_suport', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{t('Official Support')}</p>
              <p className="text-xs text-muted-foreground">@DSW_Support</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
          <button
            onClick={() => window.open('https://t.me/etonlinejob1', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Send className="w-5 h-5 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{t('Public Channel')}</p>
              <p className="text-xs text-muted-foreground">DSW Channel</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
          <button
            onClick={() => window.open('https://t.me/+Jihv4uEOv0o0M2U0', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-sm">{t('Discussion Group')}</p>
              <p className="text-xs text-muted-foreground">DSW Group</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<DailyIncome | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [timeUntilNextTransfer, setTimeUntilNextTransfer] = useState('');

  // Independent eye toggle states for each field
  const [showBalanceEye, setShowBalanceEye] = useState(false);
  const [showWithdrawableEye, setShowWithdrawableEye] = useState(false);
  const [showRewardEye, setShowRewardEye] = useState(false);
  const [showTodayEye, setShowTodayEye] = useState(false);
  const [showYesterdayEye, setShowYesterdayEye] = useState(false);

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
  };

  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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
      setDailyIncome({
        today_income: data.today_income,
        yesterday_income: data.yesterday_income,
        last_income_transfer_at: data.last_income_transfer_at,
        last_yesterday_claim_at: data.last_yesterday_claim_at,
      });
    }

    await refreshProfile();
  };

  const fetchRewardBalance = async () => {
    if (!user) return;
    
    // Sum gift code claims
    const { data: giftClaims } = await supabase
      .from('gift_code_claims')
      .select('amount')
      .eq('user_id', user.id);

    // Sum referral bonus transactions
    const { data: referralBonuses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'referral_bonus')
      .eq('status', 'completed');

    const giftTotal = giftClaims?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const referralTotal = referralBonuses?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setRewardBalance(giftTotal + referralTotal);
  };

  useEffect(() => {
    fetchDailyIncome();
    fetchRewardBalance();
  }, [user]);

  useEffect(() => {
    if (!dailyIncome?.last_income_transfer_at) return;

    const updateTimer = () => {
      const now = new Date();
      const lastTransfer = new Date(dailyIncome.last_income_transfer_at!);
      const hoursSince = (now.getTime() - lastTransfer.getTime()) / (1000 * 60 * 60);

      if (hoursSince < 24) {
        const hoursLeft = 24 - hoursSince;
        const h = Math.floor(hoursLeft);
        const m = Math.floor((hoursLeft % 1) * 60);
        setTimeUntilNextTransfer(`${h}h ${m}m`);
      } else {
        setTimeUntilNextTransfer('');
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, [dailyIncome?.last_income_transfer_at]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 6) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 9) return phone;
    const lastNine = cleaned.slice(-9);
    return '+251' + lastNine.slice(0, 1) + '**' + lastNine.slice(-4);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const menuItems = [
    { icon: <History className="w-5 h-5" />, label: t('Transaction History'), onClick: () => navigate('/transactions'), iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: <Settings className="w-5 h-5" />, label: t('Settings'), onClick: () => navigate('/settings'), iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
    { icon: <HelpCircle className="w-5 h-5" />, label: t('Help Center'), onClick: () => setShowHelpCenter(true), iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { icon: <FileText className="w-5 h-5" />, label: t('Terms & Conditions'), onClick: () => setShowTerms(true), iconBg: 'bg-teal-50', iconColor: 'text-teal-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Telebirr-style Header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}>
        {/* Filled wave patterns like BalanceCard */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0,120 C100,170 200,70 300,120 C350,145 400,120 400,120 L400,300 L0,300 Z" fill="white" />
          <path d="M0,160 C80,210 180,110 280,170 C340,200 400,160 400,160 L400,300 L0,300 Z" fill="white" opacity="0.5" />
        </svg>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-10 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 pt-8 pb-10 px-5 max-w-md mx-auto">
          {/* User info */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">
                {profile.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{t('Selam')}, {profile.name}</h2>
                {profile.current_vip_level && profile.current_vip_level > 0 && (
                  <span className="px-2 py-0.5 bg-yellow-400/90 rounded-full text-[10px] font-bold text-yellow-900 flex items-center gap-0.5">
                    <Crown className="w-2.5 h-2.5" /> VIP {profile.current_vip_level}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-white/70">{maskPhone(profile.phone)}</span>
                <button onClick={() => copyToClipboard(profile.phone)} className="p-0.5">
                  <Copy className="w-3 h-3 text-white/50" />
                </button>
                {copied && <span className="text-[10px] text-yellow-300 ml-1">Copied!</span>}
              </div>
            </div>
          </div>

          {/* Main Balance - centered */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-sm text-white/70">{t('Balance')} (ETB)</span>
              <button onClick={() => setShowBalanceEye(!showBalanceEye)} className="p-0.5">
                {showBalanceEye ? <Eye className="w-4 h-4 text-white/70" /> : <EyeOff className="w-4 h-4 text-white/70" />}
              </button>
            </div>
            <p className="text-4xl font-bold text-white tracking-wider">
              {showBalanceEye ? profile.balance.toLocaleString() : '***'}
              <span className="text-base font-normal text-white/60 ml-1">ETB</span>
            </p>
          </div>

          {/* 2-column: Withdrawable & Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center bg-white/10 rounded-xl py-3 px-2 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-bold text-white">{t('Withdrawable')}</span>
                <button onClick={() => setShowWithdrawableEye(!showWithdrawableEye)} className="p-0.5">
                  {showWithdrawableEye ? <Eye className="w-3 h-3 text-white/60" /> : <EyeOff className="w-3 h-3 text-white/60" />}
                </button>
              </div>
              <p className="text-lg font-bold text-white">
                {showWithdrawableEye ? profile.withdrawable_balance.toLocaleString() : '***'}
                <span className="text-[10px] font-normal text-white/50 ml-0.5">ETB</span>
              </p>
            </div>
            <div className="text-center bg-white/10 rounded-xl py-3 px-2 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-sm font-bold text-white">{t('Reward')}</span>
                <button onClick={() => setShowRewardEye(!showRewardEye)} className="p-0.5">
                  {showRewardEye ? <Eye className="w-3 h-3 text-white/60" /> : <EyeOff className="w-3 h-3 text-white/60" />}
                </button>
              </div>
              <p className="text-lg font-bold text-yellow-300">
                {showRewardEye ? rewardBalance.toLocaleString() : '***'}
                <span className="text-[10px] font-normal text-yellow-300/60 ml-0.5">ETB</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom wave separator */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" preserveAspectRatio="none" style={{ height: '20px' }}>
          <path d="M0,20 C360,40 720,0 1080,25 C1260,32 1380,15 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
        </svg>
      </div>

      {/* Scrolling ticker */}
      <div className="bg-yellow-400 overflow-hidden py-1.5">
        <div className="whitespace-nowrap animate-marquee inline-block text-xs font-medium text-yellow-900">
          🎉 WELCOME TO DSW! EARN DAILY INCOME WITH YOUR VIP MEMBERSHIP! &nbsp;&nbsp;&nbsp; ONE APP FOR ALL YOUR NEEDS! &nbsp;&nbsp;&nbsp; 🚀 UPGRADE YOUR VIP LEVEL TODAY! &nbsp;&nbsp;&nbsp;
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-3">
        {/* Daily Income Cards */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white rounded-xl p-3 shadow-sm border-2" style={{ borderColor: '#B0FC38' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-green-600" />
                <span className="text-xs font-bold text-gray-800">{t("Today's Income")}</span>
              </div>
              <button onClick={() => setShowTodayEye(!showTodayEye)} className="p-0.5">
                {showTodayEye ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
            <p className="text-sm font-bold text-gray-800">
              {showTodayEye ? (dailyIncome?.today_income || 0).toLocaleString() : '***'} <span className="text-[10px] font-normal text-gray-400">ETB</span>
            </p>
            {timeUntilNextTransfer && (dailyIncome?.today_income || 0) > 0 && (
              <p className="text-[9px] text-gray-400 mt-0.5">⏳ {timeUntilNextTransfer}</p>
            )}
          </div>

          <div className="bg-white rounded-xl p-3 shadow-sm border-2" style={{ borderColor: '#B0FC38' }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-600" />
                <span className="text-xs font-bold text-gray-800">{t("Yesterday's Income")}</span>
              </div>
              <button onClick={() => setShowYesterdayEye(!showYesterdayEye)} className="p-0.5">
                {showYesterdayEye ? <Eye className="w-3 h-3 text-gray-400" /> : <EyeOff className="w-3 h-3 text-gray-400" />}
              </button>
            </div>
            <p className="text-sm font-bold text-gray-800">
              {showYesterdayEye ? (dailyIncome?.yesterday_income || 0).toLocaleString() : '***'} <span className="text-[10px] font-normal text-gray-400">ETB</span>
            </p>
            <p className="text-[9px] text-gray-400 mt-0.5">
              {(dailyIncome?.yesterday_income || 0) > 0 ? t('Auto-claimed after 24h') : t('Will be available tomorrow')}
            </p>
          </div>
        </div>

        {/* Income Flow Info */}
        <div className="bg-green-50 rounded-xl p-2.5 mb-3 border border-green-100">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-green-700 leading-relaxed">
              {t("Today's income")} → 24h → {t("Yesterday's Income")} + {t('Withdrawable')} → 24h → {t('Cleared')}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1.5 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 text-foreground">
                <div className={`w-9 h-9 rounded-lg ${item.iconBg} flex items-center justify-center ${item.iconColor}`}>
                  {item.icon}
                </div>
                <span className="text-sm font-bold">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-red-200 text-red-500 hover:bg-red-50 text-sm h-10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('Sign Out')}
        </Button>

        <p className="text-center text-[10px] text-gray-400 mt-3">DSW App v1.0.0</p>
      </div>

      <BottomNavigation />

      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />

      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Terms & Conditions')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-3 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">1. Introduction</p>
            <p>Welcome to DSW Platform. By using our services, you agree to these terms.</p>
            <p className="font-semibold text-foreground">2. Account Registration</p>
            <p>Users must provide accurate information. One account per user.</p>
            <p className="font-semibold text-foreground">3. VIP Membership</p>
            <p>VIP packages grant access to earning tasks. Non-refundable once purchased.</p>
            <p className="font-semibold text-foreground">4. Income Structure</p>
            <p>Daily income moves to "Yesterday's Income" after 24h, then auto-transfers to withdrawable balance.</p>
            <p className="font-semibold text-foreground">5. Deposits & Withdrawals</p>
            <p>Deposits require admin approval. Withdrawals processed within 24-48 hours.</p>
            <p className="font-semibold text-foreground">6. Privacy</p>
            <p>User data is protected and encrypted.</p>
            <div className="flex items-center space-x-2 pt-3 border-t">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(!!checked)}
              />
              <label htmlFor="terms" className="text-sm">I accept the terms and conditions</label>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Profile;
