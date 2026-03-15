import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { DepositModal } from '@/components/DepositModal';
import {
  ArrowLeft, Award, TrendingUp, Clock, CheckCircle,
  Crown, Headphones, Music, Star, Gift, Shield,
  X, AlertTriangle, Download, Volume2,
  Sparkles, Coffee, Gem, Rocket, Search
} from 'lucide-react';
import emptyBox from '@/assets/empty-box.png';

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
  color: string;
  gradient: string;
  icon: any;
  features: string[];
  popular?: boolean;
  badge?: string;
  backgroundColor: string;
  textColor: string;
  category: 'bronze' | 'silver' | 'gold' | 'platinum';
}

type TabType = 'bronze' | 'silver' | 'gold' | 'platinum';

const VIPPackages = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<VipPackage | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeposit, setShowDeposit] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('bronze');
  const [searchQuery, setSearchQuery] = useState('');

  // Check if user is logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const packages: VipPackage[] = [
    {
      id: 1,
      name: "Bronze Listener",
      tagline: "Start Your Music Journey",
      price: 1000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1200, // 20 hours
      dailyEarnings: 65,
      monthlyEarnings: 1950,
      yearlyEarnings: 23725,
      color: "from-amber-700 to-amber-500",
      gradient: "bg-gradient-to-br from-amber-900 via-amber-700 to-amber-500",
      icon: Coffee,
      features: [
        "Earn 0.05416 ETB per minute",
        "20 hours daily listening limit",
        "65 ETB daily earning potential",
        "Access to basic music library",
        "Standard audio quality (128kbps)",
        "Email support within 48h",
        "Basic statistics dashboard"
      ],
      backgroundColor: "bg-amber-50",
      textColor: "text-amber-900",
      category: 'bronze'
    },
    {
      id: 2,
      name: "Silver Melody",
      tagline: "Most Popular Choice",
      price: 2000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 94,
      monthlyEarnings: 2820,
      yearlyEarnings: 34310,
      color: "from-gray-400 to-gray-300",
      gradient: "bg-gradient-to-br from-gray-600 via-gray-400 to-gray-300",
      icon: Gem,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "94 ETB daily earning potential",
        "Access to premium music library",
        "High quality audio (256kbps)",
        "Priority support within 24h",
        "Advanced statistics dashboard",
        "Create custom playlists",
        "No ads experience"
      ],
      popular: true,
      badge: "MOST POPULAR",
      backgroundColor: "bg-gray-50",
      textColor: "text-gray-900",
      category: 'silver'
    },
    {
      id: 3,
      name: "Gold Harmony",
      tagline: "For Music Enthusiasts",
      price: 3500,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 140,
      monthlyEarnings: 4200,
      yearlyEarnings: 51100,
      color: "from-yellow-500 to-yellow-400",
      gradient: "bg-gradient-to-br from-yellow-700 via-yellow-500 to-yellow-400",
      icon: Crown,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "140 ETB daily earning potential",
        "Access to exclusive artist content",
        "HD audio quality (320kbps)",
        "VIP support within 4h",
        "Early access to new releases",
        "Download for offline listening",
        "Exclusive artist interviews",
        "Monthly exclusive playlist"
      ],
      backgroundColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      category: 'gold'
    },
    {
      id: 4,
      name: "Platinum Legend",
      tagline: "Ultimate Music Experience",
      price: 5000,
      earningsPerMinute: 0.05416,
      dailyLimit: 1440, // 24 hours
      dailyEarnings: 215,
      monthlyEarnings: 6450,
      yearlyEarnings: 78475,
      color: "from-indigo-500 to-purple-500",
      gradient: "bg-gradient-to-br from-indigo-900 via-purple-600 to-purple-400",
      icon: Rocket,
      features: [
        "Earn 0.05416 ETB per minute",
        "24 hours daily listening limit",
        "215 ETB daily earning potential",
        "Unlimited music access",
        "Lossless audio quality (FLAC)",
        "Dedicated account manager",
        "Artist meet & greet access",
        "Exclusive merchandise discounts",
        "Priority feature requests",
        "Early access to new features",
        "Custom music recommendations",
        "VIP events and concerts access"
      ],
      badge: "LEGENDARY",
      backgroundColor: "bg-purple-50",
      textColor: "text-purple-900",
      category: 'platinum'
    }
  ];

  const filteredPackages = packages.filter(pkg => 
    pkg.category === activeTab && 
    (searchQuery === '' || pkg.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const tabs: { key: TabType; label: string; icon: any; color: string }[] = [
    { key: 'bronze', label: 'Bronze', icon: Coffee, color: 'from-amber-700 to-amber-500' },
    { key: 'silver', label: 'Silver', icon: Gem, color: 'from-gray-400 to-gray-300' },
    { key: 'gold', label: 'Gold', icon: Crown, color: 'from-yellow-500 to-yellow-400' },
    { key: 'platinum', label: 'Platinum', icon: Rocket, color: 'from-indigo-500 to-purple-500' },
  ];

  const handlePackageSelect = (pkg: VipPackage) => {
    if (!profile) {
      navigate('/login');
      return;
    }
    
    if (profile.balance < pkg.price) {
      setSelectedPackage(pkg);
      setShowConfirmModal(true);
    } else {
      setSelectedPackage(pkg);
      setShowConfirmModal(true);
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedPackage) return;
    
    // Here you would process the purchase via Supabase
    // For now, show success message
    setShowConfirmModal(false);
    setSuccessMessage(`Successfully upgraded to ${selectedPackage.name}! Start earning now.`);
    setShowSuccess(true);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f9f0] to-[#e8f5e9]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5' }}>
      {/* Green gradient header with wave - Like Orders page */}
      <div className="relative" style={{ background: 'linear-gradient(180deg, #7acc00 0%, #a3e635 60%, #c8f547 100%)' }}>
        <header className="px-4 pt-6 pb-8 relative z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">VIP Music Packages</h1>
              <p className="text-sm text-white/80">Choose your earning path</p>
            </div>
          </div>
        </header>
        {/* Wave SVG */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '30px' }}>
          <path d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,25 1440,30 L1440,60 L0,60 Z" fill="#f5f5f5" />
        </svg>
      </div>

      {/* Balance Card */}
      <div className="px-4 -mt-4 relative z-10">
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

      {/* Search bar - Like Orders page */}
      <div className="px-4 mt-4">
        <div className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-4 py-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
          <button
            className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Tabs - Like Orders page but with 4 tabs */}
      <div className="px-4 mt-4">
        <div className="flex rounded-full p-1" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-t-3xl px-4 pt-6 pb-24 mt-4">
        {filteredPackages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <img src={emptyBox} alt="No packages" className="w-48 h-auto mb-4 opacity-50" />
            <p className="text-gray-500 text-sm">No packages found in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPackages.map((pkg) => {
              const Icon = pkg.icon;
              const isAffordable = profile.balance >= pkg.price;
              
              return (
                <div
                  key={pkg.id}
                  className={`relative ${pkg.backgroundColor} rounded-2xl shadow-md overflow-hidden border border-gray-100 ${
                    pkg.popular ? 'ring-2 ring-[#7acc00]' : ''
                  }`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-[#7acc00] text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div className={`${pkg.gradient} p-4`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                          <p className="text-xs text-white/80">{pkg.tagline}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-white">{pkg.price}</p>
                        <p className="text-xs text-white/70">ETB</p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    {/* Earnings Preview */}
                    <div className="bg-white rounded-xl p-3 mb-3 shadow-sm">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Daily</p>
                          <p className="text-base font-bold text-[#7acc00]">{pkg.dailyEarnings} ETB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Monthly</p>
                          <p className="text-base font-bold text-[#7acc00]">{pkg.monthlyEarnings} ETB</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Rate</p>
                          <p className="text-sm font-semibold text-gray-700">{pkg.earningsPerMinute}/min</p>
                        </div>
                      </div>
                    </div>

                    {/* Key Features - Show first 3 */}
                    <div className="space-y-1.5 mb-3">
                      {pkg.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <CheckCircle className="w-3.5 h-3.5 text-[#7acc00] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </div>
                      ))}
                      {pkg.features.length > 3 && (
                        <p className="text-xs text-[#7acc00] ml-5">+{pkg.features.length - 3} more features</p>
                      )}
                    </div>

                    {/* Daily Limit */}
                    <div className="bg-gray-100 rounded-lg p-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Daily limit
                        </span>
                        <span className="font-semibold text-gray-800">
                          {Math.floor(pkg.dailyLimit / 60)} hours
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handlePackageSelect(pkg)}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all ${
                        isAffordable
                          ? 'bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1a2a1a] hover:shadow-md'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isAffordable ? 'Upgrade Now' : 'Insufficient Balance'}
                    </button>

                    {/* Break-even */}
                    <p className="text-[10px] text-gray-400 text-center mt-2">
                      Break-even: {Math.ceil(pkg.price / pkg.dailyEarnings)} days
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNavigation />

      {/* Purchase Confirmation Modal */}
      {showConfirmModal && selectedPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowConfirmModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className={`${selectedPackage.gradient} p-5 rounded-t-2xl relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <selectedPackage.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Upgrade</h3>
                  <p className="text-sm text-white/80">{selectedPackage.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-3 right-3 p-1 bg-white/20 rounded-full hover:bg-white/30"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600 mb-4">
                You are about to upgrade to the <span className="font-semibold text-gray-800">{selectedPackage.name}</span> package.
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
                {profile.balance < selectedPackage.price && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Need</span>
                    <span className="font-semibold text-red-500">{(selectedPackage.price - profile.balance).toLocaleString()} ETB</span>
                  </div>
                )}
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
                  className="w-full py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg"
                >
                  Confirm Upgrade
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
          setSuccessMessage('Deposit submitted successfully!');
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

export default VIPPackages;