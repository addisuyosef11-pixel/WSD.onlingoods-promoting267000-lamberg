import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import {
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

interface DailyIncome {
  today_income: number;
  yesterday_income: number;
  last_income_transfer_at: string | null;
  last_yesterday_claim_at: string | null;
}

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

const Profile = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [dailyIncome, setDailyIncome] = useState<DailyIncome | null>(null);
  const [rewardBalance, setRewardBalance] = useState(0);
  const [investmentEarnings, setInvestmentEarnings] = useState(0);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [threePercentEarnings, setThreePercentEarnings] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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
    const { data: giftClaims } = await supabase
      .from('gift_code_claims')
      .select('amount')
      .eq('user_id', user.id);
    const { data: referralBonuses } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'referral_bonus')
      .eq('status', 'completed');
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
  };

  useEffect(() => {
    fetchDailyIncome();
    fetchRewardBalance();
    fetchInvestmentEarnings();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

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
      </div>

      <BottomNavigation />

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
    </div>
  );
};

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