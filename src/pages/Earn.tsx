import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DepositModal } from '@/components/DepositModal';
import { BottomNavigation } from '@/components/BottomNavigation';
import SeriesProductCard from '@/components/SeriesProductCard';
import SeriesTabs from '@/components/SeriesTabs';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';

interface VipLevel {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
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
    setSuccessMessage('Deposit submitted! Awaiting admin approval for 15-20 minutes.');
    setShowSuccessModal(true);
  };

  const filteredLevels = vipLevels.filter(level => level.series === activeSeries);

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
                onBuy={() => handleBuy(level)}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />

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
