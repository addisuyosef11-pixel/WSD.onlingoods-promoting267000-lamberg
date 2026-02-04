import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessModal } from './SuccessModal';
import giftBox from '@/assets/gift-box.png';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose }) => {
  const { user, refreshProfile } = useAuth();
  const [giftCode, setGiftCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Claim Gift</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center py-6">
            {/* Gift Box Image */}
            <div className="w-32 h-32 mb-6">
              <img src={giftBox} alt="Gift Box" className="w-full h-full object-contain" />
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-center mb-6">
              Enter your gift code to claim your reward!
            </p>

            {/* Gift Code Input */}
            <div className="w-full space-y-4">
              <Input
                type="text"
                placeholder="Enter gift code"
                value={giftCode}
                onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                className="text-center text-lg uppercase tracking-wider"
              />

              <Button
                onClick={handleClaim}
                disabled={!giftCode.trim() || claiming}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
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
