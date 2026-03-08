import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownToLine, Banknote, Lock } from 'lucide-react';
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

  const handleSubmit = async () => {
    if (!user) return;

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

    if (!withdrawalPassword) {
      toast.error('Please enter your withdrawal password');
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
      toast.error('Please set a withdrawal password in your profile settings first');
      setLoading(false);
      return;
    }

    if (profile.withdrawal_password !== withdrawalPassword) {
      toast.error('Invalid withdrawal password');
      setLoading(false);
      return;
    }

    // Process withdrawal using database function
    const { data: transactionId, error } = await supabase.rpc('process_withdrawal', {
      p_user_id: user.id,
      p_amount: withdrawAmount,
    });

    if (error || !transactionId) {
      toast.error('Failed to process withdrawal');
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
