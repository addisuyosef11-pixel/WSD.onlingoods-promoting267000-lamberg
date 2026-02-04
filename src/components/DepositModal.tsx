import React, { useState, useRef, useEffect } from 'react';
import { X, CreditCard, Upload, AlertTriangle, Clock, Building2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SuccessModal } from '@/components/SuccessModal';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDepositSubmitted: () => void;
  requiredAmount?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  logo_url: string | null;
  branch_name?: string | null;
  account_holder_name?: string | null;
}

const presetAmounts = [100, 200, 500, 1000, 2000, 5000];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  onDepositSubmitted,
  requiredAmount,
}) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState(requiredAmount || 100);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [senderName, setSenderName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true);
      
      if (data) {
        setPaymentMethods(data as PaymentMethod[]);
      }
    };

    if (isOpen) {
      fetchPaymentMethods();
      setTimeLeft(15 * 60); // Reset timer when modal opens
      
      // Start countdown timer
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Time's up - close the modal
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    const method = paymentMethods.find(m => m.id === methodId);
    setSelectedPaymentMethod(method || null);
  };

  const handleIncreaseAmount = () => {
    setAmount(prev => prev + 50);
  };

  const handleDecreaseAmount = () => {
    setAmount(prev => Math.max(50, prev - 50));
  };

  const handleDeposit = async () => {
    if (!user || !selectedPaymentMethod || !screenshot) return;

    const depositAmount = amount;
    
    if (!senderName.trim()) {
      return;
    }
    
    if (!transactionRef.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload screenshot to storage
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Create deposit record
      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: depositAmount,
          payment_method_id: selectedPaymentMethod.id,
          sender_name: senderName.trim(),
          transaction_ref: transactionRef.trim(),
          proof_url: publicUrl.publicUrl,
          status: 'pending'
        });

      if (depositError) throw depositError;

      // Show success modal
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onDepositSubmitted();
    onClose();
    
    // Reset form
    setAmount(100);
    setSelectedPaymentMethod(null);
    setSenderName('');
    setTransactionRef('');
    setScreenshot(null);
    setScreenshotPreview(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 animate-slide-up shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl primary-gradient">
              <CreditCard className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">Deposit Funds</h3>
              <p className="text-sm text-muted-foreground">Add funds to your account</p>
            </div>
          </div>

          {/* 15-Minute Timer */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
            <Clock className="w-5 h-5 text-red-500" />
            <span className="text-red-600 font-bold text-lg">{formatTime(timeLeft)}</span>
            <span className="text-sm text-red-500">remaining</span>
          </div>

          {/* Warning */}
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 mb-4 flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-orange-700">Important</p>
              <p className="text-xs text-orange-600">
                Complete payment within 15 minutes. Your deposit will be verified after screenshot review.
              </p>
            </div>
          </div>

          {requiredAmount && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-4">
              <p className="text-sm text-blue-700">
                Minimum {requiredAmount.toFixed(2)} ETB required for the next task
              </p>
            </div>
          )}

          {/* Amount Selection with +/- Controls */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Amount</label>
            
            {/* Manual Amount Control */}
            <div className="flex items-center justify-center gap-4 mb-3">
              <button
                onClick={handleDecreaseAmount}
                className="w-12 h-12 rounded-xl border-2 border-border bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex-1 text-center">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(50, parseInt(e.target.value) || 0))}
                  className="text-center text-2xl font-bold h-14 bg-muted border-border"
                  min={50}
                />
              </div>
              <button
                onClick={handleIncreaseAmount}
                className="w-12 h-12 rounded-xl border-2 border-border bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Plus className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Quick Select Buttons */}
            <div className="grid grid-cols-3 gap-2">
              {presetAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    amount === amt
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-foreground hover:border-primary/50'
                  }`}
                >
                  {amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethodSelect(method.id)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedPaymentMethod?.id === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {method.logo_url ? (
                    <div className="w-full h-12 rounded-lg overflow-hidden bg-white">
                      <img 
                        src={method.logo_url} 
                        alt={method.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ) : (
                    <div className="w-full h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary" />
                    </div>
                  )}
                  <span className="text-xs font-medium text-center text-foreground line-clamp-2">
                    {method.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Merchant Account Info */}
          {selectedPaymentMethod && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center gap-3 mb-3">
                {selectedPaymentMethod.logo_url ? (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-white">
                    <img 
                      src={selectedPaymentMethod.logo_url} 
                      alt={selectedPaymentMethod.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Merchant</p>
                  <p className="text-base font-bold text-foreground">{selectedPaymentMethod.name}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {selectedPaymentMethod.branch_name && (
                  <div className="bg-white rounded-lg p-2.5 border border-border">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="text-sm font-semibold text-foreground">{selectedPaymentMethod.branch_name}</p>
                  </div>
                )}
                
                <div className="bg-white rounded-lg p-2.5 border border-border">
                  <p className="text-xs text-muted-foreground">Account Number</p>
                  <p className="text-lg font-bold text-primary tracking-wider">{selectedPaymentMethod.account_number}</p>
                </div>
                
                {selectedPaymentMethod.account_holder_name && (
                  <div className="bg-white rounded-lg p-2.5 border border-border">
                    <p className="text-xs text-muted-foreground">Account Holder</p>
                    <p className="text-sm font-semibold text-foreground">{selectedPaymentMethod.account_holder_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sender Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Sender Name</label>
            <Input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Enter sender name on payment"
              className="bg-muted border-border focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Transaction Reference */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-2">Transaction Reference (FT)</label>
            <Input
              type="text"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              placeholder="Enter FT number"
              className="bg-muted border-border focus:border-primary focus:ring-primary"
            />
          </div>

          {/* Screenshot Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">Payment Screenshot</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            
            {screenshotPreview ? (
              <div className="relative">
                <img 
                  src={screenshotPreview} 
                  alt="Screenshot preview" 
                  className="w-full h-40 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => {
                    setScreenshot(null);
                    setScreenshotPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Upload screenshot</span>
              </button>
            )}
          </div>

          <Button
            onClick={handleDeposit}
            disabled={amount <= 0 || !selectedPaymentMethod || !senderName || !transactionRef || !screenshot || isSubmitting}
            className="w-full primary-gradient text-primary-foreground font-semibold hover:opacity-90"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Deposit Request'}
          </Button>
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message="Deposit submitted successfully!"
      />
    </>
  );
};
