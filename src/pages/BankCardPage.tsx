import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import {
  ArrowLeft, CreditCard, Plus, Trash2, CheckCircle, X, AlertCircle,
  Building, User, Clock, Shield, ChevronRight, Lock, ChevronDown, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import bankCardIcon from '@/assets/icon-bankcard.png';

interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  created_at: string;
  updated_at: string;
}

// List of Ethiopian banks
const ETHIOPIAN_BANKS = [
  { id: 'cbe', name: 'Commercial Bank of Ethiopia' },
  { id: 'awash', name: 'Awash Bank' },
  { id: 'dashen', name: 'Dashen Bank' },
  { id: 'wegagen', name: 'Wegagen Bank' },
  { id: 'hibret', name: 'Hibret Bank' },
  { id: 'nib', name: 'NIB International Bank' },
  { id: 'united', name: 'United Bank' },
  { id: 'berhan', name: 'Berhan Bank' },
  { id: 'abyssinia', name: 'Abyssinia Bank' },
  { id: 'coop', name: 'Cooperative Bank of Oromia' },
  { id: 'zemen', name: 'Zemen Bank' },
  { id: 'debub', name: 'Debub Global Bank' },
  { id: 'enat', name: 'Enat Bank' },
  { id: 'adij', name: 'Adij International Bank' },
  { id: 'goh', name: 'Goh Betoch Bank' },
  { id: 'tsedey', name: 'Tsedey Bank' },
  { id: 'other', name: 'Other Bank' }
];

