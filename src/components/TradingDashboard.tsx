import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ChevronDown, RefreshCw, 
  AlertCircle, Clock, ArrowUp, ArrowDown, DollarSign,
  BarChart3, Activity, BookOpen, History 
} from 'lucide-react';
import { tradingService } from '@/services/tradingService';
import { Order, OrderBook, Trade, TradingPair } from '@/types/crypto';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from './Spinner';

interface TradingDashboardProps {
  initialPair?: string;
}

const TradingDashboard: React.FC<TradingDashboardProps> = ({ initialPair = 'BTC/USDT' }) => {
  const { user, profile } = useAuth();
  const [selectedPair, setSelectedPair] = useState(initialPair);
  const [orderBook, setOrderBook] = useState<OrderBook | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'history' | 'open'>('orders');
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [showPairSelector, setShowPairSelector] = useState(false);
  const [pricePrecision, setPricePrecision] = useState(2);
  const [amountPrecision, setAmountPrecision] = useState(3);

  useEffect(() => {
    const pairs = tradingService.getTradingPairs();
    setPairs(pairs);
    loadOrderBook();
    
    // Subscribe to updates
    tradingService.subscribe(selectedPair, 'orderBookUpdate', handleOrderBookUpdate);
    tradingService.subscribe(selectedPair, 'newTrade', handleNewTrade);

    return () => {
      tradingService.unsubscribe(selectedPair, 'orderBookUpdate', handleOrderBookUpdate);
      tradingService.unsubscribe(selectedPair, 'newTrade', handleNewTrade);
    };
  }, [selectedPair]);

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user, selectedPair]);

  useEffect(() => {
    calculateTotal();
  }, [price, amount]);

  const loadOrderBook = () => {
    const book = tradingService.getOrderBook(selectedPair);
    setOrderBook(book);
    
    // Set price precision from pair
    const pair = pairs.find(p => p.symbol === selectedPair);
    if (pair) {
      setPricePrecision(pair.pricePrecision);
      setAmountPrecision(pair.amountPrecision);
    }
  };

  const loadUserOrders = () => {
    if (user) {
      const orders = tradingService.getUserOrders(user.id, selectedPair);
      setUserOrders(orders);
    }
  };

  const handleOrderBookUpdate = (data?: any) => {
    loadOrderBook();
  };

  const handleNewTrade = (trade: Trade) => {
    setRecentTrades(prev => [trade, ...prev].slice(0, 50));
    loadOrderBook();
  };

  const calculateTotal = () => {
    if (price && amount) {
      const numPrice = parseFloat(price);
      const numAmount = parseFloat(amount);
      if (!isNaN(numPrice) && !isNaN(numAmount)) {
        setTotal((numPrice * numAmount).toFixed(2));
      } else {
        setTotal('');
      }
    } else {
      setTotal('');
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(e.target.value);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      alert('Please login to trade');
      return;
    }

    const numPrice = parseFloat(price);
    const numAmount = parseFloat(amount);
    const numTotal = parseFloat(total);

    if (isNaN(numPrice) || isNaN(numAmount) || isNaN(numTotal)) {
      alert('Please enter valid price and amount');
      return;
    }

    // Check balance
    if (orderType === 'buy') {
      if (profile.balance < numTotal) {
        alert('Insufficient balance');
        return;
      }
    }

    setLoading(true);
    try {
      const order = await tradingService.placeOrder({
        userId: user.id,
        type: orderType,
        pair: selectedPair,
        price: numPrice,
        amount: numAmount,
        total: numTotal
      });

      alert(`Order placed successfully! Order ID: ${order.id}`);
      setPrice('');
      setAmount('');
      setTotal('');
      loadUserOrders();
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  if (!orderBook) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const priceChangePositive = orderBook.priceChange24h >= 0;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
      {/* Header - Trading Pair Info */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Pair Selector */}
            <div className="relative">
              <button
                onClick={() => setShowPairSelector(!showPairSelector)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <span className="font-bold text-gray-900 dark:text-white">{selectedPair}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showPairSelector && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                  {pairs.map(pair => (
                    <button
                      key={pair.symbol}
                      onClick={() => {
                        setSelectedPair(pair.symbol);
                        setShowPairSelector(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">{pair.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Info */}
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${formatPrice(orderBook.lastPrice)}
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                priceChangePositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {priceChangePositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(orderBook.priceChange24h * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="flex gap-6 text-sm">
            <div>
              <div className="text-gray-500 dark:text-gray-400">24h High</div>
              <div className="font-medium text-gray-900 dark:text-white">${formatPrice(orderBook.high24h)}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">24h Low</div>
              <div className="font-medium text-gray-900 dark:text-white">${formatPrice(orderBook.low24h)}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Volume</div>
              <div className="font-medium text-gray-900 dark:text-white">${formatNumber(orderBook.volume24h / 1000000, 1)}M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Trading Interface */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {/* Order Book - Left Column */}
        <div className="col-span-1 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Order Book
            </h3>
            
            {/* Bids (Buy Orders) */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Bids (Buy)</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              {orderBook.bids.slice(0, 8).map((bid, i) => (
                <div key={bid.id} className="flex justify-between text-sm py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="text-green-600 font-medium">${formatPrice(bid.price)}</span>
                  <span className="text-gray-700 dark:text-gray-300">{bid.amount.toFixed(amountPrecision)}</span>
                  <span className="text-gray-500 dark:text-gray-400">${(bid.price * bid.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Spread */}
            <div className="border-t border-b border-gray-200 dark:border-gray-700 py-2 my-2 text-center text-xs text-gray-500">
              Spread: ${(orderBook.asks[0]?.price - orderBook.bids[0]?.price).toFixed(pricePrecision)}
            </div>

            {/* Asks (Sell Orders) */}
            <div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>Asks (Sell)</span>
                <span>Amount</span>
                <span>Total</span>
              </div>
              {orderBook.asks.slice(0, 8).map((ask, i) => (
                <div key={ask.id} className="flex justify-between text-sm py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <span className="text-red-600 font-medium">${formatPrice(ask.price)}</span>
                  <span className="text-gray-700 dark:text-gray-300">{ask.amount.toFixed(amountPrecision)}</span>
                  <span className="text-gray-500 dark:text-gray-400">${(ask.price * ask.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <History className="w-4 h-4" />
              Recent Trades
            </h3>
            <div className="space-y-1">
              {recentTrades.slice(0, 5).map(trade => (
                <div key={trade.id} className="flex justify-between text-xs py-1">
                  <span className={trade.buyerId === user?.id ? 'text-green-600' : 'text-red-600'}>
                    {trade.buyerId === user?.id ? 'BUY' : 'SELL'}
                  </span>
                  <span className="font-medium">${formatPrice(trade.price)}</span>
                  <span className="text-gray-600 dark:text-gray-400">{trade.amount.toFixed(amountPrecision)}</span>
                  <span className="text-gray-400 text-[10px]">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trading Form - Middle Column */}
        <div className="col-span-1">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Place Order</h3>
            
            {/* Order Type Toggle */}
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 mb-4">
              <button
                onClick={() => setOrderType('buy')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  orderType === 'buy'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setOrderType('sell')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  orderType === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Price Input */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Price</label>
              <div className="relative">
                <input
                  type="number"
                  value={price}
                  onChange={handlePriceChange}
                  placeholder="0.00"
                  step={1 / Math.pow(10, pricePrecision)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">USDT</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Amount</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  step={1 / Math.pow(10, amountPrecision)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {selectedPair.split('/')[0]}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Total:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ${total || '0.00'} USDT
                </span>
              </div>
            </div>

            {/* Balance Info */}
            <div className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Available Balance: ${profile?.balance.toFixed(2) || '0.00'} USDT
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loading || !price || !amount}
              className={`w-full py-3 rounded-lg font-medium text-white transition-all ${
                orderType === 'buy'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `${orderType === 'buy' ? 'Buy' : 'Sell'} ${selectedPair.split('/')[0]}`
              )}
            </button>
          </div>
        </div>

        {/* Market Depth & Stats - Right Column */}
        <div className="col-span-1 space-y-4">
          {/* Market Depth Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Market Depth
            </h3>
            <div className="h-32 relative">
              {/* Simplified depth visualization */}
              <div className="absolute inset-0 flex items-end">
                <div className="flex-1 flex items-end h-full gap-0.5">
                  {/* Buy side */}
                  {orderBook.bids.slice(0, 10).map((bid, i) => (
                    <div
                      key={bid.id}
                      className="flex-1 bg-green-500/30 hover:bg-green-500/50 transition-colors"
                      style={{ height: `${(bid.amount / orderBook.bids[0]?.amount) * 100}%` }}
                    />
                  ))}
                  {/* Sell side */}
                  {orderBook.asks.slice(0, 10).map((ask, i) => (
                    <div
                      key={ask.id}
                      className="flex-1 bg-red-500/30 hover:bg-red-500/50 transition-colors"
                      style={{ height: `${(ask.amount / orderBook.asks[0]?.amount) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50">
                Buy 25%
              </button>
              <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50">
                Sell 25%
              </button>
              <button className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50">
                Buy 50%
              </button>
              <button className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm hover:bg-red-200 dark:hover:bg-red-900/50">
                Sell 50%
              </button>
              <button className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm hover:bg-green-200 dark:hover:bg-green-900/50 col-span-2">
                Buy Max
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Orders Tabs */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="flex border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Open Orders
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Order History
          </button>
          <button
            onClick={() => setActiveTab('open')}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'open'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Trade History
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'orders' && (
            <div className="space-y-2">
              {userOrders.filter(o => o.status === 'open' || o.status === 'partial').map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.type === 'buy' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.pair}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">${order.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{order.amount}</span>
                    <span className="text-gray-600 dark:text-gray-400">${order.total}</span>
                    <span className={`text-xs ${
                      order.status === 'partial' ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-2">
              {userOrders.filter(o => o.status === 'completed' || o.status === 'cancelled').map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.type === 'buy' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {order.type.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{order.pair}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">${order.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{order.amount}</span>
                    <span className="text-gray-600 dark:text-gray-400">${order.total}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'open' && (
            <div className="space-y-2">
              {recentTrades.slice(0, 10).map(trade => (
                <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.buyerId === user?.id
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {trade.buyerId === user?.id ? 'BUY' : 'SELL'}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{trade.pair}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">${trade.price}</span>
                    <span className="text-gray-600 dark:text-gray-400">{trade.amount}</span>
                    <span className="text-gray-600 dark:text-gray-400">${trade.total}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(trade.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingDashboard;