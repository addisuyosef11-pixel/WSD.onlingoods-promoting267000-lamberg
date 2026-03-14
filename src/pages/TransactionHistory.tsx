import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Spinner } from '@/components/Spinner';
import { BottomNavigation } from '@/components/BottomNavigation';
import { CustomerServiceModal } from '@/components/CustomerServiceModal';
<<<<<<< HEAD
import { ArrowUpFromLine, Crown, History, ArrowLeft, Download, Upload, Clock, CheckCircle, XCircle } from 'lucide-react';
=======
import { ArrowUpFromLine, Crown, History, ArrowLeft } from 'lucide-react';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
  const [totals, setTotals] = useState({
    deposit: 0,
    withdrawal: 0,
    vip: 0
  });
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3

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
<<<<<<< HEAD
      
      // Calculate totals from completed transactions
      if (data) {
        const depositTotal = data
          .filter(t => t.type === 'deposit' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const withdrawalTotal = data
          .filter(t => t.type === 'withdrawal' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const vipTotal = data
          .filter(t => t.type === 'vip_purchase' && t.status === 'completed')
          .reduce((sum, t) => sum + t.amount, 0);

        setTotals({
          deposit: depositTotal,
          withdrawal: withdrawalTotal,
          vip: vipTotal
        });
      }
      
=======
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      setLoading(false);
    };

    fetchTransactions();
  }, [user, filter]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'withdrawal':
<<<<<<< HEAD
        return <Upload className="w-5 h-5 text-white" />;
      case 'deposit':
        return <Download className="w-5 h-5 text-white" />;
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
        return 'bg-gradient-to-br from-[#7acc00] to-[#B0FC38]'; // Green like header
      case 'vip_purchase':
        return 'bg-gradient-to-br from-[#7acc00] to-[#B0FC38]'; // Green like header
      default:
        return 'bg-gradient-to-br from-gray-400 to-gray-500';
=======
        return <ArrowUpFromLine className="w-5 h-5 text-red-500" />;
      case 'deposit':
        return <ArrowUpFromLine className="w-5 h-5 text-green-500 rotate-180" />;
      case 'vip_purchase':
        return <Crown className="w-5 h-5 text-primary" />;
      default:
        return <History className="w-5 h-5 text-muted-foreground" />;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
        return 'text-[#7acc00]'; // Green like header
=======
        return 'text-green-500';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
      default:
        return 'text-foreground';
    }
  };

  const getStatusBadge = (status: string) => {
<<<<<<< HEAD
    switch (status) {
      case 'completed':
        return 'bg-[#7acc00] text-white'; // Green like header
      case 'pending':
        return 'bg-[#FFD700] text-[#856404]'; // Gold color
      case 'failed':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
=======
    const styles: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-muted text-muted-foreground';
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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
<<<<<<< HEAD
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
=======
      <div className="min-h-screen flex items-center justify-center bg-background">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
        <Spinner size="lg" />
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Simple Green Header - No Wave */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-6 relative z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/profile')}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-white" />
                <h1 className="text-xl font-bold text-white">{t('Transaction History')}</h1>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              </div>
            </div>
            {/* Customer Service Button */}
            <button
              onClick={() => setShowService(true)}
<<<<<<< HEAD
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <img src={customerServiceIcon} alt="Service" className="w-6 h-6" />
=======
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <img src={customerServiceIcon} alt="Service" className="w-8 h-8" />
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="relative max-w-md mx-auto px-4 py-4">
        {/* Summary Cards */}
        {!loading && transactions.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="bg-white rounded-xl p-3 border border-[#e2e8e2] shadow-sm">
              <p className="text-xs text-[#6b7b6b] mb-1">Deposit</p>
              <p className="text-base font-bold text-[#7acc00]">{totals.deposit.toLocaleString()}</p>
              <p className="text-[8px] text-[#6b7b6b]">ETB</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#e2e8e2] shadow-sm">
              <p className="text-xs text-[#6b7b6b] mb-1">Withdraw</p>
              <p className="text-base font-bold text-red-500">{totals.withdrawal.toLocaleString()}</p>
              <p className="text-[8px] text-[#6b7b6b]">ETB</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-[#e2e8e2] shadow-sm">
              <p className="text-xs text-[#6b7b6b] mb-1">VIP</p>
              <p className="text-base font-bold text-[#7acc00]">{totals.vip.toLocaleString()}</p>
              <p className="text-[8px] text-[#6b7b6b]">ETB</p>
            </div>
          </div>
        )}

        {/* Filter Tabs - Order page style */}
        <div className="flex rounded-full p-1 mb-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
=======
      <div className="max-w-md mx-auto px-4 py-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
          {filterButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setFilter(btn.value)}
<<<<<<< HEAD
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
                filter === btn.value
                  ? 'bg-white text-[#2d3a2d] shadow-sm'
                  : 'text-white hover:bg-white/20'
=======
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === btn.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {loading ? (
<<<<<<< HEAD
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
              <History className="w-16 h-16 mx-auto mb-3 text-[#6b7b6b] opacity-50" />
              <p className="text-[#2d3a2d] font-medium">{t('No transactions found')}</p>
              <p className="text-sm text-[#6b7b6b] mt-1">Your transactions will appear here</p>
=======
            <div className="flex justify-center py-8">
              <Spinner size="md" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>{t('No transactions found')}</p>
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
<<<<<<< HEAD
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#e2e8e2] shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${getIconBackground(tx.type)} flex items-center justify-center shadow-sm flex-shrink-0`}>
                  {getTransactionIcon(tx.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-[#2d3a2d]">
                      {formatType(tx.type)}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBadge(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#6b7b6b]">
                    {format(new Date(tx.created_at), 'MMM dd, yyyy • hh:mm a')}
                  </p>
                  
                  {tx.description && (
                    <p className="text-xs text-[#6b7b6b] mt-1 truncate">{tx.description}</p>
                  )}
                </div>
                
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-base ${getAmountColor(tx.type)}`}>
                    {tx.type === 'deposit' || tx.type === 'referral_bonus' || tx.type === 'gift' ? '+' : '-'}
                    {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-[#6b7b6b]">ETB</p>
=======
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
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
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

<<<<<<< HEAD
export default TransactionHistory;
=======
export default TransactionHistory;
>>>>>>> 70a5741d742af1eae8cfd0591d074442a0eef3d3
