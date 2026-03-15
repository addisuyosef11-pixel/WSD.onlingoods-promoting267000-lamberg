import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/Spinner';
import { SuccessModal } from '@/components/SuccessModal';
import { GiftModal } from '@/components/GiftModal';
import { TelegramModal } from '@/components/TelegramModal';
import { AnnouncementModal } from '@/components/AnnouncementModal';

import dswLogo from '@/assets/dsw-logo.png';
import withdrawImage from '@/assets/withdraw.png';
import depositImage from '@/assets/deposit.png';
import giftCodeImage from '@/assets/gift-code.png';
import walletImage from '@/assets/wallet_1.png';
import customerServiceImage from '@/assets/custumer_service.png';
import {
  MessageCircle, Send, Users, ExternalLink, X,
  Eye, EyeOff, Play, Pause, SkipForward, Volume2,
  Headphones, Music, Radio, ListMusic, Search, Loader,
  ChevronLeft, ChevronRight, AlertTriangle, Award, TrendingUp, Clock,
  Menu, User, LogOut, Settings, CreditCard, History, Phone, Mail,
  Wallet, Download, Gift, HelpCircle, ChevronDown, ChevronUp
} from 'lucide-react';

interface VipLevel {
  id: number;
  name: string;
  price: number;
  description: string;
  image_url: string | null;
  series?: string;
  daily_income?: number;
  cycle_days?: number;
  total_income?: number;
  purchase_limit?: number;
}

interface MusicTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
  collectionName?: string;
}

interface UserDetails {
  full_name: string | null;
  phone: string;
  email: string | null;
  vip_level: string;
  balance: number;
  withdrawable_balance: number;
  total_investment: number;
  total_earnings: number;
  referral_code: string | null;
}

const telegramChannels = [
  { label: 'Official Support', url: 'https://t.me/DSWonline_suport', handle: '@DSWonline_suport' },
  { label: 'Public Channel', url: 'https://t.me/etonlinejob1', handle: 'DSW Channel' },
  { label: 'Discussion Group', url: 'https://t.me/+Jihv4uEOv0o0M2U0', handle: 'DSW Group' },
];

