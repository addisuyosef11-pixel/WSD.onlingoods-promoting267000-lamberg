import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Users, Copy, Share2, CheckCircle, Clock, 
  Phone, TrendingUp, Wallet, RefreshCw, Zap, 
  Flame, Sparkles, Crown, QrCode, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import QRCode from 'react-qr-code';

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

// Simple announcement data
const ANNOUNCEMENTS = [
  { phone: '+251 91***78', amount: 145, icon: '🚀' },
  { phone: '+251 92***89', amount: 200, icon: '💎' },
  { phone: '+251 93***90', amount: 175, icon: '🌟' },
  { phone: '+251 94***01', amount: 300, icon: '🔥' },
  { phone: '+251 95***12', amount: 250, icon: '💫' },
];

const AnnouncementTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
        setIsAnimating(false);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <div className="bg-gradient-to-r from-amber-400 to-yellow-400 overflow-hidden py-2 px-4">
      <div className={`flex items-center justify-center gap-3 transition-all duration-400 ${isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        <span className="text-base">{current.icon}</span>
        <span className="text-xs font-medium text-amber-900">{current.phone}</span>
        <span className="text-xs font-bold text-amber-900 bg-white/30 px-2 py-0.5 rounded-full">
          +{current.amount} ETB
        </span>
      </div>
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
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const BONUS_AMOUNT = 145;
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
      const { data: members, error } = await supabase
        .from('profiles')
        .select('id, name, phone, created_at, current_vip_level, has_made_deposit, has_made_first_deposit')
        .eq('referred_by', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const { data: referrals, error: refError } = await supabase
        .from('referrals')
        .select('referred_id, bonus_paid')
        .eq('referrer_id', profile.id);

      if (refError) throw refError;

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
        setStats({ total_referrals: 0, qualified_referrals: 0, pending_referrals: 0, total_bonus_earned: 0, pending_bonus: 0 });
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
        setSuccessMessage('145 ETB bonus claimed to withdrawable balance!');
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
  const referralLink = `${APP_URL}/signup?ref=${referralCode}`;

  const fireConfetti = () => {
    confetti({ 
      particleCount: 80, 
      spread: 60, 
      origin: { y: 0.4 }, 
      colors: ['#7acc00', '#B0FC38', '#a3e635'] 
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSuccessMessage('Referral link copied!');
    setIsError(false);
    setShowSuccessModal(true);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setSuccessMessage('Referral code copied!');
    setIsError(false);
    setShowSuccessModal(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyEnhancedMessage = () => {
    const message = `Join DSW and earn daily income! Use my referral code: ${referralCode} to get 145 ETB bonus after your first deposit! Sign up here: ${referralLink}`;
    navigator.clipboard.writeText(message);
    setSuccessMessage('Invite message copied!');
    setIsError(false);
    setShowSuccessModal(true);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === '09XXXXXXXX') return '09XXXXXXXX';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 9) {
      const last9 = cleaned.slice(-9);
      return '+251' + last9.slice(0, 1) + '**' + last9.slice(-4);
    }
    return phone;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto">
        {/* Header - Clean white header */}
        <div className="bg-white px-5 pt-8 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Invite & Earn</h1>
            <button 
              onClick={handleRefresh} 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-sm text-gray-500">Earn {BONUS_AMOUNT} ETB for each friend who joins and deposits</p>
        </div>

        {/* Stats Cards */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-gray-800">{stats.total_referrals}</p>
              <p className="text-xs text-gray-500 mt-1">Total</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-[#7acc00]">{stats.total_bonus_earned}</p>
              <p className="text-xs text-gray-500 mt-1">Earned (ETB)</p>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
              <p className="text-2xl font-bold text-amber-500">{stats.pending_referrals}</p>
              <p className="text-xs text-gray-500 mt-1">Pending</p>
            </div>
          </div>
        </div>

        {/* Announcement Ticker */}
        <div className="px-5 mt-4">
          <AnnouncementTicker />
        </div>

        {/* Referral Code Card */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-xs text-gray-500 mb-2">Your referral code</p>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-50 rounded-xl py-3 px-4 text-center border border-gray-200">
                <span className="text-xl font-mono font-bold tracking-wider text-gray-800">{referralCode}</span>
              </div>
              <button
                onClick={copyReferralCode}
                className="w-12 h-12 rounded-xl bg-[#7acc00] text-white flex items-center justify-center hover:bg-[#6bb800] transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            {/* Referral Link */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
              <p className="flex-1 text-xs text-gray-500 truncate">{referralLink}</p>
              <button onClick={copyReferralLink} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Copy Message Button */}
            <button
              onClick={copyEnhancedMessage}
              className="w-full py-3 rounded-xl text-sm font-medium text-white mb-3 transition-colors bg-[#7acc00] hover:bg-[#6bb800]"
            >
              <span className="flex items-center justify-center gap-2">
                <Share2 className="w-4 h-4" />
                Copy Invite Message
              </span>
            </button>

            {/* QR Code Toggle */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {showQR ? 'Hide QR Code' : 'Show QR Code'}
            </button>

            {/* Centered QR Code */}
            {showQR && (
              <div className="flex flex-col items-center mt-4 p-4 bg-white rounded-xl border border-gray-200">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <QRCode value={referralLink} size={180} />
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Scan to share your referral link
                </p>
                <button 
                  onClick={() => setShowQR(false)}
                  className="mt-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h4 className="font-semibold text-gray-800 text-sm mb-3">Your Progress</h4>
            
            <div className="flex gap-6 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7acc00]/20 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-[#7acc00]" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Qualified</p>
                  <p className="font-bold text-gray-800">{stats.qualified_referrals}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-bold text-gray-800">{stats.pending_referrals}</p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{qualifiedCount}/3 referrals</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500 bg-[#7acc00]"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            {qualifiedCount >= 3 && (
              <p className="text-xs text-[#7acc00] font-medium mt-2 text-center">
                🎉 You've reached 3 qualified referrals!
              </p>
            )}
          </div>
        </div>

        {/* Team Members List */}
        <div className="px-5 mt-4 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Spinner size="lg" />
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-3 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-700 font-medium text-sm">No team members yet</p>
              <p className="text-xs text-gray-400 mt-1">Share your code to start earning</p>
              <button
                onClick={copyReferralLink}
                className="mt-4 px-5 py-2 rounded-xl text-sm font-medium text-white bg-[#7acc00] hover:bg-[#6bb800]"
              >
                Copy Referral Link
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">Your Team ({teamMembers.length})</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-[#7acc00]/10 text-[#7acc00] font-medium">
                  {stats.qualified_referrals} qualified
                </span>
              </div>
              <div className="divide-y divide-gray-100">
                {teamMembers.map((member) => (
                  <div key={member.id} className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar with first letter */}
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7acc00] to-[#B0FC38] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      >
                        {(member.name && /[a-zA-Z]/.test(member.name.charAt(0))) 
                          ? member.name.charAt(0).toUpperCase() 
                          : '👤'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-800 text-sm truncate">
                            {member.name.length > 15 ? member.name.substring(0, 15) + '...' : member.name}
                          </p>
                          {member.current_vip_level && member.current_vip_level > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                              VIP {member.current_vip_level}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatPhoneNumber(member.phone)}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{formatDate(member.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        {member.bonus_claimed ? (
                          <span className="flex items-center gap-1 text-xs font-medium text-[#7acc00]">
                            <CheckCircle className="w-4 h-4" />
                            +145
                          </span>
                        ) : member.has_made_first_deposit ? (
                          <button
                            onClick={() => handleClaimBonus(member.id)}
                            disabled={claimingId === member.id}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-[#7acc00] hover:bg-[#6bb800] disabled:opacity-50 transition-colors"
                          >
                            {claimingId === member.id ? <Spinner size="sm" /> : 'Claim'}
                          </button>
                        ) : (
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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