import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Crown, LogOut, ChevronRight, Settings, HelpCircle, 
  FileText, MessageCircle, Send, Banknote, Calendar, Clock, 
  History, User, Users, Copy, Phone, Wallet, Gift, TrendingUp,
  Award, CheckCircle
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
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 rounded-full bg-blue-500 text-white">
              <HelpCircle className="w-4 h-4" />
            </div>
            {t('Help Center')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            onClick={() => window.open('https://t.me/DSWonline_suport', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="p-2 rounded-full bg-blue-500 text-white">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-800">Official Support</p>
              <p className="text-xs text-gray-500">@DSWonline_suport</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => window.open('https://t.me/etonlinejob1', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="p-2 rounded-full bg-purple-500 text-white">
              <Users className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-800">Public Channel</p>
              <p className="text-xs text-gray-500">DSW Channel</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button
            onClick={() => window.open('https://t.me/+Jihv4uEOv0o0M2U0', '_blank')}
            className="w-full flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="p-2 rounded-full bg-green-500 text-white">
              <MessageCircle className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <p className="font-medium text-gray-800">Discussion Group</p>
              <p className="text-xs text-gray-500">DSW Group</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Profile Menu Item Component - Reduced size
const ProfileMenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="text-blue-600">{icon}</div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400" />
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
  const [isClaiming, setIsClaiming] = useState(false);

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

    await refreshProfile();
  };

  useEffect(() => {
    fetchDailyIncome();
  }, [user]);

  // Function to transfer yesterday's income to withdrawable after 24 hours
  const transferYesterdayIncome = async () => {
    if (!user || dailyIncome.yesterday_income <= 0) return;

    setIsClaiming(true);

    try {
      // Call the transfer-income function which handles the 24-hour logic
      const { error } = await supabase.functions.invoke('transfer-income', {
        body: { user_id: user.id }
      });

      if (error) throw error;

      // Refresh data
      await fetchDailyIncome();
      await refreshProfile();
      
      showSuccess('Income transferred to withdrawable balance!');
    } catch (error) {
      console.error('Error transferring income:', error);
      showSuccess('Failed to transfer income. Please try again.');
    } finally {
      setIsClaiming(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { icon: <History className="w-4 h-4" />, label: t('Transaction History'), onClick: () => navigate('/transactions') },
    { icon: <Settings className="w-4 h-4" />, label: t('Settings'), onClick: () => navigate('/settings') },
    { icon: <HelpCircle className="w-4 h-4" />, label: t('Help Center'), onClick: () => setShowHelpCenter(true) },
    { icon: <FileText className="w-4 h-4" />, label: t('Terms & Conditions'), onClick: () => setShowTerms(true) },
  ];

  // Check if 24 hours have passed since last transfer
  const canTransferYesterdayIncome = () => {
    if (!dailyIncome.last_income_transfer_at) return true;
    
    const lastTransfer = new Date(dailyIncome.last_income_transfer_at);
    const now = new Date();
    const hoursPassed = (now.getTime() - lastTransfer.getTime()) / (1000 * 60 * 60);
    
    return hoursPassed >= 24;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Simple Header */}
        <h1 className="text-xl font-bold text-gray-800 mb-4">My Profile</h1>

        {/* Profile Card - Clean version */}
        <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-3">
            {/* Simple Avatar */}
            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
              {profile.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-gray-800">{profile.name}</h2>
                {profile.current_vip_level > 0 && (
                  <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
              </div>
              
              {/* Phone with Copy */}
              <div className="flex items-center gap-1 mt-1">
                <Phone className="w-3 h-3 text-gray-400" />
                <p className="text-xs text-gray-600">{maskPhone(profile.phone)}</p>
                <button
                  onClick={() => copyToClipboard(profile.phone)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <Copy className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </div>

            {/* VIP Badge */}
            {profile.current_vip_level > 0 && (
              <div className="px-2 py-1 bg-blue-100 rounded text-xs font-medium text-blue-600">
                VIP {profile.current_vip_level}
              </div>
            )}
          </div>

          {/* Copy Feedback */}
          {copied && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Copied!
            </p>
          )}
        </div>

        {/* Balance Cards - Clean version */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 mb-2">
              <Wallet className="w-4 h-4 text-blue-500" />
              <p className="text-xs text-gray-500">Balance</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{profile.balance.toLocaleString()} ETB</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-1 mb-2">
              <Banknote className="w-4 h-4 text-green-500" />
              <p className="text-xs text-gray-500">Withdrawable</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{profile.withdrawable_balance.toLocaleString()} ETB</p>
          </div>
        </div>

        {/* Daily Income Display - No icons, bold text, home page colors */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Today's Income - Gift Code color (#F3E5F5) */}
          <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: '#F3E5F5' }}>
            <p className="text-xs font-medium text-gray-600 mb-1">Today's Income</p>
            <p className="text-xl font-bold text-gray-800">
              {dailyIncome.today_income.toLocaleString()} ETB
            </p>
            
            {dailyIncome.today_income > 0 ? (
              <p className="text-xs font-medium text-gray-600 mt-2">
                Auto-transfer in 24h
              </p>
            ) : (
              <p className="text-xs font-medium text-gray-600 mt-2">
                Start earning today
              </p>
            )}
          </div>

          {/* Yesterday's Income - Withdraw color (#FFF3E0) */}
          <div className="p-4 rounded-lg shadow-sm" style={{ backgroundColor: '#FFF3E0' }}>
            <p className="text-xs font-medium text-gray-600 mb-1">Yesterday's Income</p>
            <p className="text-xl font-bold text-gray-800">
              {dailyIncome.yesterday_income.toLocaleString()} ETB
            </p>
            
            {dailyIncome.yesterday_income > 0 ? (
              canTransferYesterdayIncome() ? (
                <button
                  onClick={transferYesterdayIncome}
                  disabled={isClaiming}
                  className="mt-2 w-full py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isClaiming ? 'Transferring...' : 'Transfer to Withdrawable'}
                </button>
              ) : (
                <p className="text-xs font-medium text-gray-600 mt-2">
                  Available in {Math.ceil(24 - ((new Date().getTime() - new Date(dailyIncome.last_income_transfer_at || '').getTime()) / (1000 * 60 * 60)))}h
                </p>
              )
            ) : (
              <p className="text-xs font-medium text-gray-600 mt-2">
                No income yesterday
              </p>
            )}
          </div>
        </div>

        {/* Menu Items - Reduced size */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item, index) => (
            <ProfileMenuItem key={index} {...item} />
          ))}
        </div>

        {/* Sign Out Button - Reduced size */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-500 hover:bg-red-600 text-white h-10 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

        {/* App Version */}
        <p className="text-center text-xs text-gray-400 mt-6">
          DSW App v1.0.0
        </p>
      </div>

      <BottomNavigation />

      {/* Help Center Modal */}
      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />

      {/* Terms & Conditions Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-full bg-orange-500 text-white">
                <FileText className="w-4 h-4" />
              </div>
              Terms & Conditions
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">1. Introduction</p>
              <p className="text-sm text-gray-600">Welcome to DSW Platform. By using our services, you agree to these terms and conditions.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">2. Account Registration</p>
              <p className="text-sm text-gray-600">Users must provide accurate information during registration. One account per user only.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">3. VIP Membership</p>
              <p className="text-sm text-gray-600">VIP packages grant access to earning tasks. Membership is non-refundable once purchased.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">4. Deposits & Withdrawals</p>
              <p className="text-sm text-gray-600">Deposits require admin approval. Withdrawals processed within 24-48 hours.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">5. User Conduct</p>
              <p className="text-sm text-gray-600">Fraudulent activities may result in account suspension.</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-800 mb-1">6. Privacy</p>
              <p className="text-sm text-gray-600">User data is protected and encrypted.</p>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
                className="border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                I agree to the Terms & Conditions
              </label>
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              disabled={!termsAccepted}
              onClick={() => {
                showSuccess('Terms accepted successfully!');
                setShowTerms(false);
              }}
            >
              Accept & Continue
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
    </div>
  );
};

export default Profile;