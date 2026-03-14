import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { 
  ArrowLeft, 
  CreditCard, 
  Upload, 
  AlertTriangle, 
  Clock, 
  Building2, 
  Plus, 
  Minus, 
  Copy, 
  Check, 
  Volume2,
  DollarSign,
  Coins,
  ExternalLink,
  Shield,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SuccessModal } from '@/components/SuccessModal';
import { Spinner } from '@/components/Spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PaymentMethod {
  id: string;
  name: string;
  account_number: string;
  logo_url: string | null;
  branch_name?: string | null;
  account_holder_name?: string | null;
  currency: 'ETB' | 'USD';
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
}

const presetAmounts = [100, 200, 500, 1000, 2000, 5000];
const SUPPORT_USERNAME = "@DSWonline_suport";
const BINANCE_PAY_ID = "DSW_BINANCE_12345";

// Ethiopian Birr to USD conversion rate
const ETB_TO_USD_RATE = 0.018; // 1 ETB = $0.018 USD

export const Deposit = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  
  const [currency, setCurrency] = useState<'ETB' | 'USD'>('ETB');
  const [amount, setAmount] = useState(100);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [senderName, setSenderName] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [checkingBank, setCheckingBank] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has any bank account (no verification needed)
  useEffect(() => {
    const checkBankAccounts = async () => {
      if (!user) {
        setCheckingBank(false);
        return;
      }
      
      const { data } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id);
      
      setHasBankAccount(data && data.length > 0);
      setCheckingBank(false);
    };

    checkBankAccounts();
  }, [user]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (!hasBankAccount) return;
      
      setIsLoading(true);
      
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .eq('currency', currency);
      
      if (data) {
        setPaymentMethods(data as PaymentMethod[]);
      }
      
      setIsLoading(false);
    };

    if (hasBankAccount) {
      fetchPaymentMethods();
      setTimeLeft(15 * 60);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
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
  }, [hasBankAccount, currency]);

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

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSupportClick = () => {
    window.open(`https://t.me/${SUPPORT_USERNAME.replace('@', '')}`, '_blank');
  };

  const handleAddBankCard = () => {
    navigate('/bank-cards');
  };

  const handleDeposit = async () => {
    if (!user || !selectedPaymentMethod || !screenshot) return;

    if (!senderName.trim() || !transactionRef.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, screenshot);

      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          amount: amount,
          currency: currency,
          payment_method_id: selectedPaymentMethod.id,
          sender_name: senderName.trim(),
          transaction_ref: transactionRef.trim(),
          proof_url: publicUrl.publicUrl,
          status: 'pending'
        });

      if (depositError) throw depositError;

      setShowSuccess(true);
      
    } catch (error) {
      console.error('Deposit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate('/profile');
  };

  const usdAmount = (amount * ETB_TO_USD_RATE).toFixed(2);

  if (checkingBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Green Gradient Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-6 relative z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-white" />
              <h1 className="text-xl font-bold text-white">Deposit Funds</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Bank Account Check */}
        {!hasBankAccount ? (
          <div className="bg-white rounded-xl border border-[#e2e8e2] p-6 mb-6 shadow-sm text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3a2d] mb-2">Bank Account Required</h3>
            <p className="text-sm text-[#6b7b6b] mb-4">
              You need to add a bank account before making a deposit.
            </p>
            <Button
              onClick={() => navigate('/bank-cards')}
              className="w-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold"
            >
              Add Bank Account
            </Button>
          </div>
        ) : (
          <>
            {/* Currency Selector */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#2d3a2d] mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#7acc00]" />
                Select Currency
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCurrency('ETB')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    currency === 'ETB'
                      ? 'border-[#7acc00] bg-[#7acc00]/5'
                      : 'border-[#e2e8e2] hover:border-[#7acc00]/50'
                  }`}
                >
                  <Coins className={`w-6 h-6 ${currency === 'ETB' ? 'text-[#7acc00]' : 'text-[#6b7b6b]'}`} />
                  <span className={`text-sm font-medium ${currency === 'ETB' ? 'text-[#2d3a2d]' : 'text-[#6b7b6b]'}`}>
                    Ethiopian Birr
                  </span>
                  <span className="text-xs text-[#6b7b6b]">ETB</span>
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    currency === 'USD'
                      ? 'border-[#7acc00] bg-[#7acc00]/5'
                      : 'border-[#e2e8e2] hover:border-[#7acc00]/50'
                  }`}
                >
                  <DollarSign className={`w-6 h-6 ${currency === 'USD' ? 'text-[#7acc00]' : 'text-[#6b7b6b]'}`} />
                  <span className={`text-sm font-medium ${currency === 'USD' ? 'text-[#2d3a2d]' : 'text-[#6b7b6b]'}`}>
                    US Dollar
                  </span>
                  <span className="text-xs text-[#6b7b6b]">USD</span>
                </button>
              </div>
            </div>

            {/* Support Contact */}
            <div className="mb-6">
              <button
                onClick={handleSupportClick}
                className="w-full p-4 rounded-xl bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/20">
                      <Volume2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-white text-sm font-medium opacity-90">Need assistance?</p>
                      <p className="text-white text-lg font-bold">{SUPPORT_USERNAME}</p>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white" />
                </div>
              </button>
            </div>

            {/* Timer */}
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 mb-4">
              <Clock className="w-5 h-5 text-red-500" />
              <span className="text-red-600 font-bold text-lg">{formatTime(timeLeft)}</span>
              <span className="text-sm text-red-500">remaining</span>
            </div>

            {/* Warning */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 mb-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Important</p>
                <p className="text-xs text-amber-600">
                  Complete payment within 15 minutes. Your deposit will be verified after screenshot review.
                </p>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#2d3a2d] mb-3">Amount</h3>
              
              <div className="flex items-center justify-center gap-4 mb-3">
                <button
                  onClick={handleDecreaseAmount}
                  className="w-12 h-12 rounded-xl border-2 border-[#e2e8e2] bg-white flex items-center justify-center hover:bg-[#f1f5f1] transition-colors"
                >
                  <Minus className="w-5 h-5 text-[#2d3a2d]" />
                </button>
                <div className="flex-1 text-center">
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(50, parseInt(e.target.value) || 0))}
                    className="text-center text-2xl font-bold h-14 border-[#e2e8e2]"
                    min={50}
                  />
                </div>
                <button
                  onClick={handleIncreaseAmount}
                  className="w-12 h-12 rounded-xl border-2 border-[#e2e8e2] bg-white flex items-center justify-center hover:bg-[#f1f5f1] transition-colors"
                >
                  <Plus className="w-5 h-5 text-[#2d3a2d]" />
                </button>
              </div>

              {currency === 'USD' && (
                <div className="p-3 bg-[#f8fafc] rounded-lg text-center">
                  <p className="text-sm text-[#6b7b6b]">Equivalent in USD</p>
                  <p className="text-lg font-bold text-[#2d3a2d]">${usdAmount} USD</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 mt-3">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt)}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                      amount === amt
                        ? 'border-[#7acc00] bg-[#7acc00]/5 text-[#7acc00]'
                        : 'border-[#e2e8e2] text-[#6b7b6b] hover:border-[#7acc00]/50'
                    }`}
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-[#2d3a2d] mb-3">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => handlePaymentMethodSelect(method.id)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        selectedPaymentMethod?.id === method.id
                          ? 'border-[#7acc00] bg-[#7acc00]/5'
                          : 'border-[#e2e8e2] hover:border-[#7acc00]/50'
                      }`}
                    >
                      {method.logo_url ? (
                        <div className="w-full h-12 rounded-lg overflow-hidden bg-white">
                          <img 
                            src={method.logo_url} 
                            alt={method.name} 
                            className="w-full h-full object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="w-full h-12 rounded-lg bg-[#f1f5f1] flex items-center justify-center">
                          <Building2 className="w-8 h-8 text-[#7acc00]" />
                        </div>
                      )}
                      <span className="text-xs font-medium text-center text-[#2d3a2d]">
                        {method.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Details */}
            {selectedPaymentMethod && (
              <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
                <h3 className="font-semibold text-[#2d3a2d] mb-3">Payment Details</h3>
                
                {currency === 'USD' ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#f8fafc] rounded-lg text-center">
                      <p className="text-sm text-[#6b7b6b] mb-2">Binance Pay ID</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-lg font-bold text-[#2d3a2d] font-mono">{BINANCE_PAY_ID}</p>
                        <button
                          onClick={() => copyToClipboard(BINANCE_PAY_ID, 'binance')}
                          className="p-1 rounded-md hover:bg-white transition-colors"
                        >
                          {copiedField === 'binance' ? (
                            <Check className="w-4 h-4 text-[#7acc00]" />
                          ) : (
                            <Copy className="w-4 h-4 text-[#7acc00]" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPaymentMethod.branch_name && (
                      <div className="p-3 bg-[#f8fafc] rounded-lg">
                        <p className="text-xs text-[#6b7b6b]">Branch</p>
                        <p className="text-sm font-semibold text-[#2d3a2d]">{selectedPaymentMethod.branch_name}</p>
                      </div>
                    )}
                    
                    <div className="p-3 bg-[#f8fafc] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-[#6b7b6b]">Account Number</p>
                        <button
                          onClick={() => copyToClipboard(selectedPaymentMethod.account_number, 'account')}
                          className="p-1 rounded-md hover:bg-white transition-colors"
                        >
                          {copiedField === 'account' ? (
                            <Check className="w-3.5 h-3.5 text-[#7acc00]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-[#7acc00]" />
                          )}
                        </button>
                      </div>
                      <p className="text-lg font-bold text-[#7acc00] tracking-wider font-mono">
                        {selectedPaymentMethod.account_number}
                      </p>
                    </div>
                    
                    {selectedPaymentMethod.account_holder_name && (
                      <div className="p-3 bg-[#f8fafc] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-[#6b7b6b]">Account Holder</p>
                          <button
                            onClick={() => copyToClipboard(selectedPaymentMethod.account_holder_name!, 'holder')}
                            className="p-1 rounded-md hover:bg-white transition-colors"
                          >
                            {copiedField === 'holder' ? (
                              <Check className="w-3.5 h-3.5 text-[#7acc00]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-[#7acc00]" />
                            )}
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-[#2d3a2d]">
                          {selectedPaymentMethod.account_holder_name}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Sender Details */}
            <div className="bg-white rounded-xl border border-[#e2e8e2] p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-[#2d3a2d] mb-3">Sender Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2d3a2d] mb-2">
                    Sender Name
                  </label>
                  <Input
                    type="text"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Enter sender name on payment"
                    className="border-[#e2e8e2] focus:ring-[#7acc00] focus:border-[#7acc00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3a2d] mb-2">
                    Transaction Reference (FT)
                  </label>
                  <Input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Enter FT number"
                    className="border-[#e2e8e2] focus:ring-[#7acc00] focus:border-[#7acc00]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2d3a2d] mb-2">
                    Payment Screenshot
                  </label>
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
                        className="w-full h-40 object-cover rounded-lg border border-[#e2e8e2]"
                      />
                      <button
                        onClick={() => {
                          setScreenshot(null);
                          setScreenshotPreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-[#e2e8e2] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#7acc00] hover:bg-[#f1f5f1] transition-colors"
                    >
                      <Upload className="w-8 h-8 text-[#6b7b6b]" />
                      <span className="text-sm text-[#6b7b6b]">Upload screenshot</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleDeposit}
              disabled={amount <= 0 || !selectedPaymentMethod || !senderName || !transactionRef || !screenshot || isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Processing Deposit...</span>
                </div>
              ) : (
                'Submit Deposit Request'
              )}
            </Button>
          </>
        )}
      </div>

      <BottomNavigation />

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        message="Deposit submitted successfully!"
      />
    </div>
  );
};

export default Deposit;