import React, { useState, useEffect } from 'react';

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  totalIncome: number;
  purchaseLimit: number;
  progressPercent: number;
  soldOutTime?: Date;
  onInvest: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  image,
  price,
  dailyIncome,
  validityDays,
  totalIncome,
  purchaseLimit,
  progressPercent,
  soldOutTime,
  onInvest,
}) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!soldOutTime) return;

    const updateTimer = () => {
      const now = new Date();
      const diff = soldOutTime.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [soldOutTime]);

  return (
    <div className="bg-card rounded-lg border border-border p-4 mb-4">
      {/* Header with name and countdown */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-bold text-foreground">{name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">Sold out time</span>
          <div className="flex gap-0.5">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="bg-primary text-primary-foreground text-xs font-bold px-1.5 py-0.5 rounded">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Content with image and details */}
      <div className="flex gap-4">
        <div className="w-28 h-20 flex-shrink-0">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain"
          />
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Price:</span>
          <span className="text-primary font-semibold text-right">{price.toLocaleString()} ETB</span>
          
          <span className="text-muted-foreground">Daily income:</span>
          <span className="text-primary font-semibold text-right">{dailyIncome.toLocaleString()} ETB</span>
          
          <span className="text-muted-foreground">Validity period:</span>
          <span className="text-primary font-semibold text-right">{validityDays} Days</span>
          
          <span className="text-muted-foreground">Total income:</span>
          <span className="text-primary font-semibold text-right">{totalIncome.toLocaleString()} ETB</span>
          
          <span className="text-muted-foreground">Purchase limit:</span>
          <span className="text-primary font-semibold text-right">{purchaseLimit}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4 relative">
        <div className="h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 rounded-full overflow-hidden">
          <div 
            className="h-full bg-transparent"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div 
          className="absolute -top-1 transform -translate-x-1/2"
          style={{ left: `${progressPercent}%` }}
        >
          <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Invest button */}
      <button
        onClick={onInvest}
        className="w-full mt-4 py-2 bg-gradient-to-r from-purple-500 to-primary text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
      >
        Invest
      </button>
    </div>
  );
};

export default ProductCard;
