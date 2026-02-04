import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/Spinner';
import { ArrowDownToLine, ArrowUpFromLine, Crown, History } from 'lucide-react';
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
        return <ArrowDownToLine className="w-5 h-5 text-red-500" />;
      case 'deposit':
        return <ArrowUpFromLine className="w-5 h-5 text-green-500" />;
      case 'vip_purchase':
        return <Crown className="w-5 h-5 text-primary" />;
      default:
        return <History className="w-5 h-5 text-muted-foreground" />;
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
        return 'text-green-500';
      default:
        return 'text-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
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
      <DialogContent className="bg-card border-border max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <History className="w-5 h-5 text-primary" />
            Transaction History
          </DialogTitle>
        </DialogHeader>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === btn.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto space-y-3">
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
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">
                      {formatType(tx.type)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(tx.status)}`}>
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
                <div className={`text-right ${getAmountColor(tx.type)}`}>
                  <p className="font-bold">
                    {tx.type === 'deposit' || tx.type === 'referral_bonus' || tx.type === 'gift' ? '+' : '-'}
                    {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">ETB</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
