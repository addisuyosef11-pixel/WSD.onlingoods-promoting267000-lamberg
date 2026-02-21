export interface Order {
  id: string;
  userId: string;
  type: 'buy' | 'sell';
  pair: string;
  price: number;
  amount: number;
  total: number;
  status: 'open' | 'partial' | 'completed' | 'cancelled';
  createdAt: Date;
  filledAmount: number;
}

export interface Trade {
  id: string;
  pair: string;
  price: number;
  amount: number;
  total: number;
  buyerId: string;
  sellerId: string;
  buyerOrderId: string;
  sellerOrderId: string;
  timestamp: Date;
}

export interface OrderBook {
  bids: Order[]; // Buy orders
  asks: Order[]; // Sell orders
  lastPrice: number;
  priceChange24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  minAmount: number;
  maxAmount: number;
  stepSize: number;
  pricePrecision: number;
  amountPrecision: number;
}