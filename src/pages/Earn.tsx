import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import SeriesTabs from '@/components/SeriesTabs';
import VIPPackages from '@/pages/VIPPackages';
import MicroSavings from '@/pages/MicroSavings';
import { ArrowLeft, Play, X, Headset, Sparkles, TrendingUp, Clock, Shield, Zap, Coins, CheckCircle, AlertCircle, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import customerServiceImg from '@/assets/customer-service.png';

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

// 3D Gold Button Component (reusable)
const GoldButton = ({ onClick, children, disabled = false, loading = false }: { onClick: () => void; children: React.ReactNode; disabled?: boolean; loading?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`w-full py-2 bg-gradient-to-b from-[#FFD700] to-[#FDB931] rounded-lg text-[#1a2a1a] font-semibold text-xs shadow-[0_4px_0_0_#b37b00] hover:shadow-[0_2px_0_0_#b37b00] hover:translate-y-0.5 active:translate-y-1 active:shadow-[0_1px_0_0_#b37b00] transition-all duration-150 border border-[#FFE55C] disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {loading ? (
      <div className="flex items-center justify-center gap-2">
        <Spinner size="sm" />
        <span>Processing...</span>
      </div>
    ) : (
      children
    )}
  </button>
);

// Music Package Card Component - Compact vertical display (half height)
const MusicPackageCard = ({ 
  pkg, 
  onSelect 
}: { 
  pkg: any; 
  onSelect: (pkg: any) => void;
}) => {
  return (
    <div 
      className="w-full rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-white border border-gray-200 mb-3"
      onClick={() => onSelect(pkg)}
    >
      <div className="relative flex items-center p-3">
        {/* Badge - compact */}
        {pkg.badge && (
          <div className="absolute top-2 left-2 z-10">
            <div className={`${pkg.badgeColor} text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-sm`}>
              {pkg.badge}
            </div>
          </div>
        )}

        {/* Image - smaller */}
        <div className="flex-shrink-0 w-16 h-16 mr-3">
          <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            <img 
              src={pkg.image} 
              alt={pkg.name} 
              className="w-full h-full object-contain p-1" 
            />
          </div>
        </div>

        {/* Content - compact */}
        <div className="flex-1 min-w-0">
          {/* Title and Price row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-gray-800 font-bold text-sm truncate pr-2">{pkg.name}</h3>
            <div className="flex items-center flex-shrink-0">
              <span className="text-base font-extrabold text-gray-900">{pkg.price?.toLocaleString()}</span>
              <span className="text-[#7acc00] font-bold text-[10px] ml-0.5">ETB</span>
            </div>
          </div>

          {/* Stats - 3 columns compact */}
          <div className="grid grid-cols-3 gap-1 mb-1">
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Daily</div>
              <div className="text-gray-800 font-bold text-[10px]">{pkg.dailyIncome || pkg.dailyEarnings} ETB</div>
            </div>
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Cycle</div>
              <div className="text-gray-800 font-bold text-[10px]">{pkg.cycleDays || 60}d</div>
            </div>
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Total</div>
              <div className="text-gray-800 font-bold text-[10px]">{(pkg.totalReturn || pkg.price * 0.09 * 60).toLocaleString()} ETB</div>
            </div>
          </div>

          {/* Invest Button - compact */}
          <GoldButton onClick={() => onSelect(pkg)}>
            Invest Now
          </GoldButton>
        </div>
      </div>
    </div>
  );
};

// Product Card Component for investment products - Compact vertical display (half height)
const ProductCard = ({ 
  level, 
  onInvest 
}: { 
  level: VipLevel; 
  onInvest: (level: VipLevel) => void;
}) => {
  return (
    <div 
      className="w-full rounded-xl overflow-hidden shadow-md cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-white border border-gray-200 mb-3"
      onClick={() => onInvest(level)}
    >
      <div className="relative flex items-center p-3">
        {/* Image - smaller */}
        <div className="flex-shrink-0 w-16 h-16 mr-3">
          <div className="w-full h-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {level.image_url ? (
              <img 
                src={level.image_url} 
                alt={level.name} 
                className="w-full h-full object-contain p-1" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150/e2e8e2/2d3a2d?text=Product';
                }}
              />
            ) : (
              <Package className="w-8 h-8 text-gray-400" />
            )}
          </div>
        </div>

        {/* Content - compact */}
        <div className="flex-1 min-w-0">
          {/* Title and Price row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-gray-800 font-bold text-sm truncate pr-2">{level.name}</h3>
            <div className="flex items-center flex-shrink-0">
              <span className="text-base font-extrabold text-gray-900">{level.price?.toLocaleString()}</span>
              <span className="text-[#7acc00] font-bold text-[10px] ml-0.5">ETB</span>
            </div>
          </div>

          {/* Stats - 3 columns compact */}
          <div className="grid grid-cols-3 gap-1 mb-1">
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Daily</div>
              <div className="text-gray-800 font-bold text-[10px]">{level.daily_income?.toLocaleString()} <span className="text-[#7acc00] text-[8px]">ETB</span></div>
            </div>
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Cycle</div>
              <div className="text-gray-800 font-bold text-[10px]">{level.cycle_days}d</div>
            </div>
            <div className="text-center bg-gray-50 py-1 rounded">
              <div className="text-gray-500 text-[8px] font-medium">Total</div>
              <div className="text-gray-800 font-bold text-[10px]">{(level.daily_income * level.cycle_days).toLocaleString()} ETB</div>
            </div>
          </div>

          {/* Invest Button - compact */}
          <GoldButton onClick={() => onInvest(level)}>
            Invest Now
          </GoldButton>
        </div>
      </div>
    </div>
  );
};

// P Series Products - Vertical stack with compact cards
const PSeriesProducts = ({ 
  levels, 
  onInvest,
  loading 
}: { 
  levels: VipLevel[]; 
  onInvest: (level: VipLevel) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
        <Package className="w-12 h-12 text-[#6b7b6b] mx-auto mb-3" />
        <p className="text-[#2d3a2d] font-medium">No P Series products available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {levels.map((level) => (
        <ProductCard
          key={level.id}
          level={level}
          onInvest={onInvest}
        />
      ))}
    </div>
  );
};

// B Series Products - Vertical stack with compact cards
const BSeriesProducts = ({ 
  levels, 
  onInvest,
  loading 
}: { 
  levels: VipLevel[]; 
  onInvest: (level: VipLevel) => void;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
        <Package className="w-12 h-12 text-[#6b7b6b] mx-auto mb-3" />
        <p className="text-[#2d3a2d] font-medium">No B Series products available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {levels.map((level) => (
        <ProductCard
          key={level.id}
          level={level}
          onInvest={onInvest}
        />
      ))}
    </div>
  );
};

// VIP Music Packages - Using imported VIPPackages component
const VIPMusicPackages = ({ 
  onSelect 
}: { 
  onSelect: (pkg: any) => void;
}) => {
  // We're using the imported VIPPackages component directly
  // This component will just pass through the selection
  return <VIPPackages />;
};

const Earn = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [activeSeries, setActiveSeries] = useState<'P' | 'B' | 'M' | 'VIP'>('P');
  const [showDeposit, setShowDeposit] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [selectedMusicPackage, setSelectedMusicPackage] = useState<any | null>(null);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

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

  const openPurchaseModal = (level: VipLevel) => {
    setSelectedLevel(level);
    setShowPurchaseModal(true);
  };

  const openMusicPackageModal = (pkg: any) => {
    setSelectedMusicPackage(pkg);
    setShowMusicModal(true);
  };

  const handleAddToCart = async () => {
    if (!profile || !user || !selectedLevel) return;

    if (profile.balance < selectedLevel.price) {
      setShowPurchaseModal(false);
      setErrorMessage('Insufficient balance. Please deposit first.');
      setShowErrorModal(true);
      setShowDeposit(true);
      return;
    }

    setPurchasing(true);

    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: selectedLevel.id,
      p_amount: selectedLevel.price,
    });

    setPurchasing(false);

    if (error) {
      setShowPurchaseModal(false);
      setErrorMessage('Purchase failed. Please try again.');
      setShowErrorModal(true);
      return;
    }

    if (data) {
      setShowPurchaseModal(false);
      setSuccessMessage(`${selectedLevel.name} purchased successfully!`);
      setShowSuccessModal(true);
      await refreshProfile();
    } else {
      setShowPurchaseModal(false);
      setErrorMessage('Purchase failed. Insufficient balance.');
      setShowErrorModal(true);
    }
  };

  const handleMusicPurchase = async () => {
    if (!profile || !user || !selectedMusicPackage) return;

    if (profile.balance < selectedMusicPackage.price) {
      setShowMusicModal(false);
      setErrorMessage('Insufficient balance. Please deposit first.');
      setShowErrorModal(true);
      setShowDeposit(true);
      return;
    }

    setPurchasing(true);

    // Simulate purchase - replace with actual Supabase call
    await new Promise(resolve => setTimeout(resolve, 1000));

    setPurchasing(false);
    setShowMusicModal(false);
    setSuccessMessage(`${selectedMusicPackage.name} unlocked successfully! Start listening to earn.`);
    setShowSuccessModal(true);
    await refreshProfile();
  };

  const handleDepositSubmitted = () => {
    setSuccessMessage('Deposit submitted! Awaiting admin approval.');
    setShowSuccessModal(true);
  };

  const videosFromDb = vipLevels.filter(l => !!l.video_url);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Filter levels by series
  const pSeriesLevels = vipLevels.filter(level => level.series === 'P');
  const bSeriesLevels = vipLevels.filter(level => level.series === 'B');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] w-full overflow-x-hidden">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Main container - single scrollable area */}
      <div className="relative w-full min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pt-2 pb-2 mb-4 backdrop-blur-sm bg-opacity-90 w-full rounded-lg">
            <div className="flex items-center gap-2 sm:gap-4 w-full">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/dashboard')}
                className="hover:bg-[#7acc00]/10 active:bg-[#7acc00]/20 transition-all flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#2d3a2d]" />
              </Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2d3a2d] to-[#4a5a4a] bg-clip-text text-transparent truncate">
                  {t('Investment Products')}
                </h1>
                <p className="text-xs sm:text-sm text-[#6b7b6b] truncate">Choose your earning path</p>
              </div>
            </div>
          </header>

          {/* Customer Service Card */}
          <div className="relative mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-[#e2e8e2] shadow-sm overflow-hidden w-full">
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-[#7acc00]/5 to-[#B0FC38]/5 rounded-full blur-2xl" />
            <div className="relative flex items-center gap-3 sm:gap-4 w-full">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#7acc00] to-[#B0FC38] rounded-full blur-md opacity-30" />
                <img src={customerServiceImg} alt="Customer Service" className="relative w-12 h-12 sm:w-16 sm:h-16 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-[#7acc00] flex-shrink-0" />
                  <h3 className="font-bold text-xs sm:text-sm text-[#2d3a2d] truncate">Ready to start earning?</h3>
                </div>
                <p className="text-xs text-[#6b7b6b] mb-2 sm:mb-3 truncate">Watch our quick guide</p>
                <button
                  onClick={() => setShowHowToEarn(true)}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-white text-xs sm:text-sm font-semibold transition-all hover:shadow-lg active:scale-95 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] whitespace-nowrap"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>How to Earn</span>
                </button>
              </div>
            </div>
          </div>

          {/* Series Tabs */}
          <div className="mb-6 w-full">
            <SeriesTabs activeSeries={activeSeries} onSeriesChange={setActiveSeries} />
          </div>

          {/* Content based on active tab - All vertical stack with compact cards */}
          <div className="w-full">
            {activeSeries === 'P' && (
              <PSeriesProducts 
                levels={pSeriesLevels} 
                onInvest={openPurchaseModal}
                loading={loadingLevels}
              />
            )}

            {activeSeries === 'B' && (
              <BSeriesProducts 
                levels={bSeriesLevels} 
                onInvest={openPurchaseModal}
                loading={loadingLevels}
              />
            )}

            {activeSeries === 'VIP' && (
              <VIPMusicPackages onSelect={openMusicPackageModal} />
            )}

            {activeSeries === 'M' && (
              <div className="w-full">
                <MicroSavings />
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />

      {/* Purchase Confirmation Modal for Investment Products - With Gold Button */}
      {showPurchaseModal && selectedLevel && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !purchasing && setShowPurchaseModal(false)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Gradient */}
            <div className="relative h-20 sm:h-24 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-lg p-1 sm:p-2 flex items-center justify-center">
                  {selectedLevel.image_url ? (
                    <img src={selectedLevel.image_url} alt={selectedLevel.name} className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                  ) : (
                    <Package className="w-5 h-5 sm:w-8 sm:h-8 text-[#7acc00]" />
                  )}
                </div>
              </div>
              <button 
                onClick={() => !purchasing && setShowPurchaseModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                disabled={purchasing}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="pt-8 sm:pt-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#2d3a2d] mb-1">{selectedLevel.name}</h2>
              <p className="text-xs sm:text-sm text-[#6b7b6b] mb-4 sm:mb-6">Confirm your investment purchase</p>

              {/* Product Details */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Price</span>
                  <span className="font-bold text-sm sm:text-base text-[#2d3a2d]">{selectedLevel.price.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Daily Income</span>
                  <span className="font-bold text-sm sm:text-base text-[#7acc00]">{selectedLevel.daily_income.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Cycle Days</span>
                  <span className="font-bold text-sm sm:text-base text-[#2d3a2d]">{selectedLevel.cycle_days} Days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Total Return</span>
                  <span className="font-bold text-base sm:text-lg text-[#2d3a2d]">{(selectedLevel.daily_income * selectedLevel.cycle_days).toLocaleString()} ETB</span>
                </div>
              </div>

              {/* Balance Check */}
              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 ${profile?.balance >= selectedLevel.price ? 'bg-[#7acc00]/10' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  {profile?.balance >= selectedLevel.price ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#7acc00]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-[#2d3a2d]">
                      {profile?.balance >= selectedLevel.price ? 'Sufficient Balance' : 'Insufficient Balance'}
                    </p>
                    <p className="text-xs text-[#6b7b6b]">
                      Your balance: {profile?.balance?.toLocaleString()} ETB
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => !purchasing && setShowPurchaseModal(false)}
                  className="flex-1 text-xs sm:text-sm border-[#e2e8e2] text-[#6b7b6b] hover:bg-[#f1f5f1]"
                  disabled={purchasing}
                >
                  Cancel
                </Button>
                <GoldButton
                  onClick={handleAddToCart}
                  disabled={purchasing || profile?.balance < selectedLevel.price}
                  loading={purchasing}
                >
                  Confirm Purchase
                </GoldButton>
              </div>

              {profile?.balance < selectedLevel.price && (
                <Button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setShowDeposit(true);
                  }}
                  className="w-full mt-2 sm:mt-3 text-xs sm:text-sm bg-[#f1f5f1] text-[#2d3a2d] border border-[#e2e8e2] hover:bg-[#e2e8e2]"
                >
                  Deposit Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal for Music Packages - With Gold Button */}
      {showMusicModal && selectedMusicPackage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !purchasing && setShowMusicModal(false)}
        >
          <div 
            className="w-full max-w-sm sm:max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-20 sm:h-24 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white shadow-lg p-1 sm:p-2 flex items-center justify-center">
                  <img src={selectedMusicPackage.image} alt={selectedMusicPackage.name} className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
                </div>
              </div>
              <button 
                onClick={() => !purchasing && setShowMusicModal(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                disabled={purchasing}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>

            <div className="pt-8 sm:pt-10 px-4 sm:px-6 pb-4 sm:pb-6">
              <h2 className="text-lg sm:text-xl font-bold text-[#2d3a2d] mb-1">{selectedMusicPackage.name}</h2>
              <p className="text-xs sm:text-sm text-[#6b7b6b] mb-4 sm:mb-6">Unlock this music package</p>

              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Price</span>
                  <span className="font-bold text-sm sm:text-base text-[#2d3a2d]">{selectedMusicPackage.price?.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Daily Income</span>
                  <span className="font-bold text-sm sm:text-base text-[#7acc00]">{selectedMusicPackage.dailyIncome || selectedMusicPackage.dailyEarnings} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#e2e8e2]">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Cycle Days</span>
                  <span className="font-bold text-sm sm:text-base text-[#2d3a2d]">{selectedMusicPackage.cycleDays || 60} Days</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs sm:text-sm text-[#6b7b6b]">Total Return</span>
                  <span className="font-bold text-base sm:text-lg text-[#2d3a2d]">{(selectedMusicPackage.totalReturn || selectedMusicPackage.price * 0.09 * 60).toLocaleString()} ETB</span>
                </div>
              </div>

              <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 ${profile?.balance >= selectedMusicPackage.price ? 'bg-[#7acc00]/10' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 sm:gap-3">
                  {profile?.balance >= selectedMusicPackage.price ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[#7acc00]" />
                  ) : (
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-[#2d3a2d]">
                      {profile?.balance >= selectedMusicPackage.price ? 'Sufficient Balance' : 'Insufficient Balance'}
                    </p>
                    <p className="text-xs text-[#6b7b6b]">
                      Your balance: {profile?.balance?.toLocaleString()} ETB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => !purchasing && setShowMusicModal(false)}
                  className="flex-1 text-xs sm:text-sm border-[#e2e8e2] text-[#6b7b6b] hover:bg-[#f1f5f1]"
                  disabled={purchasing}
                >
                  Cancel
                </Button>
                <GoldButton
                  onClick={handleMusicPurchase}
                  disabled={purchasing || profile?.balance < selectedMusicPackage.price}
                  loading={purchasing}
                >
                  Confirm & Unlock
                </GoldButton>
              </div>

              {profile?.balance < selectedMusicPackage.price && (
                <Button
                  onClick={() => {
                    setShowMusicModal(false);
                    setShowDeposit(true);
                  }}
                  className="w-full mt-2 sm:mt-3 text-xs sm:text-sm bg-[#f1f5f1] text-[#2d3a2d] border border-[#e2e8e2] hover:bg-[#e2e8e2]"
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
            className="w-full max-w-sm sm:max-w-md bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[#e2e8e2]">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="p-1 rounded-lg bg-gradient-to-br from-[#7acc00] to-[#B0FC38]">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[#2d3a2d]">How to Earn</h3>
              </div>
              <button 
                onClick={() => setShowHowToEarn(false)} 
                className="p-1 rounded-lg hover:bg-[#f1f5f1] transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-[#6b7b6b]" />
              </button>
            </div>
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto">
              {videosFromDb.length > 0 ? (
                videosFromDb.map((level) => (
                  <div key={level.id} className="rounded-lg sm:rounded-xl overflow-hidden border border-[#e2e8e2]">
                    <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-[#7acc00]/10 to-[#B0FC38]/10">
                      <p className="text-xs sm:text-sm font-semibold text-[#2d3a2d]">{level.name} Tutorial</p>
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
                <div className="text-center py-8 sm:py-12">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center">
                    <Headset className="w-5 h-5 sm:w-8 sm:h-8 text-[#7acc00]" />
                  </div>
                  <p className="text-sm sm:text-base text-[#2d3a2d] font-medium">No tutorials available</p>
                  <p className="text-xs sm:text-sm text-[#6b7b6b] mt-1">Contact our support team</p>
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

// Add hide scrollbar style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    /* Hide scrollbar for Chrome, Safari and Opera */
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
    
    /* Hide scrollbar for IE, Edge and Firefox */
    .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    /* Ensure no double scrollbars */
    html, body {
      overflow-x: hidden;
      overflow-y: auto;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    #root {
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }

    /* Fix for fixed positioning */
    .fixed {
      max-width: 100vw;
    }
  `;
  document.head.appendChild(style);
}

export default Earn;