import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Users, UserPlus, Gift, Copy, Share2, Star, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { TeamMemberCard } from '@/components/TeamMemberCard';

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
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    pendingBonuses: 0
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
        let active = 0;
        let pending = 0;

        const processed: TeamMember[] = members.map(m => {
          const bonusClaimed = bonusMap[m.id] ?? false;
          
          if (bonusClaimed) {
            earnings += 145;
          }
          
          if (m.has_made_first_deposit || m.has_made_deposit) {
            active++;
          }
          
          if (!m.has_made_first_deposit) {
            pending++;
          }

          return {
            id: m.id,
            name: m.name || 'New User',
            phone: m.phone || '',
            created_at: m.created_at,
            current_vip_level: m.current_vip_level || 0,
            has_made_deposit: m.has_made_deposit || false,
            has_made_first_deposit: m.has_made_first_deposit || false,
            bonus_claimed: bonusClaimed,
          };
        });

        setTeamMembers(processed);
        setTeamEarnings(earnings);
        setStats({ totalMembers: processed.length, activeMembers: active, pendingBonuses: pending });
      } else {
        setTeamMembers([]);
        setTeamEarnings(0);
        setStats({ totalMembers: 0, activeMembers: 0, pendingBonuses: 0 });
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
        setSuccessMessage(t('145 ETB bonus claimed to withdrawable balance!'));
        setIsError(false);
        setShowSuccessModal(true);
        fireConfetti();
        await fetchTeamData();
      } else {
        setSuccessMessage(t('Unable to claim bonus. Please try again.'));
        setIsError(true);
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      setSuccessMessage(t('Error claiming bonus'));
      setIsError(true);
      setShowSuccessModal(true);
    } finally {
      setClaimingId(null);
    }
  };

  const referralCode = (profile as any)?.referral_code || 'LOADING';
  const referralLink = `https://tiktal.lovable.app/signup?ref=${referralCode}`;

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
    setSuccessMessage(t('Referral link copied!'));
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setSuccessMessage(t('Referral code copied!'));
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const shareReferralLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: t('Join my team and earn 145 ETB!'),
          text: `${t('Use my referral code')} ${referralCode} ${t('when signing up')}`,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">{t('My Team')}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchTeamData}>
            <RefreshCw className="w-5 h-5 text-muted-foreground" />
          </Button>
        </header>

        {/* Referral Card */}
        <div className="p-6 bg-card rounded-2xl border border-primary/30 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full primary-gradient">
              <Gift className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{t('Invite Friends')}</h3>
              <p className="text-sm text-muted-foreground">{t('Earn 145 ETB when they deposit')}</p>
            </div>
          </div>

          {/* Referral Code Display */}
          <div className="mb-4">
            <p className="text-xs text-muted-foreground mb-1">{t('Your referral code')}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-muted rounded-lg p-3 flex items-center justify-center">
                <span className="text-2xl font-bold tracking-widest text-primary">{referralCode}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={copyReferralCode} className="text-primary">
                <Copy className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={copyReferralLink} className="primary-gradient text-primary-foreground">
              <Copy className="w-4 h-4 mr-2" />
              {t('Copy Link')}
            </Button>
            <Button onClick={shareReferralLink} variant="outline" className="border-primary text-primary">
              <Share2 className="w-4 h-4 mr-2" />
              {t('Share')}
            </Button>
          </div>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
            <p className="text-xs text-muted-foreground">{t('Team Members')}</p>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-primary">{teamEarnings.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('Earned (ETB)')}</p>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.pendingBonuses}</p>
            <p className="text-xs text-muted-foreground">{t('Pending')}</p>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-100">
              <Star className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Active Members')}</p>
              <p className="text-lg font-bold text-foreground">{stats.activeMembers}</p>
            </div>
          </div>
          <div className="p-4 bg-card rounded-xl border border-border shadow-sm flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100">
              <CreditCard className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{t('Bonus Per Invite')}</p>
              <p className="text-lg font-bold text-primary">145 ETB</p>
            </div>
          </div>
        </div>

        {/* Team Members List or Empty State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl border border-border shadow-sm">
            <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">{t('No team members yet')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('Share your referral code to grow your team')}</p>
            <Button onClick={copyReferralLink} className="mt-4 primary-gradient text-primary-foreground">
              <Copy className="w-4 h-4 mr-2" />
              {t('Copy Referral Link')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground">{t('Team Members')}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                {stats.activeMembers} {t('active')}
              </span>
            </div>
            {teamMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                claimingId={claimingId}
                onClaim={handleClaimBonus}
              />
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
