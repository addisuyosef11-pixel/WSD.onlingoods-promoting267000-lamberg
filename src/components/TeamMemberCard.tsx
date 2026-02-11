import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Trophy, UserPlus, Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';

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

interface TeamMemberCardProps {
  member: TeamMember;
  claimingId: string | null;
  onClaim: (memberId: string) => void;
}

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 6) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  const lastNine = cleaned.slice(-9);
  return '+251' + lastNine.slice(0, 2) + '***' + lastNine.slice(-2);
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, claimingId, onClaim }) => {
  const { t } = useLanguage();
  const isClaiming = claimingId === member.id;

  // Determine state
  const canClaim = member.has_made_first_deposit && !member.bonus_claimed;
  const isPending = !member.has_made_first_deposit;
  const isClaimed = member.bonus_claimed;

  return (
    <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isClaimed
              ? 'bg-green-100'
              : canClaim
                ? 'bg-orange-100'
                : 'bg-muted'
          }`}>
            {isClaimed ? (
              <Trophy className="w-5 h-5 text-green-600" />
            ) : canClaim ? (
              <Trophy className="w-5 h-5 text-orange-500" />
            ) : (
              <UserPlus className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground">{member.name}</p>
              {(member.current_vip_level ?? 0) > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  VIP {member.current_vip_level}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {maskPhone(member.phone)} • {new Date(member.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Bonus Section */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">145 ETB</span>
          {isPending && (
            <span className="flex items-center gap-1 text-xs text-orange-500">
              <Clock className="w-3 h-3" />
              {t('Pending deposit')}
            </span>
          )}
          {isClaimed && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="w-3 h-3" />
              {t('Claimed')}
            </span>
          )}
        </div>

        {isClaimed ? (
          <Button
            size="sm"
            disabled
            className="bg-green-100 text-green-700 hover:bg-green-100 cursor-default"
          >
            <Check className="w-4 h-4 mr-1" />
            {t('Claimed')}
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={isPending || isClaiming}
            onClick={() => onClaim(member.id)}
            className={canClaim
              ? 'primary-gradient text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed'
            }
          >
            {isClaiming ? (
              <Spinner size="sm" />
            ) : (
              <>
                {isPending ? t('Pending') : t('Claim 145 ETB')}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
