import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Search } from 'lucide-react';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';
import boostIcon from '@/assets/boost-icon.png';
import emptyBox from '@/assets/empty-box.png';

interface ProductClaim {
  transaction_id: string;
  last_claim_at: string;
}

interface UserProduct {
  id: string;
  vipLevel: number;
  name: string;
  price: number;
  cycleDays: number;
  dailyIncome: number;
  createDate: string;
  createdAt: Date;
  lastClaimAt: Date | null;
  canClaim: boolean;
  imageUrl: string | null;
  daysElapsed: number;
  isExpired: boolean;
}

type TabType = 'all' | 'active' | 'expired';

const OrderProductCard: React.FC<{
  product: UserProduct;
  onGet: () => void;
  claiming: boolean;
  claimingId: string | null;
}> = ({ product, onGet, claiming, claimingId }) => {
  const { t } = useLanguage();
  const isClaimingThis = claiming && claimingId === product.id;
  const canClaim = product.canClaim && !claiming && !product.isExpired;

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-3">
      <div className="flex gap-3">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-foreground mb-2">{product.name}</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            <span className="text-muted-foreground">{t('Price')}</span>
            <span className="text-primary font-semibold text-right">{product.price.toLocaleString()} ETB</span>
            <span className="text-muted-foreground">{t('Cycle')}</span>
            <span className="text-primary font-semibold text-right">{product.cycleDays} {t('Days')}</span>
            <span className="text-muted-foreground">{t('Daily Income')}</span>
            <span className="text-green-600 font-semibold text-right">{product.dailyIncome.toLocaleString()} ETB</span>
            <span className="text-muted-foreground">{t('Create')}</span>
            <span className="text-primary font-semibold text-right">{product.createDate}</span>
          </div>
        </div>
      </div>

      {/* Boost button */}
      {product.isExpired ? (
        <div className="w-full mt-3 py-2 text-center text-sm font-semibold text-muted-foreground bg-muted rounded-lg">
          {t('Expired')}
        </div>
      ) : (
        <button
          onClick={onGet}
          disabled={!canClaim}
          className={`w-full mt-3 flex items-center justify-center gap-2 py-2 font-semibold rounded-lg transition-all ${
            !canClaim ? 'bg-gray-300' : ''
          }`}
          style={canClaim ? { background: 'linear-gradient(135deg, #00c853, #7acc00, #B0FC38)' } : undefined}
        >
          {canClaim ? (
            <>
              <img src={boostIcon} alt="Boost" className="w-7 h-7 rounded-md animate-pulse" />
              <span className="text-white font-bold text-sm">{isClaimingThis ? t('Claiming...') : t('Boost')}</span>
            </>
          ) : (
            <span className="text-muted-foreground text-sm font-semibold">{t('Claimed')}</span>
          )}
        </button>
      )}
    </div>
  );
};

