import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import {
<<<<<<< HEAD
  ChevronRight, MessageCircle, Send, ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Spinner } from '@/components/Spinner';
import rechargeIcon from '@/assets/icon-recharge.png';
import withdrawIcon from '@/assets/icon-withdraw.png';
import userAvatarIcon from '@/assets/icon-user-avatar.png';
import customerServiceIcon from '@/assets/customer-service.png';
import iconGift from '@/assets/icon-gift.png';
import iconChat from '@/assets/icon-chat.png';
import iconDollar from '@/assets/icon-dollar.png';
import iconDownload from '@/assets/icon-download.png';
import iconLogout from '@/assets/icon-logout.png';
import iconBankcard from '@/assets/icon-bankcard.png';
import iconSettingsGear from '@/assets/icon-settings-gear.png';
=======
  Crown, LogOut, ChevronRight, Settings, HelpCircle,
  FileText, MessageCircle, Send, Calendar, Clock,
  History, Copy, Eye, EyeOff, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

interface DailyIncome {
  today_income: number;
  yesterday_income: number;
  last_income_transfer_at: string | null;
  last_yesterday_claim_at: string | null;
}

<<<<<<< HEAD
interface UserDetails {
  full_name: string | null;
  phone: string;
  email: string | null;
  created_at: string;
  vip_level_name: string;
  account_number: string;
  referral_code: string | null;
  total_investment: number;
  total_earnings: number;
}
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
<<<<<<< HEAD
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<DailyIncome | null>(null);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [investmentEarnings, setInvestmentEarnings] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [threePercentEarnings, setThreePercentEarnings] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

<<<<<<< HEAD
  // Fetch user details from database
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user || !profile) return;
      
      // Get VIP level name
      let vipLevelName = 'VIP 0';
      if (profile.vip_level_id) {
        const { data: vipData } = await supabase
          .from('vip_levels')
          .select('name')
          .eq('id', profile.vip_level_id)
          .single();
        
        if (vipData) {
          vipLevelName = vipData.name;
        }
      }

      // Format account number from phone
      const phoneNumber = profile.phone || '';
      const accountNumber = phoneNumber.replace(/\D/g, '');

      // Get total investment from transactions
      const { data: investments } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'vip_purchase')
        .eq('status', 'completed');

      const totalInvestment = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

      setUserDetails({
        full_name: profile.full_name || null,
        phone: profile.phone || '',
        email: profile.email || null,
        created_at: profile.created_at || new Date().toISOString(),
        vip_level_name: vipLevelName,
        account_number: accountNumber,
        referral_code: profile.referral_code || null,
        total_investment: totalInvestment,
        total_earnings: profile.withdrawable_balance || 0
      });
    };

    fetchUserDetails();
  }, [user, profile]);

  const fetchDailyIncome = async () => {
    if (!user) return;
=======
  const fetchDailyIncome = async () => {
    if (!user) return;

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    try {
      await supabase.functions.invoke('transfer-income');
    } catch (e) {
      console.log('Income transfer check:', e);
    }
<<<<<<< HEAD
=======

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    const { data } = await supabase
      .from('user_daily_income')
      .select('*')
      .eq('user_id', user.id)
      .single();
<<<<<<< HEAD
=======

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    if (data) {
      setDailyIncome({
        today_income: data.today_income,
        yesterday_income: data.yesterday_income,
        last_income_transfer_at: data.last_income_transfer_at,
        last_yesterday_claim_at: data.last_yesterday_claim_at,
      });
    }
<<<<<<< HEAD
=======

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    await refreshProfile();
  };

  const fetchRewardBalance = async () => {
    if (!user) return;
<<<<<<< HEAD
=======
    
    // Sum gift code claims
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    const { data: giftClaims } = await supabase
      .from('gift_code_claims')
      .select('amount')
      .eq('user_id', user.id);
<<<<<<< HEAD
=======

    // Sum referral bonus transactions
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    const { data: referralBonuses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'referral_bonus')
      .eq('status', 'completed');
<<<<<<< HEAD
    const giftTotal = giftClaims?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const referralTotal = referralBonuses?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setRewardBalance(giftTotal + referralTotal);
    setTeamEarnings(referralTotal);
  };

  const fetchInvestmentEarnings = async () => {
    if (!user) return;
    setInvestmentEarnings(profile?.withdrawable_balance || 0);
    
    const { data: threePercent } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'task_profit')
      .eq('status', 'completed');
    const total3 = threePercent?.reduce((sum, t) => sum + Number(t.amount) * 0.03, 0) || 0;
    setThreePercentEarnings(total3);
=======

    const giftTotal = giftClaims?.reduce((sum, c) => sum + Number(c.amount), 0) || 0;
    const referralTotal = referralBonuses?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
    setRewardBalance(giftTotal + referralTotal);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  };

  useEffect(() => {
    fetchDailyIncome();
    fetchRewardBalance();
<<<<<<< HEAD
    fetchInvestmentEarnings();
  }, [user]);

