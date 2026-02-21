import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Crown, LogOut, ChevronRight, Settings, HelpCircle, 
  FileText, MessageCircle, Send, Banknote, Calendar, Clock, 
  History, User, Users, Sparkles, Shield, CheckCircle,
  Gift, Award, TrendingUp, Wallet, Phone, Copy,
  Star, Diamond, Medal, Target, Zap, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';

interface DailyIncome {
  today_income: number;
  yesterday_income: number;
  last_claim_date: string | null;
  last_income_transfer_at: string | null;
  last_yesterday_claim_at: string | null;
}

// Help Center Modal Component
const HelpCenterModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <HelpCircle className="w-5 h-5" />
            </div>
            {t('Help Center')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            onClick={() => window.open('https://t.me/Tiktokshoponline_suport', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-blue-100 dark:border-blue-900/50 shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 group"
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                {t('Official Support')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Send className="w-3 h-3" />
                @DSW_Support
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
          </button>

          <button
            onClick={() => window.open('https://t.me/etonlinejob1', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-purple-900/50 shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 group"
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition-colors">
                {t('Public Channel')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Join our Telegram channel')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-purple-600" />
            </div>
          </button>

          <button
            onClick={() => window.open('https://t.me/+Jihv4uEOv0o0M2U0', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border-2 border-green-100 dark:border-green-900/50 shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 group"
          >
            <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-gray-800 dark:text-white group-hover:text-green-600 transition-colors">
                {t('Discussion Group')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('Join our community')}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-green-600" />
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Profile Menu Item Component
const ProfileMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
}> = ({ icon, label, onClick, color = 'blue' }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-indigo-600 border-blue-200 dark:border-blue-800',
    purple: 'from-purple-500 to-pink-600 border-purple-200 dark:border-purple-800',
    green: 'from-green-500 to-emerald-600 border-green-200 dark:border-green-800',
    orange: 'from-orange-500 to-red-600 border-orange-200 dark:border-orange-800',
    red: 'from-red-500 to-rose-600 border-red-200 dark:border-red-800',
  };

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-100 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all hover:scale-102 active:scale-98 group"
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-full bg-gradient-to-br ${colorClasses[color]} text-white shadow-md`}>
          {icon}
        </div>
        <span className="font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {label}
        </span>
      </div>
      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
        <ChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-400" />
      </div>
    </button>
  );
};

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<DailyIncome>({
    today_income: 0,
    yesterday_income: 0,
    last_claim_date: null,
    last_income_transfer_at: null,
    last_yesterday_claim_at: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);

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

    // Trigger automatic income transfers via edge function
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
        today_income: data.today_income || 0,
        yesterday_income: data.yesterday_income || 0,
        last_claim_date: data.last_claim_date,
        last_income_transfer_at: data.last_income_transfer_at,
        last_yesterday_claim_at: data.last_yesterday_claim_at,
      });
    }

    // Refresh profile to get updated withdrawable balance
    await refreshProfile();
  };

  useEffect(() => {
    fetchDailyIncome();
  }, [user]);

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('Loading profile...')}</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <History className="w-4 h-4" />, label: t('Transaction History'), onClick: () => navigate('/transactions'), color: 'blue' as const },
    { icon: <Settings className="w-4 h-4" />, label: t('Settings'), onClick: () => navigate('/settings'), color: 'purple' as const },
    { icon: <HelpCircle className="w-4 h-4" />, label: t('Help Center'), onClick: () => setShowHelpCenter(true), color: 'green' as const },
    { icon: <FileText className="w-4 h-4" />, label: t('Terms & Conditions'), onClick: () => setShowTerms(true), color: 'orange' as const },
  ];

  // VIP Level Badge Configuration
  const getVipBadge = (level: number) => {
    if (level === 0) return { icon: Star, color: 'from-gray-400 to-gray-500', text: 'VIP 0' };
    if (level === 1) return { icon: Medal, color: 'from-yellow-400 to-yellow-500', text: 'VIP 1' };
    if (level === 2) return { icon: Diamond, color: 'from-blue-400 to-blue-500', text: 'VIP 2' };
    if (level === 3) return { icon: Crown, color: 'from-purple-400 to-purple-500', text: 'VIP 3' };
    if (level === 4) return { icon: Award, color: 'from-red-400 to-red-500', text: 'VIP 4' };
    if (level === 5) return { icon: Target, color: 'from-green-400 to-green-500', text: 'VIP 5' };
    return { icon: Crown, color: 'from-indigo-400 to-indigo-500', text: `VIP ${level}` };
  };

  const vipBadge = getVipBadge(profile.current_vip_level || 0);
  const VipIcon = vipBadge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-800 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Decorative Header */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl opacity-10 blur-2xl" />
          <h1 className="relative text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <User className="w-5 h-5" />
            </div>
            {t('My Profile')}
          </h1>
        </div>

        {/* Profile Header with Glass Effect */}
        <div className="relative mb-4 overflow-hidden rounded-2xl animate-fadeIn">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
          
          <div className="relative p-6 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              {/* User Avatar with Animation */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full animate-pulse blur-md" />
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-white shadow-2xl">
                  <span className="text-4xl filter drop-shadow-lg">👤</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white drop-shadow-lg">{profile.name}</h2>
                  {profile.current_vip_level > 0 && (
                    <div className="animate-bounce-slow">
                      <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                    </div>
                  )}
                </div>
                
                {/* Phone with Copy */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <Phone className="w-3 h-3 text-white/80" />
                    <p className="text-sm text-white/90">{maskPhone(profile.phone)}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(profile.phone)}
                    className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors hover:scale-110 active:scale-90"
                  >
                    <Copy className="w-3 h-3 text-white" />
                  </button>
                </div>
                
                {/* Copy Feedback */}
                {copied && (
                  <p className="text-xs text-green-300 mt-1 animate-fadeIn">
                    ✓ {t('Copied!')}
                  </p>
                )}
              </div>

              {/* VIP Badge */}
              <div 
                className={`px-4 py-2 rounded-full bg-gradient-to-r ${vipBadge.color} shadow-lg flex items-center gap-1 hover:scale-110 transition-transform`}
              >
                <VipIcon className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">{vipBadge.text}</span>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <p className="text-xs text-white/70">Tasks</p>
                <p className="text-sm font-bold text-white">24</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <p className="text-xs text-white/70">Days</p>
                <p className="text-sm font-bold text-white">15</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
                <p className="text-xs text-white/70">Rank</p>
                <p className="text-sm font-bold text-white">#42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Balance Cards with Improved Design */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="relative group animate-slideInLeft">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg overflow-hidden hover:scale-102 transition-transform">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-6 -mb-6" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-white/80">{t('Total Balance')}</p>
                </div>
                <p className="text-2xl font-bold text-white">{profile.balance.toLocaleString()} ETB</p>
                <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  ≈ ${(profile.balance * 0.031).toFixed(2)} USD
                </p>
              </div>
            </div>
          </div>

          <div className="relative group animate-slideInRight">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl blur-lg opacity-25 group-hover:opacity-40 transition-opacity" />
            <div className="relative p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg overflow-hidden hover:scale-102 transition-transform">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-6 -mb-6" />
              
              <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Banknote className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-white/80">{t('Withdrawable')}</p>
                </div>
                <p className="text-2xl font-bold text-white">{profile.withdrawable_balance.toLocaleString()} ETB</p>
                <p className="text-xs text-white/60 mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {t('Available now')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Income Display with Improved Design */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative overflow-hidden rounded-xl animate-fadeInUp">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
            
            <div className="relative p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/30 backdrop-blur-sm rounded-lg">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{t("Today's Income")}</span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-white">
                  {dailyIncome.today_income.toLocaleString()}
                </p>
                <span className="text-sm text-white/80">ETB</span>
              </div>
              
              {dailyIncome.today_income > 0 ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                  <TrendingUp className="w-3 h-3" />
                  <span>{t('Auto-transfers in 24h')}</span>
                </div>
              ) : (
                <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {t('Start earning today')}
                </p>
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl animate-fadeInUp animation-delay-200">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-sm" />
            
            <div className="relative p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-white/30 backdrop-blur-sm rounded-lg">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">{t("Yesterday's Income")}</span>
              </div>
              
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-white">
                  {dailyIncome.yesterday_income.toLocaleString()}
                </p>
                <span className="text-sm text-white/80">ETB</span>
              </div>
              
              {dailyIncome.yesterday_income > 0 ? (
                <div className="flex items-center gap-1 mt-2 text-xs text-white/80">
                  <Gift className="w-3 h-3" />
                  <span>{t('Ready to transfer')}</span>
                </div>
              ) : (
                <p className="text-xs text-white/60 mt-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('Check back tomorrow')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Menu Items with Improved Design */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, index) => (
            <div
              key={item.label}
              className={`animate-slideInLeft animation-delay-${index * 200}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProfileMenuItem {...item} />
            </div>
          ))}
        </div>

        {/* Sign Out Button */}
        <div className="animate-fadeInUp animation-delay-500">
          <button
            onClick={handleSignOut}
            className="w-full bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white border-0 shadow-lg hover:shadow-xl transition-all group h-12 rounded-xl font-medium hover:scale-102 active:scale-98"
          >
            <div className="flex items-center justify-center">
              <LogOut className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              {t('Sign Out')}
            </div>
          </button>
        </div>

        {/* App Version */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          DSW App v1.0.0
        </p>
      </div>

      <BottomNavigation />

      {/* Help Center Modal */}
      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />

      {/* Terms & Conditions Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-gradient-to-b from-white to-blue-50 dark:from-gray-900 dark:to-gray-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white">
                <FileText className="w-5 h-5" />
              </div>
              {t('Terms & Conditions')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Terms sections */}
            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('Introduction')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Welcome to DSW Platform. By using our services, you agree to these terms and conditions.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">2</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('Account Registration')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Users must provide accurate information during registration. One account per user only.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">3</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('VIP Membership')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                VIP packages grant access to earning tasks. Membership is non-refundable once purchased.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400">4</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('Deposits & Withdrawals')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Deposits require admin approval. Withdrawals processed within 24-48 hours.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">5</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('User Conduct')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                Fraudulent activities may result in account suspension.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">6</span>
                </div>
                <p className="font-semibold text-gray-800 dark:text-white">{t('Privacy')}</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                User data is protected and encrypted.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
                className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                {t('I agree to the Terms & Conditions')}
              </label>
            </div>

            <button
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-50 h-11 rounded-xl font-medium disabled:cursor-not-allowed transition-all hover:scale-102 active:scale-98"
              disabled={!termsAccepted}
              onClick={() => {
                showSuccess('Terms accepted successfully!');
                setShowTerms(false);
              }}
            >
              <div className="flex items-center justify-center">
                <Sparkles className="w-4 h-4 mr-2" />
                {t('Accept & Continue')}
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceSlow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        
        .animate-bounce-slow {
          animation: bounceSlow 2s infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
        
        .active\\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default Profile;