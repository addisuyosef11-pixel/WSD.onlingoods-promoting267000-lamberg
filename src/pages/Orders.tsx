import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Search, Headphones, Music, Clock, TrendingUp, BarChart3, Target, Zap, ChevronRight, Play, Pause } from 'lucide-react';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';
import boostIcon from '@/assets/boost-icon.png';
import emptyBox from '@/assets/empty-box.png';

// Import package images
import vip1 from '@/assets/vip_1.png';
import vip2 from '@/assets/vip_2.png';
import vip3 from '@/assets/vip_3.png';
import vip4 from '@/assets/vip_4.png';
import vip5 from '@/assets/vip_5.png';
import vip6 from '@/assets/vip_6.png';
import vip7 from '@/assets/vip_7.png';
import vip8 from '@/assets/vip_8.png';

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
  image: string;
  daysElapsed: number;
  isExpired: boolean;
}

interface VipPackage {
  id: number;
  name: string;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  totalReturn: number;
  image: string;
  badge?: string;
  badgeColor?: string;
}

interface ListeningProgress {
  packageId: number;
  packageName: string;
  listenedMinutes: number;
  dailyLimit: number;
  earnedToday: number;
  lastUpdated: string;
  isPlaying?: boolean;
  currentTime?: number;
}

interface UserMusicPackage extends VipPackage {
  purchaseId: string;
  purchaseDate: string;
  lastClaimAt: string | null;
  totalClaimed: number;
  dailyProgress: ListeningProgress;
}

type TabType = 'all' | 'active' | 'expired';

// My Progress Button Component
const MyProgressButton = ({ onClick, hasActiveProgress }: { onClick: () => void; hasActiveProgress: boolean }) => {
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative"
    >
      <BarChart3 className="w-7 h-7 text-white" />
      {hasActiveProgress && (
        <>
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full" />
        </>
      )}
    </button>
  );
};

// Progress Modal Component
const ProgressModal = ({ 
  isOpen, 
  onClose, 
  progress,
  onUpdateBalance,
  totalListenedToday,
  totalEarnedToday
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  progress: ListeningProgress[];
  onUpdateBalance: () => void;
  totalListenedToday: number;
  totalEarnedToday: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">My Listening Progress</h3>
                <p className="text-sm text-white/80">Today's earnings & limits</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-5 max-h-96 overflow-y-auto">
          {/* Summary Card */}
          <div className="bg-gradient-to-br from-[#1a2a1a] to-[#2d4a2d] rounded-xl p-4 mb-4 text-white">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-white/60">Total Listened</p>
                <p className="text-xl font-bold">{Math.floor(totalListenedToday / 60)}h {totalListenedToday % 60}m</p>
              </div>
              <div>
                <p className="text-xs text-white/60">Earned Today</p>
                <p className="text-xl font-bold text-[#B0FC38]">{totalEarnedToday.toFixed(2)} ETB</p>
              </div>
            </div>
          </div>

          {/* Individual Package Progress */}
          {progress.length === 0 ? (
            <div className="text-center py-8">
              <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No listening activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Start listening to music to earn!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((item) => {
                const percentage = Math.min(100, (item.listenedMinutes / item.dailyLimit) * 100);
                const isLimitReached = item.listenedMinutes >= item.dailyLimit;
                
                return (
                  <div key={item.packageId} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">{item.packageName}</h4>
                      {isLimitReached && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Limit Reached
                        </span>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{Math.floor(item.listenedMinutes / 60)}h {item.listenedMinutes % 60}m</span>
                        <span>{Math.floor(item.dailyLimit / 60)}h limit</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isLimitReached ? 'bg-red-500' : 'bg-gradient-to-r from-[#7acc00] to-[#B0FC38]'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Earnings */}
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Earned today:</span>
                      <span className="text-sm font-bold text-[#7acc00]">{item.earnedToday.toFixed(2)} ETB</span>
                    </div>

                    {/* Claim Button - appears when limit reached */}
                    {isLimitReached && (
                      <button
                        onClick={() => onUpdateBalance()}
                        className="w-full mt-3 py-2 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-lg text-white text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        Claim {item.earnedToday.toFixed(2)} ETB
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Music Package Card Component - For purchased music packages with listening control
const MusicPackageCard: React.FC<{
  pkg: UserMusicPackage;
  onPlay: (pkg: UserMusicPackage) => void;
  onPause: (pkg: UserMusicPackage) => void;
  onClaim: (pkg: UserMusicPackage) => void;
  isPlaying: boolean;
}> = ({ pkg, onPlay, onPause, onClaim, isPlaying }) => {
  const { t } = useLanguage();
  const progress = pkg.dailyProgress;
  const percentage = Math.min(100, (progress.listenedMinutes / progress.dailyLimit) * 100);
  const canClaim = progress.listenedMinutes >= progress.dailyLimit && progress.earnedToday > 0;
  const canPlay = progress.listenedMinutes < progress.dailyLimit;

  return (
    <div className="bg-gradient-to-br from-[#1a2a1a] to-[#2d4a2d] rounded-xl p-4 mb-3 shadow-lg border border-[#7acc00]/30">
      <div className="flex gap-3">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center p-2">
          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <div>
              <h3 className="font-display text-base font-bold text-white">{pkg.name}</h3>
              {pkg.badge && (
                <span className={`${pkg.badgeColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1`}>
                  {pkg.badge}
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-[#B0FC38]">{pkg.price.toLocaleString()} ETB</p>
            </div>
          </div>
          
          {/* Daily Stats */}
          <div className="grid grid-cols-3 gap-1 mt-2 mb-2">
            <div className="bg-white/10 rounded-lg p-1.5 text-center">
              <p className="text-[8px] text-white/60">Daily</p>
              <p className="text-xs font-bold text-[#B0FC38]">{pkg.dailyIncome} ETB</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5 text-center">
              <p className="text-[8px] text-white/60">Earned</p>
              <p className="text-xs font-bold text-white">{progress.earnedToday.toFixed(2)} ETB</p>
            </div>
            <div className="bg-white/10 rounded-lg p-1.5 text-center">
              <p className="text-[8px] text-white/60">Limit</p>
              <p className="text-xs font-bold text-white">{Math.floor(progress.dailyLimit / 60)}h</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>{Math.floor(progress.listenedMinutes / 60)}h {progress.listenedMinutes % 60}m</span>
              <span>{Math.floor(progress.dailyLimit / 60)}h limit</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {canPlay && (
              <button
                onClick={() => isPlaying ? onPause(pkg) : onPlay(pkg)}
                className="flex-1 py-2 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-lg text-[#1a2a1a] font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Listen
                  </>
                )}
              </button>
            )}
            
            {canClaim && (
              <button
                onClick={() => onClaim(pkg)}
                className="flex-1 py-2 bg-gradient-to-r from-[#FFD700] to-[#FDB931] rounded-lg text-[#1a2a1a] font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all"
              >
                <Zap className="w-4 h-4" />
                Claim {progress.earnedToday.toFixed(2)} ETB
              </button>
            )}

            {!canPlay && !canClaim && (
              <div className="flex-1 py-2 bg-gray-600 rounded-lg text-white text-sm text-center opacity-50">
                Limit Reached
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Original Product Card - For investment products
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
            <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
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

// FIXED MUSIC PACKAGES - These are the 8 VIP music packages with CORRECT values
const MUSIC_PACKAGES: VipPackage[] = [
  {
    id: 1,
    name: "Starter Pack",
    price: 500,
    dailyIncome: 32.5,
    cycleDays: 60,
    totalReturn: 1950,
    image: vip1,
    badge: "STARTER",
    badgeColor: "bg-blue-500"
  },
  {
    id: 2,
    name: "Bronze Listener",
    price: 1000,
    dailyIncome: 65,
    cycleDays: 60,
    totalReturn: 3900,
    image: vip2,
    badge: "BRONZE",
    badgeColor: "bg-amber-700"
  },
  {
    id: 3,
    name: "Silver Melody",
    price: 2000,
    dailyIncome: 94,
    cycleDays: 60,
    totalReturn: 5640,
    image: vip3,
    badge: "⭐ POPULAR",
    badgeColor: "bg-purple-600"
  },
  {
    id: 4,
    name: "Gold Harmony",
    price: 3500,
    dailyIncome: 140,
    cycleDays: 60,
    totalReturn: 8400,
    image: vip4,
    badge: "GOLD",
    badgeColor: "bg-yellow-600"
  },
  {
    id: 5,
    name: "Platinum Legend",
    price: 5000,
    dailyIncome: 215,
    cycleDays: 60,
    totalReturn: 12900,
    image: vip5,
    badge: "PLATINUM",
    badgeColor: "bg-indigo-600"
  },
  {
    id: 6,
    name: "Diamond Elite",
    price: 7500,
    dailyIncome: 320,
    cycleDays: 60,
    totalReturn: 19200,
    image: vip6,
    badge: "ELITE",
    badgeColor: "bg-blue-600"
  },
  {
    id: 7,
    name: "Royal Collection",
    price: 10000,
    dailyIncome: 430,
    cycleDays: 60,
    totalReturn: 25800,
    image: vip7,
    badge: "ROYAL",
    badgeColor: "bg-red-600"
  },
  {
    id: 8,
    name: "Legendary VIP",
    price: 15000,
    dailyIncome: 650,
    cycleDays: 60,
    totalReturn: 39000,
    image: vip8,
    badge: "👑 LEGEND",
    badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600"
  }
];

// Package daily limits (in minutes)
const PACKAGE_DAILY_LIMITS: { [key: number]: number } = {
  1: 600,   // 10 hours for Starter
  2: 1200,  // 20 hours for Bronze
  3: 1440,  // 24 hours for Silver
  4: 1440,  // 24 hours for Gold
  5: 1440,  // 24 hours for Platinum
  6: 1440,  // 24 hours for Diamond
  7: 1440,  // 24 hours for Royal
  8: 1440,  // 24 hours for Legend
};

const Orders = () => {
  const { user, loading, profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [userMusicPackages, setUserMusicPackages] = useState<UserMusicPackage[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [productClaims, setProductClaims] = useState<Map<string, Date>>(new Map());
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  
  // Progress state
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [listeningProgress, setListeningProgress] = useState<ListeningProgress[]>([]);
  const [totalListenedToday, setTotalListenedToday] = useState(0);
  const [totalEarnedToday, setTotalEarnedToday] = useState(0);
  
  // User data from profile
  const [userBalance, setUserBalance] = useState(0);
  const [userWithdrawable, setUserWithdrawable] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user balance from profile
  useEffect(() => {
    if (profile) {
      setUserBalance(profile.balance || 0);
      setUserWithdrawable(profile.withdrawable_balance || 0);
    }
  }, [profile]);

  // Load listening progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      const saved = localStorage.getItem('listeningProgress');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setListeningProgress(parsed);
          
          // Calculate totals
          const totalListened = parsed.reduce((sum: number, p: ListeningProgress) => sum + p.listenedMinutes, 0);
          const totalEarned = parsed.reduce((sum: number, p: ListeningProgress) => sum + p.earnedToday, 0);
          setTotalListenedToday(totalListened);
          setTotalEarnedToday(totalEarned);
        } catch (e) {
          console.error('Failed to load progress:', e);
        }
      }
    };

    loadProgress();
    // Refresh progress every minute
    const interval = setInterval(loadProgress, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user's purchased music packages
  useEffect(() => {
    const fetchUserMusicPackages = async () => {
      if (!user) return;

      // Get user's music package purchases from transactions
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'music_package')
        .order('created_at', { ascending: false });

      if (!transactions || transactions.length === 0) return;

      const purchasedPackages: UserMusicPackage[] = [];
      const today = new Date().toDateString();
      
      for (const tx of transactions) {
        const packageId = tx.music_package_id || parseInt(tx.description?.match(/Package (\d+)/)?.[1] || '0');
        
        if (packageId >= 1 && packageId <= 8) {
          const musicPkg = MUSIC_PACKAGES.find(p => p.id === packageId);
          if (musicPkg) {
            // Get today's listening progress
            const progressKey = `progress_${user.id}_${packageId}_${today}`;
            const savedProgress = localStorage.getItem(progressKey);
            
            let dailyProgress: ListeningProgress = {
              packageId: musicPkg.id,
              packageName: musicPkg.name,
              listenedMinutes: 0,
              dailyLimit: PACKAGE_DAILY_LIMITS[packageId],
              earnedToday: 0,
              lastUpdated: new Date().toISOString()
            };

            if (savedProgress) {
              try {
                dailyProgress = JSON.parse(savedProgress);
              } catch (e) {
                console.error('Failed to load progress:', e);
              }
            }

            purchasedPackages.push({
              ...musicPkg,
              purchaseId: tx.id,
              purchaseDate: tx.created_at,
              lastClaimAt: null,
              totalClaimed: 0,
              dailyProgress
            });
          }
        }
      }

      setUserMusicPackages(purchasedPackages);
    };

    fetchUserMusicPackages();
  }, [user]);

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
        lastClaimAt,
        canClaim,
        imageUrl: vipInfo?.image_url || null,
        image: vip1,
        daysElapsed,
        isExpired,
      });
    }

    setProducts(userProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, [user, profile]);

  const handlePlay = (pkg: UserMusicPackage) => {
    setCurrentlyPlaying(pkg.id);
    // Navigate to dashboard with music player
    navigate('/dashboard', { state: { 
      selectedMusicPackage: pkg,
      autoPlay: true 
    }});
  };

  const handlePause = (pkg: UserMusicPackage) => {
    setCurrentlyPlaying(null);
    // Update progress in localStorage
    const today = new Date().toDateString();
    const progressKey = `progress_${user?.id}_${pkg.id}_${today}`;
    localStorage.setItem(progressKey, JSON.stringify(pkg.dailyProgress));
  };

  const handleClaim = async (pkg: UserMusicPackage) => {
    if (!user || !profile) return;

    setClaiming(true);
    setClaimingId(pkg.purchaseId);

    try {
      // Add to withdrawable balance
      const { error } = await supabase
        .from('profiles')
        .update({ 
          withdrawable_balance: (profile.withdrawable_balance || 0) + pkg.dailyProgress.earnedToday 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Reset today's progress
      const today = new Date().toDateString();
      const progressKey = `progress_${user.id}_${pkg.id}_${today}`;
      const resetProgress = {
        ...pkg.dailyProgress,
        listenedMinutes: 0,
        earnedToday: 0,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(progressKey, JSON.stringify(resetProgress));

      // Update state
      setUserMusicPackages(prev => 
        prev.map(p => 
          p.id === pkg.id 
            ? { ...p, dailyProgress: resetProgress }
            : p
        )
      );

      setSuccessMessage(`${pkg.dailyProgress.earnedToday.toFixed(2)} ETB claimed to withdrawable balance!`);
      setShowSuccess(true);
      await refreshProfile();
    } catch (error) {
      console.error('Failed to claim:', error);
      setSuccessMessage('Failed to claim earnings. Please try again.');
      setShowSuccess(true);
    } finally {
      setClaiming(false);
      setClaimingId(null);
    }
  };

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
      await refreshProfile();
    } catch (error) {
      console.error('Failed to claim income:', error);
    } finally {
      setClaiming(false);
      setClaimingId(null);
    }
  };

  const handleUpdateBalance = async () => {
    setSuccessMessage('Balance updated successfully!');
    setShowSuccess(true);
    await refreshProfile();
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'active') return matchesSearch && !p.isExpired;
    if (activeTab === 'expired') return matchesSearch && p.isExpired;
    return matchesSearch;
  });

  const filteredMusicPackages = userMusicPackages.filter((pkg) => {
    const matchesSearch = !searchQuery || pkg.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'active') return matchesSearch;
    if (activeTab === 'expired') return false; // Music packages don't expire
    return matchesSearch;
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: t('All') },
    { key: 'active', label: t('Active') },
    { key: 'expired', label: t('Expired') },
  ];

  const hasActiveProgress = listeningProgress.some(p => p.listenedMinutes > 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Green gradient header without wave */}
      <div className="bg-gradient-to-b from-[#7acc00] to-[#B0FC38] px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">{t('My Orders')}</h1>
            {/* User balance from profile */}
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-white/80">Balance: {userBalance.toLocaleString()} ETB</span>
              <span className="text-xs text-white/80">|</span>
              <span className="text-xs text-white/80">Withdrawable: {userWithdrawable.toLocaleString()} ETB</span>
            </div>
          </div>
          
          {/* Progress Button */}
          <MyProgressButton 
            onClick={() => setShowProgressModal(true)} 
            hasActiveProgress={hasActiveProgress}
          />
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 pb-3 mt-3">
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

      {/* Music Packages Section - Shows purchased packages with listening controls */}
      {filteredMusicPackages.length > 0 && (
        <div className="px-4 mt-2">
          <h2 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1">
            <Music className="w-4 h-4 text-[#7acc00]" />
            Your Music Packages
          </h2>
          <div className="space-y-2">
            {filteredMusicPackages.map((pkg) => (
              <MusicPackageCard
                key={pkg.purchaseId}
                pkg={pkg}
                onPlay={handlePlay}
                onPause={handlePause}
                onClaim={handleClaim}
                isPlaying={currentlyPlaying === pkg.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pb-3 mt-3">
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

      {/* Content - Investment Products */}
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
        onClick={() => navigate('/vip-packages')}
        className="fixed bottom-24 right-4 z-40 flex flex-col items-center"
      >
        <img src={boostIcon} alt="Boost" className="w-14 h-14 rounded-2xl shadow-lg" />
        <span className="text-xs font-bold mt-1" style={{ color: '#4caf50' }}>{t('Get VIP')}</span>
      </button>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        progress={listeningProgress}
        onUpdateBalance={handleUpdateBalance}
        totalListenedToday={totalListenedToday}
        totalEarnedToday={totalEarnedToday}
      />

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