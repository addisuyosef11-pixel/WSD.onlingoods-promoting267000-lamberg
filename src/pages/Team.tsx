import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Users, UserPlus, Gift, Copy, CreditCard, Share2, Star, RefreshCw, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';

interface TeamMember {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  current_vip_level: number | null;
  has_received_bonus: boolean;
  deposit_amount?: number;
  last_deposit_at?: string;
}

const Team = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamEarnings, setTeamEarnings] = useState(0);
  const [totalTeamDeposits, setTotalTeamDeposits] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [newMemberCount, setNewMemberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Get user's referral code from profile
      const userReferralCode = (profile as any)?.referral_code;
      
      if (!userReferralCode) {
        console.log('User does not have a referral code');
        setTeamMembers([]);
        setTeamEarnings(0);
        setIsLoading(false);
        return;
      }

      // Method 1: Find team members by referral code (if used_referral_code exists)
      // OR Method 2: Find team members by referred_by field
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      // Check which referral field exists in your database
      // Option A: If you have a 'referred_by' field that stores the referrer's user ID
      const { data: membersByReferredBy, error: error1 } = await query
        .eq('referred_by', user.id)
        .neq('id', user.id); // Exclude self

      if (!error1 && membersByReferredBy && membersByReferredBy.length > 0) {
        processTeamMembers(membersByReferredBy);
        return;
      }

      // Option B: If you have a 'used_referral_code' field
      const { data: membersByReferralCode, error: error2 } = await query
        .eq('used_referral_code', userReferralCode)
        .neq('id', user.id);

      if (!error2 && membersByReferralCode && membersByReferralCode.length > 0) {
        processTeamMembers(membersByReferralCode);
        return;
      }

      // Option C: Check if there's a separate referrals table
      const { data: referrals, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      if (!referralsError && referrals && referrals.length > 0) {
        // Get referred users' profiles
        const referredIds = referrals.map(ref => ref.referred_id);
        const { data: referredProfiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .in('id', referredIds);

        if (!profilesError && referredProfiles) {
          processTeamMembers(referredProfiles);
          return;
        }
      }

      // If no team members found using any method
      setTeamMembers([]);
      setTeamEarnings(0);
      setStats({
        totalMembers: 0,
        activeMembers: 0,
        pendingBonuses: 0
      });

    } catch (error: any) {
      console.error('Error fetching team data:', error);
      setSuccessMessage(`Failed to load team data: ${error.message || 'Database error'}`);
      setIsError(true);
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const processTeamMembers = (members: any[]) => {
    const now = new Date();
    let totalEarnings = 0;
    let totalDeposits = 0;
    let activeMembers = 0;
    let pendingBonuses = 0;
    let newMembers = 0;
    
    const processedMembers: TeamMember[] = members.map(member => {
      const memberDate = new Date(member.created_at);
      const diffMinutes = (now.getTime() - memberDate.getTime()) / (1000 * 60);
      
      if (diffMinutes < 1440) { // Within 24 hours
        newMembers++;
      }

      // Check if member has made deposits (you'll need to fetch this from transactions table)
      const hasDeposit = member.has_made_deposit || false;
      const hasBonus = member.has_received_referral_bonus || false;
      const depositAmount = member.total_deposits || 0;
      
      if (hasDeposit) {
        activeMembers++;
        totalDeposits += depositAmount;
      }
      
      if (hasBonus) {
        totalEarnings += 100; // 100 ETB per bonus
      } else if (hasDeposit) {
        pendingBonuses++;
      }

      return {
        id: member.id,
        name: member.full_name || member.username || 'New User',
        phone: member.phone || 'Not provided',
        created_at: member.created_at,
        current_vip_level: member.current_vip_level || member.vip_level || 0,
        has_received_bonus: hasBonus,
        deposit_amount: depositAmount,
        last_deposit_at: member.last_deposit_at
      };
    });

    setTeamMembers(processedMembers);
    setTeamEarnings(totalEarnings);
    setTotalTeamDeposits(totalDeposits);
    setNewMemberCount(newMembers);
    setStats({
      totalMembers: processedMembers.length,
      activeMembers,
      pendingBonuses
    });

    // Show success message for new members
    if (newMembers > 0) {
      setSuccessMessage(`${newMembers} new member${newMembers > 1 ? 's' : ''} joined your team!`);
      setIsError(false);
      setShowSuccessModal(true);
    }

    // Show pending bonuses message
    if (pendingBonuses > 0 && totalEarnings === 0) {
      toast.info(`You have ${pendingBonuses} pending bonus${pendingBonuses > 1 ? 'es' : ''}. Bonuses are awarded when team members make deposits.`);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user, profile]);

  const referralCode = (profile as any)?.referral_code || 'GENERATING...';
  const referralLink = `https://WSD.onlingoods/promoting267000/lamberg.vercel.app/signup?ref=${referralCode}`;

  const generateReferralCodeIfNeeded = async () => {
    if (!user?.id) return;
    
    if (referralCode === 'GENERATING...' || !referralCode) {
      try {
        // Generate a random referral code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Update user's profile with referral code
        const { error } = await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', user.id);

        if (error) throw error;
        
        // Refresh the page or profile data
        window.location.reload();
      } catch (error) {
        console.error('Error generating referral code:', error);
        setSuccessMessage('Failed to generate referral code. Please try again.');
        setIsError(true);
        setShowSuccessModal(true);
      }
    }
  };

  useEffect(() => {
    if (referralCode === 'GENERATING...') {
      generateReferralCodeIfNeeded();
    }
  }, [referralCode]);

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.3 },
      colors: ['#ff69b4', '#ff1493', '#ff6347', '#ffd700', '#00ff00', '#00bfff', '#9400d3']
    });
  };

  const copyReferralLink = () => {
    if (referralCode === 'GENERATING...') {
      setSuccessMessage('Your referral code is being generated. Please wait a moment.');
      setIsError(true);
      setShowSuccessModal(true);
      return;
    }
    
    navigator.clipboard.writeText(referralLink);
    setSuccessMessage('Referral link copied successfully! Share it with your friends.');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const copyReferralCode = () => {
    if (referralCode === 'GENERATING...') {
      setSuccessMessage('Your referral code is being generated. Please wait a moment.');
      setIsError(true);
      setShowSuccessModal(true);
      return;
    }
    
    navigator.clipboard.writeText(referralCode);
    setSuccessMessage('Referral code copied to clipboard!');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  const shareReferralLink = async () => {
    if (referralCode === 'GENERATING...') {
      setSuccessMessage('Your referral code is being generated. Please wait a moment.');
      setIsError(true);
      setShowSuccessModal(true);
      return;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my team and earn 100 ETB!',
          text: `Use my referral code ${referralCode} when signing up. We both get 100 ETB bonus!`,
          url: referralLink,
        });
        setSuccessMessage('Referral shared successfully!');
        setIsError(false);
      } else {
        copyReferralLink();
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setSuccessMessage('Failed to share referral link. You can copy it instead.');
        setIsError(true);
      }
    } finally {
      setShowSuccessModal(true);
    }
  };

  const showTeamTips = () => {
    if (teamMembers.length === 0) {
      setSuccessMessage('Share your referral link to grow your team. You earn 100 ETB when a friend makes their first deposit.');
    } else if (teamEarnings > 0) {
      setSuccessMessage(`Great work! You've earned ${teamEarnings} ETB from ${stats.activeMembers} active members. Keep inviting!`);
    } else if (stats.pendingBonuses > 0) {
      setSuccessMessage(`You have ${stats.pendingBonuses} pending bonus${stats.pendingBonuses > 1 ? 'es' : ''}. Your team members need to make a deposit for you to receive 100 ETB each.`);
    } else {
      setSuccessMessage(`You have ${teamMembers.length} team members. Share tips on how to deposit to help them get started.`);
    }
    setIsError(false);
    setShowSuccessModal(true);
  };

  const handleRetry = () => {
    fetchTeamData();
  };

  const simulateNewMember = () => {
    // For testing - simulate a new team member
    setSuccessMessage('🎉 New member joined your team! You will earn 100 ETB when they make their first deposit.');
    setIsError(false);
    setShowSuccessModal(true);
    fireConfetti();
  };

  if (loading || (referralCode === 'GENERATING...' && isLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Spinner size="lg" className="mb-4" />
        <p className="text-muted-foreground">Setting up your referral system...</p>
        {referralCode === 'GENERATING...' && (
          <p className="text-sm text-muted-foreground mt-2">Generating your unique referral code</p>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">{t('My Team')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={showTeamTips}
              className="text-primary hover:text-primary/80"
            >
              <Star className="w-4 h-4 mr-1" />
              Tips
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRetry}
              className="text-primary hover:text-primary/80"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        {/* Referral Code Status */}
        {referralCode === 'GENERATING...' ? (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-600"></div>
              <div>
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Generating your referral code...
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                  This will only take a moment
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Referral Card */}
            <div className="p-6 bg-card rounded-2xl border border-primary/30 shadow-sm mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-600">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{t('Invite Friends')}</h3>
                  <p className="text-sm text-muted-foreground">{t('Earn 100 ETB when they deposit')}</p>
                </div>
              </div>

              {/* Referral Code Display */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{t('Your referral code')}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xl font-bold text-primary text-center tracking-widest">
                      {referralCode}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyReferralCode}
                    className="border-primary text-primary hover:bg-primary/10 h-12"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={copyReferralLink}
                  className="bg-primary hover:bg-primary/90 h-11"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={shareReferralLink}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 h-11"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
                <p className="text-2xl font-bold text-foreground">{stats.totalMembers}</p>
                <p className="text-sm text-muted-foreground">{t('Team Members')}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
                <p className="text-2xl font-bold text-primary">{teamEarnings.toLocaleString()} ETB</p>
                <p className="text-sm text-muted-foreground">{t('Earned')}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border shadow-sm text-center">
                <p className="text-2xl font-bold text-amber-500">{stats.pendingBonuses}</p>
                <p className="text-sm text-muted-foreground">{t('Pending')}</p>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Members</p>
                    <p className="text-xl font-bold text-foreground">{stats.activeMembers}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Team Deposits</p>
                    <p className="text-xl font-bold text-green-500">{totalTeamDeposits.toLocaleString()} ETB</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>

            {/* New Member Notification */}
            {newMemberCount > 0 && (
              <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      {newMemberCount} new member{newMemberCount > 1 ? 's' : ''} joined today!
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={simulateNewMember}
                    className="bg-green-600 hover:bg-green-700 text-white h-8"
                  >
                    Celebrate
                  </Button>
                </div>
              </div>
            )}

            {/* Team Members List or Empty State */}
            {teamMembers.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-2xl border border-border shadow-sm">
                <UserPlus className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="font-semibold text-foreground mb-2">No team members yet</h3>
                <p className="text-muted-foreground mb-6">
                  Share your referral code with friends to build your team
                </p>
                <div className="space-y-3 max-w-xs mx-auto">
                  <Button 
                    onClick={copyReferralLink} 
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Referral Link
                  </Button>
                  <Button
                    onClick={showTeamTips}
                    variant="outline"
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    How to Grow Your Team
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{t('Team Members')}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                      {stats.activeMembers} active
                    </p>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 bg-card rounded-xl border border-border shadow-sm hover:bg-card/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${member.has_received_bonus ? 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30' : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'}`}>
                          {member.has_received_bonus ? (
                            <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Users className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{member.name}</p>
                            {member.current_vip_level > 0 && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                                VIP {member.current_vip_level}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Joined {new Date(member.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full ${member.has_received_bonus ? 'bg-green-100 dark:bg-green-900' : member.deposit_amount > 0 ? 'bg-amber-100 dark:bg-amber-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <p className={`text-xs font-medium ${member.has_received_bonus ? 'text-green-800 dark:text-green-200' : member.deposit_amount > 0 ? 'text-amber-800 dark:text-amber-200' : 'text-gray-600 dark:text-gray-400'}`}>
                            {member.has_received_bonus ? (
                              <span className="flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                100 ETB
                              </span>
                            ) : member.deposit_amount > 0 ? (
                              <span className="flex items-center gap-1">
                                <CreditCard className="w-3 h-3" />
                                {member.deposit_amount} ETB
                              </span>
                            ) : (
                              'No deposit'
                            )}
                          </p>
                        </div>
                        {member.deposit_amount > 0 && !member.has_received_bonus && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Bonus pending
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Success Modal */}
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