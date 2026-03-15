import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import SeriesProductCard from '@/components/SeriesProductCard';
import SeriesTabs from '@/components/SeriesTabs';
import { ArrowLeft, Play, X, Headset, Sparkles, TrendingUp, Clock, Shield, Zap, Coins, CheckCircle, AlertCircle, PiggyBank, Package, ChevronLeft, ChevronRight } from 'lucide-react';
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

// VIP Card Component - With image touching corners
const VipCard = ({ 
  level, 
  onInvest
}: { 
  level: VipLevel; 
  onInvest: (level: VipLevel) => void;
}) => {
  return (
    <div 
      className="w-full rounded-xl overflow-hidden shadow-xl cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
      style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
      onClick={() => onInvest(level)}
    >
      <div className="relative">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 z-0" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 z-0" />
        
        {/* Title at top with black background and golden text - positioned absolute over image */}
        <div className="absolute top-0 left-0 right-0 z-20 p-4">
          <div className="inline-block bg-black/80 px-4 py-2 rounded-lg">
            <h3 className="text-yellow-400 font-bold text-lg">{level.name}</h3>
          </div>
        </div>

        {/* Image - enlarged to touch corners */}
        <div className="w-full">
          <div className="relative w-full h-56 flex items-center justify-center bg-white/10 overflow-hidden">
            {level.image_url ? (
              <img 
                src={level.image_url} 
                alt={level.name} 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200/7acc00/ffffff?text=VIP';
                }}
              />
            ) : (
              <Package className="w-24 h-24 text-white" />
            )}
          </div>
        </div>

        {/* Price and Stats Section */}
        <div className="relative z-10 p-5">
          {/* Price */}
          <div className="text-center mb-3">
            <span className="text-3xl font-bold text-white">{level.price.toLocaleString()}</span>
            <span className="text-white/80 text-sm ml-1">ETB</span>
          </div>

          {/* Stats in grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center">
              <div className="text-white/80 text-xs">Daily</div>
              <div className="text-white font-bold text-sm">{level.daily_income.toLocaleString()} ETB</div>
            </div>
            <div className="text-center">
              <div className="text-white/80 text-xs">Cycle</div>
              <div className="text-white font-bold text-sm">{level.cycle_days} days</div>
            </div>
            <div className="text-center col-span-2">
              <div className="text-white/80 text-xs">Total Return</div>
              <div className="text-white font-bold text-base">{(level.daily_income * level.cycle_days).toLocaleString()} ETB</div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full py-3 bg-white rounded-lg text-[#2d3a2d] font-semibold text-base hover:bg-white/90 transition-colors shadow-md">
            Invest Now
          </button>
        </div>
      </div>
    </div>
  );
};

const Earn = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [activeSeries, setActiveSeries] = useState<'P' | 'B' | 'M'>('P');
  const [showDeposit, setShowDeposit] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showHowToEarn, setShowHowToEarn] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  
  // Carousel state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [carouselLevels, setCarouselLevels] = useState<VipLevel[]>([]);
  
  // Auto-slide functionality
  const autoSlideInterval = useRef<NodeJS.Timeout>();

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
        // Get all P and B series for carousel (limit to 5)
        const featured = (data as VipLevel[])
          .filter(level => level.series === 'P' || level.series === 'B')
          .slice(0, 5); // Show only 5 products
        setCarouselLevels(featured);
      }
      setLoadingLevels(false);
    };

    fetchVipLevels();
  }, []);

  // Auto-slide setup
  useEffect(() => {
    if (carouselLevels.length > 1) {
      autoSlideInterval.current = setInterval(() => {
        goToNext();
      }, 5000); // Change card every 5 seconds
    }

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
    };
  }, [carouselLevels.length]);

  // Navigation functions
  const goToPrevious = () => {
    setCurrentCardIndex((prev) => 
      prev === 0 ? carouselLevels.length - 1 : prev - 1
    );
    // Reset auto-slide timer
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = setInterval(() => {
        goToNext();
      }, 5000);
    }
  };

  const goToNext = () => {
    setCurrentCardIndex((prev) => 
      prev === carouselLevels.length - 1 ? 0 : prev + 1
    );
  };

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const openPurchaseModal = (level: VipLevel) => {
    setSelectedLevel(level);
    setShowPurchaseModal(true);
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

  return (
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

        {/* VIP Cards Carousel - One card at a time with side arrows */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2d3a2d] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#7acc00]" />
              Featured VIP Packages
            </h2>
            <div className="text-sm text-[#6b7b6b]">
              {currentCardIndex + 1} / {carouselLevels.length}
            </div>
          </div>

          {loadingLevels ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : carouselLevels.length > 0 ? (
            <div className="relative flex items-center">
              {/* Left Arrow - outside card */}
              {carouselLevels.length > 1 && (
                <button
                  onClick={goToPrevious}
                  className="absolute -left-3 z-30 p-2 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all border border-[#e2e8e2]"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-6 h-6 text-[#7acc00]" />
                </button>
              )}

              {/* Card Container */}
              <div className="flex-1 mx-8">
                <VipCard 
                  level={carouselLevels[currentCardIndex]} 
                  onInvest={openPurchaseModal}
                />
              </div>

              {/* Right Arrow - outside card */}
              {carouselLevels.length > 1 && (
                <button
                  onClick={goToNext}
                  className="absolute -right-3 z-30 p-2 rounded-full bg-white shadow-lg hover:shadow-xl hover:scale-110 transition-all border border-[#e2e8e2]"
                  aria-label="Next"
                >
                  <ChevronRight className="w-6 h-6 text-[#7acc00]" />
                </button>
              )}

              {/* Dots indicator */}
              <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                {carouselLevels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentCardIndex(index);
                      // Reset auto-slide timer
                      if (autoSlideInterval.current) {
                        clearInterval(autoSlideInterval.current);
                        autoSlideInterval.current = setInterval(() => {
                          goToNext();
                        }, 5000);
                      }
                    }}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentCardIndex 
                        ? 'w-6 bg-[#7acc00]' 
                        : 'bg-gray-300 hover:bg-[#7acc00]/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8e2]">
              <Package className="w-12 h-12 text-[#6b7b6b] mx-auto mb-2" />
              <p className="text-[#2d3a2d] font-medium">No VIP packages available</p>
            </div>
          )}
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
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {vipLevels.filter(level => level.series === activeSeries).length > 0 ? (
              vipLevels
                .filter(level => level.series === activeSeries)
                .map((level) => (
                  <SeriesProductCard
                    key={level.id}
                    id={level.id}
                    name={level.name}
                    price={level.price}
                    dailyIncome={level.daily_income}
                    cycleDays={level.cycle_days}
                    imageUrl={level.image_url}
                    onAddToCart={() => openPurchaseModal(level)}
                  />
                ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
                <Package className="w-12 h-12 text-[#6b7b6b] mx-auto mb-3" />
                <p className="text-[#2d3a2d] font-medium">No products available</p>
                <p className="text-sm text-[#6b7b6b] mt-1">Check back later for new investment opportunities</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNavigation />

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
                  onClick={handleAddToCart}
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
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {videosFromDb.length > 0 ? (
                videosFromDb.map((level) => (
                  <div key={level.id} className="rounded-xl overflow-hidden border border-[#e2e8e2]">
                    <div className="px-3 py-2 bg-gradient-to-r from-[#7acc00]/10 to-[#B0FC38]/10">
                      <p className="text-sm font-semibold text-[#2d3a2d]">{level.name} Tutorial</p>
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
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center">
                    <Headset className="w-8 h-8 text-[#7acc00]" />
                  </div>
                  <p className="text-[#2d3a2d] font-medium">No tutorials available</p>
                  <p className="text-sm text-[#6b7b6b] mt-1">Contact our support team for assistance</p>
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

export default Earn;