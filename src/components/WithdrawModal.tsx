import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, Banknote, Lock, User, CreditCard } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  withdrawableBalance: number;
  hasCompletedVipLevel?: boolean;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  withdrawableBalance,
  hasCompletedVipLevel = false,
}) => {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Pre-fill from saved bank account
  useEffect(() => {
    if (!user || !isOpen) return;
    const fetchBankAccount = async () => {
      const { data } = await supabase
        .from('bank_accounts')
        .select('account_number, account_holder_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        setAccountNumber(data.account_number);
        setAccountHolderName(data.account_holder_name);
      }
    };
    fetchBankAccount();
  }, [user, isOpen]);

  const handleSubmit = async () => {
    if (!user) return;

    const withdrawAmount = parseFloat(amount);

    if (!withdrawAmount || withdrawAmount <= 0) {
      setSuccessMessage('Please enter a valid amount');
      setShowSuccess(true);
      return;
    }

    if (withdrawAmount > withdrawableBalance) {
      setSuccessMessage('Insufficient withdrawable balance');
      setShowSuccess(true);
      return;
    }

    if (withdrawAmount < 157) {
      setSuccessMessage('Minimum withdrawal is 157 ETB');
      setShowSuccess(true);
      return;
    }

    if (!accountNumber.trim()) {
      setSuccessMessage('Please enter your account number');
      setShowSuccess(true);
      return;
    }

    if (!accountHolderName.trim()) {
      setSuccessMessage('Please enter the account holder name');
      setShowSuccess(true);
      return;
    }

    if (!withdrawalPassword) {
      setSuccessMessage('Please enter your withdrawal password');
      setShowSuccess(true);
      return;
    }

    setLoading(true);

    // Verify withdrawal password
    const { data: profile } = await supabase
      .from('profiles')
      .select('withdrawal_password')
      .eq('user_id', user.id)
      .single();

    if (!profile?.withdrawal_password) {
      setSuccessMessage('Please set a withdrawal password in your profile settings first');
      setShowSuccess(true);
      setLoading(false);
      return;
    }

    if (profile.withdrawal_password !== withdrawalPassword) {
      setSuccessMessage('Invalid withdrawal password');
      setShowSuccess(true);
      setLoading(false);
      return;
    }

    // Process withdrawal with account details
    const { data: result, error } = await supabase.rpc('process_withdrawal', {
      p_user_id: user.id,
      p_amount: withdrawAmount,
      p_account_number: accountNumber.trim(),
      p_account_holder_name: accountHolderName.trim(),
    });

    if (error || !result) {
      setSuccessMessage('Failed to process withdrawal');
      setShowSuccess(true);
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
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ArrowDownToLine className="w-5 h-5 text-green-600" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Withdrawable Balance</p>
            <p className="text-2xl font-bold text-green-600">{withdrawableBalance.toLocaleString()} ETB</p>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Minimum withdraw 157 birr
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Holder Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Enter account holder name"
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Withdrawal Amount
            </label>
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount in ETB"
                className="pl-10 bg-muted border-border"
                min={157}
                max={withdrawableBalance}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Minimum withdrawal: 157 ETB</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Withdrawal Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={withdrawalPassword}
                onChange={(e) => setWithdrawalPassword(e.target.value)}
                placeholder="Enter withdrawal password"
                className="pl-10 bg-muted border-border"
              />
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full primary-gradient text-primary-foreground font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Spinner size="sm" />
                <span>Processing...</span>
              </div>
            ) : 'Withdraw'}
          </Button>
        </div>
      </DialogContent>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message={successMessage}
      />
    </Dialog>
  );
};
