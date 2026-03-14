import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dswLogo from '@/assets/dsw-logo.png';

interface VipCarouselItem {
  id: number;
  name: string;
  price: number;
  dailyIncome: number;
  validityDays: number;
  totalIncome: number;
  purchaseLimit: number;
  discountPercent: number;
  image: string | null;
  imageUrl: string | null;
  soldOutTime: Date;
}

interface VipCarouselProps {
  items: VipCarouselItem[];
  onInvest: (itemId: number) => void;
}

const VipCarouselCard: React.FC<{
  item: VipCarouselItem;
}> = ({ item }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = item.soldOutTime.getTime() - now.getTime();
      
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
  }, [item.soldOutTime]);

  return (
    <div 
      className="w-full bg-card rounded-lg border border-border overflow-hidden cursor-pointer"
      onClick={() => navigate(`/vip/${item.id}`)}
    >
      {/* Header row with title and timer */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-bold text-foreground text-lg">{item.name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm mr-1">Sold out time</span>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Content row with image and info */}
      <div className="flex items-center p-4 gap-4">
        {/* Product Image */}
        <div className="w-32 h-32 flex-shrink-0">
          <img 
            src={item.imageUrl || dswLogo} 
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Info Grid */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Price</span>
            <span className="text-primary font-bold text-sm">{item.price.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Daily income</span>
            <span className="text-primary font-bold text-sm">{item.dailyIncome.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Validity period</span>
            <span className="text-primary font-bold text-sm">{item.validityDays} Days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Total income</span>
            <span className="text-primary font-bold text-sm">{item.totalIncome.toLocaleString()} ETB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-sm">Purchase limit</span>
            <span className="text-primary font-bold text-sm">{item.purchaseLimit}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const VipCarousel: React.FC<VipCarouselProps> = ({ items, onInvest }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full flex-shrink-0">
              <VipCarouselCard item={item} />
            </div>
          ))}
        </div>
      </div>
      
      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default VipCarousel;
