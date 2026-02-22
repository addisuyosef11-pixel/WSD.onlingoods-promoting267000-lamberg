import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Users, Copy, Share2, CheckCircle, Clock, ChevronRight, 
  Facebook, Instagram, Send, QrCode, Phone, Award, Gift, 
  TrendingUp, Wallet, Star, RefreshCw, Bell
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
}

interface ReferralStats {
  total_referrals: number;
  qualified_referrals: number;
  pending_referrals: number;
  total_bonus_earned: number;
  pending_bonus: number;
}

// Sample phone numbers for the announcement banner
const PHONE_NUMBERS = [
  '+251 912****89',
  '+251 934****90',
  '+251 943****01',
  '+251 953****12',
  '+251 967****23',
  '+251 978****34',
  '+251 983****45',
  '+251 993****56',
];

// Flipping Announcement Banner Component
const FlippingAnnouncementBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Start flip animation
      setIsFlipping(true);
      
      // Change content after half the flip
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % PHONE_NUMBERS.length);
        setIsFlipping(false);
      }, 200);
      
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-4 relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 shadow-lg">
      {/* Decorative elements - matching home page announcement style */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-20 h-20 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
      </div>
      
      <div className="relative p-4 flex items-center gap-3">
        {/* Bell icon for announcement */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Bell className="w-5 h-5 text-white" />
          </div>
        </div>
        
        {/* Flipping content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/80 mb-1">🔥 Recent successful inviters</p>
          
          {/* Flipping phone number with animation */}
          <div 
            className={`transition-all duration-300 transform ${
              isFlipping ? 'opacity-0 scale-95 rotate-x-90' : 'opacity-100 scale-100 rotate-x-0'
            }`}
            style={{
              transformStyle: 'preserve-3d',
              perspective: '1000px'
            }}
          >
            <p className="text-lg font-bold text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-white/80" />
              {PHONE_NUMBERS[currentIndex]}
            </p>
          </div>
          
          <p className="text-xs text-white/60 mt-1">
            Earned 145 ETB bonus • {currentIndex + 1}/{PHONE_NUMBERS.length}
          </p>
        </div>
        
        {/* Invite & Earn badge */}
        <div className="flex-shrink-0 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <span className="text-xs font-medium text-white">Invite & Earn</span>
        </div>
      </div>

      <style>{`
        @keyframes flipIn {
          0% {
            transform: rotateX(90deg);
            opacity: 0;
          }
          100% {
            transform: rotateX(0deg);
            opacity: 1;
          }
        }
        
        @keyframes flipOut {
          0% {
            transform: rotateX(0deg);
            opacity: 1;
          }
          100% {
            transform: rotateX(-90deg);
            opacity: 0;
          }
        }
        
        .rotate-x-90 {
          transform: rotateX(90deg);
        }
        
        .rotate-x-0 {
          transform: rotateX(0deg);
        }
        
        .rotate-x-\\[90deg\\] {
          transform: rotateX(90deg);
        }
      `}</style>
    </div>
  );
};

