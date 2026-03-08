import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  Users, Copy, Share2, CheckCircle, Clock, 
  Facebook, Instagram, Send, QrCode, Phone,
  TrendingUp, Wallet, RefreshCw, Zap, Flame, Sparkles, Crown
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

const ANNOUNCEMENTS = [
  { phone: '+251 91***78', amount: 145, icon: '🚀' },
  { phone: '+251 92***89', amount: 200, icon: '💎' },
  { phone: '+251 93***90', amount: 175, icon: '🌟' },
  { phone: '+251 94***01', amount: 300, icon: '🔥' },
  { phone: '+251 95***12', amount: 250, icon: '💫' },
  { phone: '+251 96***23', amount: 180, icon: '⚡' },
  { phone: '+251 97***34', amount: 220, icon: '🎯' },
  { phone: '+251 98***45', amount: 280, icon: '🏆' },
  { phone: '+251 99***56', amount: 320, icon: '👑' },
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
    <div className="bg-yellow-400 overflow-hidden py-1.5 px-4">
      <div className={`flex items-center gap-2 transition-all duration-400 ${isAnimating ? 'opacity-0 -translate-y-3' : 'opacity-100 translate-y-0'}`}>
        <span className="text-sm">{current.icon}</span>
        <span className="text-xs font-medium text-yellow-900 flex-1">{current.phone} earned</span>
        <span className="text-xs font-bold text-yellow-900">+{current.amount} ETB</span>
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
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.3 }, colors: ['#7acc00', '#B0FC38', '#a3e635', '#84cc16', '#65a30d'] });
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
    const message = `🚀 Join DSW and earn daily income! 🚀\n\n✨ Use my referral code: ${referralCode}\n💰 Get 145 ETB bonus instantly after your first deposit!\n💎 Start earning passive income today!\n\n👉 Sign up here: ${referralLink}\n\n#DSW #EarnMoney #Ethiopia #PassiveIncome`;
    navigator.clipboard.writeText(message);
    setSuccessMessage('📋 Complete message copied! Share it anywhere!');
    setIsError(false);
    setShowSuccessModal(true);
  };

  const shareOnSocial = (platform: string) => {
    const text = `🚀 Join DSW and earn daily income! Use my referral code ${referralCode} to get 145 ETB bonus instantly after your first deposit! Start earning passive income today! 💰\n\n👉 Sign up: ${referralLink}`;
    
    switch(platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}&quote=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        window.open('https://www.instagram.com/', '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`, '_blank');
        break;
      default:
        copyReferralLink();
    }
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
      {/* Green Header - matching Profile page */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7acc00 0%, #8fd914 35%, #a3e635 60%, #B0FC38 100%)' }}>
        {/* Wave patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300" preserveAspectRatio="none">
          <path d="M0,120 C100,170 200,70 300,120 C350,145 400,120 400,120 L400,300 L0,300 Z" fill="white" />
          <path d="M0,160 C80,210 180,110 280,170 C340,200 400,160 400,160 L400,300 L0,300 Z" fill="white" opacity="0.5" />
        </svg>
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

        <div className="relative z-10 pt-8 pb-10 px-5 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white">Invite & Earn</h1>
              <p className="text-xs text-white/70 mt-0.5">Earn {BONUS_AMOUNT} ETB per friend</p>
            </div>
            <button onClick={handleRefresh} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
              <RefreshCw className={`w-5 h-5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-extrabold text-white">{stats.total_referrals}</p>
              <p className="text-[11px] font-bold text-white mt-0.5">Total</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-3xl font-extrabold text-gray-700">{stats.total_bonus_earned}</p>
              <p className="text-[11px] font-semibold text-white mt-0.5">Earned <span className="font-extrabold text-gray-700">(ETB)</span></p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-yellow-300/40">
              <p className="text-3xl font-extrabold text-yellow-300">{stats.pending_referrals}</p>
              <p className="text-[11px] font-bold text-yellow-200 mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Ticker */}
      <div className="-mt-4">
        <AnnouncementTicker />
      </div>

      {/* Content */}
      <div className="px-5 max-w-md mx-auto space-y-4">
        {/* Bonus Promo Banner */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-sm font-bold text-yellow-800">Invite 3 users in 24 hours!</p>
            <p className="text-xs text-yellow-700 mt-0.5">
              Earn <span className="font-bold">300 ETB bonus</span> on top of your <span className="font-bold">145 ETB</span> per referral reward!
            </p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-2">Your referral code</p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
              <span className="text-2xl font-bold tracking-[0.3em] text-gray-800">{referralCode}</span>
            </div>
            <button
              onClick={copyReferralCode}
              className="px-4 py-3 rounded-xl text-sm font-semibold text-white transition-colors"
              style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Referral Link */}
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-4">
            <p className="flex-1 text-[11px] text-gray-400 truncate">{referralLink}</p>
            <button onClick={copyReferralLink} className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors">
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { platform: 'facebook', icon: <Facebook className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600', label: 'Facebook' },
              { platform: 'instagram', icon: <Instagram className="w-5 h-5" />, color: 'bg-pink-50 text-pink-600', label: 'Instagram' },
              { platform: 'telegram', icon: <Send className="w-5 h-5" />, color: 'bg-sky-50 text-sky-600', label: 'Telegram' },
              { platform: 'whatsapp', icon: (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              ), color: 'bg-green-50 text-green-600', label: 'WhatsApp' },
            ].map(({ platform, icon, color, label }) => (
              <button
                key={platform}
                onClick={() => shareOnSocial(platform)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}>
                  {icon}
                </div>
                <span className="text-[10px] text-gray-500">{label}</span>
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <button
            onClick={copyEnhancedMessage}
            className="w-full py-3 rounded-xl text-sm font-bold text-gray-900 mb-2 transition-colors shadow-sm"
            style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
          >
            <span className="flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" />
              Copy Invite Message
            </span>
          </button>

          <button
            onClick={() => setShowQR(!showQR)}
            className="w-full py-3 text-sm font-bold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>

          {showQR && (
            <div className="flex flex-col items-center mt-3 p-4 bg-gray-50 rounded-xl">
              <QRCode value={referralLink} size={140} />
              <p className="text-[10px] text-gray-400 mt-2">Scan to share referral link</p>
            </div>
          )}
        </div>

        {/* Progress Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Progress</h4>
          
          <div className="flex gap-6 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#B0FC38' }}>
                <CheckCircle className="w-4 h-4 text-gray-700" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Qualified</p>
                <p className="font-bold text-gray-800">{stats.qualified_referrals}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400">Pending</p>
                <p className="font-bold text-gray-800">{stats.pending_referrals}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>{qualifiedCount}/3 referrals</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%`, background: 'linear-gradient(90deg, #7acc00, #B0FC38)' }}
            />
          </div>
        </div>

        {/* Team Members */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-14 h-14 rounded-full bg-gray-50 mx-auto mb-3 flex items-center justify-center">
              <Users className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-700 font-medium text-sm">No team members yet</p>
            <p className="text-xs text-gray-400 mt-1">Share your code to start earning</p>
            <button
              onClick={copyReferralLink}
              className="mt-4 px-6 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
            >
              Copy Referral Link
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50">
              <h3 className="font-semibold text-gray-800 text-sm">Team ({teamMembers.length})</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#B0FC38', color: '#3d6600' }}>
                {stats.qualified_referrals} qualified
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {teamMembers.map((member) => (
                <div key={member.id} className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
                    >
                      {(/^[a-zA-Z]/.test(member.name) ? member.name.charAt(0) : 'U').toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm">{/^\d+$/.test(member.name) ? 'User' : member.name}</p>
                        {member.current_vip_level && member.current_vip_level > 0 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 font-medium">
                            VIP {member.current_vip_level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-gray-400">{formatPhoneNumber(member.phone)}</span>
                        <span className="text-[10px] text-gray-300">•</span>
                        <span className="text-[10px] text-gray-400">{formatDate(member.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {member.bonus_claimed ? (
                        <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: '#65a30d' }}>
                          <CheckCircle className="w-3.5 h-3.5" />
                          +145
                        </span>
                      ) : member.has_made_first_deposit ? (
                        <button
                          onClick={() => handleClaimBonus(member.id)}
                          disabled={claimingId === member.id}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50"
                          style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
                        >
                          {claimingId === member.id ? <Spinner size="sm" /> : 'Claim'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-orange-500 flex items-center gap-1">
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
        isError={isError}
      />

      <BottomNavigation />
      </div>
    </div>
  );
};

export default Team;
