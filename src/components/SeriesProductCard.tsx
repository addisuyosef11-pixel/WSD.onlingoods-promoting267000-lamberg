import React from 'react';
import dswLogo from '@/assets/dsw-logo.png';
import { ArrowRight } from 'lucide-react';

interface SeriesProductCardProps {
  id: number;i
  name: string;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  imageUrl?: string | null;
  onBuy: () => void;
}

const SeriesProductCard: React.FC<SeriesProductCardProps> = ({
  name,
  price,
  dailyIncome,
  cycleDays,
  imageUrl,
  onBuy,
}) => {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden mb-4">
      {/* Title */}
      <div className="px-4 py-3 border-b border-border">
        <h3 className="font-bold text-foreground text-lg">{name}</h3>
      </div>

      {/* Content row with image and info */}
      <div className="flex items-start p-4 gap-4">
        {/* Product Image */}
        <div className="w-28 h-24 flex-shrink-0 border border-border rounded-lg overflow-hidden bg-muted">
          <img 
            src={imageUrl || dswLogo} 
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info Grid */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Price :</span>
            <span className="text-primary font-bold">ETB{price.toLocaleString()}.00</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Cycle :</span>
            <span className="text-primary font-bold">{cycleDays} Day</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Daily :</span>
            <span className="text-primary font-bold">ETB{dailyIncome.toLocaleString()}.00</span>
          </div>
        </div>
      </div>

      {/* Buy button only - no progress bar */}
      <div className="px-4 pb-4">
        <button
          onClick={onBuy}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
        >
          <span>Buy</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SeriesProductCard;
