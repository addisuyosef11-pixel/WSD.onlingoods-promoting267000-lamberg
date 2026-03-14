import { Order, OrderBook, Trade, TradingPair } from '@/types/crypto';

class TradingService {
  private pairs: TradingPair[] = [
    {
      symbol: 'BTC/USDT',
      baseAsset: 'BTC',
      quoteAsset: 'USDT',
      minAmount: 0.001,
      maxAmount: 100,
      stepSize: 0.001,
      pricePrecision: 2,
      amountPrecision: 3
    },
    {
      symbol: 'ETH/USDT',
      baseAsset: 'ETH',
      quoteAsset: 'USDT',
      minAmount: 0.01,
      maxAmount: 1000,
      stepSize: 0.01,
      pricePrecision: 2,
      amountPrecision: 2
    },
    {
      symbol: 'BNB/USDT',
      baseAsset: 'BNB',
      quoteAsset: 'USDT',
      minAmount: 0.1,
      maxAmount: 5000,
      stepSize: 0.1,
      pricePrecision: 2,
      amountPrecision: 1
    }
  ];

  private orders: Map<string, Order[]> = new Map();
  private trades: Trade[] = [];
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    // Initialize with sample orders
    this.initializeSampleOrders();
  }

  private initializeSampleOrders() {
    this.pairs.forEach(pair => {
      const bids: Order[] = [];
      const asks: Order[] = [];
      
      // Generate sample buy orders
      for (let i = 0; i < 10; i++) {
        const price = this.getBasePrice(pair.symbol) * (1 - (i + 1) * 0.001);
        const amount = Math.random() * 2 + 0.1;
        bids.push({
          id: `bid-${pair.symbol}-${i}`,
          userId: `user${i}`,
          type: 'buy',
          pair: pair.symbol,
          price,
          amount,
          total: price * amount,
          status: 'open',
          createdAt: new Date(),
          filledAmount: 0
        });
      }

      // Generate sample sell orders
      for (let i = 0; i < 10; i++) {
        const price = this.getBasePrice(pair.symbol) * (1 + (i + 1) * 0.001);
        const amount = Math.random() * 2 + 0.1;
        asks.push({
          id: `ask-${pair.symbol}-${i}`,
          userId: `user${i}`,
          type: 'sell',
          pair: pair.symbol,
          price,
          amount,
          total: price * amount,
          status: 'open',
          createdAt: new Date(),
          filledAmount: 0
        });
      }

      // Sort bids (highest first) and asks (lowest first)
      bids.sort((a, b) => b.price - a.price);
      asks.sort((a, b) => a.price - b.price);

      this.orders.set(pair.symbol, [...bids, ...asks]);
    });
  }

  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'BTC/USDT': 43250,
      'ETH/USDT': 2250,
      'BNB/USDT': 312
    };
    return prices[symbol] || 100;
  }

  // Get order book for a pair
  getOrderBook(pair: string, limit: number = 20): OrderBook {
    const orders = this.orders.get(pair) || [];
    const bids = orders.filter(o => o.type === 'buy' && o.status === 'open')
      .sort((a, b) => b.price - a.price)
      .slice(0, limit);
    const asks = orders.filter(o => o.type === 'sell' && o.status === 'open')
      .sort((a, b) => a.price - b.price)
      .slice(0, limit);

    const basePrice = this.getBasePrice(pair);
    const lastPrice = basePrice;
    const priceChange24h = ((Math.random() * 10) - 5) / 100; // Random -5% to +5%

    return {
      bids,
      asks,
      lastPrice,
      priceChange24h,
      volume24h: basePrice * 1000,
      high24h: basePrice * 1.05,
      low24h: basePrice * 0.95
    };
  }

  // Place a new order
  async placeOrder(order: Omit<Order, 'id' | 'status' | 'createdAt' | 'filledAmount'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}-${Math.random()}`,
      status: 'open',
      createdAt: new Date(),
      filledAmount: 0
    };

    // Try to match the order immediately
    this.matchOrder(newOrder);

    // Add to order book
    const existingOrders = this.orders.get(order.pair) || [];
    this.orders.set(order.pair, [...existingOrders, newOrder]);

    // Notify listeners
    this.notifyListeners(order.pair, 'orderBookUpdate');

    return newOrder;
  }

  // Match orders (simplified matching engine)
  private matchOrder(newOrder: Order) {
    const orders = this.orders.get(newOrder.pair) || [];
    const oppositeType = newOrder.type === 'buy' ? 'sell' : 'buy';
    
    const matchingOrders = orders.filter(o => 
      o.type === oppositeType && 
      o.status === 'open' &&
      (newOrder.type === 'buy' ? o.price <= newOrder.price : o.price >= newOrder.price)
    ).sort((a, b) => newOrder.type === 'buy' ? a.price - b.price : b.price - a.price);

    let remainingAmount = newOrder.amount;

    for (const matchOrder of matchingOrders) {
      if (remainingAmount <= 0) break;

      const matchAmount = Math.min(remainingAmount, matchOrder.amount - matchOrder.filledAmount);
      const matchPrice = matchOrder.price;

      // Create a trade
      const trade: Trade = {
        id: `trade-${Date.now()}-${Math.random()}`,
        pair: newOrder.pair,
        price: matchPrice,
        amount: matchAmount,
        total: matchPrice * matchAmount,
        buyerId: newOrder.type === 'buy' ? newOrder.userId : matchOrder.userId,
        sellerId: newOrder.type === 'sell' ? newOrder.userId : matchOrder.userId,
        buyerOrderId: newOrder.type === 'buy' ? newOrder.id : matchOrder.id,
        sellerOrderId: newOrder.type === 'sell' ? newOrder.id : matchOrder.id,
        timestamp: new Date()
      };

      this.trades.push(trade);

      // Update filled amounts
      matchOrder.filledAmount += matchAmount;
      newOrder.filledAmount += matchAmount;

      if (matchOrder.filledAmount >= matchOrder.amount) {
        matchOrder.status = 'completed';
      } else {
        matchOrder.status = 'partial';
      }

      remainingAmount -= matchAmount;

      // Notify listeners
      this.notifyListeners(newOrder.pair, 'newTrade', trade);
    }

    if (newOrder.filledAmount >= newOrder.amount) {
      newOrder.status = 'completed';
    } else if (newOrder.filledAmount > 0) {
      newOrder.status = 'partial';
    }
  }

  // Get user orders
  getUserOrders(userId: string, pair?: string): Order[] {
    const allOrders: Order[] = [];
    this.orders.forEach((orders, key) => {
      if (!pair || key === pair) {
        allOrders.push(...orders.filter(o => o.userId === userId));
      }
    });
    return allOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Get recent trades
  getRecentTrades(pair: string, limit: number = 50): Trade[] {
    return this.trades
      .filter(t => t.pair === pair)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Get trading pairs
  getTradingPairs(): TradingPair[] {
    return this.pairs;
  }

  // Subscribe to updates
  subscribe(pair: string, event: string, callback: Function) {
    const key = `${pair}:${event}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)?.push(callback);
  }

  // Unsubscribe from updates
  unsubscribe(pair: string, event: string, callback: Function) {
    const key = `${pair}:${event}`;
    const listeners = this.listeners.get(key) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  private notifyListeners(pair: string, event: string, data?: any) {
    const key = `${pair}:${event}`;
    const listeners = this.listeners.get(key) || [];
    listeners.forEach(callback => callback(data));
  }
}

export const tradingService = new TradingService();