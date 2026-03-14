import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Banknote, Megaphone } from 'lucide-react';

interface CommissionItem {
  id: string;
  phone: string;
  amount: number;
  isMock?: boolean;
}

// Mock data for commissions
const mockCommissions: CommissionItem[] = [
  { id: 'mock1', phone: '+2519**4521', amount: 1250, isMock: true },
  { id: 'mock2', phone: '+2517**8934', amount: 3500, isMock: true },
  { id: 'mock3', phone: '+2519**1267', amount: 890, isMock: true },
  { id: 'mock4', phone: '+2517**5643', amount: 2100, isMock: true },
  { id: 'mock5', phone: '+2519**9087', amount: 4750, isMock: true },
  { id: 'mock6', phone: '+2517**3421', amount: 1680, isMock: true },
  { id: 'mock7', phone: '+2519**7854', amount: 5200, isMock: true },
  { id: 'mock8', phone: '+2517**2198', amount: 980, isMock: true },
];

const maskPhone = (phone: string): string => {
  if (!phone || phone.length < 6) return phone;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 9) return phone;
  const lastNine = cleaned.slice(-9);
  return '+251' + lastNine.slice(0, 1) + '**' + lastNine.slice(-4);
};

const RecentCommissions: React.FC = () => {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRealWithdrawals = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('id, amount, user_id, created_at')
        .eq('type', 'withdrawal')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(5);

      const realCommissions: CommissionItem[] = [];

      if (data && data.length > 0) {
        for (const tx of data) {
          // Get user phone
          const { data: profile } = await supabase
            .from('profiles')
            .select('phone')
            .eq('user_id', tx.user_id)
            .single();

          if (profile) {
            realCommissions.push({
              id: tx.id,
              phone: maskPhone(profile.phone),
              amount: tx.amount,
            });
          }
        }
      }

      // Mix real and mock data
      const mixed = [...realCommissions, ...mockCommissions];
      // Shuffle array
      const shuffled = mixed.sort(() => Math.random() - 0.5);
      setCommissions(shuffled);
    };

    fetchRealWithdrawals();
  }, []);

  // Auto-scroll every 2 seconds
  useEffect(() => {
    if (commissions.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % commissions.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [commissions.length]);

  if (commissions.length === 0) return null;

  const visibleItems = [];
  for (let i = 0; i < 3; i++) {
    const index = (currentIndex + i) % commissions.length;
    visibleItems.push(commissions[index]);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-6 overflow-hidden">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-primary" />
        Recent Commissions
      </h3>
      <div ref={containerRef} className="relative h-[120px] overflow-hidden">
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${(currentIndex % commissions.length) * 0}px)` }}
        >
          {visibleItems.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg mb-2 animate-fade-in"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{item.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-green-600">+{item.amount.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">ETB</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentCommissions;
