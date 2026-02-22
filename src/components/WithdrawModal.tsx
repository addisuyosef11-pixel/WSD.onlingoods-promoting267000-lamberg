import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, Banknote, Lock, Copy, Check, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
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

const SUPPORT_USERNAME = "@DSWonline_suport";

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  withdrawableBalance,
  hasCompletedVipLevel = false,
}) => {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState('');
  const [withdrawalPassword, setWithdrawalPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Account details fields
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleSupportClick = () => {
    window.open(`https://t.me/${SUPPORT_USERNAME.replace('@', '')}`, '_blank');
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
    if (!user) {
      toast.error('Please log in first');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > withdrawableBalance) {
      toast.error('Insufficient withdrawable balance');
      return;
    }

    if (withdrawAmount < 157) {
      toast.error('Minimum withdrawal is 157 ETB');
      return;
    }

    if (!accountNumber.trim()) {
      toast.error('Please enter your account number');
      return;
    }

    if (!accountHolderName.trim()) {
      toast.error('Please enter the account holder name');
      return;
    }

    if (!withdrawalPassword) {
      toast.error('Please enter your withdrawal password');
      return;
    }

    setLoading(true);

    try {
      // First verify the withdrawal password
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('withdrawal_password, withdrawable_balance')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        toast.error('Failed to verify withdrawal password');
        setLoading(false);
        return;
      }

      if (!profile?.withdrawal_password) {
        toast.error('Please set a withdrawal password in your profile settings first');
        setLoading(false);
        return;
      }

      if (profile.withdrawal_password !== withdrawalPassword) {
        toast.error('Invalid withdrawal password');
        setLoading(false);
        return;
      }

      // Double-check balance hasn't changed
      if (profile.withdrawable_balance < withdrawAmount) {
        toast.error('Insufficient withdrawable balance');
        setLoading(false);
        return;
      }

      // Call the RPC function
      const { data: result, error: rpcError } = await supabase
        .rpc('process_withdrawal', {
          p_user_id: user.id,
          p_amount: withdrawAmount,
          p_account_number: accountNumber.trim(),
          p_account_holder_name: accountHolderName.trim()
        });

      if (rpcError) {
        console.error('RPC Error:', rpcError);
        toast.error(rpcError.message || 'Failed to process withdrawal');
        setLoading(false);
        return;
      }

      // Check if we got a valid result
      if (!result || !result.success) {
        toast.error('Failed to process withdrawal');
        setLoading(false);
        return;
      }

      // Refresh user profile to get updated balance
      await refreshProfile();
      
      // Show success message with transaction ID
      const transactionId = result.transaction_id;
      const shortId = transactionId ? transactionId.substring(0, 8) : '';
      
      setSuccessMessage(`${withdrawAmount.toLocaleString()} ETB withdrawal requested! Transaction ID: ${shortId}...`);
      setShowSuccess(true);
      
      // Reset form
      setAmount('');
      setWithdrawalPassword('');
      setAccountNumber('');
      setAccountHolderName('');
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ArrowDownToLine className="w-5 h-5 text-green-600" />
            Withdraw Funds
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Support Contact - Green Box with White Text */}
          <div className="mb-2">
            <button
              onClick={handleSupportClick}
              className="w-full p-4 rounded-xl bg-green-600 hover:bg-green-700 transition-colors shadow-md cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/30">
                    <Volume2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium opacity-90">Need assistance?</p>
                    <p className="text-white text-lg font-bold">{SUPPORT_USERNAME}</p>
                  </div>
                </div>
                <div className="bg-white/20 rounded-full p-2 group-hover:bg-white/30 transition-colors">
                  <svg 
                    className="w-5 h-5 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <p className="text-white/80 text-xs mt-2 text-left">
                Click to contact support on Telegram
              </p>
            </button>
          </div>

          {/* Balance Display */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Withdrawable Balance</p>
            <p className="text-2xl font-bold text-green-600">{withdrawableBalance.toLocaleString()} ETB</p>
          </div>

          {/* Warning Message */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-700">
              ⚠️ Minimum withdrawal: 157 ETB
            </p>
          </div>

          {/* Amount Input */}
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
            <p className="text-xs text-muted-foreground mt-1">Available: {withdrawableBalance.toLocaleString()} ETB</p>
          </div>

          {/* Account Number Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Your Account Number
            </label>
            <div className="relative">
              <Input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
                className="bg-muted border-border pr-10"
              />
              {accountNumber && (
                <button
                  onClick={() => copyToClipboard(accountNumber, 'account')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/80 transition-colors"
                  title="Copy account number"
                >
                  {copiedField === 'account' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Account Holder Name Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Account Holder Name
            </label>
            <div className="relative">
              <Input
                type="text"
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                placeholder="Enter account holder name"
                className="bg-muted border-border pr-10"
              />
              {accountHolderName && (
                <button
                  onClick={() => copyToClipboard(accountHolderName, 'holder')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted/80 transition-colors"
                  title="Copy holder name"
                >
                  {copiedField === 'holder' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-primary" />
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Withdrawal Password */}
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

          {/* Support Contact Reminder */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Questions? Contact{" "}
              <button
                onClick={handleSupportClick}
                className="text-green-600 font-medium hover:underline"
              >
                {SUPPORT_USERNAME}
              </button>
            </p>
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount || !accountNumber || !accountHolderName || !withdrawalPassword}
            className="w-full primary-gradient text-primary-foreground font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner />
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