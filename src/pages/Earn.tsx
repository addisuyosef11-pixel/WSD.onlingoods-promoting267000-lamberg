import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import SeriesProductCard from '@/components/SeriesProductCard';
import SeriesTabs from '@/components/SeriesTabs';
import { ArrowLeft, Play, X, Headset } from 'lucide-react';
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

const Earn = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [activeSeries, setActiveSeries] = useState<'P' | 'B'>('P');
  const [showDeposit, setShowDeposit] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);
  const [showHowToEarn, setShowHowToEarn] = useState(false);

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

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleBuy = async (level: VipLevel) => {
    if (!profile || !user) return;

    if (profile.balance < level.price) {
      setErrorMessage('Insufficient balance. Please deposit first.');
      setShowErrorModal(true);
      setShowDeposit(true);
      return;
    }

    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: level.id,
      p_amount: level.price,
    });

    if (error) {
      setErrorMessage('Purchase failed. Please try again.');
      setShowErrorModal(true);
      return;
    }

    if (data) {
      setSuccessMessage(`${level.name} purchased successfully!`);
      setShowSuccessModal(true);
      await refreshProfile();
    } else {
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
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
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
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
          </div>
        )}
      </div>

      <BottomNavigation />

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
              </button>
            </div>
            <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {videosFromDb.length > 0 ? (
                videosFromDb.map((level) => (
                  <div key={level.id} className="rounded-xl overflow-hidden border border-border">
                    <div className="px-3 py-2 bg-muted/50">
                      <p className="text-sm font-semibold text-foreground">{level.name}</p>
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
                <div className="text-center py-8">
                  <Headset className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No tutorial videos available yet.</p>
                  <p className="text-muted-foreground text-xs mt-1">Contact customer service for help.</p>
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
