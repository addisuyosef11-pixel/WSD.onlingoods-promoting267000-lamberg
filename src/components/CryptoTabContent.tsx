import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, ChevronDown, RefreshCw, 
  AlertCircle, DollarSign, BarChart3, History, Star,
  Bitcoin, Wallet, Globe, ArrowUpCircle, ArrowDownCircle,
  Users, MessageCircle, Shield, Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/Spinner';
import { cryptoService, CryptoCoin } from '@/services/cryptoService';

// ============== REGULAR TRADING COMPONENTS ==============

const PriceDisplay = ({ price, change }: { price: number; change: number }) => {
  const isPositive = change >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold">${price.toLocaleString()}</span>
      <span className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
        isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    </div>
  );
};

const CoinSelector = ({ coins, selected, onSelect }: { 
  coins: CryptoCoin[]; 
  selected: CryptoCoin | null;
  onSelect: (coin: CryptoCoin) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
      >
        {selected && (
          <>
            <img src={selected.image} alt={selected.name} className="w-5 h-5" />
            <span className="font-medium">{selected.symbol.toUpperCase()}/USDT</span>
          </>
        )}
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {coins.map(coin => (
            <button
              key={coin.id}
              onClick={() => {
                onSelect(coin);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50"
            >
              <img src={coin.image} alt={coin.name} className="w-5 h-5" />
              <div className="flex-1 text-left">
                <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                <span className="text-xs text-gray-500 ml-2">/USDT</span>
              </div>
              <span className="text-sm">${coin.current_price.toLocaleString()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const SimpleOrderBook = ({ bids, asks }: { bids: any[]; asks: any[] }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
      <BarChart3 className="w-4 h-4" />
      Order Book
    </h3>
    
    {/* Sell Orders (Asks) - Red */}
    <div className="mb-2">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      {asks.map((ask, i) => (
        <div key={i} className="flex justify-between text-sm py-0.5">
          <span className="text-red-600">${ask.price.toLocaleString()}</span>
          <span className="text-gray-700">{ask.amount}</span>
          <span className="text-gray-500">${ask.total.toLocaleString()}</span>
        </div>
      ))}
    </div>

    {/* Spread */}
    <div className="border-t border-b py-1 my-1 text-center text-xs text-gray-500">
      Spread: $10.00
    </div>

    {/* Buy Orders (Bids) - Green */}
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Price</span>
        <span>Amount</span>
        <span>Total</span>
      </div>
      {bids.map((bid, i) => (
        <div key={i} className="flex justify-between text-sm py-0.5">
          <span className="text-green-600">${bid.price.toLocaleString()}</span>
          <span className="text-gray-700">{bid.amount}</span>
          <span className="text-gray-500">${bid.total.toLocaleString()}</span>
        </div>
      ))}
    </div>
  </div>
);

const TradeForm = ({ 
  type, 
  onTypeChange,
  price,
  onPriceChange,
  amount,
  onAmountChange,
  total,
  balance,
  symbol,
  onSubmit 
}: {
  type: 'buy' | 'sell';
  onTypeChange: (type: 'buy' | 'sell') => void;
  price: string;
  onPriceChange: (value: string) => void;
  amount: string;
  onAmountChange: (value: string) => void;
  total: string;
  balance: number;
  symbol: string;
  onSubmit: () => void;
}) => (
  <div className="bg-gray-50 rounded-lg p-4">
    <h3 className="text-sm font-medium mb-3">Regular Trade</h3>
    
    {/* Buy/Sell Toggle */}
    <div className="flex rounded-lg overflow-hidden border mb-4">
      <button
        onClick={() => onTypeChange('buy')}
        className={`flex-1 py-2 text-sm font-medium ${
          type === 'buy' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
        }`}
      >
        Buy
      </button>
      <button
        onClick={() => onTypeChange('sell')}
        className={`flex-1 py-2 text-sm font-medium ${
          type === 'sell' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
        }`}
      >
        Sell
      </button>
    </div>

    {/* Price Input */}
    <div className="mb-3">
      <label className="text-xs text-gray-500 mb-1 block">Price (USDT)</label>
      <input
        type="number"
        value={price}
        onChange={(e) => onPriceChange(e.target.value)}
        placeholder="0.00"
        className="w-full px-3 py-2 bg-white border rounded-lg"
      />
    </div>

    {/* Amount Input */}
    <div className="mb-3">
      <label className="text-xs text-gray-500 mb-1 block">Amount ({symbol})</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        placeholder="0.00"
        className="w-full px-3 py-2 bg-white border rounded-lg"
      />
    </div>

    {/* Total */}
    <div className="mb-3 p-3 bg-white rounded-lg">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Total:</span>
        <span className="font-bold">${total || '0.00'} USDT</span>
      </div>
    </div>

    {/* Balance */}
    <div className="mb-4 text-xs text-gray-500 flex items-center justify-between">
      <span className="flex items-center gap-1">
        <Wallet className="w-3 h-3" />
        Balance:
      </span>
      <span className="font-medium">${balance?.toFixed(2) || '0.00'} USDT</span>
    </div>

    {/* Submit Button */}
    <button
      onClick={onSubmit}
      disabled={!price || !amount}
      className={`w-full py-3 rounded-lg font-medium text-white ${
        type === 'buy' 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-red-500 hover:bg-red-600'
      } disabled:opacity-50`}
    >
      {type === 'buy' ? 'Buy' : 'Sell'} {symbol}
    </button>
  </div>
);

const RecentTrades = ({ trades, symbol }: { trades: any[]; symbol: string }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
      <History className="w-4 h-4" />
      Recent Trades
    </h3>
    <div className="space-y-1 max-h-32 overflow-y-auto">
      {trades.map((trade, i) => (
        <div key={i} className="flex justify-between text-xs py-1">
          <span className={trade.type === 'buy' ? 'text-green-600' : 'text-red-600'}>
            {trade.type.toUpperCase()}
          </span>
          <span>${trade.price.toLocaleString()}</span>
          <span>{trade.amount} {symbol}</span>
          <span className="text-gray-400">{new Date(trade.time).toLocaleTimeString()}</span>
        </div>
      ))}
    </div>
  </div>
);

// ============== P2P TRADING COMPONENTS ==============

interface P2POrder {
  id: string;
  userName: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  minAmount: number;
  maxAmount: number;
  paymentMethod: string;
  rating: number;
  trades: number;
  verified: boolean;
}

const P2POrderCard = ({ order, onTrade }: { order: P2POrder; onTrade: () => void }) => (
  <div className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
    {/* User Info */}
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
          {order.userName[0]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">{order.userName}</span>
            {order.verified && <Shield className="w-4 h-4 text-blue-500" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              {order.rating}
            </span>
            <span>•</span>
            <span>{order.trades} trades</span>
          </div>
        </div>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        order.type === 'buy' 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        {order.type === 'buy' ? 'BUYING' : 'SELLING'}
      </span>
    </div>

    {/* Order Details */}
    <div className="grid grid-cols-3 gap-2 mb-3 text-sm">
      <div>
        <p className="text-gray-500 text-xs">Price</p>
        <p className="font-bold">${order.price.toLocaleString()}</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs">Amount</p>
        <p>{order.amount} BTC</p>
      </div>
      <div>
        <p className="text-gray-500 text-xs">Total</p>
        <p>${(order.price * order.amount).toLocaleString()}</p>
      </div>
    </div>

    {/* Limits & Payment */}
    <div className="flex items-center justify-between mb-3 text-xs">
      <span className="text-gray-500">
        Limits: ${order.minAmount} - ${order.maxAmount}
      </span>
      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
        {order.paymentMethod}
      </span>
    </div>

    {/* Trade Button */}
    <button
      onClick={onTrade}
      className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
    >
      Trade
    </button>
  </div>
);

const CreateOrderModal = ({ isOpen, onClose, onSubmit }: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (order: any) => void;
}) => {
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      minAmount: parseFloat(minAmount),
      maxAmount: parseFloat(maxAmount),
      paymentMethod
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-4">Create P2P Order</h3>
        
        {/* Type Selector */}
        <div className="flex rounded-lg overflow-hidden border mb-4">
          <button
            onClick={() => setType('buy')}
            className={`flex-1 py-2 text-sm font-medium ${
              type === 'buy' ? 'bg-green-500 text-white' : 'bg-gray-100'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setType('sell')}
            className={`flex-1 py-2 text-sm font-medium ${
              type === 'sell' ? 'bg-red-500 text-white' : 'bg-gray-100'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Amount (BTC)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Min Amount</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Max Amount</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option>Bank Transfer</option>
              <option>PayPal</option>
              <option>Credit Card</option>
              <option>USDT (TRC20)</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 border rounded-lg text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg"
          >
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MAIN COMPONENT ==============

const CryptoTabContent: React.FC = () => {
  const { user, profile } = useAuth();
  const [mode, setMode] = useState<'regular' | 'p2p'>('regular'); // Toggle between regular and P2P
  const [cryptos, setCryptos] = useState<CryptoCoin[]>([]);
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoCoin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [recentTrades, setRecentTrades] = useState<any[]>([]);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [p2pOrders, setP2pOrders] = useState<P2POrder[]>([]);

  // Sample order book data
  const [orderBook] = useState({
    bids: [
      { price: 43250, amount: 0.5, total: 21625 },
      { price: 43240, amount: 1.2, total: 51888 },
      { price: 43230, amount: 0.8, total: 34584 },
      { price: 43220, amount: 2.1, total: 90762 },
      { price: 43210, amount: 1.5, total: 64815 },
    ],
    asks: [
      { price: 43260, amount: 0.3, total: 12978 },
      { price: 43270, amount: 1.1, total: 47597 },
      { price: 43280, amount: 0.9, total: 38952 },
      { price: 43290, amount: 1.8, total: 77922 },
      { price: 43300, amount: 2.0, total: 86600 },
    ]
  });

  // Sample P2P orders
  useEffect(() => {
    setP2pOrders([
      {
        id: '1',
        userName: 'CryptoKing',
        type: 'sell',
        price: 43250,
        amount: 0.5,
        minAmount: 100,
        maxAmount: 5000,
        paymentMethod: 'Bank Transfer',
        rating: 4.9,
        trades: 156,
        verified: true
      },
      {
        id: '2',
        userName: 'BTCWhale',
        type: 'buy',
        price: 43200,
        amount: 1.2,
        minAmount: 500,
        maxAmount: 10000,
        paymentMethod: 'PayPal',
        rating: 4.8,
        trades: 89,
        verified: true
      },
      {
        id: '3',
        userName: 'StableTrader',
        type: 'sell',
        price: 43300,
        amount: 0.8,
        minAmount: 200,
        maxAmount: 3000,
        paymentMethod: 'USDT',
        rating: 4.7,
        trades: 234,
        verified: false
      }
    ]);
  }, []);

  useEffect(() => {
    fetchCryptos();
    generateSampleTrades();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [price, amount]);

  const fetchCryptos = async () => {
    try {
      setLoading(true);
      const data = await cryptoService.getTopCryptos(50);
      setCryptos(data);
      if (data.length > 0) {
        setSelectedCrypto(data[0]);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const generateSampleTrades = () => {
    const trades = [];
    for (let i = 0; i < 10; i++) {
      trades.push({
        price: 43200 + Math.random() * 200,
        amount: (Math.random() * 2).toFixed(4),
        time: new Date(Date.now() - i * 60000),
        type: Math.random() > 0.5 ? 'buy' : 'sell'
      });
    }
    setRecentTrades(trades);
  };

  const calculateTotal = () => {
    if (price && amount) {
      setTotal((parseFloat(price) * parseFloat(amount)).toFixed(2));
    } else {
      setTotal('');
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      alert('Please login to trade');
      return;
    }
    alert(`${orderType === 'buy' ? 'Buy' : 'Sell'} order placed!`);
    setPrice('');
    setAmount('');
  };

  const handleCreateP2POrder = (order: any) => {
    const newOrder: P2POrder = {
      id: Date.now().toString(),
      userName: profile?.name || 'New Trader',
      ...order,
      rating: 5.0,
      trades: 0,
      verified: false
    };
    setP2pOrders([newOrder, ...p2pOrders]);
    alert('P2P order created successfully!');
  };

  const handleTrade = () => {
    if (!user) {
      alert('Please login to trade');
      return;
    }
    alert('Trade started! Check your messages.');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-600">{error}</p>
        <button onClick={fetchCryptos} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Mode Toggle */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {mode === 'regular' ? <Bitcoin className="w-5 h-5" /> : <Users className="w-5 h-5" />}
            {mode === 'regular' ? 'Crypto Trading' : 'P2P Trading'}
          </h2>
          <div className="flex bg-white/20 rounded-lg p-1">
            <button
              onClick={() => setMode('regular')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mode === 'regular' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
              }`}
            >
              Regular
            </button>
            <button
              onClick={() => setMode('p2p')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                mode === 'p2p' ? 'bg-white text-blue-600' : 'text-white hover:bg-white/20'
              }`}
            >
              P2P
            </button>
          </div>
        </div>
        <div className="text-sm bg-white/20 px-3 py-1 rounded-full inline-block">
          24h Vol: $2.4B
        </div>
      </div>

      {/* Mode Content */}
      {mode === 'regular' ? (
        /* ===== REGULAR TRADING MODE ===== */
        <div className="bg-white rounded-xl shadow-lg border p-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <CoinSelector 
              coins={cryptos} 
              selected={selectedCrypto} 
              onSelect={setSelectedCrypto} 
            />
            
            {selectedCrypto && (
              <PriceDisplay 
                price={selectedCrypto.current_price}
                change={selectedCrypto.price_change_percentage_24h}
              />
            )}
          </div>

          {/* Market Stats */}
          {selectedCrypto && (
            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-500">24h High</p>
                <p className="font-medium">${selectedCrypto.high_24h.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">24h Low</p>
                <p className="font-medium">${selectedCrypto.low_24h.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Volume</p>
                <p className="font-medium">${(selectedCrypto.total_volume / 1e6).toFixed(1)}M</p>
              </div>
            </div>
          )}

          {/* Trading Grid */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-4">
              <SimpleOrderBook bids={orderBook.bids} asks={orderBook.asks} />
            </div>
            <div className="col-span-5">
              <TradeForm
                type={orderType}
                onTypeChange={setOrderType}
                price={price}
                onPriceChange={setPrice}
                amount={amount}
                onAmountChange={setAmount}
                total={total}
                balance={profile?.balance || 0}
                symbol={selectedCrypto?.symbol.toUpperCase() || 'BTC'}
                onSubmit={handlePlaceOrder}
              />
            </div>
            <div className="col-span-3">
              <RecentTrades 
                trades={recentTrades} 
                symbol={selectedCrypto?.symbol.toUpperCase() || 'BTC'}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ===== P2P TRADING MODE ===== */
        <div className="space-y-4">
          {/* P2P Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateOrder(true)}
              className="flex-1 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              Create Order
            </button>
            <button className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200">
              <Users className="w-5 h-5" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button className="px-3 py-1.5 bg-blue-500 text-white rounded-full text-sm whitespace-nowrap">
              All
            </button>
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap">
              Bank Transfer
            </button>
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap">
              PayPal
            </button>
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap">
              Credit Card
            </button>
            <button className="px-3 py-1.5 bg-gray-100 rounded-full text-sm whitespace-nowrap">
              USDT
            </button>
          </div>

          {/* P2P Orders List */}
          <div className="space-y-3">
            {p2pOrders.map(order => (
              <P2POrderCard 
                key={order.id} 
                order={order} 
                onTrade={handleTrade}
              />
            ))}
          </div>

          {/* Create Order Modal */}
          <CreateOrderModal 
            isOpen={showCreateOrder}
            onClose={() => setShowCreateOrder(false)}
            onSubmit={handleCreateP2POrder}
          />
        </div>
      )}

      {/* Quick Tips - Visible in both modes */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-4 justify-center">
        {mode === 'regular' ? (
          <>
            <span className="flex items-center gap-1">
              <ArrowUpCircle className="w-3 h-3 text-green-500" />
              Buy at lower price
            </span>
            <span className="flex items-center gap-1">
              <ArrowDownCircle className="w-3 h-3 text-red-500" />
              Sell at higher price
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-blue-500" />
              Check trader ratings
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-yellow-500" />
              Complete within 30 min
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default CryptoTabContent;