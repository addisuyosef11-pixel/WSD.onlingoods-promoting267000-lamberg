import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { DepositModal } from '@/components/DepositModal';
import {
  ArrowLeft, Award, TrendingUp, Clock, CheckCircle,
  Crown, Headphones, Music, Star, Gift, Shield,
  X, AlertTriangle, Download, Volume2,
  Sparkles, Coffee, Gem, Rocket, Search, Lock, Unlock,
  Zap, Trophy, Diamond, Medal
} from 'lucide-react';

// Import package images
import vip1 from '@/assets/vip_1.png';
import vip2 from '@/assets/vip_2.png';
import vip3 from '@/assets/vip_3.png';
import vip4 from '@/assets/vip_4.png';
import vip5 from '@/assets/vip_5.png';
import vip6 from '@/assets/vip_6.png';
import vip7 from '@/assets/vip_7.png';
import vip8 from '@/assets/vip_8.png';
import packageBanner from '@/assets/package_banner.png';

interface VipPackage {
  id: number;
  name: string;
  tagline: string;
  price: number;
  earningsPerMinute: number;
  dailyLimit: number; // minutes
  dailyEarnings: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  image: string;
  features: string[];
  popular?: boolean;
  badge?: string;
  badgeColor?: string;
  backgroundColor: string;
  textColor: string;
  icon: any;
}

// Upgrade Notification Modal
const UpgradeNotification = ({ isOpen, onClose, packageName }: { isOpen: boolean; onClose: () => void; packageName: string }) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  useEffect(() => {
    setIsVisible(isOpen);
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-2xl shadow-2xl p-6 max-w-sm mx-4 animate-bounce-once">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">🎉 Congratulations!</h3>
          <p className="text-white/90 text-sm mb-1">
            You've successfully unlocked
          </p>
          <p className="text-white font-bold text-lg mb-3">{packageName}</p>
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <Zap className="w-4 h-4" />
            <span>Start earning now!</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VIPPackages = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);
  const [upgradedPackage, setUpgradedPackage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [togglingLogo, setTogglingLogo] = useState<number | null>(null);

  // Logo toggle animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      const randomId = Math.floor(Math.random() * 8) + 1;
      setTogglingLogo(randomId);
      setTimeout(() => setTogglingLogo(null), 1000);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check if user is logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const packages: VipPackage[] = [
    {
      id: 1,
      name: "Starter Pack",
      tagline: "Begin Your Journey",
      price: 500,
      earningsPerMinute: 0.05416,
      dailyLimit: 600, // 10 hours
      dailyEarnings: 32.5,
      monthlyEarnings: 975,
      yearlyEarnings: 11862,
      image: vip1,
      icon: Coffee,
      features: [
        "Earn 0.05416 ETB per minute",
        "10 hours daily listening limit",
        "32.5 ETB daily earning potential",
        "Access to basic music library"
      ],
      badge: "NEW",
      badgeColor: "bg-blue-500",
      backgroundColor: "bg-amber-50",
      textColor: "text-amber-900"
    },
    {
      id: 2,
      name: "Bronze Listener",
      tagline: "Start Earning Steady",
      price: 1000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1200, // 20 hours
      dailyEarnings: 65,
      monthlyEarnings: 1950,
      yearlyEarnings: 23725,
      image: vip2,
      icon: Medal,
      features: [
        "Earn 0.05416 ETB per minute",
        "20 hours daily listening limit",
        "65 ETB daily earning potential",
        "Access to basic music library",
        "Standard audio quality",
        "Email support"
      ],
      badge: "BRONZE",
      badgeColor: "bg-amber-700",
      backgroundColor: "bg-amber-100",
      textColor: "text-amber-900"
    },
    {
      id: 3,
      name: "Silver Melody",
      tagline: "Most Popular Choice",
      price: 2000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 94,
      monthlyEarnings: 2820,
      yearlyEarnings: 34310,
      image: vip3,
      icon: Gem,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "94 ETB daily earning potential",
        "Access to premium music library",
        "High quality audio",
        "Priority support",
        "Create custom playlists"
      ],
      popular: true,
      badge: "⭐ MOST POPULAR",
      badgeColor: "bg-purple-600",
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-900"
    },
    {
      id: 4,
      name: "Gold Harmony",
      tagline: "For Music Enthusiasts",
      price: 3500,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 140,
      monthlyEarnings: 4200,
      yearlyEarnings: 51100,
      image: vip4,
      icon: Crown,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "140 ETB daily earning potential",
        "Access to exclusive artist content",
        "HD audio quality",
        "VIP support 24/7",
        "Early access to new releases",
        "Download for offline listening"
      ],
      badge: "GOLD",
      badgeColor: "bg-yellow-600",
      backgroundColor: "bg-yellow-50",
      textColor: "text-yellow-900"
    },
    {
      id: 5,
      name: "Platinum Legend",
      tagline: "Ultimate Music Experience",
      price: 5000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 215,
      monthlyEarnings: 6450,
      yearlyEarnings: 78475,
      image: vip5,
      icon: Rocket,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "215 ETB daily earning potential",
        "Unlimited music access",
        "Lossless audio quality",
        "Dedicated account manager",
        "Artist meet & greet access",
        "Exclusive merchandise discounts"
      ],
      badge: "PLATINUM",
      badgeColor: "bg-indigo-600",
      backgroundColor: "bg-purple-50",
      textColor: "text-purple-900"
    },
    {
      id: 6,
      name: "Diamond Elite",
      tagline: "Premium Experience",
      price: 7500,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 320,
      monthlyEarnings: 9600,
      yearlyEarnings: 116800,
      image: vip6,
      icon: Diamond,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "320 ETB daily earning potential",
        "All previous features",
        "Exclusive concerts access",
        "Personalized playlists",
        "Artist meetups"
      ],
      badge: "ELITE",
      badgeColor: "bg-blue-600",
      backgroundColor: "bg-blue-50",
      textColor: "text-blue-900"
    },
    {
      id: 7,
      name: "Royal Collection",
      tagline: "Royal Treatment",
      price: 10000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 430,
      monthlyEarnings: 12900,
      yearlyEarnings: 156950,
      image: vip7,
      icon: Crown,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "430 ETB daily earning potential",
        "All previous features",
        "Royal VIP events",
        "Backstage passes",
        "Limited edition merch"
      ],
      badge: "ROYAL",
      badgeColor: "bg-red-600",
      backgroundColor: "bg-red-50",
      textColor: "text-red-900"
    },
    {
      id: 8,
      name: "Legendary VIP",
      tagline: "The Ultimate Package",
      price: 15000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 650,
      monthlyEarnings: 19500,
      yearlyEarnings: 237250,
      image: vip8,
      icon: Trophy,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "650 ETB daily earning potential",
        "All previous features",
        "Lifetime membership",
        "Personal manager",
        "All-access pass",
        "Exclusive merchandise"
      ],
      badge: "👑 LEGENDARY",
      badgeColor: "bg-gradient-to-r from-purple-600 to-pink-600",
      backgroundColor: "bg-indigo-50",
      textColor: "text-indigo-900"
    }
  ];

  const handlePackageSelect = (pkg: VipPackage) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    
    setSelectedPackage(pkg);
    setShowConfirmModal(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !user || !profile || purchasing) return;

    if (profile.balance < selectedPackage.price) {
      setShowConfirmModal(false);
      setSuccessMessage('Insufficient balance. Please deposit first.');
      setShowSuccess(true);
      setShowDeposit(true);
      return;
    }

    setPurchasing(true);

    try {
      // 1. Deduct balance from user's profile
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: profile.balance - selectedPackage.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (balanceError) throw balanceError;

      // 2. Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: selectedPackage.price,
          type: 'music_package',
          status: 'completed',
          description: `Purchased ${selectedPackage.name} Music Package`,
          music_package_id: selectedPackage.id,
          created_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      // 3. Create initial listening progress in localStorage
      const today = new Date().toDateString();
      const progressKey = `progress_${user.id}_${selectedPackage.id}_${today}`;
      const initialProgress = {
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        listenedMinutes: 0,
        dailyLimit: selectedPackage.dailyLimit,
        earnedToday: 0,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(progressKey, JSON.stringify(initialProgress));

      // 4. Update UI
      setShowConfirmModal(false);
      setUpgradedPackage(selectedPackage.name);
      setShowUpgradeNotif(true);
      setSuccessMessage(`Successfully unlocked ${selectedPackage.name}! Start listening to earn.`);
      setShowSuccess(true);
      
      // 5. Refresh profile to get updated balance
      await refreshProfile();

    } catch (error) {
      console.error('Purchase failed:', error);
      setSuccessMessage('Purchase failed. Please try again.');
      setShowSuccess(true);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f9f0] to-[#e8f5e9]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5]">
      {/* Header with Back Button */}
      <div className="px-4 pt-6 pb-2 bg-white">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">VIP Music Packages</h1>
        </div>
      </div>

      {/* Full Width Banner */}
      <div className="w-full">
        <img 
          src={packageBanner} 
          alt="VIP Packages" 
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Balance Card */}
      <div className="px-4 mt-4">
        <div className="bg-gradient-to-r from-[#1a2a1a] to-[#2d4a2d] rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-xs mb-1">Your Balance</p>
              <p className="text-xl font-bold text-white">{profile.balance.toLocaleString()} ETB</p>
            </div>
            <button
              onClick={() => setShowDeposit(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1a2a1a] font-semibold rounded-xl hover:shadow-lg transition-all active:scale-95 text-sm"
            >
              Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Packages List - Vertical */}
      <div className="flex-1 px-4 pt-6 pb-24 mt-2">
        <div className="space-y-4">
          {packages.map((pkg) => {
            const isAffordable = profile.balance >= pkg.price;
            const isToggling = togglingLogo === pkg.id;
            
            return (
              <div
                key={pkg.id}
                className={`relative ${pkg.backgroundColor} rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-all ${
                  pkg.popular ? 'ring-2 ring-[#7acc00]' : ''
                }`}
              >
                {/* Badge on top left of logo */}
                {pkg.badge && (
                  <div className="absolute top-2 left-2 z-20">
                    <div className={`${pkg.badgeColor} text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg`}>
                      {pkg.badge}
                    </div>
                  </div>
                )}

                <div className="p-4">
                  {/* Package Row - Logo on left, content on right */}
                  <div className="flex gap-4">
                    {/* Logo with toggle animation */}
                    <div className="flex-shrink-0">
                      <div className={`relative transition-all duration-500 ${
                        isToggling ? 'animate-pulse scale-110 rotate-3' : ''
                      }`}>
                        <img 
                          src={pkg.image} 
                          alt={pkg.name}
                          className={`w-20 h-20 object-contain transition-all duration-500 ${
                            isToggling ? 'brightness-110 drop-shadow-lg' : ''
                          }`}
                        />
                        {isToggling && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#7acc00] rounded-full animate-ping" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">{pkg.name}</h3>
                          <p className="text-xs text-gray-500">{pkg.tagline}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-[#7acc00]">{pkg.price}</p>
                          <p className="text-xs text-gray-500">ETB</p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-3 gap-1 my-2">
                        <div>
                          <p className="text-[10px] text-gray-500">Daily</p>
                          <p className="text-sm font-bold text-[#7acc00]">{pkg.dailyEarnings} ETB</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Monthly</p>
                          <p className="text-sm font-bold text-[#7acc00]">{pkg.monthlyEarnings} ETB</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Limit</p>
                          <p className="text-xs font-semibold text-gray-700">{Math.floor(pkg.dailyLimit / 60)}h</p>
                        </div>
                      </div>

                      {/* Features Preview */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-[#7acc00]" />
                          <span className="text-[10px] text-gray-600">{pkg.features[0].substring(0, 20)}...</span>
                        </div>
                        <span className="text-[10px] text-[#7acc00] font-medium">+{pkg.features.length - 1} more</span>
                      </div>

                      {/* Unlock Button - Shows "Unlock Package" or "Insufficient Balance" based on affordability */}
                      <button
                        onClick={() => handlePackageSelect(pkg)}
                        disabled={!isAffordable}
                        className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                          isAffordable
                            ? 'bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#1a2a1a] hover:shadow-md hover:scale-[1.02] active:scale-95'
                            : 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        <Unlock className="w-4 h-4" />
                        {isAffordable ? 'Unlock Package' : 'Insufficient Balance'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <BottomNavigation />

      {/* Upgrade Notification Popup */}
      <UpgradeNotification 
        isOpen={showUpgradeNotif} 
        onClose={() => setShowUpgradeNotif(false)}
        packageName={upgradedPackage}
      />

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => !purchasing && setShowConfirmModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] p-5 rounded-t-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center gap-3">
                <div className={`w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center ${purchasing ? 'animate-pulse' : ''}`}>
                  <img 
                    src={selectedPackage.image} 
                    alt={selectedPackage.name}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1a2a1a]">Confirm Unlock</h3>
                  <p className="text-sm text-[#1a2a1a]/80">{selectedPackage.name}</p>
                </div>
              </div>
              <button
                onClick={() => !purchasing && setShowConfirmModal(false)}
                className="absolute top-3 right-3 p-1 bg-white/20 rounded-full hover:bg-white/30"
                disabled={purchasing}
              >
                <X className="w-4 h-4 text-[#1a2a1a]" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">
                You are about to unlock the <span className="font-semibold text-gray-800">{selectedPackage.name}</span> package.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Price</span>
                  <span className="font-semibold text-gray-800">{selectedPackage.price} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Balance</span>
                  <span className={`font-semibold ${profile.balance >= selectedPackage.price ? 'text-[#7acc00]' : 'text-red-500'}`}>
                    {profile.balance.toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">After Purchase</span>
                  <span className={`font-semibold ${profile.balance >= selectedPackage.price ? 'text-[#7acc00]' : 'text-red-500'}`}>
                    {profile.balance >= selectedPackage.price ? (profile.balance - selectedPackage.price).toLocaleString() : profile.balance.toLocaleString()} ETB
                  </span>
                </div>
              </div>

              {profile.balance < selectedPackage.price ? (
                <>
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-red-600 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>Insufficient balance. Please deposit first.</span>
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setShowDeposit(true);
                    }}
                    className="w-full py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg"
                  >
                    Deposit Now
                  </button>
                </>
              ) : (
                <button
                  onClick={handleConfirmPurchase}
                  disabled={purchasing}
                  className="w-full py-3 bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#1a2a1a] font-semibold rounded-xl hover:shadow-lg flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4" />
                      Confirm & Unlock
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSubmitted={() => {
          setShowDeposit(false);
          setSuccessMessage('Deposit submitted! Awaiting admin approval.');
          setShowSuccess(true);
        }}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

// Add custom animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bounce-once {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-bounce-once {
      animation: bounce-once 0.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

export default VIPPackages;