// Navigation Menu Component with Balance, Deposit/Withdraw, and Quick Stats
const NavigationMenu = ({ 
  user, 
  profile, 
  onLogout,
  dailyIncome,
  todayEarnings,
  canEarn,
  onDeposit,
  onWithdraw,
  userDetails
}: { 
  user: any; 
  profile: any; 
  onLogout: () => void;
  dailyIncome: number;
  todayEarnings: number;
  canEarn: boolean;
  onDeposit: () => void;
  onWithdraw: () => void;
  userDetails: UserDetails | null;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalance, setShowBalance] = useState(true);
  const [showQuickStats, setShowQuickStats] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowQuickStats(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button - 3 Lines */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center gap-1 bg-white shadow-sm"
      >
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
          {/* User Info with Phone from Profile */}
          <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-[#f0f9e8] to-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#7acc00] to-[#B0FC38] rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{userDetails?.full_name || 'User'}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{userDetails?.phone || 'No phone'}</span>
                </div>
                {userDetails?.email && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[180px]">{userDetails.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Balance Card inside Menu */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <img src={walletImage} alt="Wallet" className="w-6 h-6 object-contain" />
                  <span className="text-sm font-bold text-white">My Wallet</span>
                </div>

                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/80">Main Balance</span>
                    <button onClick={() => setShowBalance(!showBalance)} className="p-0.5 hover:bg-white/10 rounded">
                      {showBalance ? <Eye className="w-3 h-3 text-white" /> : <EyeOff className="w-3 h-3 text-white/60" />}
                    </button>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-white">{showBalance ? profile?.balance?.toLocaleString() || 0 : '****'}</span>
                    <span className="text-xs text-white/80">ETB</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/80">Withdrawable</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-white">{showBalance ? profile?.withdrawable_balance?.toLocaleString() || 0 : '****'}</span>
                    <span className="text-xs text-white/80">ETB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deposit & Withdraw Icons inside Menu */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-around">
              <button
                onClick={() => { onDeposit(); setIsOpen(false); }}
                className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-xl flex items-center justify-center">
                  <img src={depositImage} alt="Deposit" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-700">Deposit</span>
              </button>
              
              <button
                onClick={() => { onWithdraw(); setIsOpen(false); }}
                className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] rounded-xl flex items-center justify-center">
                  <img src={withdrawImage} alt="Withdraw" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-700">Withdraw</span>
              </button>
              
              <button
                onClick={() => { window.location.href = '/gift'; setIsOpen(false); }}
                className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2] rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#ff9800]" />
                </div>
                <span className="text-xs font-medium text-gray-700">Gift</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Toggle */}
          <div className="p-2 border-b border-gray-100">
            <button
              onClick={() => setShowQuickStats(!showQuickStats)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-[#7acc00]" />
                <span className="text-sm font-medium text-gray-700">Quick Stats</span>
              </div>
              {showQuickStats ? (
                <ChevronUp className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {/* Quick Stats Content */}
            {showQuickStats && (
              <div className="p-3 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">VIP Level</span>
                  <span className="text-xs font-semibold text-[#7acc00]">{profile?.vip_level || 'Basic'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Total Balance</span>
                  <span className="text-xs font-semibold">{(profile?.balance + profile?.withdrawable_balance).toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Earning Status</span>
                  <span className={`text-xs font-semibold ${canEarn ? 'text-[#7acc00]' : 'text-gray-500'}`}>
                    {canEarn ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Daily Income</span>
                  <span className="text-xs font-semibold text-[#7acc00]">{dailyIncome.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-600">Today's Earnings</span>
                  <span className="text-xs font-semibold text-[#7acc00]">{todayEarnings.toFixed(3)} ETB</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="p-2">
            <button
              onClick={() => { window.location.href = '/profile'; setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">My Profile</span>
            </button>
            <button
              onClick={() => { window.location.href = '/transactions'; setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <History className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Transaction History</span>
            </button>
            <button
              onClick={() => { window.location.href = '/settings'; setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Settings</span>
            </button>
            <button
              onClick={() => { window.location.href = '/help'; setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Help Center</span>
            </button>
          </div>

          {/* Logout */}
          <div className="p-2 border-t border-gray-100">
            <button
              onClick={() => { onLogout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Gift Code Button
const GiftCodeButton = ({ onClick }: { onClick: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <button 
      onClick={onClick} 
      className="fixed left-4 bottom-24 z-40 flex items-center gap-2 bg-gradient-to-r from-[#ff9800] to-[#ffc107] text-white px-3 py-2 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 text-sm font-bold"
    >
      <img src={giftCodeImage} alt="Gift" className="w-5 h-5" />
      Gift Code
      <button
        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
        className="ml-1 p-0.5 hover:bg-white/20 rounded-full"
      >
        <X className="w-3 h-3" />
      </button>
    </button>
  );
};

// VIP Benefits Card
const VIPBenefitsCard = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <div className="bg-gradient-to-br from-[#1a2a1a] to-[#2d4a2d] rounded-2xl p-5 text-white mb-4">
    <div className="flex items-center gap-2 mb-3">
      <Award className="w-5 h-5 text-[#B0FC38]" />
      <h3 className="font-bold">VIP Benefits</h3>
    </div>
    <p className="text-sm text-white/80 mb-4">
      Upgrade to VIP and start earning real money from your listening time!
    </p>
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-[#B0FC38]" />
        <span>Earn 0.05 ETB per minute</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-[#B0FC38]" />
        <span>Daily income added to wallet</span>
      </div>
    </div>
    <button
      onClick={onUpgrade}
      className="w-full py-2 bg-white text-[#2d3a2d] font-semibold rounded-xl hover:bg-white/90 transition-colors"
    >
      View Packages
    </button>
  </div>
);

// Upgrade Notification Modal
const UpgradeNotification = ({ isOpen, onClose, onUpgrade }: { isOpen: boolean; onClose: () => void; onUpgrade: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] p-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Upgrade to Earn</h3>
              <p className="text-sm text-white/80">VIP Members Get Paid</p>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            You're currently on a free plan. To start earning real money from listening, you need to upgrade to a VIP package.
          </p>
          
          <div className="bg-[#f0f9e8] p-4 rounded-xl mb-4 border border-[#7acc00]/30">
            <h4 className="font-semibold text-[#2d3a2d] mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7acc00]" />
              VIP Benefits:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#7acc00] font-bold">•</span>
                <span>Earn 0.05 ETB per minute of listening</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7acc00] font-bold">•</span>
                <span>Daily income added to your wallet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7acc00] font-bold">•</span>
                <span>Access to exclusive premium content</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#7acc00] font-bold">•</span>
                <span>Higher withdrawal limits</span>
              </li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 mb-4">
            Free users can listen but won't accumulate earnings. Deposit first and upgrade to start earning.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Later
            </button>
            <button
              onClick={() => {
                onUpgrade();
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 5 Minute Listening Notification
const FiveMinuteNotification = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown w-full max-w-sm px-4">
      <div className="bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-xl shadow-2xl p-4 border-l-4 border-[#2d5a2d]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">🎉 Great Job!</h3>
            <p className="text-xs text-white/90">
              You've been listening for 5 minutes! Keep going to earn more.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-xs text-white/80 hover:text-white underline"
            >
              Got it
            </button>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// View Confirmation Modal - Free listening allowed
const ViewConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  trackName,
  duration,
  canEarn
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
  trackName: string;
  duration: number;
  canEarn: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#ff9800]/20 rounded-full flex items-center justify-center">
              <Headphones className="w-5 h-5 text-[#ff9800]" />
            </div>
            <h3 className="font-bold text-gray-800">Ready to Listen?</h3>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            You are about to play: <span className="font-semibold text-gray-800">{trackName}</span>
          </p>
          
          <div className={`p-3 rounded-xl mb-4 border ${canEarn ? 'bg-[#f0f9e8] border-[#7acc00]/20' : 'bg-gray-100 border-gray-200'}`}>
            {canEarn ? (
              <>
                <p className="text-xs text-gray-700 mb-2">
                  ⚠️ <span className="font-bold">Earning Active:</span> You will earn {Math.floor(duration / 60)} minute video.
                </p>
                <p className="text-xs text-gray-700">
                  🔍 Our system will track your listening time. Enjoy the music!
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-700 mb-2">
                  🎵 <span className="font-bold">Free Listening:</span> You're on a free plan.
                </p>
                <p className="text-xs text-gray-700">
                  You can listen for free. Upgrade to VIP to start earning money!
                </p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              {canEarn ? 'Listen & Earn' : 'Listen Free'}
            </button>
          </div>
          
          {!canEarn && (
            <button
              onClick={() => {
                onClose();
                // Navigate to upgrade page
              }}
              className="w-full mt-3 py-2 text-center text-sm text-[#7acc00] font-semibold hover:underline"
            >
              Upgrade to Start Earning →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Music Section with Search
const MusicSection = ({ 
  onEarningsUpdate,
  canEarn,
  onUpgradeClick
}: { 
  onEarningsUpdate: (earnings: number) => void;
  canEarn: boolean;
  onUpgradeClick: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [trendingTracks, setTrendingTracks] = useState<MusicTrack[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingTrack, setPendingTrack] = useState<MusicTrack | null>(null);
  const [listeningTimer, setListeningTimer] = useState(0);
  const [showFiveMinuteNotif, setShowFiveMinuteNotif] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('trending');
  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fiveMinuteTriggered = useRef(false);

  // Load trending on mount
  useEffect(() => {
    searchMusic('top hits 2024');
  }, []);

  // Track listening time for 5-minute notification (only if can earn)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack && canEarn) {
      interval = setInterval(() => {
        setListeningTimer(prev => {
          const newTime = prev + 1;
          // Show notification at 5 minutes (300 seconds) if not already shown
          if (newTime >= 300 && !fiveMinuteTriggered.current) {
            setShowFiveMinuteNotif(true);
            fiveMinuteTriggered.current = true;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, canEarn]);

  // Reset timer when track changes or stops
  useEffect(() => {
    if (!isPlaying || !currentTrack) {
      setListeningTimer(0);
      fiveMinuteTriggered.current = false;
    }
  }, [isPlaying, currentTrack]);

  const searchMusic = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`
      );
      const data = await res.json();
      const results = (data.results || []).filter((t: MusicTrack) => t.previewUrl);
      if (trendingTracks.length === 0) setTrendingTracks(results.slice(0, 6));
      setTracks(results);
    } catch (e) {
      console.error('Music search failed:', e);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMusic(searchQuery);
  };

  const playTrack = (track: MusicTrack) => {
    setPendingTrack(track);
    setShowConfirmModal(true);
  };

  const confirmPlay = () => {
    if (!pendingTrack) return;
    
    setCurrentTrack(pendingTrack);
    setIsPlaying(true);
    setProgress(0);
    setListeningTimer(0);
    fiveMinuteTriggered.current = false;
    if (audioRef.current) {
      audioRef.current.src = pendingTrack.previewUrl;
      audioRef.current.play().catch(e => console.log('Playback failed:', e));
    }
    setPendingTrack(null);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack && canEarn) {
      setProgress(audioRef.current.currentTime);
      const earningsPerSecond = 0.05 / 60;
      setEarnedAmount(prev => prev + earningsPerSecond);
      onEarningsUpdate(earningsPerSecond);
    } else if (audioRef.current && currentTrack) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const skipTrack = () => {
    const list = tracks.length > 0 ? tracks : trendingTracks;
    if (!currentTrack || list.length === 0) return;
    const idx = list.findIndex(t => t.trackId === currentTrack.trackId);
    const next = list[(idx + 1) % list.length];
    playTrack(next);
  };

  const closeCurrentTrack = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setListeningTimer(0);
    fiveMinuteTriggered.current = false;
  };

  const formatTime = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const displayTracks = tracks.length > 0 ? tracks : trendingTracks;

  const handleCategoryClick = (catName: string, query: string) => {
    setSelectedCategory(catName);
    setSearchQuery(query);
    searchMusic(query);
  };

  return (
    <div className="mb-0">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleTrackEnd} />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#7acc00]" />
          <span className="text-sm font-bold text-gray-800">Listen & Earn</span>
        </div>
        {canEarn ? (
          <span className="text-xs text-[#7acc00] font-semibold bg-[#7acc00]/10 px-2 py-1" style={{ borderRadius: '0' }}>
            +{earnedAmount.toFixed(3)} ETB
          </span>
        ) : (
          <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1" style={{ borderRadius: '0' }}>
            Free Listening
          </span>
        )}
      </div>

      {/* VIP Benefits Card */}
      <VIPBenefitsCard onUpgrade={onUpgradeClick} />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song, artist..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#7acc00]/50 focus:border-[#7acc00]"
            style={{ borderRadius: '0' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold text-sm hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          style={{ borderRadius: '0' }}
        >
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      </form>

      {/* Music Categories */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { icon: Headphones, name: 'Pop', color: 'from-pink-500 to-rose-500', query: 'pop hits' },
          { icon: Radio, name: 'Hip Hop', color: 'from-purple-500 to-indigo-500', query: 'hip hop' },
          { icon: Music, name: 'Electronic', color: 'from-blue-500 to-cyan-500', query: 'electronic dance' },
          { icon: ListMusic, name: 'R&B', color: 'from-green-500 to-emerald-500', query: 'r&b soul' },
        ].map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.name;
          return (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name, cat.query)}
              className={`flex flex-col items-center gap-1 p-2 hover:bg-gray-50 transition-colors relative ${
                isSelected ? 'border-b-2 border-black' : ''
              }`}
              style={{ borderRadius: '0' }}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${cat.color} flex items-center justify-center`} style={{ borderRadius: '0' }}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-medium text-gray-600">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Now Playing */}
      {currentTrack && (
        <div className="bg-gradient-to-br from-[#1a2a1a] to-[#2d4a2d] p-3 mb-3 shadow-lg relative" style={{ borderRadius: '0' }}>
          {/* Close button */}
          <button
            onClick={closeCurrentTrack}
            className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
            style={{ borderRadius: '0' }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <img
              src={currentTrack.artworkUrl100.replace('100x100', '200x200')}
              alt={currentTrack.trackName}
              className="w-14 h-14 object-cover shadow-md"
              style={{ borderRadius: '0' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentTrack.trackName}</p>
              <p className="text-xs text-white/60 truncate">{currentTrack.artistName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Music className="w-3 h-3 text-[#7acc00]" />
                <span className="text-[10px] text-[#B0FC38]">
                  {canEarn ? 'Earn 0.05 ETB/min' : 'Free Listening'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-[#7acc00] flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                style={{ borderRadius: '0' }}
              >
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              <button 
                onClick={skipTrack} 
                className="p-2 hover:bg-white/10 transition-colors"
                style={{ borderRadius: '0' }}
              >
                <SkipForward className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>{formatSec(progress)}</span>
              <span>{formatTime(currentTrack.trackTimeMillis || 30000)}</span>
            </div>
            <div className="h-1 bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] transition-all"
                style={{ width: `${(progress / ((currentTrack.trackTimeMillis || 30000) / 1000)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      <div className="bg-white border border-gray-100 overflow-hidden shadow-sm" style={{ marginBottom: '0' }}>
        <div className="p-3 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-700">
            {tracks.length > 0 ? `Results (${tracks.length})` : '🔥 Trending Now'}
          </span>
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="w-6 h-6 text-[#7acc00] animate-spin" />
            </div>
          ) : displayTracks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No tracks found. Try a different search.</div>
          ) : (
            displayTracks.map((track) => (
              <button
                key={track.trackId}
                onClick={() => playTrack(track)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-[#f8fdf5] transition-colors ${
                  currentTrack?.trackId === track.trackId ? 'bg-[#f0fce0]' : ''
                }`}
                style={{ borderRadius: '0' }}
              >
                <div className="relative">
                  <img
                    src={track.artworkUrl100}
                    alt={track.trackName}
                    className="w-11 h-11 object-cover"
                    style={{ borderRadius: '0' }}
                  />
                  {currentTrack?.trackId === track.trackId && isPlaying && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center" style={{ borderRadius: '0' }}>
                      <Volume2 className="w-4 h-4 text-white animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-800 truncate">{track.trackName}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[10px] text-gray-400">{formatTime(track.trackTimeMillis)}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Hidden scrollbar style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* View Confirmation Modal */}
      <ViewConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmPlay}
        trackName={pendingTrack?.trackName || ''}
        duration={pendingTrack?.trackTimeMillis || 180000}
        canEarn={canEarn}
      />

      {/* 5 Minute Listening Notification */}
      <FiveMinuteNotification 
        isOpen={showFiveMinuteNotif} 
        onClose={() => setShowFiveMinuteNotif(false)} 
      />

      {/* Upgrade Notification */}
      <UpgradeNotification
        isOpen={showUpgradeNotif}
        onClose={() => setShowUpgradeNotif(false)}
        onUpgrade={onUpgradeClick}
      />
    </div>
  );
};

// Customer Service Modal
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-2xl p-6">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <img src={customerServiceImage} alt="Support" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Customer Support</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          <p className="relative mt-3 text-sm text-white/80">Connect with us on Telegram for instant support</p>
        </div>

        <div className="p-4 space-y-3">
          {telegramChannels.map((channel, index) => (
            <a key={index} href={channel.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  {index === 0 ? <img src={customerServiceImage} className="w-5 h-5" /> : index === 1 ? <MessageCircle className="w-5 h-5 text-blue-600" /> : <Users className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{channel.label}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Send className="w-3 h-3" />
                    {channel.handle}
                  </div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// Customer Service Button
const CustomerServiceButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
  >
    <img src={customerServiceImage} alt="Support" className="w-7 h-7" />
    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
    </span>
  </button>
);

const Dashboard = () => {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [showGift, setShowGift] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasCompletedVipLevel, setHasCompletedVipLevel] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [timeUntilNextTransfer, setTimeUntilNextTransfer] = useState('');
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [showUpgradeNotif, setShowUpgradeNotif] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const [isInvestLoading, setIsInvestLoading] = useState(false);
  const [investLevelId, setInvestLevelId] = useState<number | null>(null);

  // Check if user can earn (has made a deposit)
  const [canEarn, setCanEarn] = useState(false);

  useEffect(() => {
    const fromLogin = location.state?.fromLogin;
    if (fromLogin && !loading && user) {
      setShowAnnouncement(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loading, user]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading, navigate]);

  // Fetch user details including phone from profile
  useEffect(() => {
    if (profile) {
      setUserDetails({
        full_name: profile.full_name || null,
        phone: profile.phone || '',
        email: profile.email || null,
        vip_level: profile.vip_level || 'Basic',
        balance: profile.balance || 0,
        withdrawable_balance: profile.withdrawable_balance || 0,
        total_investment: 0, // This would need to be calculated
        total_earnings: profile.withdrawable_balance || 0,
        referral_code: profile.referral_code || null
      });
    }
  }, [profile]);

  // Check if user has made any deposit
  const checkUserDeposit = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('type', 'deposit')
      .eq('status', 'approved')
      .limit(1);
      
    setCanEarn(data && data.length > 0);
  };

  useEffect(() => {
    checkUserDeposit();
  }, [user]);

  const fetchDailyIncome = async () => {
    if (!user) return;
    try {
      await supabase.functions.invoke('transfer-income');
    } catch (e) {
      console.log('Income transfer check:', e);
    }

    const { data } = await supabase
      .from('user_daily_income')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setDailyIncome(data.today_income || 0);
      if (data.last_income_transfer_at) {
        const now = new Date();
        const lastTransfer = new Date(data.last_income_transfer_at);
        const hoursSince = (now.getTime() - lastTransfer.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24 && data.today_income > 0) {
          const hoursLeft = 24 - hoursSince;
          const h = Math.floor(hoursLeft);
          const m = Math.floor((hoursLeft % 1) * 60);
          setTimeUntilNextTransfer(`${h}h ${m}m`);
        } else {
          setTimeUntilNextTransfer('');
        }
      }
    }
  };

  useEffect(() => {
    fetchDailyIncome();
    const interval = setInterval(fetchDailyIncome, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const fetchVipLevels = async () => {
      const { data } = await supabase.from('vip_levels').select('*').order('id');
      if (data) setVipLevels(data);
    };
    fetchVipLevels();
  }, []);

  useEffect(() => {
    const checkCompletedVipLevels = async () => {
      if (!user) return;
      for (const vipLevel of [1, 2, 3, 4, 5, 6]) {
        const { data: tasks } = await supabase.from('tasks').select('id').eq('vip_level', vipLevel);
        const { data: completed } = await supabase.from('user_task_progress').select('task_id').eq('user_id', user.id).eq('vip_level', vipLevel).eq('completed', true);
        if ((tasks?.length || 0) > 0 && (completed?.length || 0) >= (tasks?.length || 0)) {
          setHasCompletedVipLevel(true);
          return;
        }
      }
      setHasCompletedVipLevel(false);
    };
    checkCompletedVipLevels();
  }, [user, profile?.current_vip_level]);

  const handleInvest = async (levelId: number) => {
    setInvestLevelId(levelId);
    setIsInvestLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const level = vipLevels.find(l => l.id === levelId);
    if (!level || !profile || !user) {
      setIsInvestLoading(false);
      setInvestLevelId(null);
      return;
    }

    if (profile.balance < level.price) {
      setSuccessMessage('Insufficient balance');
      setShowSuccess(true);
      setIsInvestLoading(false);
      setInvestLevelId(null);
      return;
    }

    const { data, error } = await supabase.rpc('process_vip_purchase', {
      p_user_id: user.id,
      p_vip_level: level.id,
      p_amount: level.price,
    });

    if (error) {
      setSuccessMessage('Purchase failed. Please try again.');
    } else if (data) {
      setSuccessMessage('Purchase successful!');
      await refreshProfile();
      await fetchDailyIncome();
    } else {
      setSuccessMessage('Purchase failed. Insufficient balance.');
    }
    setShowSuccess(true);
    setIsInvestLoading(false);
    setInvestLevelId(null);
  };

  const handleMusicEarnings = (earnings: number) => {
    setTodayEarnings(prev => prev + earnings);
  };

  const handleUpgradeClick = () => {
    navigate('/earn');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f9f0]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9f0]">
      {/* Desktop Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header with Navigation Menu only */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* 3-Line Navigation Menu with everything inside */}
            <NavigationMenu 
              user={user} 
              profile={profile} 
              onLogout={handleLogout}
              dailyIncome={dailyIncome}
              todayEarnings={todayEarnings}
              canEarn={canEarn}
              onDeposit={() => navigate('/deposit')}
              onWithdraw={() => navigate('/withdraw')}
              userDetails={userDetails}
            />
            
            {/* Page Title */}
            <h1 className="text-xl font-bold text-gray-800">Music Dashboard</h1>
          </div>

          {/* Empty div for spacing */}
          <div className="w-10" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Music Section (12 cols on desktop) */}
          <div className="lg:col-span-12 space-y-4">
            <MusicSection 
              onEarningsUpdate={handleMusicEarnings}
              canEarn={canEarn}
              onUpgradeClick={handleUpgradeClick}
            />
          </div>
        </div>
      </div>

      {/* Gift Code Button */}
      <GiftCodeButton onClick={() => setShowGift(true)} />

      {/* Customer Service Button */}
      <CustomerServiceButton onClick={() => setShowCustomerService(true)} />

      <CustomerServiceModal isOpen={showCustomerService} onClose={() => setShowCustomerService(false)} />

      <BottomNavigation />

      {/* Modals */}
      <GiftModal isOpen={showGift} onClose={() => setShowGift(false)} />
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMessage} />
      <AnnouncementModal isOpen={showAnnouncement} onClose={() => { setShowAnnouncement(false); setShowTelegram(true); }} />
      <TelegramModal isOpen={showTelegram} onClose={() => setShowTelegram(false)} />
    </div>
  );
};

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-slideDown {
      animation: slideDown 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-in;
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;