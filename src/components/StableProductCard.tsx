import React from 'react';
import { useNavigate } from 'react-router-dom';
import dswLogo from '@/assets/dsw-logo.png';

interface StableProductCardProps {
  id: number;
  name: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  totalIncome: number;
  imageUrl?: string | null;
  purchaseLimit?: number;
  discountPercent?: number;
}

const StableProductCard: React.FC<StableProductCardProps> = ({
  id,
  name,
  price,
  dailyIncome,
  validityDays,
  totalIncome,
  imageUrl,
  purchaseLimit = 2,
  discountPercent,
}) => {
  const navigate = useNavigate();
  const percent = discountPercent || (50 + id * 5);

  return (
    <div 
      onClick={() => navigate(`/vip/${id}`)}
      className="bg-card rounded-lg border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Header with title */}
      <div className="px-3 py-2 bg-black">
        <h3 className="font-bold text-amber-400 text-sm">{name}</h3>
      </div>

      {/* Content row with image and info */}
      <div className="flex items-start p-3 gap-3">
        {/* Product Image */}
        <div className="w-16 h-16 flex-shrink-0">
          <img 
            src={imageUrl || dswLogo} 
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info Grid */}
        <div className="flex-1 space-y-0.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="text-primary font-bold">{price.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Daily income:</span>
            <span className="text-primary font-bold">{dailyIncome.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validity period:</span>
            <span className="text-primary font-bold">{validityDays} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total income:</span>
            <span className="text-primary font-bold">{totalIncome.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Purchase limit:</span>
            <span className="text-primary font-bold">{purchaseLimit}</span>
          </div>
        </div>
      </div>

      {/* Progress bar with percentage badge */}
      <div className="px-3 pb-4 pt-2">
        <div className="relative">
          <div className="h-3 bg-gradient-to-r from-pink-400 via-purple-400 to-purple-500 rounded-full shadow-inner" />
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5">
            <span className="bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
              {percent}%
            </span>
          </div>
        </div>
      </div>
      <div className="h-2" /> {/* Spacer for badge */}
    </div>
  );
};

export default StableProductCard;
