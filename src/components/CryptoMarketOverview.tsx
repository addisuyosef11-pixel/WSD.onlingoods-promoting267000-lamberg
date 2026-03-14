import React, { useEffect, useState } from 'react';
import { CryptoMarketData, cryptoService } from '@/services/cryptoService';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Activity, Globe } from 'lucide-react';

const CryptoMarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<CryptoMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const data = await cryptoService.getGlobalMarketData();
      setMarketData(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch market data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    return `$${(num / 1e6).toFixed(2)}M`;
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white animate-pulse">
        <div className="h-6 bg-white/20 rounded w-1/3 mb-2"></div>
        <div className="h-10 bg-white/20 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !marketData) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
        <p className="text-sm">{error || 'Unable to load market data'}</p>
      </div>
    );
  }

  const marketCapChange = marketData.market_cap_change_percentage_24h_usd;
  const isPositive = marketCapChange >= 0;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-5 text-white shadow-lg mb-4">
      <h3 className="text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
        <Globe className="w-4 h-4" />
        Global Cryptocurrency Market
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/60 mb-1">Total Market Cap</p>
          <p className="text-xl font-bold">{formatLargeNumber(marketData.total_market_cap.usd)}</p>
          <div className={`flex items-center gap-1 mt-1 text-xs ${
            isPositive ? 'text-green-300' : 'text-red-300'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(marketCapChange).toFixed(2)}% (24h)</span>
          </div>
        </div>
        
        <div>
          <p className="text-xs text-white/60 mb-1">24h Volume</p>
          <p className="text-xl font-bold">{formatLargeNumber(marketData.total_volume.usd)}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-xs text-white/80">BTC Dominance</span>
          </div>
          <span className="text-sm font-semibold">{marketData.market_cap_percentage.btc.toFixed(1)}%</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-xs text-white/80">ETH Dominance</span>
          </div>
          <span className="text-sm font-semibold">{marketData.market_cap_percentage.eth.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
};

export default CryptoMarketOverview;