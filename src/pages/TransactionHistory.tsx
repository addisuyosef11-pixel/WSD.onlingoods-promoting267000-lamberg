import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Spinner } from '@/components/Spinner';
import { BottomNavigation } from '@/components/BottomNavigation';
import { CustomerServiceModal } from '@/components/CustomerServiceModal';
import { ArrowUpFromLine, Crown, History, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import customerServiceIcon from '@/assets/customer-service.png';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  created_at: string;
}

type FilterType = 'all' | 'withdrawal' | 'deposit' | 'vip_purchase';

const TransactionHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showService, setShowService] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data } = await query.limit(100);
      setTransactions(data || []);
      setLoading(false);
    };

    fetchTransactions();
  }, [user, filter]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
        return <ArrowUpFromLine className="w-5 h-5 text-red-500" />;
      case 'deposit':
        return <ArrowUpFromLine className="w-5 h-5 text-green-500 rotate-180" />;
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
    { label: t('All'), value: 'all' },
    { label: t('Withdraw'), value: 'withdrawal' },
    { label: t('Deposit'), value: 'deposit' },
    { label: t('VIP'), value: 'vip_purchase' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-foreground" />
              </button>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">{t('Transaction History')}</h1>
              </div>
            </div>
            {/* Customer Service Button */}
            <button
              onClick={() => setShowService(true)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <img src={customerServiceIcon} alt="Service" className="w-8 h-8" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4">
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
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('No transactions found')}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
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
      </div>

      <BottomNavigation />

      <CustomerServiceModal
        isOpen={showService}
        onClose={() => setShowService(false)}
      />
    </div>
  );
};

export default TransactionHistory;
