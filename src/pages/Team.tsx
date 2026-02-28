import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Users, Copy, Share2, CheckCircle, Clock, ChevronRight, 
  Facebook, Instagram, Send, QrCode, Phone, Award, Gift, 
  TrendingUp, Wallet, Star, RefreshCw, Bell, Zap, Flame, Sparkles, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import QRCode from 'react-qr-code';
import teamImage from '@/assets/team-mem.png';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  current_vip_level: number | null;
  has_made_deposit: boolean;
  has_made_first_deposit: boolean;
  bonus_claimed: boolean;
  bonus_amount: number;
}

interface ReferralStats {
  total_referrals: number;
  qualified_referrals: number;
  pending_referrals: number;
  total_bonus_earned: number;
  pending_bonus: number;
}

// Announcement data with different colors and reward amounts
const ANNOUNCEMENTS = [
  {
    phone: '+251 91 234 5678',
    amount: 145,
    color: 'from-purple-600 to-purple-700',
    icon: '🚀',
    bgColor: 'bg-purple-500'
  },
  {
    phone: '+251 92 345 6789',
    amount: 200,
    color: 'from-blue-600 to-blue-700',
    icon: '💎',
    bgColor: 'bg-blue-500'
  },
  {
    phone: '+251 93 456 7890',
    amount: 175,
    color: 'from-green-600 to-green-700',
    icon: '🌟',
    bgColor: 'bg-green-500'
  },
  {
    phone: '+251 94 567 8901',
    amount: 300,
    color: 'from-orange-600 to-orange-700',
    icon: '🔥',
    bgColor: 'bg-orange-500'
  },
  {
    phone: '+251 95 678 9012',
    amount: 250,
    color: 'from-pink-600 to-pink-700',
    icon: '💫',
    bgColor: 'bg-pink-500'
  },
  {
    phone: '+251 96 789 0123',
    amount: 180,
    color: 'from-indigo-600 to-indigo-700',
    icon: '⚡',
    bgColor: 'bg-indigo-500'
  },
  {
    phone: '+251 97 890 1234',
    amount: 220,
    color: 'from-red-600 to-red-700',
    icon: '🎯',
    bgColor: 'bg-red-500'
  },
  {
    phone: '+251 98 901 2345',
    amount: 280,
    color: 'from-teal-600 to-teal-700',
    icon: '🏆',
    bgColor: 'bg-teal-500'
  },
  {
    phone: '+251 99 012 3456',
    amount: 320,
    color: 'from-amber-600 to-amber-700',
    icon: '👑',
    bgColor: 'bg-amber-500'
  }
];

