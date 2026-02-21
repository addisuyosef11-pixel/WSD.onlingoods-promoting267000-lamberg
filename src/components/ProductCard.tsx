import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Calendar, Award, Shield, Zap, ChevronRight, Bitcoin, CreditCard, Wallet } from 'lucide-react';

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  totalIncome: number;
  purchaseLimit: number;
  progressPercent: number;
  soldOutTime?: Date;
  onInvest: (paymentMethod?: 'card' | 'crypto') => void;
  discountPercent?: number;
  cryptoPrice?: {
    btc?: number;
    eth?: number;
    usdt?: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  price,
  dailyIncome,
  validityDays,
  totalIncome,
  purchaseLimit,
  progressPercent,
  soldOutTime,
  onInvest,
  discountPercent = 50,
  cryptoPrice,
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [showCryptoOptions, setShowCryptoOptions] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<'btc' | 'eth' | 'usdt' | null>(null);

  useEffect(() => {
    if (!soldOutTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = soldOutTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [soldOutTime]);

  // Calculate crypto prices based on current rates (example rates)
  const getCryptoPrice = (crypto: 'btc' | 'eth' | 'usdt') => {
    const rates = {
      btc: 43250, // 1 BTC = $43,250
      eth: 2250,  // 1 ETH = $2,250
      usdt: 1,    // 1 USDT = $1
    };
    
    const cryptoAmount = price / rates[crypto];
    return cryptoAmount.toFixed(crypto === 'btc' ? 6 : crypto === 'eth' ? 4 : 2);
  };

  const handleInvestClick = () => {
    if (showCryptoOptions) {
      setShowCryptoOptions(false);
      setSelectedCrypto(null);
    }
    onInvest('card');
  };

  const handleCryptoSelect = (crypto: 'btc' | 'eth' | 'usdt') => {
    setSelectedCrypto(crypto);
    onInvest('crypto');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-4 relative">
      {/* Crypto Payment Badge */}
      <div className="absolute top-2 right-2 flex gap-1">
        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Bitcoin className="w-3 h-3" />
          BTC
        </span>
        <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Bitcoin className="w-3 h-3" />
          ETH
        </span>
        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Wallet className="w-3 h-3" />
          USDT
        </span>
      </div>

      {/* Header with name and countdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Sold out time</span>
          <div className="flex gap-0.5">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Content with image and details */}
      <div className="flex gap-4">
        <div className="w-28 h-20 flex-shrink-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Price:</span>
          <span className="text-primary font-semibold text-right">
            {price.toLocaleString()} ETB
            {showCryptoOptions && selectedCrypto && (
              <span className="block text-xs text-gray-500">
                ≈ {getCryptoPrice(selectedCrypto)} {selectedCrypto.toUpperCase()}
              </span>
            )}
          </span>
          
          <span className="text-muted-foreground">Daily income:</span>
          <span className="text-primary font-semibold text-right">{dailyIncome.toLocaleString()} ETB</span>
          
          <span className="text-muted-foreground">Validity period:</span>
          <span className="text-primary font-semibold text-right">{validityDays} Days</span>
          
          <span className="text-muted-foreground">Total income:</span>
          <span className="text-primary font-semibold text-right">{totalIncome.toLocaleString()} ETB</span>
          
          <span className="text-muted-foreground">Purchase limit:</span>
          <span className="text-primary font-semibold text-right">{purchaseLimit}</span>
        </div>
      </div>

      {/* Crypto Price Preview (when not expanded) */}
      {!showCryptoOptions && (
        <div className="mt-3 flex items-center justify-between bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-4 h-4 text-yellow-600" />
            <span className="text-xs text-gray-600 dark:text-gray-400">Pay with Crypto:</span>
          </div>
          <div className="flex gap-2">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              ≈ {getCryptoPrice('btc')} BTC
            </span>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              / {getCryptoPrice('eth')} ETH
            </span>
          </div>
          <button
            onClick={() => setShowCryptoOptions(true)}
            className="text-xs text-yellow-600 hover:text-yellow-700 font-medium"
          >
            View all
          </button>
        </div>
      )}

      {/* Crypto Payment Options */}
      {showCryptoOptions && (
        <div className="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
            <Bitcoin className="w-4 h-4 text-yellow-600" />
            Pay with Cryptocurrency
          </h4>
          
          <div className="grid grid-cols-3 gap-2 mb-2">
            <button
              onClick={() => handleCryptoSelect('btc')}
              className={`p-2 rounded-lg border text-center transition-all ${
                selectedCrypto === 'btc'
                  ? 'bg-yellow-500 border-yellow-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-yellow-500'
              }`}
            >
              <Bitcoin className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">BTC</span>
              <span className="block text-[10px] opacity-75">{getCryptoPrice('btc')}</span>
            </button>
            
            <button
              onClick={() => handleCryptoSelect('eth')}
              className={`p-2 rounded-lg border text-center transition-all ${
                selectedCrypto === 'eth'
                  ? 'bg-purple-500 border-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-500'
              }`}
            >
              <Bitcoin className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">ETH</span>
              <span className="block text-[10px] opacity-75">{getCryptoPrice('eth')}</span>
            </button>
            
            <button
              onClick={() => handleCryptoSelect('usdt')}
              className={`p-2 rounded-lg border text-center transition-all ${
                selectedCrypto === 'usdt'
                  ? 'bg-green-500 border-green-600 text-white'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-green-500'
              }`}
            >
              <Wallet className="w-4 h-4 mx-auto mb-1" />
              <span className="text-xs font-medium">USDT</span>
              <span className="block text-[10px] opacity-75">${price}</span>
            </button>
          </div>
          
          {selectedCrypto && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-lg text-xs">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {getCryptoPrice(selectedCrypto)} {selectedCrypto.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Equivalent:</span>
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {price.toLocaleString()} ETB
                </span>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowCryptoOptions(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Hide crypto options
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="mt-4 relative">
        <div className="h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 rounded-full overflow-hidden">
          <div 
            className="h-full bg-transparent"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div 
          className="absolute -top-1 transform -translate-x-1/2"
          style={{ left: `${progressPercent}%` }}
        >
          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Invest buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleInvestClick}
          className="flex-1 py-2 bg-gradient-to-r from-purple-500 to-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          Pay with Card
        </button>
        
        {!showCryptoOptions && (
          <button
            onClick={() => setShowCryptoOptions(true)}
            className="py-2 px-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Bitcoin className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
