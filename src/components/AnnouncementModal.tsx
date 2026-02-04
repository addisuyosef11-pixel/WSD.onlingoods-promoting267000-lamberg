import React from 'react';
import { X } from 'lucide-react';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="py-4 px-6 border-b border-border">
          <h2 className="text-center text-primary text-xl font-bold">Announcement</h2>
        </div>
        
        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <h3 className="text-foreground font-bold text-lg mb-4">Weekly Bonus Fund Settlement</h3>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            Every Sunday, every member has a chance to receive an exclusive Weekly Bonus Fund, which will generate a steady passive income.
          </p>
          
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            For example: If your account is at Level 2, you'll receive 150 ETB per week, 600 ETB per month (4 weeks), and 7200 ETB per year (52 weeks).
          </p>
          
          <p className="text-foreground text-sm font-semibold mb-4">
            * If you reach Level 7, you'll receive 5,000 ETB per week, 20,000 ETB per month (4 weeks), and a whopping 240,000 ETB per year (52 weeks) 💰💰! *
          </p>
          
          <p className="text-muted-foreground text-sm leading-relaxed">
            This means the sooner you level up, the sooner you can accumulate wealth! 🎯 Seize the opportunity to level up and reap the rewards! 💪🚀
          </p>
        </div>
        
        {/* Button */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
        
        {/* Close button at bottom center */}
        <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
