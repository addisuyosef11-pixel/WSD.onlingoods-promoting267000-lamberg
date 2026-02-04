import React from 'react';
import { Crown, Star, Zap, Diamond, Gem, Lock, Unlock, Play, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import dswLogo from '@/assets/dsw-logo.png';

interface VipCardProps {
  level: number;
  name: string;
  price: number;
  description: string;
  taskCount: number;
  isOwned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  onStart: () => void;
}

const vipIcons = [Crown, Star, Zap, Diamond, Gem];
const vipBgColors = [
  'bg-gradient-to-br from-amber-50 to-amber-100',
  'bg-gradient-to-br from-orange-50 to-orange-100',
  'bg-gradient-to-br from-purple-50 to-purple-100',
  'bg-gradient-to-br from-cyan-50 to-cyan-100',
  'bg-gradient-to-br from-yellow-50 to-yellow-100',
];

export const VipCard: React.FC<VipCardProps> = ({
  level,
  name,
  price,
  description,
  taskCount,
  isOwned,
  canAfford,
  onPurchase,
  onStart,
}) => {
  const IconComponent = vipIcons[level - 1] || Crown;
  const bgColor = vipBgColors[level - 1] || vipBgColors[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${bgColor} border border-border p-4 transition-all duration-300 hover:shadow-lg`}
    >
      {/* Square Layout */}
      <div className="flex flex-col h-full">
        {/* Top Row: Logo + Level Badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
            <img 
              src={dswLogo} 
              alt="DSW" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/80 rounded-full shadow-sm">
            <IconComponent className="w-4 h-4 text-primary" />
            {isOwned ? (
              <Unlock className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-foreground mb-2">{name}</h3>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-sm font-bold text-foreground">{price.toLocaleString()} ETB</p>
          </div>
          <div className="p-2 bg-white/60 rounded-lg">
            <p className="text-xs text-muted-foreground">Tasks</p>
            <div className="flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-bold text-foreground">{taskCount} Tasks</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-xs mb-3 line-clamp-2 flex-1">{description}</p>

        {/* Action Button */}
        <div className="mt-auto">
          {isOwned ? (
            <Button
              onClick={onStart}
              size="sm"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md"
            >
              <Play className="w-4 h-4 mr-1.5" />
              Start Work
            </Button>
          ) : (
            <Button
              onClick={onPurchase}
              disabled={!canAfford}
              size="sm"
              variant={canAfford ? 'default' : 'secondary'}
              className={canAfford ? 'w-full primary-gradient text-primary-foreground font-semibold shadow-md' : 'w-full'}
            >
              {canAfford ? 'Upgrade Level' : 'Insufficient'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