const BankCardPage = () => {
  const { user, profile, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Form state
  const [selectedBank, setSelectedBank] = useState('');
  const [customBankName, setCustomBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBankAccounts();
    }
  }, [user]);

  const fetchBankAccounts = async () => {
    if (!user) return;
    
    setLoadingAccounts(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const validateForm = () => {
    if (!selectedBank) {
      setErrorMessage('Please select a bank');
      setShowErrorModal(true);
      return false;
    }
    if (selectedBank === 'other' && !customBankName.trim()) {
      setErrorMessage('Please enter your bank name');
      setShowErrorModal(true);
      return false;
    }
    if (!accountHolderName.trim()) {
      setErrorMessage('Account holder name is required');
      setShowErrorModal(true);
      return false;
    }
    if (!accountNumber.trim()) {
      setErrorMessage('Account number is required');
      setShowErrorModal(true);
      return false;
    }
    if (accountNumber.length < 8) {
      setErrorMessage('Please enter a valid account number');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleAddAccount = async () => {
    if (!user || !validateForm()) return;

    setSubmitting(true);

    try {
      // Get the final bank name
      const finalBankName = selectedBank === 'other' 
        ? customBankName 
        : ETHIOPIAN_BANKS.find(b => b.id === selectedBank)?.name || '';

      // Check if this account number already exists for the user
      const { data: existingAccount, error: checkError } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .eq('account_number', accountNumber)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingAccount) {
        setErrorMessage('This account number is already registered');
        setShowErrorModal(true);
        setSubmitting(false);
        return;
      }

      // Insert new bank account (no verification field)
      const { error } = await supabase
        .from('bank_accounts')
        .insert([
          {
            user_id: user.id,
            bank_name: finalBankName,
            account_number: accountNumber,
            account_holder_name: accountHolderName
          }
        ]);

      if (error) throw error;

      // Refresh bank accounts list
      await fetchBankAccounts();

      setSuccessMessage('Bank account added successfully!');
      setShowSuccessModal(true);
      setShowAddModal(false);
      
      // Clear form
      setSelectedBank('');
      setCustomBankName('');
      setAccountNumber('');
      setAccountHolderName('');
      
    } catch (error: any) {
      console.error('Error adding bank account:', error);
      setErrorMessage(error.message || 'Failed to add bank account');
      setShowErrorModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !selectedAccount) return;

    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', selectedAccount.id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchBankAccounts();
      setSuccessMessage('Bank account deleted successfully');
      setShowSuccessModal(true);
      setShowDeleteModal(false);
      setSelectedAccount(null);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setErrorMessage(error.message || 'Failed to delete account');
      setShowErrorModal(true);
    }
  };

  const maskAccountNumber = (number: string) => {
    if (number.length <= 4) return number;
    return '•••• ' + number.slice(-4);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] pb-24">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Green Gradient Header */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-6 relative z-10">
          <div className="flex items-center gap-3 max-w-md mx-auto">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-white" />
              <h1 className="text-xl font-bold text-white">Bank Cards</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6">
        {/* Add New Card Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white flex items-center justify-center gap-2 font-semibold hover:shadow-lg transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Add New Bank Account
        </button>

        {/* Bank Accounts List */}
        {loadingAccounts ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : bankAccounts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-[#e2e8e2]">
            <img src={bankCardIcon} alt="No cards" className="w-24 h-24 mx-auto mb-4 opacity-50" />
            <p className="text-[#2d3a2d] font-medium">No bank accounts added</p>
            <p className="text-sm text-[#6b7b6b] mt-1">Add your first account to start withdrawals</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-6 py-2 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white rounded-xl font-semibold text-sm"
            >
              Add Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bankAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-xl border border-[#e2e8e2] p-4 shadow-sm hover:shadow-md transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7acc00]/20 to-[#B0FC38]/20 flex items-center justify-center">
                      <Building className="w-6 h-6 text-[#7acc00]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2d3a2d]">{account.bank_name}</h3>
                      <p className="text-xs text-[#6b7b6b]">{account.account_holder_name}</p>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-[#7acc00]" />
                      <span className="text-[#2d3a2d] font-mono">{maskAccountNumber(account.account_number)}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(account.account_number, `account-${account.id}`)}
                      className="p-1 hover:bg-[#f1f5f1] rounded transition-colors"
                    >
                      {copiedField === `account-${account.id}` ? (
                        <CheckCircle className="w-4 h-4 text-[#7acc00]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#7acc00]" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#6b7b6b]">
                    <Clock className="w-3 h-3" />
                    <span>Added: {new Date(account.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex gap-2 pt-2 border-t border-[#e2e8e2]">
                  <button
                    onClick={() => {
                      setSelectedAccount(account);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />

      {/* Add Bank Account Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-white p-0 overflow-hidden">
          {/* Modal Header with Gradient */}
          <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
            <div className="px-6 pt-6 pb-8 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-white" />
                  <DialogTitle className="text-white font-bold text-lg">
                    Add Bank Account
                  </DialogTitle>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {/* Bank Dropdown */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#2d3a2d]">Select Bank</Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowBankDropdown(!showBankDropdown)}
                    className="w-full px-4 py-3 border border-[#e2e8e2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7acc00]/50 flex items-center justify-between bg-white"
                  >
                    <span className={selectedBank ? 'text-[#2d3a2d]' : 'text-[#6b7b6b]'}>
                      {selectedBank 
                        ? selectedBank === 'other' 
                          ? customBankName || 'Other Bank' 
                          : ETHIOPIAN_BANKS.find(b => b.id === selectedBank)?.name 
                        : 'Select your bank'}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-[#6b7b6b] transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showBankDropdown && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-[#e2e8e2] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {ETHIOPIAN_BANKS.map((bank) => (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => {
                            setSelectedBank(bank.id);
                            if (bank.id !== 'other') {
                              setCustomBankName('');
                            }
                            setShowBankDropdown(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-[#f1f5f1] transition-colors border-b border-[#e2e8e2] last:border-b-0"
                        >
                          <span className="text-sm text-[#2d3a2d]">{bank.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Custom Bank Name (if "Other" selected) */}
              {selectedBank === 'other' && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-[#2d3a2d]">Bank Name</Label>
                  <Input
                    value={customBankName}
                    onChange={(e) => setCustomBankName(e.target.value)}
                    placeholder="Enter your bank name"
                    className="w-full px-4 py-2 border border-[#e2e8e2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7acc00]/50"
                  />
                </div>
              )}

              {/* Account Holder Name */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#2d3a2d]">Account Holder Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7b6b]" />
                  <Input
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Full name as on bank account"
                    className="w-full pl-9 pr-4 py-2 border border-[#e2e8e2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7acc00]/50"
                  />
                </div>
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-[#2d3a2d]">Account Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7b6b]" />
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter your account number"
                    className="w-full pl-9 pr-4 py-2 border border-[#e2e8e2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7acc00]/50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border-[#e2e8e2] text-[#6b7b6b] hover:bg-[#f1f5f1]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddAccount}
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-[#1f2a1f] font-semibold hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span>Adding...</span>
                    </div>
                  ) : (
                    'Add Account'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md bg-white p-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3a2d] mb-2">Delete Bank Account</h3>
            <p className="text-sm text-[#6b7b6b] mb-6">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 border-[#e2e8e2] text-[#6b7b6b]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      {/* Error Modal */}
      <SuccessModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
        isError={true}
      />
    </div>
  );
};

export default BankCardPage;