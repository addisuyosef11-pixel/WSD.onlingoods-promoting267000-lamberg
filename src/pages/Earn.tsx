import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import SeriesProductCard from '@/components/SeriesProductCard';
import SeriesTabs from '@/components/SeriesTabs';
<<<<<<< HEAD
import { ArrowLeft, Play, X, Headset, Sparkles, TrendingUp, Clock, Shield, Zap, Coins, CheckCircle, AlertCircle, PiggyBank, Package } from 'lucide-react';
=======
import { ArrowLeft, Play, X, Headset } from 'lucide-react';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import customerServiceImg from '@/assets/customer-service.png';
<<<<<<< HEAD
import microSavingImg from '@/assets/micro-saving.png';
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

interface VipLevel {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  video_url: string | null;
  series: string;
  daily_income: number;
  cycle_days: number;
  total_income: number;
  purchase_limit: number;
}

const Earn = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
<<<<<<< HEAD
  const [activeSeries, setActiveSeries] = useState<'P' | 'B' | 'M'>('P');
  const [showDeposit, setShowDeposit] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [purchasing, setPurchasing] = useState(false);
=======
  const [activeSeries, setActiveSeries] = useState<'P' | 'B'>('P');
  const [showDeposit, setShowDeposit] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

<<<<<<< HEAD
  // Navigate to MicroSavings when M series is selected
  useEffect(() => {
    if (activeSeries === 'M') {
      navigate('/micro-savings');
    }
  }, [activeSeries, navigate]);

=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  useEffect(() => {
    const fetchVipLevels = async () => {
      setLoadingLevels(true);
      const { data } = await supabase
        .from('vip_levels')
        .select('*')
        .order('price');
      
      if (data) {
        setVipLevels(data as VipLevel[]);
      }
      setLoadingLevels(false);
    };

    fetchVipLevels();
  }, []);

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

