import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { DepositModal } from '@/components/DepositModal';
import { SuccessModal } from '@/components/SuccessModal';
import { ArrowLeft, Crown, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dswLogo from '@/assets/dsw-logo.png';

interface VipLevel {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
}

const VipDetail = () => {
  const { levelId } = useParams();
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [vipLevel, setVipLevel] = useState<VipLevel | null>(null);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchVipLevel = async () => {
      if (!levelId) return;

      const { data } = await supabase
        .from('vip_levels')
        .select('*')
        .eq('id', parseInt(levelId))
        .single();

      if (data) {
        setVipLevel(data);
      }
    };

    fetchVipLevel();
  }, [levelId]);

  const handleInvest = async () => {
    if (!vipLevel || !profile || !user || purchasing) return;

    if (profile.balance < vipLevel.price) {
      setSuccessMessage('Insufficient balance');
      setShowSuccess(true);
      setShowDeposit(true);
      return;
    }

    setPurchasing(true);

    try {
      // Use the database function to process VIP purchase (this records the transaction)
      const { data, error } = await supabase.rpc('process_vip_purchase', {
        p_user_id: user.id,
        p_vip_level: vipLevel.id,
        p_amount: vipLevel.price,
      });

      if (error) throw error;

      if (data) {
        setSuccessMessage('Success');
        setShowSuccess(true);
        await refreshProfile();
        setTimeout(() => navigate('/orders'), 1500);
      } else {
        setSuccessMessage('Purchase failed. Please try again.');
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setSuccessMessage('Purchase failed. Please try again.');
      setShowSuccess(true);
    } finally {
      setPurchasing(false);
    }
  };

  const handleDepositSubmitted = () => {
    // Success is already shown by DepositModal
  };

  if (loading || !profile || !vipLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full spinner" />
      </div>
    );
  }

  const dailyIncome = Math.round(vipLevel.price * 0.09);
  const validityDays = 60;
  const totalIncome = dailyIncome * validityDays;
  const isOwned = (profile.current_vip_level || 0) >= vipLevel.id;
  const canAfford = profile.balance >= vipLevel.price;

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">Product Details</h1>
        </header>

        {/* Product Card */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-6">
          {/* Header with larger image */}
          <div className="relative h-48 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
            <img 
              src={vipLevel.image_url || dswLogo} 
              alt={vipLevel.name}
              className="w-full h-full object-cover"
            />
            {/* Title badge - black with golden text */}
            <div className="absolute top-3 left-3 bg-black/90 px-3 py-1 rounded">
              <span className="text-amber-400 font-bold">{vipLevel.name}</span>
            </div>
            {/* Price badge */}
            <div className="absolute top-3 right-3 bg-black/90 px-3 py-1 rounded">
              <span className="text-amber-400 font-bold">{vipLevel.price.toLocaleString()} ETB</span>
            </div>
            {/* Premium badge */}
            <div className="absolute bottom-3 left-3 bg-black/90 px-3 py-1 rounded flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 text-sm">Premium Package</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Price</span>
              <span className="text-xl font-bold text-primary">{vipLevel.price.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Daily Income</span>
              <span className="text-lg font-semibold text-green-600">{dailyIncome.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Validity Period</span>
              <span className="text-lg font-semibold text-foreground">{validityDays} Days</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border">
              <span className="text-muted-foreground">Total Income</span>
              <span className="text-lg font-bold text-green-600">{totalIncome.toLocaleString()} ETB</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground">Tasks</span>
              <span className="text-lg font-semibold text-foreground">8 Tasks</span>
            </div>
          </div>

          {/* Description */}
          <div className="px-6 pb-6">
            <p className="text-muted-foreground text-sm">{vipLevel.description}</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h3 className="font-semibold text-foreground mb-3">Package Features</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Daily passive income</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">8 premium tasks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Priority customer support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-muted-foreground">Unlimited repurchase</span>
            </div>
          </div>
        </div>

        {/* Your Balance */}
        <div className="bg-muted rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Your Balance</span>
            <span className={`text-lg font-bold ${canAfford ? 'text-green-600' : 'text-destructive'}`}>
              {profile.balance.toLocaleString()} ETB
            </span>
          </div>
        </div>

        {/* Invest Button */}
        <Button
          onClick={handleInvest}
          disabled={purchasing || !canAfford}
          className="w-full py-6 text-lg font-semibold primary-gradient text-primary-foreground"
        >
          {purchasing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : canAfford ? (
            `Invest ${vipLevel.price.toLocaleString()} ETB`
          ) : (
            'Insufficient Balance'
          )}
        </Button>

        {!canAfford && (
          <Button
            variant="outline"
            onClick={() => setShowDeposit(true)}
            className="w-full mt-3"
          >
            Deposit Now
          </Button>
        )}
      </div>

      <BottomNavigation />

      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSubmitted={handleDepositSubmitted}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

export default VipDetail;
