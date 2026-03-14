import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/Spinner';
import { ArrowDownToLine, ArrowUpFromLine, Crown, History, X } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'withdrawal' | 'deposit' | 'vip_purchase';

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user || !isOpen) return;

      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data } = await query.limit(50);
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [user, isOpen, filter]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowDownToLine className="w-5 h-5 text-white" />;
      case 'deposit':
        return <ArrowUpFromLine className="w-5 h-5 text-white" />;
      case 'vip_purchase':
        return <Crown className="w-5 h-5 text-white" />;
      default:
        return <History className="w-5 h-5 text-white" />;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return 'bg-gradient-to-br from-red-400 to-red-500';
      case 'deposit':
        return 'bg-gradient-to-br from-green-500 to-[#7acc00]';
      case 'vip_purchase':
        return 'bg-gradient-to-br from-[#7acc00] to-[#B0FC38]';
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500';
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'withdrawal':
      case 'vip_purchase':
        return 'text-red-500';
      case 'deposit':
      case 'referral_bonus':
      case 'gift':
        return 'text-[#7acc00]';
      default:
        return 'text-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700 border border-green-200',
      pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      failed: 'bg-red-100 text-red-700 border border-red-200',
      rejected: 'bg-red-100 text-red-700 border border-red-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const formatType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filterButtons: { label: string; value: FilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Withdraw', value: 'withdrawal' },
    { label: 'Deposit', value: 'deposit' },
    { label: 'VIP', value: 'vip_purchase' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Green Gradient Header */}
        <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          <div className="px-6 pt-6 pb-8 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-white" />
                <DialogTitle className="text-white font-bold text-lg">
                  Transaction History
                </DialogTitle>
              </div>
              <button 
                onClick={onClose}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
          {/* Wave SVG */}
          <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" style={{ height: '20px' }}>
            <path d="M0,20 C360,60 720,0 1080,40 C1260,55 1380,25 1440,30 L1440,60 L0,60 Z" fill="hsl(var(--card))" />
          </svg>
        </div>

        <div className="p-6 pt-4">
          {/* Filter Tabs - Order page style */}
          <div className="flex rounded-full p-1 mb-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
            {filterButtons.map((btn) => (
              <button
                key={btn.value}
                onClick={() => setFilter(btn.value)}
                className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                  filter === btn.value
                    ? 'bg-white text-[#2d3a2d] shadow-sm'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Transaction List */}
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl hover:shadow-sm transition-all"
                >
                  <div className={`w-10 h-10 rounded-xl ${getIconBackground(tx.type)} flex items-center justify-center shadow-sm`}>
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">
                        {formatType(tx.type)}
                      </p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getStatusBadge(tx.status)}`}>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), 'MMM dd, yyyy · hh:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${getAmountColor(tx.type)}`}>
                      {tx.type === 'deposit' || tx.type === 'referral_bonus' || tx.type === 'gift' ? '+' : '-'}
                      {tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">ETB</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};