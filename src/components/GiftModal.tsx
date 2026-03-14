import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessModal } from './SuccessModal';
import { Users, Wallet, Gift, Clock, Search } from 'lucide-react';
import giftBox from '@/assets/gift-box.png';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface GiftCodeInfo {
  amount: number;
  max_claims: number;
  current_claims: number;
  expires_at: string | null;
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const [giftCode, setGiftCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [codeInfo, setCodeInfo] = useState<GiftCodeInfo | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  const lookupCode = async () => {
    if (!giftCode.trim()) return;
    setLookingUp(true);
    setLookupError('');
    setCodeInfo(null);

    try {
      const { data, error } = await supabase
        .from('gift_codes')
        .select('amount, max_claims, current_claims, expires_at')
        .eq('code', giftCode.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setLookupError('Invalid gift code');
      } else {
        setCodeInfo(data);
      }
    } catch (err) {
      setLookupError('Failed to look up code');
    } finally {
      setLookingUp(false);
    }
  };

  const handleClaim = async () => {
    if (!giftCode.trim() || !user) return;

    setClaiming(true);
    try {
      const { data, error } = await supabase.rpc('claim_gift_code', {
        p_user_id: user.id,
        p_code: giftCode.trim(),
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const result = data[0];
        if (result.success) {
          setSuccessMessage(`You received ${result.amount} ETB!`);
          setShowSuccess(true);
          await refreshProfile();
          setGiftCode('');
          setCodeInfo(null);
          setTimeout(() => onClose(), 2000);
        } else {
          setSuccessMessage(result.message);
          setShowSuccess(true);
        }
      }
    } catch (error) {
      console.error('Claim error:', error);
      setSuccessMessage('Failed to claim gift code');
      setShowSuccess(true);
    } finally {
      setClaiming(false);
    }
  };

  const formatExpiry = (dateStr: string | null) => {
    if (!dateStr) return 'No expiry';
    const d = new Date(dateStr);
    const now = new Date();
    if (d < now) return 'Expired';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isExpired = codeInfo?.expires_at ? new Date(codeInfo.expires_at) < new Date() : false;
  const isFull = codeInfo ? codeInfo.current_claims >= codeInfo.max_claims : false;
  const remaining = codeInfo ? codeInfo.max_claims - codeInfo.current_claims : 0;
  const totalAmount = codeInfo ? codeInfo.amount * codeInfo.max_claims : 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => { onClose(); setCodeInfo(null); setLookupError(''); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Claim Gift</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-4">
            {/* Gift Box Image */}
            <div className="w-24 h-24 mb-4">
              <img src={giftBox} alt="Gift Box" className="w-full h-full object-contain" />
            </div>

            <p className="text-muted-foreground text-center mb-4 text-sm">
              Enter your gift code to claim your reward!
            </p>

            {/* Gift Code Input with Lookup */}
            <div className="w-full space-y-3">
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter gift code"
                  value={giftCode}
                  onChange={(e) => {
                    setGiftCode(e.target.value.toUpperCase());
                    setCodeInfo(null);
                    setLookupError('');
                  }}
                  className="text-center text-lg uppercase tracking-wider flex-1"
                />
                <Button
                  onClick={lookupCode}
                  disabled={!giftCode.trim() || lookingUp}
                  variant="outline"
                  className="px-3"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {lookupError && (
                <p className="text-sm text-red-500 text-center">{lookupError}</p>
              )}

              {/* Gift Code Details */}
              {codeInfo && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Gift className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Per User</p>
                        <p className="text-sm font-bold text-gray-800">{codeInfo.amount} ETB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Total Gift</p>
                        <p className="text-sm font-bold text-gray-800">{totalAmount} ETB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Users</p>
                        <p className="text-sm font-bold text-gray-800">
                          {codeInfo.current_claims}/{codeInfo.max_claims}
                          {isFull && <span className="text-red-500 text-[10px] ml-1">Full</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Expires</p>
                        <p className={`text-sm font-bold ${isExpired ? 'text-red-500' : 'text-gray-800'}`}>
                          {formatExpiry(codeInfo.expires_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Remaining slots bar */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>{remaining} slots remaining</span>
                      <span>{Math.round((codeInfo.current_claims / codeInfo.max_claims) * 100)}% claimed</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(codeInfo.current_claims / codeInfo.max_claims) * 100}%`,
                          background: isFull ? '#ef4444' : 'linear-gradient(135deg, #7acc00, #B0FC38)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleClaim}
                disabled={!giftCode.trim() || claiming || isExpired || isFull}
                className="w-full py-6 text-lg font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
              >
                {claiming ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Claiming...
                  </div>
                ) : (
                  'Claim Gift'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </>
  );
};
