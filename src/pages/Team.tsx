import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Users, UserPlus, Copy, Share2, RefreshCw, CheckCircle, Clock, ChevronRight, Flag, Facebook, Instagram, Send, QrCode, Phone, Award } from 'lucide-react';
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

const Team = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingBonuses: 0,
    earnedCredits: 0
  });

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
        let active = 0;
        let pending = 0;
        let earned = 0;

        const processed: TeamMember[] = members.map(m => {
          const bonusClaimed = bonusMap[m.id] ?? false;
          
          if (bonusClaimed) {
            earnings += 145;
            earned++;
          }
          
          if (m.has_made_first_deposit || m.has_made_deposit) {
            active++;
          }
          
          if (!bonusClaimed && m.has_made_first_deposit) {
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
          totalMembers: processed.length, 
          activeMembers: active, 
          pendingBonuses: pending,
          earnedCredits: earned 
        });
      } else {
        setTeamMembers([]);
        setTeamEarnings(0);
        setStats({ totalMembers: 0, activeMembers: 0, pendingBonuses: 0, earnedCredits: 0 });
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
        setSuccessMessage('145 ETB bonus claimed successfully!');
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
  const referralLink = `https://wsd-onlingoods-promoting267000-lamb.vercel.app/signup?ref=${referralCode}`;

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#ff0000', '#dc2626', '#ef4444', '#f87171', '#fee2e2']
    });
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setSuccessMessage('✨ Your unique referral link copied! Share it now and start earning!');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setSuccessMessage('✅ Referral code copied! Share it with your friends!');
    setIsError(false);
    setShowSuccessModal(true);
    setTimeout(() => setCopiedCode(false), 2000);
    fireConfetti();
  };

  const shareOnSocial = (platform: string) => {
    let shareUrl = '';
    const text = `🚀 Join me on this amazing platform and earn BIG! Use my unique referral code: ${referralCode} to get 5,000 ETB bonus instantly! Don't miss out on this opportunity to earn passive income. 💰\n\n👉 Sign up here: ${referralLink}\n\n#EarnMoney #PassiveIncome #Ethiopia #WorkFromHome`;
    const url = referralLink;

    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        navigator.clipboard.writeText(text);
        setSuccessMessage('📱 Text copied! Paste it on your Instagram story or bio!');
        setIsError(false);
        setShowSuccessModal(true);
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone || phone === '09XXXXXXXX') return '09XXXXXXXX';
    // Format as +251 XX XXX XXXX
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 9) {
      return `+251 ${cleaned.slice(0,2)} ${cleaned.slice(2,5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    );
  }

  const successfulInvites = teamMembers.filter(m => m.has_made_first_deposit).length;
  const progressPercentage = Math.min((successfulInvites / 3) * 100, 100);

  return (
    <div className="min-h-screen bg-white p-4 pb-24">
      <div className="max-w-md mx-auto">
        {/* Ethiopian Flag Header */}
        <div className="flex items-center justify-end mb-2">
          <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-700">Ethiopia</span>
            <span className="text-sm">🇪🇹</span>
          </div>
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
            <div className="w-full h-48 bg-gradient-to-r from-green-600 via-yellow-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
              <div className="text-center text-white">
                <Users className="w-16 h-16 mx-auto mb-3" />
                <p className="text-xl font-bold">Team Ethiopia</p>
                <p className="text-sm opacity-90">Build Your Team</p>
              </div>
            </div>
          )}
        </div>

        {/* Main Invite Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="p-5">
            <div className="flex items-start justify-between mb-2">
              <h2 className="text-xl font-semibold text-gray-900">🚀 Invite & Earn</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">5,000 ETB</div>
              </div>
            </div>
            
            {/* Motivational Description */}
            <div className="mb-4 space-y-2">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-red-600">Start earning passive income today!</span> Just invite your friends and family using your unique referral link.
              </p>
              <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                <p className="text-xs text-gray-700">
                  💰 <span className="font-medium">How it works:</span> Get 5,000 ETB for every 3 friends who join and transfer 20,000 ETB. Your friends also get 500 ETB bonus!
                </p>
              </div>
            </div>
            
            {/* Excluding European countries badge */}
            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-full">
                <span className="text-sm">🇪🇹</span>
                <span className="text-xs font-medium text-red-600">
                  Excluding European countries
                </span>
              </div>
            </div>
            
            {/* Referral Code Display with Copy Button */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Your unique referral code:</p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 p-3 rounded-xl border border-red-200 flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-red-600 tracking-wider">{referralCode}</span>
                  <p className="text-xs text-gray-500 mt-1">Share this code with friends</p>
                </div>
                <Button
                  onClick={copyReferralCode}
                  size="sm"
                  className={`${copiedCode ? 'bg-green-600' : 'bg-red-600'} hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2`}
                >
                  <Copy className="w-4 h-4" />
                  {copiedCode ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            {/* Referral Link Display */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Your unique referral link:</p>
              <div className="bg-gray-50 p-2 rounded-lg border border-gray-200 flex items-center justify-between">
                <code className="text-xs text-gray-700 truncate max-w-[200px]">
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
            
            <Button 
              onClick={copyReferralLink}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 rounded-xl mb-3 text-base flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              Share Your Unique Link & Earn
            </Button>
            
            <p className="text-xs text-gray-500 text-center">
              Terms and conditions apply • Start earning today!
            </p>
          </div>
          
          {/* Progress Section */}
          <div className="border-t border-gray-100 p-5">
            <h3 className="text-base font-semibold text-gray-900 mb-4">📊 Your Progress</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700">Successful Invite</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.earnedCredits} Earned Credit</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-sm text-gray-700">Pending Invite</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{stats.pendingBonuses} Pending</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                <span>{successfulInvites}/3 invites</span>
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

        {/* QR Code Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">📱 Scan to Invite</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowQR(!showQR)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <QrCode className="w-5 h-5" />
            </Button>
          </div>
          
          {showQR && (
            <div className="flex flex-col items-center p-4 bg-white rounded-xl">
              <div className="p-4 bg-white rounded-2xl shadow-lg mb-3">
                <QRCode value={referralLink} size={180} />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Scan this QR code to share the referral link
              </p>
            </div>
          )}
        </div>

        {/* Social Media Share Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6 p-5">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Share via</h3>
          
          <div className="flex items-center justify-center gap-6">
            {/* Facebook - Blue Background */}
            <button 
              onClick={() => shareOnSocial('facebook')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Facebook className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-gray-600">Facebook</span>
            </button>
            
            {/* Instagram - Gradient Background */}
            <button 
              onClick={() => shareOnSocial('instagram')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-gray-600">Instagram</span>
            </button>
            
            {/* Telegram - Blue Background */}
            <button 
              onClick={() => shareOnSocial('telegram')}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 rounded-full bg-[#0088cc] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <Send className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs text-gray-600">Telegram</span>
            </button>
          </div>
        </div>

        {/* Team Members List with Phone Numbers */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
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
            <div className="flex items-center justify-between px-1">
              <h3 className="font-semibold text-gray-900">Team Members</h3>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                {stats.totalMembers} Total
              </span>
            </div>
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  {/* Person icon/avatar */}
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-semibold text-lg border-2 border-red-200">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Member Info with Phone Number */}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    
                    {/* Phone Number Display */}
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      <span>{formatPhoneNumber(member.phone)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {member.bonus_claimed ? (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Claimed
                        </span>
                      ) : member.has_made_first_deposit ? (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Ready to Claim
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                          Pending Deposit
                        </span>
                      )}
                      
                      {member.current_vip_level > 0 && (
                        <span className="text-xs bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-full border border-yellow-200">
                          VIP {member.current_vip_level}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Claim Button - Only shows when ready to claim */}
                  {!member.bonus_claimed && member.has_made_first_deposit && (
                    <Button
                      onClick={() => handleClaimBonus(member.id)}
                      disabled={claimingId === member.id}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg text-sm"
                    >
                      {claimingId === member.id ? '...' : 'Claim 145 ETB'}
                    </Button>
                  )}
                  
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
                
                {/* Joined Date */}
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-400">
                    Joined: {new Date(member.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
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