import React from 'react';
import dswLogo from '@/assets/dsw-logo.png';
<<<<<<< HEAD
import { ShoppingCart } from 'lucide-react';

interface SeriesProductCardProps {
  id: number;
=======
import { ArrowRight } from 'lucide-react';

interface SeriesProductCardProps {
  id: number;i
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
  name: string;
  price: number;
  dailyIncome: number;
  cycleDays: number;
  imageUrl?: string | null;
<<<<<<< HEAD
  onAddToCart: () => void; // This will function exactly like the buy button
=======
  onBuy: () => void;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
}

const SeriesProductCard: React.FC<SeriesProductCardProps> = ({
  name,
  price,
  dailyIncome,
  cycleDays,
  imageUrl,
<<<<<<< HEAD
  onAddToCart,
}) => {
  // Calculate total return for the cycle
  const totalReturn = dailyIncome * cycleDays;

  const handleClick = () => {
    // This will trigger the same purchase flow as the buy button
    onAddToCart();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-3 relative">
      {/* Product Image and Name - exactly like ProductCard */}
      <div className="flex gap-3 mb-3">
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <img 
            src={imageUrl || dswLogo} 
            alt={name}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-foreground mb-1">{name}</h3>
        </div>
      </div>

      {/* Product Details Grid - exactly like ProductCard */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        <span className="text-muted-foreground">Price:</span>
        <span className="text-primary font-semibold text-right">{price.toLocaleString()} ETB</span>
        
        <span className="text-muted-foreground">Daily income:</span>
        <span className="text-green-600 font-semibold text-right">{dailyIncome.toLocaleString()} ETB</span>
        
        <span className="text-muted-foreground">Cycle:</span>
        <span className="text-primary font-semibold text-right">{cycleDays} Days</span>
        
        <span className="text-muted-foreground">Total Return:</span>
        <span className="text-green-600 font-semibold text-right bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
          {totalReturn.toLocaleString()} ETB
        </span>
      </div>

      {/* Add to Cart Button - functionally identical to buy button */}
      <button
        onClick={handleClick}
        className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 font-semibold rounded-lg transition-all hover:shadow-lg active:scale-95"
        style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}
      >
        <ShoppingCart className="w-5 h-5 text-white" />
        <span className="text-white font-bold text-sm">Add to Cart</span>
      </button>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
    </div>
  );
};

<<<<<<< HEAD
export default SeriesProductCard;
=======
export default SeriesProductCard;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