const Team = () => {
  const { user, profile, loading } = useAuth();
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

  const BONUS_AMOUNT = 145; // 145 ETB per successful invitation
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
      const { data: members, error } = await supabase
        .from('profiles')
        .select('id, name, phone, created_at, current_vip_level, has_made_deposit, has_made_first_deposit')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch referral records to check bonus_paid status
      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('referred_id, bonus_paid')
        .eq('referrer_id', profile.id);

      if (refError) throw refError;

      // Create a map of referred_id -> bonus_paid
      const bonusMap: Record<string, boolean> = {};
      if (referrals) {
        referrals.forEach(r => {
          bonusMap[r.referred_id] = r.bonus_paid ?? false;
        });
      }

      if (members && members.length > 0) {
        let earnings = 0;
        let qualified = 0;
        let pending = 0;

        const processed: TeamMember[] = members.map(m => {
          const bonusClaimed = bonusMap[m.id] ?? false;
          
          if (bonusClaimed) {
            earnings += BONUS_AMOUNT;
            qualified++;
          } else if (m.has_made_first_deposit) {
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
            has_made_first_deposit: m.has_made_first_deposit || false,
            bonus_claimed: bonusClaimed,
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
      const { data, error } = await (supabase.rpc as any)('claim_referral_bonus', {
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
  const referralLink = `${APP_URL}/signup?ref=${referralCode}`;

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#ff69b4', '#ff1493', '#ff6347', '#ffd700', '#00ff00', '#00bfff', '#9400d3']
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

  const shareReferralLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my team and earn 145 ETB!',
          text: `Use my referral code ${referralCode} when signing up`,
          url: referralLink,
        });
      } else {
        copyReferralLink();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        copyReferralLink();
      }
    }
  };

  const shareOnSocial = (platform: string) => {
    const text = `🚀 Join DSW and earn daily income! Use my referral code ${referralCode} to get 145 ETB bonus instantly after your first deposit! Start earning passive income today! 💰\n\n👉 Sign up: ${referralLink}\n\n#DSW #EarnMoney #Ethiopia`;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(text);
        setSuccessMessage('📱 Text copied! Paste it on your Instagram story or bio!');
        setIsError(false);
        setShowSuccessModal(true);
        break;
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
        {/* Flipping Announcement Banner - Below header */}
        <FlippingAnnouncementBanner />

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

        {/* Rest of your component remains exactly the same... */}
        {/* Main Invite Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Invite & Earn</h2>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">{BONUS_AMOUNT} ETB</div>
                <p className="text-xs text-gray-500">per friend</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Invite friends to join DSW. You'll earn <span className="font-bold text-red-600">{BONUS_AMOUNT} ETB</span> for each friend who makes their first deposit!
            </p>
            
            {/* Referral Code Display */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Your referral code:</p>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex items-center justify-between">
                <span className="text-xl font-bold text-red-600 tracking-wider">{referralCode}</span>
                <Button
                  onClick={copyReferralCode}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
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
                  {referralLink}
                </code>
                <Button
                  onClick={copyReferralLink}
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {/* Share Buttons */}
            <div className="flex items-center justify-around mb-4">
              <button 
                onClick={() => shareOnSocial('facebook')}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <Facebook className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>
              
              <button 
                onClick={() => shareOnSocial('instagram')}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Instagram</span>
              </button>
              
              <button 
                onClick={() => shareOnSocial('telegram')}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">Telegram</span>
              </button>

              <button 
                onClick={() => setShowQR(!showQR)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-gray-600">QR Code</span>
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center">
                <QRCode value={referralLink} size={160} />
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
                  className="h-full bg-red-600 rounded-full transition-all duration-500"
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
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-gray-900 font-medium">No team members yet</p>
            <p className="text-sm text-gray-500 mt-2">Share your referral code to grow your team</p>
            <Button onClick={copyReferralLink} className="mt-4 bg-red-600 hover:bg-red-700 text-white px-6">
              <Copy className="w-4 h-4 mr-2" />
              Copy Referral Link
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Team Members ({teamMembers.length})</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {stats.qualified_referrals} qualified
              </span>
            </div>
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-lg border-2 border-red-200 flex-shrink-0">
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
                          Ready to claim {BONUS_AMOUNT} ETB
                        </span>
                      )}
                      {member.bonus_claimed && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                          +{BONUS_AMOUNT} ETB Earned
                        </span>
                      )}
                      {!member.has_made_first_deposit && (
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

                    {/* First Deposit Info */}
                    {member.has_made_first_deposit && (
                      <p className="text-xs text-gray-500">
                        First deposit completed
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Claim Button */}
                {member.has_made_first_deposit && !member.bonus_claimed && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <Button
                      onClick={() => handleClaimBonus(member.id)}
                      disabled={claimingId === member.id}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium"
                    >
                      {claimingId === member.id ? (
                        <Spinner size="sm" />
                      ) : (
                        `Claim ${BONUS_AMOUNT} ETB Bonus`
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