=======
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

>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

<<<<<<< HEAD
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading || !profile || !userDetails) {
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

<<<<<<< HEAD
  const balanceValue = profile.balance || 0;
  const todayIncome = dailyIncome?.today_income || 0;
  const displayPhone = userDetails.phone.replace(/\D/g, '').slice(-9) || 'User';

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Green gradient header */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #a3e635 0%, #d4f57a 50%, #f0f9e0 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-8 right-[-40px] w-[180px] h-[180px] rounded-full" style={{ background: 'rgba(180, 230, 60, 0.4)' }} />
        <div className="absolute top-[-20px] right-[60px] w-[120px] h-[120px] rounded-full" style={{ background: 'rgba(200, 240, 80, 0.3)' }} />
        <div className="absolute bottom-[40px] left-[-30px] w-[100px] h-[100px] rounded-full" style={{ background: 'rgba(180, 230, 60, 0.25)' }} />

        <div className="relative z-10 max-w-md mx-auto px-5 pt-6 pb-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-bold text-gray-900">{t('My Profile')}</h1>
            <button onClick={() => setShowHelpCenter(true)} className="p-1">
              <img src={customerServiceIcon} alt="Support" className="w-7 h-7" />
            </button>
          </div>

          {/* User card - expandable with details from database */}
          <div className="w-full bg-[#b5e834] rounded-2xl p-4 mb-5 shadow-sm">
            <button
              onClick={() => setShowUserDetails(!showUserDetails)}
              className="w-full flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                <img src={userAvatarIcon} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-left">
                <span className="text-2xl font-bold text-gray-900 block">
                  {userDetails.full_name || displayPhone}
                </span>
                <span className="text-sm text-gray-700">
                  {userDetails.vip_level_name}
                </span>
              </div>
              {showUserDetails ? (
                <ChevronUp className="w-7 h-7 text-gray-700 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-7 h-7 text-gray-700 flex-shrink-0" />
              )}
            </button>

            {/* Expanded user details - fetched from database */}
            {showUserDetails && (
              <div className="mt-4 pt-4 border-t border-gray-600/20 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Full Name</span>
                  <span className="text-sm font-semibold text-gray-900">{userDetails.full_name || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Phone Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{userDetails.phone}</span>
                    <button
                      onClick={() => copyToClipboard(userDetails.phone, 'phone')}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      {copiedField === 'phone' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Email</span>
                  <span className="text-sm font-semibold text-gray-900">{userDetails.email || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{userDetails.account_number}</span>
                    <button
                      onClick={() => copyToClipboard(userDetails.account_number, 'account')}
                      className="p-1 hover:bg-white/50 rounded transition-colors"
                    >
                      {copiedField === 'account' ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">VIP Level</span>
                  <span className="text-sm font-semibold text-green-800 bg-green-200 px-3 py-1 rounded-full">
                    {userDetails.vip_level_name}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Referral Code</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{userDetails.referral_code || 'N/A'}</span>
                    {userDetails.referral_code && (
                      <button
                        onClick={() => copyToClipboard(userDetails.referral_code!, 'referral')}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                      >
                        {copiedField === 'referral' ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Investment</span>
                  <span className="text-sm font-semibold text-gray-900">{userDetails.total_investment.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Total Earnings</span>
                  <span className="text-sm font-semibold text-green-600">{userDetails.total_earnings.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Member Since</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(userDetails.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Circular balance with 4 stats */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="relative flex items-center justify-center py-4">
              {/* Center circle */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#a3e635" strokeWidth="6"
                    strokeDasharray={`${Math.min((balanceValue / Math.max(balanceValue, 1000)) * 339, 339)} 339`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-500">{t('Balance')}</span>
                  <span className="text-xl font-bold text-gray-900">{balanceValue.toLocaleString()}</span>
                </div>
              </div>

              {/* Four corner stats */}
              <div className="absolute top-0 left-0 text-center w-24">
                <p className="text-[11px] text-gray-500 leading-tight">{t('Investment')}<br/>{t('Earnings')}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{investmentEarnings.toLocaleString()}</p>
              </div>
              <div className="absolute top-0 right-0 text-center w-24">
                <p className="text-[11px] text-gray-500 leading-tight">{t('Team')}<br/>{t('Earnings')}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{(teamEarnings + threePercentEarnings).toLocaleString()}</p>
              </div>
              <div className="absolute bottom-0 left-0 text-center w-24">
                <p className="text-[11px] text-gray-500 leading-tight">{t('Gift')}<br/>{t('Earnings')}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{rewardBalance.toLocaleString()}</p>
              </div>
              <div className="absolute bottom-0 right-0 text-center w-24">
                <p className="text-[11px] text-gray-500 leading-tight">{t("Today's")}<br/>{t('Earnings')}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">{todayIncome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        {/* Recharge & Withdraw */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <div className="grid grid-cols-3 gap-4">
            <button onClick={() => navigate('/deposit')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                <img src={rechargeIcon} alt="Recharge" className="w-14 h-14 rounded-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{t('Recharge')}</span>
            </button>
            <button onClick={() => navigate('/withdraw')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                <img src={withdrawIcon} alt="Withdraw" className="w-14 h-14 rounded-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{t('Withdraw')}</span>
            </button>
            <button onClick={() => navigate('/settings')} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center">
                <img src={iconSettingsGear} alt="Settings" className="w-14 h-14 rounded-xl" />
              </div>
              <span className="text-sm font-semibold text-gray-800">{t('Settings')}</span>
            </button>
          </div>
        </div>

        {/* Menu list */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
          <MenuItem
            icon={<img src={iconBankcard} alt="" className="w-7 h-7" />}
            iconBg="bg-[#f0ffd6]"
            label={t('Bank Card')}
            onClick={() => navigate('/bank-cards')}
          />
          <MenuItem
            icon={<img src={iconGift} alt="" className="w-7 h-7" />}
            iconBg="bg-[#fff3e0]"
            label={t('Bonus History')}
            onClick={() => navigate('/transactions')}
          />
          <MenuItem
            icon={<img src={iconDownload} alt="" className="w-7 h-7" />}
            iconBg="bg-[#e8f5e9]"
            label={t('Notifications')}
            onClick={() => navigate('/announcements')}
          />
          <MenuItem
            icon={<img src={iconDollar} alt="" className="w-7 h-7" />}
            iconBg="bg-[#e8f5e9]"
            label={t('Transaction History')}
            onClick={() => navigate('/transactions')}
          />
          <MenuItem
            icon={<img src={iconChat} alt="" className="w-7 h-7" />}
            iconBg="bg-[#fff8e1]"
            label={t('Help Center')}
            onClick={() => setShowHelpCenter(true)}
          />
          <MenuItem
            icon={<img src={iconLogout} alt="" className="w-7 h-7" />}
            iconBg="bg-[#fff3e0]"
            label={t('Log Out')}
            onClick={handleSignOut}
            isLast
          />
        </div>

        <p className="text-center text-[10px] text-gray-400 mt-3 mb-2">DSW App v1.0.0</p>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      </div>

      <BottomNavigation />

<<<<<<< HEAD
      {/* Help Center Modal */}
      <Dialog open={showHelpCenter} onOpenChange={setShowHelpCenter}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <img src={iconChat} alt="" className="w-5 h-5" />
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
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  );
};

<<<<<<< HEAD
const MenuItem: React.FC<{
  icon: React.ReactNode;
  iconBg: string;
  iconColor?: string;
  label: string;
  onClick: () => void;
  badge?: number;
  isLast?: boolean;
}> = ({ icon, iconBg, iconColor, label, onClick, badge, isLast }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors ${!isLast ? 'border-b border-gray-100' : ''}`}
  >
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-800">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge && badge > 0 && (
        <span className="w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">{badge}</span>
      )}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </button>
);

export default Profile;
=======
export default Profile;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
