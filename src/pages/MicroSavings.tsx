import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ArrowLeft, PiggyBank, Calendar, Clock, TrendingUp, Shield, Zap, CheckCircle, AlertCircle, Plus, Minus, Percent, DollarSign, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { DepositModal } from '@/components/DepositModal';
import microSavingImg from '@/assets/micro-saving.png';
import emptyBox from '@/assets/empty-box.png';

interface SavingsPlan {
  id: string;
  user_id: string;
  amount: number;
  daily_return: number;
  total_return: number;
  duration_days: number;
  return_frequency: 'daily' | 'weekly' | 'monthly';
  start_date: string;
  end_date: string;
  next_payout_date: string;
  status: 'active' | 'completed' | 'cancelled';
  total_paid: number;
  created_at: string;
}

interface SavingsPreference {
  amount: number;
  duration: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  returnRate: number;
}

const MicroSavings = () => {
  const { user, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [activeSavings, setActiveSavings] = useState<SavingsPlan[]>([]);
  const [completedSavings, setCompletedSavings] = useState<SavingsPlan[]>([]);
  const [loadingSavings, setLoadingSavings] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
  // Savings preferences
  const [preferences, setPreferences] = useState<SavingsPreference>({
    amount: 100,
    duration: 30,
    frequency: 'daily',
    returnRate: 0.5 // 0.5% daily return
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSavingsPlans();
    }
  }, [user]);

  const fetchSavingsPlans = async () => {
    if (!user) return;
    
    setLoadingSavings(true);
    
    const { data, error } = await supabase
      .from('savings_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching savings:', error);
    } else if (data) {
      const active = data.filter(plan => plan.status === 'active');
      const completed = data.filter(plan => plan.status === 'completed');
      setActiveSavings(active as SavingsPlan[]);
      setCompletedSavings(completed as SavingsPlan[]);
    }
    
    setLoadingSavings(false);
  };

  const calculateReturns = () => {
    const dailyReturn = preferences.amount * (preferences.returnRate / 100);
    let totalReturn = 0;
    
    switch(preferences.frequency) {
      case 'daily':
        totalReturn = dailyReturn * preferences.duration;
        break;
      case 'weekly':
        totalReturn = dailyReturn * 7 * Math.floor(preferences.duration / 7);
        break;
      case 'monthly':
        totalReturn = dailyReturn * 30 * Math.floor(preferences.duration / 30);
        break;
    }
    
    return {
      daily: dailyReturn,
      total: totalReturn,
      finalAmount: preferences.amount + totalReturn
    };
  };

  const handleCreateSavings = async () => {
    if (!user || !profile) return;

    if (profile.balance < preferences.amount) {
      setErrorMessage('Insufficient balance. Please deposit first.');
      setShowErrorModal(true);
      setShowDeposit(true);
      setShowCreateModal(false);
      return;
    }

    setCreating(true);

    const returns = calculateReturns();
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + preferences.duration);

    // Calculate next payout date based on frequency
    const nextPayout = new Date();
    switch(preferences.frequency) {
      case 'daily':
        nextPayout.setDate(nextPayout.getDate() + 1);
        break;
      case 'weekly':
        nextPayout.setDate(nextPayout.getDate() + 7);
        break;
      case 'monthly':
        nextPayout.setMonth(nextPayout.getMonth() + 1);
        break;
    }

    // Create savings plan
    const { data, error } = await supabase
      .from('savings_plans')
      .insert({
        user_id: user.id,
        amount: preferences.amount,
        daily_return: returns.daily,
        total_return: returns.total,
        duration_days: preferences.duration,
        return_frequency: preferences.frequency,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        next_payout_date: nextPayout.toISOString(),
        status: 'active',
        total_paid: 0
      })
      .select()
      .single();

    if (error) {
      setErrorMessage('Failed to create savings plan. Please try again.');
      setShowErrorModal(true);
    } else if (data) {
      // Deduct from balance
      await supabase
        .from('profiles')
        .update({ balance: profile.balance - preferences.amount })
        .eq('id', user.id);

      setSuccessMessage(`Savings plan created successfully! You'll receive ${returns.daily.toFixed(2)} ETB ${preferences.frequency}`);
      setShowSuccessModal(true);
      setShowCreateModal(false);
      await refreshProfile();
      await fetchSavingsPlans();
    }

    setCreating(false);
  };

  const handleCancelSavings = async (planId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('savings_plans')
      .update({ status: 'cancelled' })
      .eq('id', planId);

    if (error) {
      setErrorMessage('Failed to cancel savings plan.');
      setShowErrorModal(true);
    } else {
      setSuccessMessage('Savings plan cancelled successfully.');
      setShowSuccessModal(true);
      await fetchSavingsPlans();
    }
  };

  const handleCollectReturn = async (plan: SavingsPlan) => {
    if (!user || !profile) return;

    // Update total paid
    const newTotalPaid = plan.total_paid + plan.daily_return;
    
    // Add to balance
    await supabase
      .from('profiles')
      .update({ balance: profile.balance + plan.daily_return })
      .eq('id', user.id);

    // Calculate next payout
    const nextPayout = new Date(plan.next_payout_date);
    switch(plan.return_frequency) {
      case 'daily':
        nextPayout.setDate(nextPayout.getDate() + 1);
        break;
      case 'weekly':
        nextPayout.setDate(nextPayout.getDate() + 7);
        break;
      case 'monthly':
        nextPayout.setMonth(nextPayout.getMonth() + 1);
        break;
    }

    // Check if plan is completed
    const status = newTotalPaid >= plan.total_return ? 'completed' : 'active';

    await supabase
      .from('savings_plans')
      .update({
        total_paid: newTotalPaid,
        next_payout_date: nextPayout.toISOString(),
        status
      })
      .eq('id', plan.id);

    setSuccessMessage(`${plan.daily_return.toFixed(2)} ETB collected successfully!`);
    setShowSuccessModal(true);
    await refreshProfile();
    await fetchSavingsPlans();
  };

  const returns = calculateReturns();

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      <div className="relative px-4 pb-24 max-w-md mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pt-4 pb-2 mb-4 backdrop-blur-sm bg-opacity-90">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/earn')}
              className="hover:bg-[#7acc00]/10 active:bg-[#7acc00]/20 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-[#2d3a2d]" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-bold bg-gradient-to-r from-[#2d3a2d] to-[#4a5a4a] bg-clip-text text-transparent">
                Microsavings
              </h1>
              <p className="text-xs text-[#6b7b6b]">Save smart, earn daily</p>
            </div>
          </div>
        </header>

        {/* Balance Card */}
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#2d3a2d] to-[#1f2a1f] text-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-white/80">Available Balance</span>
            <Shield className="w-4 h-4 text-[#B0FC38]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{profile?.balance?.toLocaleString() || 0} ETB</span>
            <Button
              onClick={() => setShowDeposit(true)}
              className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1f2a1f] font-semibold px-4 py-1.5 rounded-xl text-sm hover:shadow-lg hover:shadow-[#7acc00]/20 transition-all active:scale-95"
            >
              Deposit
            </Button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#7acc00] to-[#B0FC38] overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
          <div className="relative flex items-center gap-4">
            <img src={microSavingImg} alt="Micro Savings" className="w-20 h-20 object-contain" />
            <div className="flex-1">
              <h2 className="text-white font-bold text-lg mb-1">Start Small, Grow Big</h2>
              <p className="text-white/90 text-xs mb-3">Earn up to 0.5% daily returns on your savings</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-[#2d3a2d] px-4 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
              >
                Start Saving
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex rounded-full p-1 mb-6" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
          <button
            onClick={() => setSelectedTab('active')}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              selectedTab === 'active'
                ? 'bg-white text-[#2d3a2d] shadow-sm'
                : 'text-white hover:bg-white/20'
            }`}
          >
            Active ({activeSavings.length})
          </button>
          <button
            onClick={() => setSelectedTab('completed')}
            className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${
              selectedTab === 'completed'
                ? 'bg-white text-[#2d3a2d] shadow-sm'
                : 'text-white hover:bg-white/20'
            }`}
          >
            Completed ({completedSavings.length})
          </button>
        </div>

        {/* Savings List */}
        {loadingSavings ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="space-y-4">
            {selectedTab === 'active' && activeSavings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
                <img src={emptyBox} alt="No active savings" className="w-48 h-auto mb-4" />
                <p className="text-[#2d3a2d] font-medium">No active savings</p>
                <p className="text-sm text-[#6b7b6b] mt-1 mb-4">Start your first savings plan today</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white px-6 py-2 rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
                >
                  Start Saving
                </button>
              </div>
            )}

            {selectedTab === 'completed' && completedSavings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl border border-[#e2e8e2]">
                <img src={emptyBox} alt="No completed savings" className="w-48 h-auto mb-4" />
                <p className="text-[#2d3a2d] font-medium">No completed savings</p>
                <p className="text-sm text-[#6b7b6b] mt-1">Your completed plans will appear here</p>
              </div>
            )}

            {selectedTab === 'active' && activeSavings.map((saving) => {
              const progress = (saving.total_paid / saving.total_return) * 100;
              const canCollect = new Date(saving.next_payout_date) <= new Date();

              return (
                <div key={saving.id} className="bg-white rounded-2xl border border-[#e2e8e2] p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-[#2d3a2d]">{saving.amount.toLocaleString()} ETB</h3>
                      <p className="text-xs text-[#6b7b6b]">Started {new Date(saving.start_date).toLocaleDateString()}</p>
                    </div>
                    <span className="px-2 py-1 bg-[#7acc00]/10 text-[#7acc00] rounded-full text-xs font-semibold capitalize">
                      {saving.return_frequency}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#f8fafc] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#6b7b6b]">Daily</p>
                      <p className="font-bold text-[#2d3a2d]">{saving.daily_return.toFixed(2)} ETB</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#6b7b6b]">Total</p>
                      <p className="font-bold text-[#7acc00]">{saving.total_return.toFixed(2)} ETB</p>
                    </div>
                    <div className="bg-[#f8fafc] rounded-xl p-2 text-center">
                      <p className="text-xs text-[#6b7b6b]">Collected</p>
                      <p className="font-bold text-[#2d3a2d]">{saving.total_paid.toFixed(2)} ETB</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6b7b6b]">Progress</span>
                      <span className="text-[#2d3a2d] font-semibold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-[#e2e8e2] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canCollect && saving.total_paid < saving.total_return && (
                      <button
                        onClick={() => handleCollectReturn(saving)}
                        className="flex-1 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white py-2.5 rounded-xl font-semibold text-sm hover:shadow-lg transition-all active:scale-95"
                      >
                        Collect {saving.daily_return.toFixed(2)} ETB
                      </button>
                    )}
                    {!canCollect && saving.total_paid < saving.total_return && (
                      <button
                        disabled
                        className="flex-1 bg-gray-200 text-gray-500 py-2.5 rounded-xl font-semibold text-sm cursor-not-allowed"
                      >
                        Next: {new Date(saving.next_payout_date).toLocaleDateString()}
                      </button>
                    )}
                    <button
                      onClick={() => handleCancelSavings(saving.id)}
                      className="flex-1 border border-red-200 text-red-500 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}

            {selectedTab === 'completed' && completedSavings.map((saving) => (
              <div key={saving.id} className="bg-white rounded-2xl border border-[#e2e8e2] p-4 shadow-sm opacity-75">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#2d3a2d]">{saving.amount.toLocaleString()} ETB</h3>
                    <p className="text-xs text-[#6b7b6b]">Completed {new Date(saving.end_date).toLocaleDateString()}</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-semibold">
                    Completed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7b6b]">Total Earned</p>
                    <p className="font-bold text-[#7acc00] text-lg">{saving.total_return.toFixed(2)} ETB</p>
                  </div>
                  <div className="bg-[#f8fafc] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6b7b6b]">Final Amount</p>
                    <p className="font-bold text-[#2d3a2d] text-lg">{(saving.amount + saving.total_return).toFixed(2)} ETB</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Savings Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => !creating && setShowCreateModal(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-20 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] px-6 pt-6">
              <button 
                onClick={() => !creating && setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                disabled={creating}
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h2 className="text-white font-bold text-lg">Create Savings Plan</h2>
            </div>

            <div className="p-6">
              {/* Amount Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[#2d3a2d] mb-2 block">Savings Amount (ETB)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreferences({...preferences, amount: Math.max(100, preferences.amount - 50)})}
                    className="w-10 h-10 rounded-xl bg-[#f1f5f1] flex items-center justify-center hover:bg-[#e2e8e2]"
                  >
                    <Minus className="w-4 h-4 text-[#2d3a2d]" />
                  </button>
                  <input
                    type="number"
                    value={preferences.amount}
                    onChange={(e) => setPreferences({...preferences, amount: Number(e.target.value)})}
                    className="flex-1 text-center py-2 border border-[#e2e8e2] rounded-xl font-bold text-[#2d3a2d]"
                    min="100"
                    step="50"
                  />
                  <button
                    onClick={() => setPreferences({...preferences, amount: preferences.amount + 50})}
                    className="w-10 h-10 rounded-xl bg-[#f1f5f1] flex items-center justify-center hover:bg-[#e2e8e2]"
                  >
                    <Plus className="w-4 h-4 text-[#2d3a2d]" />
                  </button>
                </div>
              </div>

              {/* Duration Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[#2d3a2d] mb-2 block">Duration (Days)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setPreferences({...preferences, duration: Math.max(7, preferences.duration - 7)})}
                    className="w-10 h-10 rounded-xl bg-[#f1f5f1] flex items-center justify-center hover:bg-[#e2e8e2]"
                  >
                    <Minus className="w-4 h-4 text-[#2d3a2d]" />
                  </button>
                  <input
                    type="number"
                    value={preferences.duration}
                    onChange={(e) => setPreferences({...preferences, duration: Number(e.target.value)})}
                    className="flex-1 text-center py-2 border border-[#e2e8e2] rounded-xl font-bold text-[#2d3a2d]"
                    min="7"
                    step="7"
                  />
                  <button
                    onClick={() => setPreferences({...preferences, duration: preferences.duration + 7})}
                    className="w-10 h-10 rounded-xl bg-[#f1f5f1] flex items-center justify-center hover:bg-[#e2e8e2]"
                  >
                    <Plus className="w-4 h-4 text-[#2d3a2d]" />
                  </button>
                </div>
              </div>

              {/* Frequency Selector */}
              <div className="mb-6">
                <label className="text-sm font-medium text-[#2d3a2d] mb-2 block">Return Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setPreferences({...preferences, frequency: freq})}
                      className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                        preferences.frequency === freq
                          ? 'bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white'
                          : 'bg-[#f1f5f1] text-[#6b7b6b] hover:bg-[#e2e8e2]'
                      }`}
                    >
                      {freq.charAt(0).toUpperCase() + freq.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Returns Calculator */}
              <div className="mb-6 p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8e2]">
                <h3 className="font-semibold text-[#2d3a2d] mb-3">Returns Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#6b7b6b]">Daily Return:</span>
                    <span className="font-bold text-[#7acc00]">{returns.daily.toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6b7b6b]">Total Return:</span>
                    <span className="font-bold text-[#2d3a2d]">{returns.total.toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#e2e8e2]">
                    <span className="text-[#6b7b6b]">Final Amount:</span>
                    <span className="font-bold text-lg text-[#2d3a2d]">{returns.finalAmount.toFixed(2)} ETB</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => !creating && setShowCreateModal(false)}
                  className="flex-1 border-[#e2e8e2] text-[#6b7b6b] hover:bg-[#f1f5f1]"
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateSavings}
                  disabled={creating || preferences.amount > profile.balance}
                  className="flex-1 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1f2a1f] font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {creating ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Creating...</span>
                    </div>
                  ) : (
                    'Create Plan'
                  )}
                </Button>
              </div>

              {preferences.amount > profile.balance && (
                <p className="text-xs text-red-500 text-center mt-3">
                  Insufficient balance. Please deposit first.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavigation />

      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        onDepositSubmitted={() => {
          setSuccessMessage('Deposit submitted! Awaiting admin approval.');
          setShowSuccessModal(true);
        }}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
        isError={true}
      />
    </div>
  );
};

export default MicroSavings;