import React, { useState, useEffect } from 'react';
import {
  Bitcoin, Search, Filter, Star, Shield, Clock,
  ChevronDown, Plus, X, CheckCircle, AlertCircle,
  MessageCircle, Users, DollarSign, TrendingUp, Wallet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { p2pService } from '@/services/p2pService';
import { P2POrder, Trade, PaymentMethod } from '@/types/p2p';
import P2PChat from './P2PChat';
import { Spinner } from './Spinner';

const P2PTrading: React.FC = () => {
  const { user, profile, loading } = useAuth(); // Get profile with balance
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<P2POrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTradeTab, setActiveTradeTab] = useState<'ongoing' | 'completed'>('ongoing');

  // New order form state
  const [newOrder, setNewOrder] = useState({
    type: 'sell' as 'buy' | 'sell',
    price: '',
    amount: '',
    minAmount: '',
    maxAmount: '',
    paymentMethods: [] as string[],
    terms: ''
  });

  // Balance from profile
  const userBalance = profile?.balance || 0;
  const userWithdrawable = profile?.withdrawable_balance || 0;

  useEffect(() => {
    loadOrders();
    if (user) {
      loadUserTrades();
      p2pService.connect(user.id);
    }

    // Subscribe to updates
    p2pService.subscribe('newTrade', handleNewTrade);
    p2pService.subscribe('tradeUpdate', handleTradeUpdate);

    return () => {
      p2pService.unsubscribe('newTrade', handleNewTrade);
      p2pService.unsubscribe('tradeUpdate', handleTradeUpdate);
      p2pService.disconnect();
    };
  }, [selectedCrypto, activeTab, user]);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, selectedPayment]);

  const loadOrders = () => {
    const type = activeTab === 'buy' ? 'sell' : 'buy';
    const fetchedOrders = p2pService.getOrders(selectedCrypto, type);
    setOrders(fetchedOrders);
  };

  const loadUserTrades = () => {
    if (user) {
      const trades = p2pService.getUserTrades(user.id);
      setUserTrades(trades);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.paymentMethods.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedPayment !== 'all') {
      filtered = filtered.filter(order =>
        order.paymentMethods.some(p => p.type === selectedPayment)
      );
    }

    setFilteredOrders(filtered);
  };

  const handleNewTrade = (trade: Trade) => {
    if (user && (trade.buyer.id === user.id || trade.seller.id === user.id)) {
      setUserTrades(prev => [trade, ...prev]);
    }
  };

  const handleTradeUpdate = (trade: Trade) => {
    setUserTrades(prev => prev.map(t => t.id === trade.id ? trade : t));
    if (selectedTrade?.id === trade.id) {
      setSelectedTrade(trade);
    }
  };

  const handleCreateOrder = async () => {
    if (!user || !profile) {
      alert('Please login to create an order');
      return;
    }

    // Check if user has sufficient balance for sell orders
    if (newOrder.type === 'sell') {
      const amount = parseFloat(newOrder.amount);
      if (amount > userBalance) {
        alert(`Insufficient balance. Your balance: ${userBalance.toLocaleString()} ETB`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const order = await p2pService.createOrder({
        user: {
          id: user.id,
          name: profile.name,
          verified: profile.current_vip_level > 0, // VIP users are verified
          rating: 5.0,
          totalTrades: 0,
          completionRate: 100,
          joinDate: new Date()
        },
        type: newOrder.type,
        crypto: { symbol: selectedCrypto, network: 'Bitcoin' },
        fiat: { currency: 'USD', symbol: '$' },
        price: parseFloat(newOrder.price),
        available: parseFloat(newOrder.amount),
        minAmount: parseFloat(newOrder.minAmount),
        maxAmount: parseFloat(newOrder.maxAmount),
        paymentMethods: [], // Add selected payment methods
        terms: newOrder.terms,
        tags: profile.current_vip_level > 0 ? ['VIP Trader'] : ['New Trader']
      });

      setShowCreateOrder(false);
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTrade = async (order: P2POrder) => {
    if (!user) {
      alert('Please login to trade');
      return;
    }

    // Check if user has sufficient balance for buying
    if (order.type === 'sell') { // User is buying from seller
      const estimatedTotal = order.price * order.minAmount;
      if (estimatedTotal > userBalance) {
        alert(`Insufficient balance. You need approximately $${estimatedTotal.toFixed(2)} USDT. Your balance: $${(userBalance * 0.031).toFixed(2)} USDT`);
        return;
      }
    }

    const amount = order.minAmount;
    const trade = await p2pService.startTrade(order.id, user.id, amount);
    if (trade) {
      setSelectedTrade(trade);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Convert ETB to USD (approximate rate)
  const etbToUsd = (etb: number) => (etb * 0.031).toFixed(2);

  const ongoingTrades = userTrades.filter(t => 
    t.status !== 'completed' && t.status !== 'cancelled'
  );
  const completedTrades = userTrades.filter(t => 
    t.status === 'completed' || t.status === 'cancelled'
  );

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
      {/* Left Column - Orders List */}
      <div className="col-span-4 bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col">
        {/* Header with Balance */}
        <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-lg">P2P Trading</h2>
            <div className="flex items-center gap-2">
              <div className="bg-white px-3 py-1.5 rounded-lg shadow-sm">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Balance:
                </span>
                <span className="font-bold text-sm">{userBalance.toLocaleString()} ETB</span>
                <span className="text-xs text-gray-500 ml-1">≈ ${etbToUsd(userBalance)}</span>
              </div>
              <button
                onClick={() => setShowCreateOrder(true)}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm flex items-center gap-1 hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Create
              </button>
            </div>
          </div>

          {/* Crypto Selector */}
          <div className="flex gap-2 mb-3">
            {['BTC', 'ETH', 'USDT', 'BNB'].map(crypto => (
              <button
                key={crypto}
                onClick={() => setSelectedCrypto(crypto)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCrypto === crypto
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {crypto}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search traders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border rounded-lg text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedPayment('all')}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap ${
                selectedPayment === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {['bank', 'paypal', 'cashapp', 'wise'].map(method => (
              <button
                key={method}
                onClick={() => setSelectedPayment(method)}
                className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex items-center gap-1 ${
                  selectedPayment === method
                    ? 'bg-blue-500 text-white'
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                {method === 'bank' && '🏦'}
                {method === 'paypal' && '📧'}
                {method === 'cashapp' && '💵'}
                {method === 'wise' && '🌍'}
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-gray-50 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleStartTrade(order)}
            >
              {/* User Info */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {order.user.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-sm">{order.user.name}</span>
                      {order.user.verified && (
                        <Shield className="w-3 h-3 text-blue-500" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span>{order.user.rating}</span>
                      <span>•</span>
                      <span>{order.user.totalTrades} trades</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  order.type === 'sell'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {order.type === 'sell' ? 'SELLING' : 'BUYING'}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-bold">${formatNumber(order.price)}</span>
                <span className="text-xs text-gray-500">{order.crypto.symbol}</span>
              </div>

              {/* Limits */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Available: {order.available} {order.crypto.symbol}</span>
                <span className="text-gray-500">Limits: ${order.minAmount} - ${order.maxAmount}</span>
              </div>

              {/* Payment Methods */}
              <div className="flex gap-1 mb-2">
                {order.paymentMethods.map(pm => (
                  <span
                    key={pm.id}
                    className="px-2 py-1 bg-gray-200 rounded text-xs flex items-center gap-1"
                  >
                    {pm.icon} {pm.type}
                  </span>
                ))}
              </div>

              {/* Tags */}
              <div className="flex gap-1">
                {order.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Column - Trade Details & Chat */}
      <div className="col-span-5 bg-white rounded-xl shadow-lg border overflow-hidden">
        {selectedTrade ? (
          <P2PChat trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="w-16 h-16 text-gray-300 mb-3" />
            <h3 className="font-medium text-gray-700 mb-1">No Trade Selected</h3>
            <p className="text-sm text-gray-500 max-w-xs">
              Select a trade from the list to start chatting with the trader
            </p>
          </div>
        )}
      </div>

      {/* Right Column - My Trades */}
      <div className="col-span-3 bg-white rounded-xl shadow-lg border overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
          <h2 className="font-bold text-lg mb-3">My Trades</h2>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTradeTab('ongoing')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                activeTradeTab === 'ongoing'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Ongoing ({ongoingTrades.length})
            </button>
            <button
              onClick={() => setActiveTradeTab('completed')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg ${
                activeTradeTab === 'completed'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              History ({completedTrades.length})
            </button>
          </div>
        </div>

        {/* Trades List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {(activeTradeTab === 'ongoing' ? ongoingTrades : completedTrades).map(trade => {
            const isBuyer = user?.id === trade.buyer.id;
            const otherParty = isBuyer ? trade.seller : trade.buyer;

            return (
              <div
                key={trade.id}
                onClick={() => setSelectedTrade(trade)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTrade?.id === trade.id
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                      {otherParty.name[0]}
                    </div>
                    <span className="text-sm font-medium">{otherParty.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    trade.status === 'completed' ? 'bg-green-100 text-green-700' :
                    trade.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    trade.status === 'paid' ? 'bg-blue-100 text-blue-700' :
                    trade.status === 'disputed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {trade.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-1">
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-1 font-medium">{trade.crypto.amount} {trade.crypto.symbol}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-1 font-medium">${trade.fiat.amount.toLocaleString()}</span>
                  </div>
                </div>

                {trade.status === 'pending' && (
                  <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>Expires in {Math.floor((trade.expiresAt.getTime() - Date.now()) / 60000)} min</span>
                  </div>
                )}
              </div>
            );
          })}

          {userTrades.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">
              No trades yet. Start trading!
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Create P2P Order</h3>
              <button
                onClick={() => setShowCreateOrder(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Balance Display in Modal */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Your Balance:</span>
                <span className="font-bold text-blue-600">{userBalance.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-500">≈ USD:</span>
                <span className="text-xs font-medium">${etbToUsd(userBalance)}</span>
              </div>
            </div>

            <div className="space-y-4">
              {/* Type Selector */}
              <div className="flex rounded-lg overflow-hidden border">
                <button
                  onClick={() => setNewOrder({...newOrder, type: 'sell'})}
                  className={`flex-1 py-2 text-sm font-medium ${
                    newOrder.type === 'sell'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Sell
                </button>
                <button
                  onClick={() => setNewOrder({...newOrder, type: 'buy'})}
                  className={`flex-1 py-2 text-sm font-medium ${
                    newOrder.type === 'buy'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Buy
                </button>
              </div>

              {/* Price */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Price (USD)</label>
                <input
                  type="number"
                  value={newOrder.price}
                  onChange={(e) => setNewOrder({...newOrder, price: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Amount ({selectedCrypto})</label>
                <input
                  type="number"
                  value={newOrder.amount}
                  onChange={(e) => setNewOrder({...newOrder, amount: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {newOrder.type === 'sell' && parseFloat(newOrder.amount) > userBalance && (
                  <p className="text-xs text-red-500 mt-1">
                    Insufficient balance! Max: {userBalance.toLocaleString()} ETB
                  </p>
                )}
              </div>

              {/* Limits */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Min Amount</label>
                  <input
                    type="number"
                    value={newOrder.minAmount}
                    onChange={(e) => setNewOrder({...newOrder, minAmount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">Max Amount</label>
                  <input
                    type="number"
                    value={newOrder.maxAmount}
                    onChange={(e) => setNewOrder({...newOrder, maxAmount: e.target.value})}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">Terms & Conditions</label>
                <textarea
                  value={newOrder.terms}
                  onChange={(e) => setNewOrder({...newOrder, terms: e.target.value})}
                  placeholder="Enter your trading terms..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg resize-none"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleCreateOrder}
                disabled={isLoading || (newOrder.type === 'sell' && parseFloat(newOrder.amount) > userBalance)}
                className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default P2PTrading;