// Colorful Flipping Announcement Banner Component
const ColorfulAnnouncementBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('next');

  useEffect(() => {
    const cycleAnnouncements = () => {
      setDirection('next');
      setIsAnimating(true);
      
      // Move to next after animation
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setIsAnimating(false);
      }, 300);
    };

    const interval = setInterval(cycleAnnouncements, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  // Get appropriate icon component based on amount
  const getIcon = () => {
    if (current.amount >= 300) return <Crown className="w-4 h-4 text-white" />;
    if (current.amount >= 250) return <Award className="w-4 h-4 text-white" />;
    if (current.amount >= 200) return <Zap className="w-4 h-4 text-white" />;
    return <Flame className="w-4 h-4 text-white" />;
  };

  return (
    <div className="mb-4 relative overflow-hidden rounded-lg shadow-lg">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${current.color} transition-all duration-500`} />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2 animate-pulse delay-300" />
      </div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/20 rounded-full animate-float"
            style={{
              width: `${Math.random() * 20 + 10}px`,
              height: `${Math.random() * 20 + 10}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${Math.random() * 5 + 3}s`,
            }}
          />
        ))}
      </div>
      
      {/* Moving card content */}
      <div 
        className={`relative p-4 transform transition-all duration-300 ${
          isAnimating 
            ? direction === 'next' 
              ? '-translate-x-full opacity-0' 
              : 'translate-x-full opacity-0'
            : 'translate-x-0 opacity-100'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="flex items-start gap-3">
          {/* Animated icon container */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl ${current.bgColor} bg-opacity-30 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 animate-pulse`}>
              <span className="text-2xl filter drop-shadow-lg">{current.icon}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                🔥 Just Now
              </span>
              <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                {currentIndex + 1}/{ANNOUNCEMENTS.length}
              </span>
            </div>
            
            <p className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <Phone className="w-4 h-4 text-white/80" />
              {current.phone}
            </p>
            
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full`}>
                {getIcon()}
                <span className="text-sm font-bold text-white">+{current.amount} ETB</span>
              </div>
              <span className="text-xs text-white/60">earned from referral</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-20px) translateX(-5px);
          }
          75% {
            transform: translateY(-10px) translateX(5px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
        
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
      `}</style>
    </div>
  );
};

const Team = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [stats, setStats] = useState<ReferralStats>({
    total_referrals: 0,
    qualified_referrals: 0,
    pending_referrals: 0,
    total_bonus_earned: 0,
    pending_bonus: 0
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const BONUS_AMOUNT = 145; // Base bonus amount
  const APP_URL = 'https://wsd-onlingoods-promoting267000-lamb.vercel.app';

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  const fetchTeamData = async () => {
    if (!user?.id || !profile) return;
    setIsLoading(true);

    try {
      // Fetch team members (profiles where referred_by = current user's auth id)
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('id, name, phone, created_at, current_vip_level, has_made_deposit, has_made_first_deposit')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

      if (membersError) throw membersError;

      // Fetch referral records to check bonus_paid status
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('referred_id, bonus_paid, bonus_amount')
        .eq('referrer_id', profile.id);

      if (refError) throw refError;

      // Create maps for quick lookup
      const bonusMap: Record<string, { paid: boolean; amount: number }> = {};
      if (referrals) {
        referrals.forEach(r => {
          bonusMap[r.referred_id] = {
            paid: r.bonus_paid ?? false,
            amount: r.bonus_amount || BONUS_AMOUNT
          };
        });
      }

      if (members && members.length > 0) {
        let earnings = 0;
        let qualified = 0;
        let pending = 0;

        const processed: TeamMember[] = members.map(m => {
          const bonusInfo = bonusMap[m.id];
          const bonusClaimed = bonusInfo?.paid || false;
          const bonusAmount = bonusInfo?.amount || BONUS_AMOUNT;
          
          // Check if this member qualifies for bonus (has made first deposit)
          const qualifies = m.has_made_first_deposit || false;
          
          if (bonusClaimed) {
            earnings += bonusAmount;
            qualified++;
          } else if (qualifies) {
            qualified++;
            pending++;
          } else {
            pending++;
          }

          return {
            id: m.id,
            name: m.name || 'New User',
            phone: m.phone || '09XXXXXXXX',
            created_at: m.created_at,
            current_vip_level: m.current_vip_level || 0,
            has_made_deposit: m.has_made_deposit || false,
            has_made_first_deposit: qualifies,
            bonus_claimed: bonusClaimed,
            bonus_amount: bonusAmount
          };
        });

        setTeamMembers(processed);
        setTeamEarnings(earnings);
        setStats({
          total_referrals: processed.length,
          qualified_referrals: qualified,
          pending_referrals: pending,
          total_bonus_earned: earnings,
          pending_bonus: pending * BONUS_AMOUNT
        });
      } else {
        setTeamMembers([]);
        setTeamEarnings(0);
        setStats({
          total_referrals: 0,
          qualified_referrals: 0,
          pending_referrals: 0,
          total_bonus_earned: 0,
          pending_bonus: 0
        });
      }
    } catch (error: any) {
      console.error('Error fetching team data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile) {
      fetchTeamData();
    }
  }, [user, profile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeamData();
    setRefreshing(false);
  };

  const handleClaimBonus = async (memberId: string) => {
    if (!user?.id || claimingId) return;
    setClaimingId(memberId);

    try {
      const { data, error } = await supabase
        .rpc('claim_referral_bonus', {
          p_referrer_user_id: user.id,
          p_referred_profile_id: memberId,
        });

      if (error) throw error;

      if (data === true) {
        setSuccessMessage(`145 ETB bonus claimed to withdrawable balance!`);
        setIsError(false);
        setShowSuccessModal(true);
        fireConfetti();
        await fetchTeamData();
        await refreshProfile();
      } else {
        setSuccessMessage('Unable to claim bonus. Please try again.');
        setIsError(true);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      setSuccessMessage('Error claiming bonus');
      setIsError(true);
      setShowSuccessModal(true);
    } finally {
      setClaimingId(null);
    }
  };

  const referralCode = (profile as any)?.referral_code || 'LOADING';
  // Use share page for better previews
  const shareLink = `${APP_URL}/share?ref=${referralCode}`;
  const referralLink = `${APP_URL}/signup?ref=${referralCode}`;

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#22C55E', '#16A34A', '#15803D', '#4ADE80', '#86EFAC']
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSuccessMessage('Referral link copied!');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setSuccessMessage('Referral code copied!');
    setIsError(false);
    setShowSuccessModal(true);
    setTimeout(() => setCopiedCode(false), 2000);
    fireConfetti();
  };

  const copyEnhancedMessage = () => {
    const message = `🚀 Join DSW and earn daily income! 🚀\n\n✨ Use my referral code: ${referralCode}\n💰 Get 145 ETB bonus instantly after your first deposit!\n💎 Start earning passive income today!\n\n👉 Sign up here: ${referralLink}\n\n#DSW #EarnMoney #Ethiopia #PassiveIncome`;
    navigator.clipboard.writeText(message);
    setSuccessMessage('📋 Complete message copied! Share it anywhere!');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const shareOnSocial = (platform: string) => {
    const text = `🚀 Join DSW and earn daily income! Use my referral code ${referralCode} to get 145 ETB bonus instantly after your first deposit! Start earning passive income today! 💰`;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        copyEnhancedMessage();
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + shareLink)}`, '_blank');
        break;
      default:
        copyReferralLink();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === '09XXXXXXXX') return '09XXXXXXXX';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `+251 ${cleaned.slice(0,2)} ${cleaned.slice(2,5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  const qualifiedCount = stats.qualified_referrals;
  const progressPercentage = Math.min((qualifiedCount / 3) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Colorful Flipping Announcement Banner */}
        <ColorfulAnnouncementBanner />

        {/* Header with Refresh */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">Referral Program</h1>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Team Image */}
        <div className="mb-4">
          {!imageError ? (
            <img 
              src={teamImage} 
              alt="Team Ethiopia" 
              className="w-full h-auto rounded-xl shadow-sm"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-40 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <div className="text-center text-white">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p className="text-lg font-bold">Build Your Team</p>
                <p className="text-sm opacity-90">Earn 145 ETB per friend</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-4 h-4 text-purple-500" />
              <p className="text-xs text-gray-500">Total Earned</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{stats.total_bonus_earned} ETB</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <p className="text-xs text-gray-500">Pending Bonus</p>
            </div>
            <p className="text-lg font-bold text-gray-800">{stats.pending_bonus} ETB</p>
          </div>
        </div>

        {/* Main Invite Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Invite & Earn</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">{BONUS_AMOUNT} ETB</div>
                <p className="text-xs text-gray-500">per friend</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Invite friends to join DSW. You'll earn <span className="font-bold text-green-600">{BONUS_AMOUNT} ETB</span> for each friend who makes their first deposit!
            </p>
            
            {/* Referral Code Display */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Your referral code:</p>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 flex items-center justify-between">
                <span className="text-xl font-bold text-green-600 tracking-wider">{referralCode}</span>
                <Button
                  onClick={copyReferralCode}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            {/* Referral Link */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Referral link:</p>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center justify-between">
                <code className="text-xs text-gray-700 truncate max-w-[180px]">
                  {shareLink}
                </code>
                <Button
                  onClick={copyReferralLink}
                  size="sm"
                  variant="ghost"
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Share Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-4">
              <button 
                onClick={() => shareOnSocial('facebook')}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>
              
              <button 
                onClick={() => shareOnSocial('instagram')}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Instagram</span>
              </button>
              
              <button 
                onClick={() => shareOnSocial('telegram')}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Telegram</span>
              </button>

              <button 
                onClick={() => shareOnSocial('whatsapp')}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 6.46 17.5 2 12.04 2ZM12.04 4.25C16.27 4.25 19.7 7.68 19.7 11.91C19.7 16.14 16.27 19.57 12.04 19.57C10.62 19.57 9.23 19.18 8.02 18.45L7.76 18.29L4.67 19.07L5.46 16.07L5.28 15.8C4.5 14.55 4.09 13.1 4.09 11.61C4.09 7.38 7.52 4.25 11.75 4.25H12.04Z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </button>
            </div>

            {/* Copy Enhanced Message Button */}
            <Button
              onClick={copyEnhancedMessage}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium mb-3 flex items-center justify-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Complete Invite Message
            </Button>

            {/* QR Code */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-2 text-sm text-green-600 hover:text-green-700 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>

            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                <QRCode value={shareLink} size={160} />
                <p className="text-xs text-gray-500 mt-2">Scan to share referral link</p>
              </div>
            )}
          </div>
          
          {/* Progress Section */}
          <div className="border-t border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Your Progress</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Qualified</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.qualified_referrals}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <Clock className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700">Pending</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.pending_referrals}</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>{qualifiedCount}/3 referrals</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Team Members List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-gray-900 font-medium">No team members yet</p>
            <p className="text-sm text-gray-500 mt-2">Share your referral code to grow your team</p>
            <Button onClick={copyReferralLink} className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6">
              <Copy className="w-4 h-4 mr-2" />
              Copy Referral Link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Team Members ({teamMembers.length})</h3>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {stats.qualified_referrals} qualified
              </span>
            </div>
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold text-lg border-2 border-green-200 flex-shrink-0">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 truncate">{member.name}</h4>
                      {member.bonus_claimed && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Claimed
                        </span>
                      )}
                    </div>
                    
                    {/* Phone */}
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{formatPhoneNumber(member.phone)}</span>
                    </div>
                    
                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {member.has_made_first_deposit && !member.bonus_claimed && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          Ready to claim {member.bonus_amount} ETB
                        </span>
                      )}
                      {member.bonus_claimed && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          +{member.bonus_amount} ETB Earned
                        </span>
                      )}
                      {!member.has_made_first_deposit && !member.bonus_claimed && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          Awaiting deposit
                        </span>
                      )}
                      {member.current_vip_level && member.current_vip_level > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">
                          VIP {member.current_vip_level}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Claim Button */}
                {member.has_made_first_deposit && !member.bonus_claimed && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handleClaimBonus(member.id)}
                      disabled={claimingId === member.id}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      {claimingId === member.id ? (
                        <Spinner size="sm" />
                      ) : (
                        `Claim ${member.bonus_amount} ETB Bonus`
                      )}
                    </Button>
                  </div>
                )}
                
                {/* Joined Date */}
                <div className="mt-2 text-xs text-gray-400">
                  Joined: {formatDate(member.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        isError={isError}
      />

      <BottomNavigation />
    </div>
  );
};

export default Team;