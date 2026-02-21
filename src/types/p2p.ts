export interface User {
  id: string;
  name: string;
  avatar?: string;
  verified: boolean;
  rating: number;
  totalTrades: number;
  completionRate: number;
  joinDate: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'paypal' | 'venmo' | 'cashapp' | 'wise' | 'crypto';
  name: string;
  details: string;
  icon: string;
  currency: string;
  timeLimit: number; // minutes
}

export interface P2POrder {
  id: string;
  user: User;
  type: 'buy' | 'sell';
  crypto: {
    symbol: string;
    network: string;
  };
  fiat: {
    currency: string;
    symbol: string;
  };
  price: number;
  available: number;
  minAmount: number;
  maxAmount: number;
  paymentMethods: PaymentMethod[];
  terms: string;
  status: 'open' | 'partial' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  tags: string[];
}

export interface Trade {
  id: string;
  orderId: string;
  buyer: User;
  seller: User;
  crypto: {
    symbol: string;
    amount: number;
    network: string;
  };
  fiat: {
    currency: string;
    amount: number;
    price: number;
  };
  paymentMethod: PaymentMethod;
  status: 'pending' | 'paid' | 'confirmed' | 'disputed' | 'completed' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  completedAt?: Date;
  chatId: string;
  escrowId: string;
}

export interface ChatMessage {
  id: string;
  tradeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'system' | 'payment';
  imageUrl?: string;
  metadata?: any;
}

export interface Dispute {
  id: string;
  tradeId: string;
  raisedBy: string;
  reason: string;
  evidence: string[];
  status: 'open' | 'resolved' | 'cancelled';
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface Rating {
  id: string;
  tradeId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}