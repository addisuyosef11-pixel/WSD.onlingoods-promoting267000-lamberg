import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Lock, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText, 
  Info,
  ChevronRight,
  Globe,
  CreditCard,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SuccessModal } from '@/components/SuccessModal';

interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'main' | 'bind' | 'password' | 'withdrawal' | 'notifications' | 'language' | 'privacy' | 'terms' | 'about'>('main');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showAllAccounts, setShowAllAccounts] = useState(false);
  
  // Bind account states
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  // Withdrawal password states
  const [loginPassword, setLoginPassword] = useState('');
  const [withdrawalPin, setWithdrawalPin] = useState('');
  const [confirmWithdrawalPin, setConfirmWithdrawalPin] = useState('');

  // Fetch user's bank accounts on component mount
  useEffect(() => {
    if (user) {
      fetchBankAccounts();
    }
  }, [user]);

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      showSuccessMessage('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showSuccessMessage('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    
    if (error) {
      showSuccessMessage(error.message);
    } else {
      showSuccessMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActiveSection('main');
    }
  };

  const handleSetWithdrawalPassword = async () => {
    if (!user) return;
    
    if (withdrawalPin.length !== 6 || !/^\d+$/.test(withdrawalPin)) {
      showSuccessMessage('Withdrawal password must be 6 digits');
      return;
    }
    if (withdrawalPin !== confirmWithdrawalPin) {
      showSuccessMessage('Withdrawal passwords do not match');
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ withdrawal_password: withdrawalPin })
      .eq('user_id', user.id);
    setLoading(false);
    
    if (error) {
      showSuccessMessage(error.message);
    } else {
      showSuccessMessage('Withdrawal password set successfully!');
      setLoginPassword('');
      setWithdrawalPin('');
      setConfirmWithdrawalPin('');
      setActiveSection('main');
    }
  };

  const handleBindAccount = async () => {
    if (!user) {
      showSuccessMessage('Please login first');
      return;
    }

    if (!bankName || !accountNumber || !accountHolderName) {
      showSuccessMessage('Please fill in all fields');
      return;
    }

    // Validate account number (basic validation)
    if (accountNumber.length < 8) {
      showSuccessMessage('Please enter a valid account number');
      return;
    }

    setLoading(true);
    
    try {
      // Check if this account number already exists for the user
      const { data: existingAccount, error: checkError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_number', accountNumber)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAccount) {
        showSuccessMessage('This account number is already registered');
        setLoading(false);
        return;
      }

      // Insert new bank account
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([
          {
            user_id: user.id,
            bank_name: bankName,
            account_number: accountNumber,
            account_holder_name: accountHolderName,
            is_verified: false
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh bank accounts list
      await fetchBankAccounts();

      showSuccessMessage('Account bound successfully! Please wait for verification.');
      
      // Clear form
      setBankName('');
      setAccountNumber('');
      setAccountHolderName('');
      
    } catch (error: any) {
      console.error('Error binding account:', error);
      showSuccessMessage(error.message || 'Failed to bind account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh bank accounts list
      await fetchBankAccounts();
      showSuccessMessage('Bank account deleted successfully');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showSuccessMessage(error.message || 'Failed to delete account');
    }
  };

  const settingsItems = [
    {
      icon: <CreditCard className="w-5 h-5" />,
      label: t('Bind Account Number'),
      description: t('Link your bank account for withdrawals'),
      onClick: () => setActiveSection('bind'),
      badge: bankAccounts.length > 0 ? `${bankAccounts.length} linked` : undefined
    },
    {
      icon: <Lock className="w-5 h-5" />,
      label: t('Change Login Password'),
      description: t('Update your account password'),
      onClick: () => setActiveSection('password'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: t('Withdrawal Password'),
      description: t('Set a 6-digit PIN for withdrawals'),
      onClick: () => setActiveSection('withdrawal'),
    },
    {
      icon: <Bell className="w-5 h-5" />,
      label: t('Notifications'),
      description: t('Managed by admin'),
      onClick: () => setActiveSection('notifications'),
    },
    {
      icon: <Globe className="w-5 h-5" />,
      label: t('Language'),
      description: 'አማርኛ',
      onClick: () => setActiveSection('language'),
    },
    {
      icon: <FileText className="w-5 h-5" />,
      label: t('Privacy Policy'),
      description: t('Read our privacy policy'),
      onClick: () => setActiveSection('privacy'),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
      label: t('Help & Support'),
      description: t('Get help from our support team'),
      onClick: () => navigate('/service'),
    },
    {
      icon: <Info className="w-5 h-5" />,
      label: t('About DSW'),
      description: t('Version 1.0.0'),
      onClick: () => setActiveSection('about'),
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'bind':
        return (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-lg">{t('Bind Account Number')}</h3>
              {bankAccounts.length > 0 && (
                <button
                  onClick={() => setShowAllAccounts(!showAllAccounts)}
                  className="text-sm text-primary hover:underline"
                >
                  {showAllAccounts ? 'Hide' : 'View All'} ({bankAccounts.length})
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{t('Link your bank account for withdrawals')}</p>

            {/* Display existing bank accounts */}
            {showAllAccounts && bankAccounts.length > 0 && (
              <div className="space-y-3 mb-4">
                <h4 className="text-sm font-medium text-foreground">Your Linked Accounts</h4>
                {bankAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="p-3 rounded-lg border border-border bg-muted/30 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{account.bank_name}</span>
                        {account.is_verified ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                            <AlertCircle className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-foreground">****{account.account_number.slice(-4)}</p>
                    <p className="text-xs text-muted-foreground mt-1">{account.account_holder_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Added: {new Date(account.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Add new account form */}
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Bank Name')}</Label>
                <Input 
                  placeholder={t('Enter bank name')} 
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Account Number')}</Label>
                <Input 
                  placeholder={t('Enter account number')}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Account Holder Name')}</Label>
                <Input 
                  placeholder={t('Enter account holder name')}
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                />
              </div>
              <Button 
                className="w-full primary-gradient text-primary-foreground" 
                onClick={handleBindAccount}
                disabled={loading}
              >
                {loading ? t('Binding...') : t('Bind Account')}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              * Your account will be verified by admin within 24 hours. You'll receive a notification once verified.
            </p>
          </div>
        );
      case 'password':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('Change Login Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Update your account password')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Current Password')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Enter current password')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('New Password')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Enter new password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Confirm New Password')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Confirm New Password')}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <Button 
                className="w-full primary-gradient text-primary-foreground" 
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? t('Changing...') : t('Change Password')}
              </Button>
            </div>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('Withdrawal Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Set a 6-digit PIN for withdrawals')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Login Password (for verification)')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Enter login password')}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Withdrawal Password (6 digits)')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Enter 6-digit PIN')} 
                  maxLength={6}
                  value={withdrawalPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setWithdrawalPin(val);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('Confirm Withdrawal Password')}</Label>
                <Input 
                  type="password" 
                  placeholder={t('Confirm 6-digit PIN')} 
                  maxLength={6}
                  value={confirmWithdrawalPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setConfirmWithdrawalPin(val);
                  }}
                />
              </div>
              <Button 
                className="w-full primary-gradient text-primary-foreground" 
                onClick={handleSetWithdrawalPassword}
                disabled={loading}
              >
                {loading ? t('Setting...') : t('Set Password')}
              </Button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('Notifications')}</h3>
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('Notifications are managed by admin')}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('You will receive important updates automatically')}</p>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('Language')}</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5"
              >
                <span className="text-foreground font-medium">አማርኛ (Amharic)</span>
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </button>
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50"
                disabled
              >
                <span className="text-muted-foreground">English</span>
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
              </button>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('Privacy Policy')}</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p><strong className="text-foreground">1. Data Collection</strong></p>
              <p>We collect information you provide directly to us, such as your name, phone number, and transaction history.</p>
              
              <p><strong className="text-foreground">2. Data Usage</strong></p>
              <p>Your data is used to provide and improve our services, process transactions, and communicate with you.</p>
              
              <p><strong className="text-foreground">3. Data Protection</strong></p>
              <p>We implement industry-standard security measures to protect your personal information.</p>
              
              <p><strong className="text-foreground">4. Data Sharing</strong></p>
              <p>We do not sell or share your personal data with third parties except as required by law.</p>
              
              <p><strong className="text-foreground">5. Your Rights</strong></p>
              <p>You have the right to access, correct, or delete your personal data at any time.</p>
            </div>
          </div>
        );
      case 'about':
        return (
          <div className="space-y-4 p-4">
            <h3 className="font-semibold text-foreground text-lg">{t('About DSW')}</h3>
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">DSW</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{t('DSW Platform')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Version 1.0.0')}</p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>DSW is your trusted platform for earning passive income through smart investments.</p>
              <p>Our VIP system offers multiple tiers with guaranteed daily returns, helping thousands of members achieve their financial goals.</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-lg font-bold text-primary">50K+</p>
                  <p className="text-xs">{t('Users')}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-lg font-bold text-primary">9%</p>
                  <p className="text-xs">{t('Daily ROI')}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-lg font-bold text-primary">24/7</p>
                  <p className="text-xs">{t('Support')}</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="px-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {settingsItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground block">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const getHeaderTitle = () => {
    switch (activeSection) {
      case 'bind': return t('Bind Account Number');
      case 'password': return t('Change Login Password');
      case 'withdrawal': return t('Withdrawal Password');
      case 'notifications': return t('Notifications');
      case 'language': return t('Language');
      case 'privacy': return t('Privacy Policy');
      case 'about': return t('About DSW');
      default: return t('Settings');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => activeSection === 'main' ? navigate(-1) : setActiveSection('main')}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">
              {getHeaderTitle()}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto py-4">
        {renderContent()}
      </div>

      <BottomNavigation />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Settings;