<<<<<<< HEAD
  const openPurchaseModal = (level: VipLevel) => {
    setSelectedLevel(level);
    setShowPurchaseModal(true);
  };

  // Renamed from handleBuy to handleAddToCart - functionality remains identical
  const handleAddToCart = async () => {
    if (!profile || !user || !selectedLevel) return;

    if (profile.balance < selectedLevel.price) {
      setShowPurchaseModal(false);
=======
  const handleBuy = async (level: VipLevel) => {
    if (!profile || !user) return;

    if (profile.balance < level.price) {
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      setErrorMessage('Insufficient balance. Please deposit first.');
      setShowErrorModal(true);
      setShowDeposit(true);
      return;
    }

<<<<<<< HEAD
    setPurchasing(true);

    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: selectedLevel.id,
      p_amount: selectedLevel.price,
    });

    setPurchasing(false);

    if (error) {
      setShowPurchaseModal(false);
=======
    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: level.id,
      p_amount: level.price,
    });

    if (error) {
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      setErrorMessage('Purchase failed. Please try again.');
      setShowErrorModal(true);
      return;
    }

    if (data) {
<<<<<<< HEAD
      setShowPurchaseModal(false);
      setSuccessMessage(`${selectedLevel.name} added to cart and purchased successfully!`);
      setShowSuccessModal(true);
      await refreshProfile();
    } else {
      setShowPurchaseModal(false);
=======
      setSuccessMessage(`${level.name} purchased successfully!`);
      setShowSuccessModal(true);
      await refreshProfile();
    } else {
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      setErrorMessage('Purchase failed. Insufficient balance.');
      setShowErrorModal(true);
    }
  };

  const handleDepositSubmitted = () => {
    setSuccessMessage('Deposit submitted! Awaiting admin approval.');
    setShowSuccessModal(true);
  };

  const filteredLevels = vipLevels.filter(level => level.series === activeSeries);
  const videosFromDb = vipLevels.filter(l => !!l.video_url);

  if (loading || !profile) {
    return (
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
=======
      <div className="min-h-screen flex items-center justify-center bg-background">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        <Spinner size="lg" />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      <div className="relative px-4 pb-24 max-w-md mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pt-4 pb-2 mb-4 backdrop-blur-sm bg-opacity-90">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="hover:bg-[#7acc00]/10 active:bg-[#7acc00]/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#2d3a2d]" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold bg-gradient-to-r from-[#2d3a2d] to-[#4a5a4a] bg-clip-text text-transparent">
                {t('Investment Products')}
              </h1>
              <p className="text-xs text-[#6b7b6b]">Choose your earning path</p>
            </div>
          </div>
        </header>

        {/* Balance Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#2d3a2d] to-[#1f2a1f] text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/80">Available Balance</span>
            <Shield className="w-4 h-4 text-[#B0FC38]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{profile?.balance?.toLocaleString() || 0} ETB</span>
            <Button
              onClick={() => setShowDeposit(true)}
              className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1f2a1f] font-semibold px-4 py-1.5 rounded-xl text-sm hover:shadow-lg hover:shadow-[#7acc00]/20 transition-all active:scale-95"
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Microsavings Promo Card */}
        <div className="relative mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#7acc00] to-[#B0FC38] overflow-hidden cursor-pointer hover:shadow-lg transition-all active:scale-98"
             onClick={() => navigate('/micro-savings')}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <img src={microSavingImg} alt="Micro Savings" className="w-16 h-16 object-contain" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank className="w-4 h-4 text-white" />
                <h3 className="font-bold text-white">Microsavings</h3>
              </div>
              <p className="text-white/90 text-xs mb-2">Start saving from 100 ETB and earn daily returns</p>
              <span className="inline-block bg-white text-[#2d3a2d] px-3 py-1 rounded-full text-xs font-semibold">
                Learn More →
              </span>
            </div>
          </div>
        </div>

        {/* Customer Service & How to Earn Card */}
        <div className="relative mb-6 p-4 rounded-2xl bg-white border border-[#e2e8e2] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7acc00]/5 to-[#B0FC38]/5 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7acc00] to-[#B0FC38] rounded-full blur-md opacity-30" />
              <img src={customerServiceImg} alt="Customer Service" className="relative w-16 h-16 object-contain" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#7acc00]" />
                <h3 className="font-bold text-[#2d3a2d]">Ready to start earning?</h3>
              </div>
              <p className="text-xs text-[#6b7b6b] mb-3">Watch our quick guide and begin your journey</p>
              <button
                onClick={() => setShowHowToEarn(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all hover:shadow-lg active:scale-95 bg-gradient-to-r from-[#7acc00] to-[#B0FC38]"
              >
                <Play className="w-4 h-4" />
                How to Earn
              </button>
            </div>
          </div>
        </div>

        {/* Series Tabs */}
        <div className="mb-6">
          <SeriesTabs activeSeries={activeSeries} onSeriesChange={setActiveSeries} />
        </div>

        {/* Products Grid */}
        {loadingLevels ? (
          <div className="flex justify-center py-12">
=======
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-md mx-auto">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <h1 className="font-display text-xl font-bold text-foreground">{t('Product')}</h1>
        </header>

        {/* Customer Service & How to Earn Card */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-6 flex items-center gap-4">
          <img src={customerServiceImg} alt="Customer Service" className="w-14 h-14 object-contain flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-foreground text-sm mb-1">Need Help Earning?</h3>
            <p className="text-xs text-muted-foreground mb-2">Watch our guide to start earning today</p>
            <button
              onClick={() => setShowHowToEarn(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
            >
              <Play className="w-4 h-4" />
              How to Earn
            </button>
          </div>
        </div>

        <SeriesTabs activeSeries={activeSeries} onSeriesChange={setActiveSeries} />

        {loadingLevels ? (
          <div className="flex justify-center py-8">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
<<<<<<< HEAD
            {filteredLevels.length > 0 ? (
              filteredLevels.map((level) => (
                <SeriesProductCard
                  key={level.id}
                  id={level.id}
                  name={level.name}
                  price={level.price}
                  dailyIncome={level.daily_income}
                  cycleDays={level.cycle_days}
                  imageUrl={level.image_url}
                  onAddToCart={() => openPurchaseModal(level)} // Changed from onBuy to onAddToCart
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
                <Package className="w-12 h-12 text-[#6b7b6b] mx-auto mb-3" />
                <p className="text-[#2d3a2d] font-medium">No products available</p>
                <p className="text-sm text-[#6b7b6b] mt-1">Check back later for new investment opportunities</p>
              </div>
            )}
=======
              {filteredLevels.map((level) => (
              <SeriesProductCard
                key={level.id}
                id={level.id}
                name={level.name}
                price={level.price}
                dailyIncome={level.daily_income}
                cycleDays={level.cycle_days}
                imageUrl={level.image_url}
                videoUrl={level.video_url}
                onBuy={() => handleBuy(level)}
              />
            ))}
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          </div>
        )}
      </div>

      <BottomNavigation />

<<<<<<< HEAD
      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedLevel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !purchasing && setShowPurchaseModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Gradient */}
            <div className="relative h-24 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] px-6 pt-6">
              <div className="absolute -bottom-8 left-6">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg p-2 flex items-center justify-center">
                  {selectedLevel.image_url ? (
                    <img src={selectedLevel.image_url} alt={selectedLevel.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <Package className="w-8 h-8 text-[#7acc00]" />
                  )}
                </div>
              </div>
              <button 
                onClick={() => !purchasing && setShowPurchaseModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                disabled={purchasing}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="pt-10 px-6 pb-6">
              <h2 className="text-xl font-bold text-[#2d3a2d] mb-1">{selectedLevel.name}</h2>
              <p className="text-sm text-[#6b7b6b] mb-6">Confirm your investment purchase</p>

              {/* Product Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-[#e2e8e2]">
                  <span className="text-[#6b7b6b]">Price</span>
                  <span className="font-bold text-[#2d3a2d]">{selectedLevel.price.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e2e8e2]">
                  <span className="text-[#6b7b6b]">Daily Income</span>
                  <span className="font-bold text-[#7acc00]">{selectedLevel.daily_income.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#e2e8e2]">
                  <span className="text-[#6b7b6b]">Cycle Days</span>
                  <span className="font-bold text-[#2d3a2d]">{selectedLevel.cycle_days} Days</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[#6b7b6b]">Total Return</span>
                  <span className="font-bold text-lg text-[#2d3a2d]">{(selectedLevel.daily_income * selectedLevel.cycle_days).toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`p-4 rounded-xl mb-6 ${profile?.balance >= selectedLevel.price ? 'bg-[#7acc00]/10' : 'bg-red-50'}`}>
                <div className="flex items-center gap-3">
                  {profile?.balance >= selectedLevel.price ? (
                    <CheckCircle className="w-5 h-5 text-[#7acc00]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#2d3a2d]">
                      {profile?.balance >= selectedLevel.price ? 'Sufficient Balance' : 'Insufficient Balance'}
                    </p>
                    <p className="text-xs text-[#6b7b6b]">
                      Your balance: {profile?.balance?.toLocaleString()} ETB
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => !purchasing && setShowPurchaseModal(false)}
                  className="flex-1 border-[#e2e8e2] text-[#6b7b6b] hover:bg-[#f1f5f1]"
                  disabled={purchasing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddToCart} // Changed from handleBuy to handleAddToCart
                  disabled={purchasing || profile?.balance < selectedLevel.price}
                  className="flex-1 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1f2a1f] font-semibold hover:shadow-lg hover:shadow-[#7acc00]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Confirm Purchase'
                  )}
                </Button>
              </div>

              {profile?.balance < selectedLevel.price && (
                <Button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setShowDeposit(true);
                  }}
                  className="w-full mt-3 bg-[#f1f5f1] text-[#2d3a2d] border border-[#e2e8e2] hover:bg-[#e2e8e2]"
                >
                  Deposit Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How to Earn Video Modal */}
      {showHowToEarn && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowHowToEarn(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#e2e8e2]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-[#7acc00] to-[#B0FC38]">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-[#2d3a2d]">How to Earn</h3>
              </div>
              <button 
                onClick={() => setShowHowToEarn(false)} 
                className="p-1.5 rounded-lg hover:bg-[#f1f5f1] transition-colors"
              >
                <X className="w-5 h-5 text-[#6b7b6b]" />
=======
      {/* How to Earn Video Modal */}
      {showHowToEarn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowHowToEarn(false)}>
          <div className="w-full max-w-md mx-4 bg-card rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-foreground">How to Earn</h3>
              </div>
              <button onClick={() => setShowHowToEarn(false)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {videosFromDb.length > 0 ? (
                videosFromDb.map((level) => (
<<<<<<< HEAD
                  <div key={level.id} className="rounded-xl overflow-hidden border border-[#e2e8e2]">
                    <div className="px-3 py-2 bg-gradient-to-r from-[#7acc00]/10 to-[#B0FC38]/10">
                      <p className="text-sm font-semibold text-[#2d3a2d]">{level.name} Tutorial</p>
=======
                  <div key={level.id} className="rounded-xl overflow-hidden border border-border">
                    <div className="px-3 py-2 bg-muted/50">
                      <p className="text-sm font-semibold text-foreground">{level.name}</p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                    </div>
                    <div className="w-full aspect-video bg-black">
                      <video
                        src={level.video_url!}
                        controls
                        playsInline
                        preload="metadata"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))
              ) : (
<<<<<<< HEAD
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center">
                    <Headset className="w-8 h-8 text-[#7acc00]" />
                  </div>
                  <p className="text-[#2d3a2d] font-medium">No tutorials available</p>
                  <p className="text-sm text-[#6b7b6b] mt-1">Contact our support team for assistance</p>
=======
                <div className="text-center py-8">
                  <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No tutorial videos available yet.</p>
                  <p className="text-muted-foreground text-xs mt-1">Contact customer service for help.</p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSubmitted={handleDepositSubmitted}
      />

      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
        isError={true}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />
    </div>
  );
};

<<<<<<< HEAD
export default Earn;
=======
export default Earn;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
