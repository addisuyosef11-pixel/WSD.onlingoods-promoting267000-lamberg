import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  ArrowDownToLine, 
  Banknote, 
  Lock, 
  Building, 
  Shield, 
  AlertCircle,
  CheckCircle,
  History,
  ChevronDown,
  Copy,
  Check,
  Wallet,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
}

export const Withdraw = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [checkingBank, setCheckingBank] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBankAccounts();
  }, [user]);

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setBankAccounts(data as BankAccount[]);
      // Auto-select the first account
      if (data.length > 0) {
        setSelectedAccount(data[0]);
      }
    }
    setCheckingBank(false);
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

  const handleSubmit = async () => {
    if (!user || !selectedAccount) return;

    const withdrawAmount = parseFloat(amount);
    const withdrawableBalance = profile?.withdrawable_balance || 0;

    if (!withdrawAmount || withdrawAmount <= 0) {
      setErrorMessage('Please enter a valid amount');
      setShowError(true);
      return;
    }

    if (withdrawAmount > withdrawableBalance) {
      setErrorMessage('Insufficient withdrawable balance');
      setShowError(true);
      return;
    }

    if (withdrawAmount < 157) {
      setErrorMessage('Minimum withdrawal is 157 ETB');
      setShowError(true);
      return;
    }

    if (!withdrawalPassword) {
      setErrorMessage('Please enter your withdrawal password');
      setShowError(true);
      return;
    }

    setLoading(true);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('withdrawal_password')
      .eq('user_id', user.id)
      .single();

    if (!profileData?.withdrawal_password) {
      setErrorMessage('Please set a withdrawal password in your profile settings first');
      setShowError(true);
      setLoading(false);
      return;
    }

    if (profileData.withdrawal_password !== withdrawalPassword) {
      setErrorMessage('Invalid withdrawal password');
      setShowError(true);
      setLoading(false);
      return;
    }

    const { data: result, error } = await supabase.rpc('process_withdrawal', {
      p_user_id: user.id,
      p_amount: withdrawAmount,
      p_account_number: selectedAccount.account_number,
      p_account_holder_name: selectedAccount.account_holder_name,
    });

    if (error || !result) {
      setErrorMessage('Failed to process withdrawal. Please try again.');
      setShowError(true);
      setLoading(false);
      return;
    }

    await refreshProfile();
    setSuccessMessage(`${withdrawAmount.toLocaleString()} ETB withdrawal requested! Awaiting approval.`);
    setShowSuccess(true);
    setLoading(false);
    setAmount('');
    setWithdrawalPassword('');
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/profile');
  };

  const withdrawableBalance = profile?.withdrawable_balance || 0;

  if (checkingBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Green Gradient Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-6 relative z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <ArrowDownToLine className="w-5 h-5 text-white" />
              <h1 className="text-xl font-bold text-white">Withdraw Funds</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6">
        {bankAccounts.length === 0 ? (
          <div className="bg-white rounded-xl border border-[#e2e8e2] p-6 mb-6 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3a2d] mb-2">No Bank Account Found</h3>
            <p className="text-sm text-[#6b7b6b] mb-4">
              You need to add a bank account before making a withdrawal.
            </p>
            <Button
              onClick={() => navigate('/bank-cards')}
              className="w-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold"
            >
              Add Bank Account
            </Button>
          </div>
        ) : (
          <>
            {/* Balance Card */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-[#7acc00]" />
                  <span className="text-sm text-[#6b7b6b]">Withdrawable Balance</span>
                </div>
                <Shield className="w-4 h-4 text-[#7acc00]" />
              </div>
              <p className="text-3xl font-bold text-[#2d3a2d]">{withdrawableBalance.toLocaleString()} <span className="text-sm font-normal text-[#6b7b6b]">ETB</span></p>
              
              <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  Minimum withdrawal amount is <span className="font-bold">157 ETB</span>
                </p>
              </div>
            </div>

            {/* Bank Account Selector */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#2d3a2d] mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#7acc00]" />
                Select Bank Account
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => setShowBankSelector(!showBankSelector)}
                  className="w-full p-3 border border-[#e2e8e2] rounded-lg flex items-center justify-between bg-white hover:border-[#7acc00] transition-colors"
                >
                  {selectedAccount ? (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#7acc00]" />
                      <span className="text-sm font-medium text-[#2d3a2d]">{selectedAccount.bank_name}</span>
                      <span className="text-xs text-[#6b7b6b]">•••• {selectedAccount.account_number.slice(-4)}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-[#6b7b6b]">Select a bank account</span>
                  )}
                  <ChevronDown className={`w-4 h-4 text-[#7acc00] transition-transform ${showBankSelector ? 'rotate-180' : ''}`} />
                </button>

                {showBankSelector && (
                  <div className="border border-[#e2e8e2] rounded-lg overflow-hidden">
                    {bankAccounts.map((account) => (
                      <button
                        key={account.id}
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowBankSelector(false);
                        }}
                        className="w-full p-3 text-left hover:bg-[#f1f5f1] border-b border-[#e2e8e2] last:border-b-0 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Building className="w-4 h-4 text-[#7acc00]" />
                          <span className="text-sm font-medium text-[#2d3a2d]">{account.bank_name}</span>
                        </div>
                        <p className="text-xs text-[#6b7b6b] pl-6">{account.account_holder_name}</p>
                        <div className="flex items-center gap-2 pl-6">
                          <p className="text-xs font-mono text-[#6b7b6b]">•••• {account.account_number.slice(-4)}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(account.account_number, `account-${account.id}`);
                            }}
                            className="p-1 hover:bg-white rounded transition-colors"
                          >
                            {copiedField === `account-${account.id}` ? (
                              <Check className="w-3 h-3 text-[#7acc00]" />
                            ) : (
                              <Copy className="w-3 h-3 text-[#7acc00]" />
                            )}
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Withdrawal Form */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#2d3a2d] mb-4">Withdrawal Details</h3>
              
              <div className="space-y-4">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-[#2d3a2d] mb-2">
                    Withdrawal Amount
                  </label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7b6b]" />
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount in ETB"
                      className="pl-10 border-[#e2e8e2] focus:ring-[#7acc00] focus:border-[#7acc00]"
                      min={157}
                      max={withdrawableBalance}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs text-[#6b7b6b]">Min: 157 ETB</p>
                    <p className="text-xs text-[#6b7b6b]">Max: {withdrawableBalance.toLocaleString()} ETB</p>
                  </div>
                </div>

                {/* Withdrawal Password */}
                <div>
                  <label className="block text-sm font-medium text-[#2d3a2d] mb-2">
                    Withdrawal Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6b7b6b]" />
                    <Input
                      type="password"
                      value={withdrawalPassword}
                      onChange={(e) => setWithdrawalPassword(e.target.value)}
                      placeholder="Enter your 6-digit withdrawal PIN"
                      className="pl-10 border-[#e2e8e2] focus:ring-[#7acc00] focus:border-[#7acc00]"
                      maxLength={6}
                    />
                  </div>
                </div>

                {/* Selected Account Summary */}
                {selectedAccount && (
                  <div className="p-3 bg-[#f8fafc] rounded-lg border border-[#e2e8e2]">
                    <p className="text-xs text-[#6b7b6b] mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Withdrawing to:
                    </p>
                    <p className="text-sm font-medium text-[#2d3a2d]">{selectedAccount.account_holder_name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-[#6b7b6b]">{selectedAccount.bank_name}</p>
                      <div className="flex items-center gap-1">
                        <p className="text-xs font-mono text-[#6b7b6b]">•••• {selectedAccount.account_number.slice(-4)}</p>
                        <button
                          onClick={() => copyToClipboard(selectedAccount.account_number, 'selected-account')}
                          className="p-1 hover:bg-white rounded transition-colors"
                        >
                          {copiedField === 'selected-account' ? (
                            <Check className="w-3 h-3 text-[#7acc00]" />
                          ) : (
                            <Copy className="w-3 h-3 text-[#7acc00]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !selectedAccount || !amount || !withdrawalPassword}
              className="w-full py-4 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Processing Withdrawal...</span>
                </div>
              ) : (
                'Withdraw Funds'
              )}
            </Button>

            {/* Withdrawal History Link */}
            <button
              onClick={() => navigate('/transactions?filter=withdrawal')}
              className="w-full mt-4 flex items-center justify-center gap-2 text-sm text-[#6b7b6b] hover:text-[#2d3a2d] transition-colors"
            >
              <History className="w-4 h-4" />
              View Withdrawal History
            </button>
          </>
        )}
      </div>

      <BottomNavigation />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message={successMessage}
      />

      {/* Error Modal */}
      <SuccessModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
        isError={true}
      />
    </div>
  );
};

export default Withdraw;