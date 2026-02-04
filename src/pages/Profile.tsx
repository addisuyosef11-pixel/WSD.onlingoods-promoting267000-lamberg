import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Crown, LogOut, ChevronRight, Settings, HelpCircle, FileText, MessageCircle, Send, Banknote, Calendar, Clock, History } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('Help Center')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <button
            onClick={() => window.open('https://t.me/Tiktokshoponline_suport', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">{t('Official Support')}</p>
              <p className="text-sm text-muted-foreground">@DSW_Support</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
          </button>
          <button
            onClick={() => window.open('https://t.me/etonlinejob1', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <Send className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">{t('Public Channel')}</p>
              <p className="text-sm text-muted-foreground">{t('Join our Telegram channel')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
          </button>
          <button
            onClick={() => window.open('https://t.me/+Jihv4uEOv0o0M2U0', '_blank')}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted transition-colors"
          >
            <MessageCircle className="w-6 h-6 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">{t('Discussion Group')}</p>
              <p className="text-sm text-muted-foreground">{t('Join our community')}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
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
  const [dailyIncome, setDailyIncome] = useState<DailyIncome>({
    today_income: 0,
    yesterday_income: 0,
    last_claim_date: null,
    last_income_transfer_at: null,
    last_yesterday_claim_at: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
        today_income: data.today_income,
        yesterday_income: data.yesterday_income,
        last_claim_date: data.last_claim_date,
        last_income_transfer_at: data.last_income_transfer_at,
        last_yesterday_claim_at: data.last_yesterday_claim_at,
      });
    }
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const menuItems = [
    { icon: <History className="w-5 h-5" />, label: t('Transaction History'), onClick: () => navigate('/transactions') },
    { icon: <Settings className="w-5 h-5" />, label: t('Settings'), onClick: () => navigate('/settings') },
    { icon: <HelpCircle className="w-5 h-5" />, label: t('Help Center'), onClick: () => setShowHelpCenter(true) },
    { icon: <FileText className="w-5 h-5" />, label: t('Terms & Conditions'), onClick: () => setShowTerms(true) },
  ];

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{maskPhone(profile.phone)}</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10">
              <Crown className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">VIP {profile.current_vip_level || 0}</span>
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{t('Total Balance')}</p>
            <p className="text-xl font-bold text-primary">{profile.balance.toLocaleString()} ETB</p>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex items-center gap-1 mb-1">
              <Banknote className="w-3 h-3 text-green-600" />
              <p className="text-xs text-muted-foreground">{t('Withdrawable')}</p>
            </div>
            <p className="text-xl font-bold text-green-600">{profile.withdrawable_balance.toLocaleString()} ETB</p>
          </div>
        </div>

        {/* Daily Income Display - Non-clickable */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-4 rounded-xl border bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-600">{t("Today's Income")}</span>
            </div>
            <p className={`text-lg font-bold ${
              dailyIncome.today_income > 0 ? 'text-blue-600' : 'text-muted-foreground'
            }`}>
              {dailyIncome.today_income.toLocaleString()} ETB
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('Wait 24h to transfer')}</p>
          </div>

          <div className="p-4 rounded-xl border bg-orange-50 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-600">{t("Yesterday's Income")}</span>
            </div>
            <p className={`text-lg font-bold ${
              dailyIncome.yesterday_income > 0 ? 'text-orange-600' : 'text-muted-foreground'
            }`}>
              {dailyIncome.yesterday_income.toLocaleString()} ETB
            </p>
            <p className="text-xs text-muted-foreground mt-1">{t('Wait 24h to claim')}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-4">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="w-full flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3 text-foreground">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="w-full border-destructive text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {t('Sign Out')}
        </Button>
      </div>

      <BottomNavigation />

      {/* Help Center Modal */}
      <HelpCenterModal isOpen={showHelpCenter} onClose={() => setShowHelpCenter(false)} />

      {/* Terms & Conditions Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('Terms & Conditions')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">{t('1. Introduction')}</p>
            <p>Welcome to DSW Platform. By using our services, you agree to these terms and conditions. Please read them carefully before proceeding.</p>
            
            <p className="font-semibold text-foreground">{t('2. Account Registration')}</p>
            <p>Users must provide accurate information during registration. Each user is allowed one account only. Sharing account credentials is strictly prohibited.</p>
            
            <p className="font-semibold text-foreground">{t('3. VIP Membership')}</p>
            <p>VIP packages grant access to earning tasks. Earnings are credited upon successful task completion. VIP membership is non-refundable once purchased.</p>
            
            <p className="font-semibold text-foreground">{t('4. Deposits & Withdrawals')}</p>
            <p>All deposits must be made within 15 minutes of selecting amount. Deposits require admin approval before being credited. Withdrawals are processed within 24-48 hours from your withdrawable balance only.</p>
            
            <p className="font-semibold text-foreground">{t('5. User Conduct')}</p>
            <p>Users must not engage in fraudulent activities. Any suspicious activity may result in account suspension. The platform reserves the right to terminate accounts.</p>
            
            <p className="font-semibold text-foreground">{t('6. Privacy')}</p>
            <p>User data is protected and will not be shared with third parties without consent. We use encryption to secure sensitive information.</p>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Checkbox 
                id="terms" 
                checked={termsAccepted} 
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
              />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                {t('I have read and agree to the Terms & Conditions')}
              </label>
            </div>

            <Button 
              className="w-full primary-gradient text-primary-foreground" 
              disabled={!termsAccepted}
              onClick={() => {
                showSuccess('Terms accepted!');
                setShowTerms(false);
              }}
            >
              {t('Accept & Continue')}
            </Button>
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
