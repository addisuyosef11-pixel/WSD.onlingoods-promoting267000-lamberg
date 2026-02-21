import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Star, ExternalLink, AlertCircle } from 'lucide-react';
import { CryptoCoin, cryptoService } from '@/services/cryptoService';

interface CryptoCardProps {
  coin: CryptoCoin;
  onViewDetails?: (coinId: string) => void;
}

const CryptoCard: React.FC<CryptoCardProps> = ({ coin, onViewDetails }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSparkline, setShowSparkline] = useState(false);
  const priceChangePositive = coin.price_change_percentage_24h >= 0;

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Format price
  const formatPrice = (price: number): string => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Load favorite status from localStorage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('cryptoFavorites') || '[]');
    setIsFavorite(favorites.includes(coin.id));
  }, [coin.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('cryptoFavorites') || '[]');
    let newFavorites;
    
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== coin.id);
    } else {
      newFavorites = [...favorites, coin.id];
    }
    
    localStorage.setItem('cryptoFavorites', JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-102 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
      onClick={() => onViewDetails?.(coin.id)}
    >
      {/* Header with Rank and Favorite */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            #{coin.market_cap_rank}
          </span>
          <img src={coin.image} alt={coin.name} className="w-6 h-6" />
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-white">{coin.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
          </div>
        </div>
        <button 
          onClick={toggleFavorite}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
        </button>
      </div>

      {/* Price Section */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formatPrice(coin.current_price)}
          </span>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            priceChangePositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {priceChangePositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">
              {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
            <p className="font-medium text-gray-800 dark:text-white">{formatNumber(coin.market_cap)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Volume (24h)</p>
            <p className="font-medium text-gray-800 dark:text-white">{formatNumber(coin.total_volume)}</p>
          </div>
        </div>

        {/* 24h Range */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>24h Low</span>
            <span>24h High</span>
          </div>
          <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute h-full bg-gradient-to-r from-red-500 to-green-500"
              style={{
                width: `${((coin.current_price - coin.low_24h) / (coin.high_24h - coin.low_24h)) * 100}%`
              }}
            />
          </div>
          <div className="flex justify-between text-xs mt-1">
            <span className="text-gray-600 dark:text-gray-300">${formatPrice(coin.low_24h)}</span>
            <span className="text-gray-600 dark:text-gray-300">${formatPrice(coin.high_24h)}</span>
          </div>
        </div>

        {/* ATH Info */}
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">All Time High</p>
            <p className="text-xs font-medium text-gray-800 dark:text-white">${formatPrice(coin.ath)}</p>
          </div>
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">From ATH</p>
            <p className={`text-xs font-medium ${coin.ath_change_percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {coin.ath_change_percentage.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoCard;