import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';

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
  lastClaimAt: Date | null;
  canClaim: boolean;
  imageUrl: string | null;
}

const OrderProductCard: React.FC<{
  product: UserProduct;
  onGet: () => void;
  claiming: boolean;
  claimingId: string | null;
}> = ({ product, onGet, claiming, claimingId }) => {
  const { t } = useLanguage();
  const isClaimingThis = claiming && claimingId === product.id;
  const canClaim = product.canClaim && !claiming;
  
  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-3">
      <div className="flex gap-3">
        {/* Product image */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-full h-full object-contain"
            />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>

        {/* Product details */}
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-foreground mb-2">{product.name}</h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            <span className="text-muted-foreground">{t('Price')}</span>
            <span className="text-primary font-semibold text-right">{product.price.toLocaleString()} ETB</span>
            
            <span className="text-muted-foreground">{t('Cycle')}</span>
            <span className="text-primary font-semibold text-right">{product.cycleDays} {t('Days')}</span>
            
            <span className="text-muted-foreground">{t('Daily Income')}</span>
            <span className="text-green-600 font-semibold text-right">
              {product.dailyIncome.toLocaleString()} ETB
            </span>
            
            <span className="text-muted-foreground">{t('Create')}</span>
            <span className="text-primary font-semibold text-right">{product.createDate}</span>
          </div>
        </div>
      </div>

      {/* Get button */}
      <button
        onClick={onGet}
        disabled={!canClaim}
        className={`w-full mt-3 py-2 font-semibold rounded-lg transition-colors ${
          canClaim 
            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
      >
        {isClaimingThis ? t('Claiming...') : canClaim ? t('get') : t('Wait 24h')}
      </button>
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
  const [productClaims, setProductClaims] = useState<Map<string, Date>>(new Map());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
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

    // Fetch product claims first
    const claimsMap = await fetchProductClaims();
    setProductClaims(claimsMap);

    // Fetch VIP purchases from transactions
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

      // Get VIP level info
      const { data: vipInfo } = await supabase
        .from('vip_levels')
        .select('name, price, image_url, cycle_days, daily_income')
        .eq('id', vipLevel)
        .single();

      const price = vipInfo?.price || Math.abs(tx.amount);
      const cycleDays = vipInfo?.cycle_days || 60;
      const dailyIncomeAmount = vipInfo?.daily_income || Math.round(price * 0.09);

      // Check if can claim (24 hours have passed since last claim for this specific product)
      const lastClaimAt = claimsMap.get(tx.id) || null;
      const canClaim = !lastClaimAt || (now.getTime() - lastClaimAt.getTime() >= 24 * 60 * 60 * 1000);

      userProducts.push({
        id: tx.id,
        vipLevel,
        name: vipInfo?.name || `VIP-${vipLevel}`,
        price,
        cycleDays,
        dailyIncome: dailyIncomeAmount,
        createDate: new Date(tx.created_at).toLocaleDateString('en-GB'),
        lastClaimAt,
        canClaim,
        imageUrl: vipInfo?.image_url || null,
      });
    }

    setProducts(userProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, [user, profile]);

  const handleGet = async (product: UserProduct) => {
    if (!product.canClaim || claiming || !user) return;
    
    setClaiming(true);
    setClaimingId(product.id);
    
    try {
      const now = new Date();
      
      // Check if user has daily income record
      const { data: existingRecord } = await supabase
        .from('user_daily_income')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (existingRecord) {
        // Update existing record
        await supabase
          .from('user_daily_income')
          .update({
            today_income: existingRecord.today_income + product.dailyIncome,
          })
          .eq('user_id', user.id);
      } else {
        // Create new record
        await supabase
          .from('user_daily_income')
          .insert({
            user_id: user.id,
            today_income: product.dailyIncome,
          });
      }

      // Check if claim record exists for this product
      const { data: existingClaim } = await supabase
        .from('user_product_claims')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_id', product.id)
        .single();

      if (existingClaim) {
        // Update existing claim
        await supabase
          .from('user_product_claims')
          .update({ last_claim_at: now.toISOString() })
          .eq('user_id', user.id)
          .eq('transaction_id', product.id);
      } else {
        // Create new claim record
        await supabase
          .from('user_product_claims')
          .insert({
            user_id: user.id,
            transaction_id: product.id,
            last_claim_at: now.toISOString(),
          });
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

  if (loading) {
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
          <h1 className="font-display text-xl font-bold text-foreground">{t('My products')}</h1>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">{t('No products purchased yet')}</p>
            <Button 
              className="mt-4"
              onClick={() => navigate('/earn')}
            >
              {t('Browse Products')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
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
