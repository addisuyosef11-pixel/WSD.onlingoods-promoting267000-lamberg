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
<<<<<<< HEAD
  AlertCircle,
  X,
  User,
  Building,
  Clock
=======
  AlertCircle
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
} from 'lucide-react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
<<<<<<< HEAD
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
=======
import { SuccessModal } from '@/components/SuccessModal';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

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
<<<<<<< HEAD
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  
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

<<<<<<< HEAD
=======
    // Validate account number (basic validation)
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    if (accountNumber.length < 8) {
      showSuccessMessage('Please enter a valid account number');
      return;
    }

    setLoading(true);
    
    try {
<<<<<<< HEAD
=======
      // Check if this account number already exists for the user
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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

<<<<<<< HEAD
      const { error } = await supabase
=======
      // Insert new bank account
      const { data, error } = await supabase
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        .from('bank_accounts')
        .insert([
          {
            user_id: user.id,
            bank_name: bankName,
            account_number: accountNumber,
            account_holder_name: accountHolderName,
            is_verified: false
          }
<<<<<<< HEAD
        ]);

      if (error) throw error;

      await fetchBankAccounts();
      showSuccessMessage('Account bound successfully! Please wait for verification.');
      
=======
        ])
        .select()
        .single();

      if (error) throw error;

      // Refresh bank accounts list
      await fetchBankAccounts();

      showSuccessMessage('Account bound successfully! Please wait for verification.');
      
      // Clear form
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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

<<<<<<< HEAD
  const handleDeleteAccount = async () => {
    if (!user || !selectedAccount) return;
=======
  const handleDeleteAccount = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
<<<<<<< HEAD
        .eq('id', selectedAccount.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBankAccounts();
      showSuccessMessage('Bank account deleted successfully');
      setShowDeleteDialog(false);
      setSelectedAccount(null);
=======
        .eq('id', accountId)
        .eq('user_id', user?.id);

      if (error) throw error;

      // Refresh bank accounts list
      await fetchBankAccounts();
      showSuccessMessage('Bank account deleted successfully');
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    } catch (error: any) {
      console.error('Error deleting account:', error);
      showSuccessMessage(error.message || 'Failed to delete account');
    }
  };

  const settingsItems = [
    {
      icon: <CreditCard className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Bind Account Number'),
      description: t('Link your bank account for withdrawals'),
      onClick: () => setActiveSection('bind'),
      badge: bankAccounts.length > 0 ? `${bankAccounts.length} linked` : undefined
    },
    {
      icon: <Lock className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Change Login Password'),
      description: t('Update your account password'),
      onClick: () => setActiveSection('password'),
    },
    {
      icon: <Shield className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-green-400 to-green-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Withdrawal Password'),
      description: t('Set a 6-digit PIN for withdrawals'),
      onClick: () => setActiveSection('withdrawal'),
    },
    {
      icon: <Bell className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-orange-400 to-orange-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Notifications'),
      description: t('Managed by admin'),
      onClick: () => setActiveSection('notifications'),
    },
    {
      icon: <Globe className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Language'),
      description: 'አማርኛ',
      onClick: () => setActiveSection('language'),
    },
    {
      icon: <FileText className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Privacy Policy'),
      description: t('Read our privacy policy'),
      onClick: () => setActiveSection('privacy'),
    },
    {
      icon: <HelpCircle className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-pink-400 to-pink-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      label: t('Help & Support'),
      description: t('Get help from our support team'),
      onClick: () => navigate('/service'),
    },
    {
      icon: <Info className="w-5 h-5" />,
<<<<<<< HEAD
      iconBg: 'bg-gradient-to-br from-gray-400 to-gray-500',
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
              <h3 className="font-display font-bold text-foreground text-lg">{t('Bind Account Number')}</h3>
              {bankAccounts.length > 0 && (
                <button
                  onClick={() => setShowAllAccounts(!showAllAccounts)}
                  className="text-sm text-[#7acc00] hover:underline"
=======
              <h3 className="font-semibold text-foreground text-lg">{t('Bind Account Number')}</h3>
              {bankAccounts.length > 0 && (
                <button
                  onClick={() => setShowAllAccounts(!showAllAccounts)}
                  className="text-sm text-primary hover:underline"
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
                    className="p-4 rounded-xl border border-border bg-white shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center">
                          <Building className="w-5 h-5 text-[#7acc00]" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{account.bank_name}</h4>
                          <p className="text-xs text-muted-foreground">{account.account_holder_name}</p>
                        </div>
                      </div>
                      {account.is_verified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-[#7acc00]" />
                        <span className="text-foreground font-mono">•••• {account.account_number.slice(-4)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Added: {new Date(account.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedAccount(account);
                        setShowDeleteDialog(true);
                      }}
                      className="w-full py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete Account
                    </button>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                  </div>
                ))}
              </div>
            )}

            {/* Add new account form */}
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
<<<<<<< HEAD
                <Label className="text-foreground">{t('Bank Name')}</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('Enter bank name')} 
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('Account Number')}</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('Enter account number')}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">{t('Account Holder Name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('Enter account holder name')}
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-2">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  Your account will be verified by admin within 24 hours. You'll receive a notification once verified.
                </p>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold hover:shadow-lg" 
                onClick={handleBindAccount}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : t('Bind Account')}
              </Button>
            </div>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          </div>
        );
      case 'password':
        return (
          <div className="space-y-4 p-4">
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('Change Login Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Update your account password')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t('Current Password')}</Label>
=======
            <h3 className="font-semibold text-foreground text-lg">{t('Change Login Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Update your account password')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Current Password')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                <Input 
                  type="password" 
                  placeholder={t('Enter current password')}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
<<<<<<< HEAD
                <Label className="text-foreground">{t('New Password')}</Label>
=======
                <Label>{t('New Password')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                <Input 
                  type="password" 
                  placeholder={t('Enter new password')}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
<<<<<<< HEAD
                <Label className="text-foreground">{t('Confirm New Password')}</Label>
=======
                <Label>{t('Confirm New Password')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                <Input 
                  type="password" 
                  placeholder={t('Confirm New Password')}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
              <Button 
<<<<<<< HEAD
                className="w-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold hover:shadow-lg" 
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : t('Change Password')}
=======
                className="w-full primary-gradient text-primary-foreground" 
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? t('Changing...') : t('Change Password')}
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              </Button>
            </div>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="space-y-4 p-4">
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('Withdrawal Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Set a 6-digit PIN for withdrawals')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-foreground">{t('Login Password (for verification)')}</Label>
=======
            <h3 className="font-semibold text-foreground text-lg">{t('Withdrawal Password')}</h3>
            <p className="text-sm text-muted-foreground">{t('Set a 6-digit PIN for withdrawals')}</p>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('Login Password (for verification)')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                <Input 
                  type="password" 
                  placeholder={t('Enter login password')}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
<<<<<<< HEAD
                <Label className="text-foreground">{t('Withdrawal Password (6 digits)')}</Label>
=======
                <Label>{t('Withdrawal Password (6 digits)')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
                <Label className="text-foreground">{t('Confirm Withdrawal Password')}</Label>
=======
                <Label>{t('Confirm Withdrawal Password')}</Label>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
                className="w-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold hover:shadow-lg" 
                onClick={handleSetWithdrawalPassword}
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : t('Set Password')}
=======
                className="w-full primary-gradient text-primary-foreground" 
                onClick={handleSetWithdrawalPassword}
                disabled={loading}
              >
                {loading ? t('Setting...') : t('Set Password')}
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              </Button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 p-4">
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('Notifications')}</h3>
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 text-center border border-orange-200">
              <Bell className="w-12 h-12 text-orange-500 mx-auto mb-3" />
              <p className="text-orange-700 font-medium">{t('Notifications are managed by admin')}</p>
              <p className="text-sm text-orange-600 mt-2">{t('You will receive important updates automatically')}</p>
=======
            <h3 className="font-semibold text-foreground text-lg">{t('Notifications')}</h3>
            <div className="bg-muted/50 rounded-xl p-6 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">{t('Notifications are managed by admin')}</p>
              <p className="text-sm text-muted-foreground mt-2">{t('You will receive important updates automatically')}</p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-4 p-4">
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('Language')}</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-[#7acc00] bg-[#7acc00]/5"
              >
                <span className="text-foreground font-medium">አማርኛ (Amharic)</span>
                <div className="w-5 h-5 rounded-full bg-[#7acc00] flex items-center justify-center">
=======
            <h3 className="font-semibold text-foreground text-lg">{t('Language')}</h3>
            <div className="space-y-2">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary bg-primary/5"
              >
                <span className="text-foreground font-medium">አማርኛ (Amharic)</span>
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('Privacy Policy')}</h3>
            <div className="space-y-4 text-sm text-muted-foreground bg-white rounded-xl p-4 border border-border">
=======
            <h3 className="font-semibold text-foreground text-lg">{t('Privacy Policy')}</h3>
            <div className="space-y-4 text-sm text-muted-foreground">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
            <h3 className="font-display font-bold text-foreground text-lg">{t('About DSW')}</h3>
            <div className="text-center py-6 bg-white rounded-xl border border-border">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-[#7acc00]">DSW</span>
=======
            <h3 className="font-semibold text-foreground text-lg">{t('About DSW')}</h3>
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary">DSW</span>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              </div>
              <p className="text-lg font-semibold text-foreground">{t('DSW Platform')}</p>
              <p className="text-sm text-muted-foreground mt-1">{t('Version 1.0.0')}</p>
            </div>
<<<<<<< HEAD
            <div className="space-y-3 text-sm text-muted-foreground bg-white rounded-xl p-4 border border-border">
              <p>DSW is your trusted platform for earning passive income through smart investments.</p>
              <p>Our VIP system offers multiple tiers with guaranteed daily returns, helping thousands of members achieve their financial goals.</p>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="p-3 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-lg text-center">
                  <p className="text-lg font-bold text-[#7acc00]">50K+</p>
                  <p className="text-xs text-muted-foreground">{t('Users')}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-lg text-center">
                  <p className="text-lg font-bold text-[#7acc00]">9%</p>
                  <p className="text-xs text-muted-foreground">{t('Daily ROI')}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-lg text-center">
                  <p className="text-lg font-bold text-[#7acc00]">24/7</p>
                  <p className="text-xs text-muted-foreground">{t('Support')}</p>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="px-4">
<<<<<<< HEAD
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
=======
            <div className="bg-card rounded-xl border border-border overflow-hidden">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              {settingsItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
<<<<<<< HEAD
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-white shadow-sm`}>
=======
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                      {item.icon}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
<<<<<<< HEAD
                        <span className="text-sm font-medium text-foreground">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-[#7acc00]/10 text-[#7acc00] px-2 py-0.5 rounded-full font-medium">
=======
                        <span className="text-sm font-medium text-foreground block">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Green Gradient Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-8 relative z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button 
              onClick={() => activeSection === 'main' ? navigate(-1) : setActiveSection('main')}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-xl font-bold text-white">
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              {getHeaderTitle()}
            </h1>
          </div>
        </div>
<<<<<<< HEAD
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '30px' }}>
          <path d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,25 1440,30 L1440,60 L0,60 Z" fill="#f8fafc" />
        </svg>
      </div>

      <div className="relative max-w-md mx-auto py-4">
=======
      </div>

      <div className="max-w-md mx-auto py-4">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        {renderContent()}
      </div>

      <BottomNavigation />

<<<<<<< HEAD
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md bg-white p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Delete Bank Account</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 border-border text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

<<<<<<< HEAD
export default Settings;
=======
export default Settings;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
