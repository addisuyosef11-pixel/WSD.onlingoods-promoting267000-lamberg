import { io, Socket } from 'socket.io-client';
import { P2POrder, Trade, ChatMessage, User, PaymentMethod, Dispute, Rating } from '@/types/p2p';

class P2PService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private orders: Map<string, P2POrder[]> = new Map();
  private trades: Map<string, Trade> = new Map();
  private chats: Map<string, ChatMessage[]> = new Map();
  private disputes: Map<string, Dispute> = new Map();
  private ratings: Rating[] = [];

  constructor() {
    this.initializeSocket();
    this.initializeSampleData();
  }

  private initializeSocket() {
    // In production, use your actual WebSocket server URL
    this.socket = io('wss://your-server.com/p2p', {
      transports: ['websocket'],
      autoConnect: false
    });

    this.socket.on('connect', () => {
      console.log('P2P WebSocket connected');
    });

    this.socket.on('newTrade', (trade: Trade) => {
      this.notifyListeners('newTrade', trade);
    });

    this.socket.on('newMessage', (data: { tradeId: string; message: ChatMessage }) => {
      const messages = this.chats.get(data.tradeId) || [];
      this.chats.set(data.tradeId, [...messages, data.message]);
      this.notifyListeners('newMessage', data);
    });

    this.socket.on('tradeUpdate', (trade: Trade) => {
      this.trades.set(trade.id, trade);
      this.notifyListeners('tradeUpdate', trade);
    });
  }

  connect(userId: string) {
    if (this.socket && !this.socket.connected) {
      this.socket.auth = { userId };
      this.socket.connect();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private initializeSampleData() {
    // Sample users
    const users: User[] = [
      {
        id: 'user1',
        name: 'CryptoKing',
        verified: true,
        rating: 4.9,
        totalTrades: 1250,
        completionRate: 99.8,
        joinDate: new Date('2023-01-15')
      },
      {
        id: 'user2',
        name: 'BTCWhale',
        verified: true,
        rating: 4.8,
        totalTrades: 890,
        completionRate: 99.5,
        joinDate: new Date('2023-03-20')
      },
      {
        id: 'user3',
        name: 'StableTrader',
        verified: false,
        rating: 4.7,
        totalTrades: 234,
        completionRate: 98.2,
        joinDate: new Date('2023-08-10')
      }
    ];

    // Sample payment methods
    const paymentMethods: PaymentMethod[] = [
      {
        id: 'pm1',
        type: 'bank',
        name: 'Bank Transfer',
        details: 'Chase Bank •••• 1234',
        icon: '🏦',
        currency: 'USD',
        timeLimit: 30
      },
      {
        id: 'pm2',
        type: 'paypal',
        name: 'PayPal',
        details: 'verified@email.com',
        icon: '📧',
        currency: 'USD',
        timeLimit: 15
      },
      {
        id: 'pm3',
        type: 'cashapp',
        name: 'Cash App',
        details: '$cryptoking',
        icon: '💵',
        currency: 'USD',
        timeLimit: 10
      }
    ];

    // Sample orders
    const sampleOrders: P2POrder[] = [
      {
        id: 'order1',
        user: users[0],
        type: 'sell',
        crypto: { symbol: 'BTC', network: 'Bitcoin' },
        fiat: { currency: 'USD', symbol: '$' },
        price: 43250,
        available: 2.5,
        minAmount: 50,
        maxAmount: 5000,
        paymentMethods: [paymentMethods[0], paymentMethods[1]],
        terms: 'Only verified users. Fast payment required.',
        status: 'open',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        tags: ['Fast Trader', 'Verified', 'VIP']
      },
      {
        id: 'order2',
        user: users[1],
        type: 'buy',
        crypto: { symbol: 'ETH', network: 'Ethereum' },
        fiat: { currency: 'USD', symbol: '$' },
        price: 2250,
        available: 15,
        minAmount: 100,
        maxAmount: 10000,
        paymentMethods: [paymentMethods[1], paymentMethods[2]],
        terms: 'Instant payment. High reputation only.',
        status: 'open',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        tags: ['Premium', 'Instant', 'High Volume']
      },
      {
        id: 'order3',
        user: users[2],
        type: 'sell',
        crypto: { symbol: 'USDT', network: 'TRC20' },
        fiat: { currency: 'USD', symbol: '$' },
        price: 1.01,
        available: 50000,
        minAmount: 20,
        maxAmount: 2000,
        paymentMethods: [paymentMethods[0], paymentMethods[2]],
        terms: 'TRC20 network only. Minimum 20 USDT.',
        status: 'open',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        tags: ['Stable Coin', 'Low Fee']
      }
    ];

    this.orders.set('BTC', sampleOrders.filter(o => o.crypto.symbol === 'BTC'));
    this.orders.set('ETH', sampleOrders.filter(o => o.crypto.symbol === 'ETH'));
    this.orders.set('USDT', sampleOrders.filter(o => o.crypto.symbol === 'USDT'));
  }

  // Get orders by crypto and type
  getOrders(crypto: string, type?: 'buy' | 'sell'): P2POrder[] {
    const cryptoOrders = this.orders.get(crypto) || [];
    let filtered = cryptoOrders.filter(o => o.status === 'open');
    if (type) {
      filtered = filtered.filter(o => o.type === type);
    }
    return filtered.sort((a, b) => b.price - a.price);
  }

  // Create new order
  async createOrder(order: Omit<P2POrder, 'id' | 'status' | 'createdAt' | 'expiresAt'>): Promise<P2POrder> {
    const newOrder: P2POrder = {
      ...order,
      id: `order-${Date.now()}-${Math.random()}`,
      status: 'open',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const cryptoOrders = this.orders.get(order.crypto.symbol) || [];
    this.orders.set(order.crypto.symbol, [newOrder, ...cryptoOrders]);
    
    if (this.socket) {
      this.socket.emit('newOrder', newOrder);
    }
    
    return newOrder;
  }

  // Start a trade
  async startTrade(orderId: string, buyerId: string, amount: number): Promise<Trade | null> {
    let foundOrder: P2POrder | null = null;
    
    for (const [_, orders] of this.orders) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        foundOrder = order;
        break;
      }
    }

    if (!foundOrder) return null;

    const trade: Trade = {
      id: `trade-${Date.now()}-${Math.random()}`,
      orderId: foundOrder.id,
      buyer: foundOrder.type === 'sell' ? { id: buyerId, name: 'Buyer' } as User : foundOrder.user,
      seller: foundOrder.type === 'sell' ? foundOrder.user : { id: buyerId, name: 'Seller' } as User,
      crypto: {
        symbol: foundOrder.crypto.symbol,
        amount: amount,
        network: foundOrder.crypto.network
      },
      fiat: {
        currency: foundOrder.fiat.currency,
        amount: amount * foundOrder.price,
        price: foundOrder.price
      },
      paymentMethod: foundOrder.paymentMethods[0],
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      chatId: `chat-${Date.now()}`,
      escrowId: `escrow-${Date.now()}`
    };

    this.trades.set(trade.id, trade);
    this.chats.set(trade.chatId, []);
    
    if (this.socket) {
      this.socket.emit('newTrade', trade);
    }
    
    return trade;
  }

  // Get trade by ID
  getTrade(tradeId: string): Trade | undefined {
    return this.trades.get(tradeId);
  }

  // Get user trades
  getUserTrades(userId: string): Trade[] {
    const userTrades: Trade[] = [];
    this.trades.forEach(trade => {
      if (trade.buyer.id === userId || trade.seller.id === userId) {
        userTrades.push(trade);
      }
    });
    return userTrades.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Update trade status
  async updateTradeStatus(tradeId: string, status: Trade['status']): Promise<Trade | undefined> {
    const trade = this.trades.get(tradeId);
    if (!trade) return undefined;

    trade.status = status;
    
    switch (status) {
      case 'paid':
        trade.paidAt = new Date();
        await this.addSystemMessage(tradeId, 'Buyer has marked payment as sent');
        break;
      case 'confirmed':
        trade.confirmedAt = new Date();
        await this.addSystemMessage(tradeId, 'Seller has confirmed receipt');
        break;
      case 'completed':
        trade.completedAt = new Date();
        await this.addSystemMessage(tradeId, 'Trade completed successfully');
        break;
      case 'disputed':
        await this.addSystemMessage(tradeId, 'Trade has been disputed');
        break;
    }

    if (this.socket) {
      this.socket.emit('tradeUpdate', trade);
    }
    
    return trade;
  }

  // Send message
  async sendMessage(tradeId: string, userId: string, userName: string, message: string, type: 'text' | 'image' = 'text', imageUrl?: string): Promise<ChatMessage> {
    const trade = this.trades.get(tradeId);
    if (!trade) throw new Error('Trade not found');

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      tradeId,
      userId,
      userName,
      message,
      timestamp: new Date(),
      read: false,
      type,
      imageUrl
    };

    const messages = this.chats.get(trade.chatId) || [];
    this.chats.set(trade.chatId, [...messages, newMessage]);

    if (this.socket) {
      this.socket.emit('newMessage', { tradeId, message: newMessage });
    }

    return newMessage;
  }

  // Add system message
  private async addSystemMessage(tradeId: string, message: string) {
    const trade = this.trades.get(tradeId);
    if (!trade) return;

    const systemMessage: ChatMessage = {
      id: `sys-${Date.now()}`,
      tradeId,
      userId: 'system',
      userName: 'System',
      message,
      timestamp: new Date(),
      read: true,
      type: 'system'
    };

    const messages = this.chats.get(trade.chatId) || [];
    this.chats.set(trade.chatId, [...messages, systemMessage]);
  }

  // Get chat messages
  getChatMessages(tradeId: string): ChatMessage[] {
    const trade = this.trades.get(tradeId);
    if (!trade) return [];
    return this.chats.get(trade.chatId) || [];
  }

  // Mark messages as read
  markMessagesAsRead(tradeId: string, userId: string) {
    const trade = this.trades.get(tradeId);
    if (!trade) return;

    const messages = this.chats.get(trade.chatId) || [];
    messages.forEach(msg => {
      if (msg.userId !== userId) {
        msg.read = true;
      }
    });
  }

  // Create dispute
  async createDispute(tradeId: string, userId: string, reason: string, evidence: string[]): Promise<Dispute> {
    const dispute: Dispute = {
      id: `dispute-${Date.now()}`,
      tradeId,
      raisedBy: userId,
      reason,
      evidence,
      status: 'open',
      createdAt: new Date()
    };

    this.disputes.set(dispute.id, dispute);
    await this.updateTradeStatus(tradeId, 'disputed');
    await this.addSystemMessage(tradeId, `Dispute raised: ${reason}`);

    return dispute;
  }

  // Add rating
  async addRating(tradeId: string, fromUserId: string, toUserId: string, rating: number, comment: string): Promise<Rating> {
    const newRating: Rating = {
      id: `rating-${Date.now()}`,
      tradeId,
      fromUserId,
      toUserId,
      rating,
      comment,
      createdAt: new Date()
    };

    this.ratings.push(newRating);
    return newRating;
  }

  // Subscribe to events
  subscribe(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  // Unsubscribe from events
  unsubscribe(event: string, callback: Function) {
    const listeners = this.listeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  private notifyListeners(event: string, data?: any) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }
}

export const p2pService = new P2PService();