const Orders = () => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productClaims, setProductClaims] = useState<Map<string, Date>>(new Map());

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  const fetchProductClaims = async () => {
    if (!user) return new Map<string, Date>();
    const { data } = await supabase
      .from('user_product_claims')
      .select('transaction_id, last_claim_at')
      .eq('user_id', user.id);
    const claimsMap = new Map<string, Date>();
    if (data) {
      data.forEach((claim: ProductClaim) => {
        claimsMap.set(claim.transaction_id, new Date(claim.last_claim_at));
      });
    }
    return claimsMap;
  };

  const fetchProducts = async () => {
    if (!user) return;
    const claimsMap = await fetchProductClaims();
    setProductClaims(claimsMap);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'vip_purchase')
      .order('created_at', { ascending: false });

    if (!transactions) return;

    const userProducts: UserProduct[] = [];
    const now = new Date();

    for (const tx of transactions) {
      const vipLevel = parseInt(tx.description?.match(/VIP Level (\d+)/)?.[1] || '0');
      if (vipLevel === 0) continue;

      const { data: vipInfo } = await supabase
        .from('vip_levels')
        .select('name, price, image_url, cycle_days, daily_income')
        .eq('id', vipLevel)
        .single();

      const price = vipInfo?.price || Math.abs(tx.amount);
      const cycleDays = vipInfo?.cycle_days || 60;
      const dailyIncomeAmount = vipInfo?.daily_income || Math.round(price * 0.09);
      const createdAt = new Date(tx.created_at);
      const daysElapsed = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysElapsed >= cycleDays;

      const lastClaimAt = claimsMap.get(tx.id) || null;
      const canClaim = !isExpired && (!lastClaimAt || (now.getTime() - lastClaimAt.getTime() >= 24 * 60 * 60 * 1000));

      userProducts.push({
        id: tx.id,
        vipLevel,
        name: vipInfo?.name || `VIP-${vipLevel}`,
        price,
        cycleDays,
        dailyIncome: dailyIncomeAmount,
        createDate: createdAt.toLocaleDateString('en-GB'),
        createdAt,
        lastClaimAt,
        canClaim,
        imageUrl: vipInfo?.image_url || null,
        daysElapsed,
        isExpired,
      });
    }

    setProducts(userProducts);
  };

  useEffect(() => { fetchProducts(); }, [user, profile]);

  const handleGet = async (product: UserProduct) => {
    if (!product.canClaim || claiming || !user) return;
    setClaiming(true);
    setClaimingId(product.id);

    try {
      const now = new Date();
      const { data: existingRecord } = await supabase
        .from('user_daily_income')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRecord) {
        const { error } = await supabase
          .from('user_daily_income')
          .update({
            today_income: existingRecord.today_income + product.dailyIncome,
            last_income_transfer_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_daily_income')
          .insert({
            user_id: user.id,
            today_income: product.dailyIncome,
            last_income_transfer_at: new Date().toISOString(),
          });
        if (error) throw error;
      }

      const { data: existingClaim } = await supabase
        .from('user_product_claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_id', product.id)
        .maybeSingle();

      if (existingClaim) {
        await supabase
          .from('user_product_claims')
          .update({ last_claim_at: now.toISOString() })
          .eq('user_id', user.id)
          .eq('transaction_id', product.id);
      } else {
        await supabase
          .from('user_product_claims')
          .insert({ user_id: user.id, transaction_id: product.id, last_claim_at: now.toISOString() });
      }

      setSuccessMessage(`Daily income of ${product.dailyIncome} ETB added!`);
      setShowSuccess(true);
      await fetchProducts();
    } catch (error) {
      console.error('Failed to claim income:', error);
    } finally {
      setClaiming(false);
      setClaimingId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'active') return matchesSearch && !p.isExpired;
    if (activeTab === 'expired') return matchesSearch && p.isExpired;
    return matchesSearch;
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: t('All') },
    { key: 'active', label: t('Active') },
    { key: 'expired', label: t('Expired') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Green gradient header with wave */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #7acc00 0%, #a3e635 60%, #c8f547 100%)' }}>
        <header className="px-4 pt-6 pb-8 relative z-10">
          <h1 className="text-xl font-bold text-white">{t('My Orders')}</h1>
        </header>
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '30px' }}>
          <path d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,25 1440,30 L1440,60 L0,60 Z" fill="#f5f5f5" />
        </svg>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 bg-card rounded-full border border-border px-4 py-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('Enter product name to search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
          >
            {t('Search')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex rounded-full p-1" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-card rounded-t-3xl px-4 pt-4 pb-24">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src={emptyBox} alt="No orders" className="w-48 h-auto mb-4" />
            <p className="text-muted-foreground text-sm">
              {activeTab === 'expired'
                ? t('No expired orders found')
                : activeTab === 'active'
                ? t('No active orders found')
                : t('No investment orders found')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => (
              <OrderProductCard
                key={product.id}
                product={product}
                onGet={() => handleGet(product)}
                claiming={claiming}
                claimingId={claimingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Boost FAB */}
      <button
        onClick={() => navigate('/earn')}
        className="fixed bottom-24 right-4 z-40 flex flex-col items-center"
      >
        <img src={boostIcon} alt="Boost" className="w-14 h-14 rounded-2xl shadow-lg" />
        <span className="text-xs font-bold mt-1" style={{ color: '#4caf50' }}>{t('Boost')}</span>
      </button>

      <BottomNavigation />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Orders;
