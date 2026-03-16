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
  Wallet, Download, Gift, HelpCircle, ChevronDown, ChevronUp, Save,
  ChevronLeftCircle, ChevronRightCircle, StopCircle, PlayCircle, Flame
} from 'lucide-react';

// Add VipMusicPackage interface
interface VipMusicPackage {
  id: number;
  name: string;
  price: number;
  earningsPerMinute: number;
  dailyEarningTarget: number;
  dailyLimit: number;
  monthlyEarnings: number;
  yearlyEarnings: number;
  color: string;
  icon: string;
  features: string[];
  popular?: boolean;
}

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
  id: string;
  title: string;
  artist: string;
  artwork: string;
  audioUrl: string;
  duration: number;
  genre: string;
  isHot?: boolean;
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

interface DownloadedTrack {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
  downloadedAt: string;
}

const telegramChannels = [
  { label: 'Official Support', url: 'https://t.me/DSWonline_suport', handle: '@DSWonline_suport' },
  { label: 'Public Channel', url: 'https://t.me/etonlinejob1', handle: 'DSW Channel' },
  { label: 'Discussion Group', url: 'https://t.me/+Jihv4uEOv0o0M2U0', handle: 'DSW Group' },
];

// Downloaded Tracks Player Component
const DownloadedTracksPlayer = ({ 
  tracks, 
  onPlayTrack,
  currentTrack,
  isPlaying,
  onStop,
  onPause,
  onResume
}: { 
  tracks: DownloadedTrack[];
  onPlayTrack: (track: DownloadedTrack) => void;
  currentTrack: DownloadedTrack | null;
  isPlaying: boolean;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#7acc00]" />
          <span className="font-semibold text-gray-700">Downloaded Tracks ({tracks.length})</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          {tracks.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">
              No downloaded tracks yet. Download songs to listen offline!
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {tracks.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100"
                >
                  <img
                    src={track.artwork}
                    alt={track.title}
                    className="w-10 h-10 object-cover"
                    style={{ borderRadius: '0' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{track.title}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <>
                        <button
                          onClick={onPause}
                          className="p-2 bg-[#ff9800] text-white rounded-lg hover:bg-[#e68900] transition-colors"
                          title="Pause"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onStop}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Stop"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : currentTrack?.id === track.id && !isPlaying ? (
                      <>
                        <button
                          onClick={onResume}
                          className="p-2 bg-[#7acc00] text-white rounded-lg hover:bg-[#6bb800] transition-colors"
                          title="Resume"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={onStop}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Stop"
                        >
                          <StopCircle className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onPlayTrack(track)}
                        className="p-2 bg-[#7acc00] text-white rounded-lg hover:bg-[#6bb800] transition-colors"
                        title="Play"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Maximum Earning Notification Component
const MaxEarningNotification = ({ isOpen, onClose, packageName, dailyEarning }: { 
  isOpen: boolean; 
  onClose: () => void; 
  packageName: string;
  dailyEarning: number;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown w-full max-w-sm px-4">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-2xl p-4 border-l-4 border-amber-700">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-sm mb-1">⏰ Daily Limit Reached!</h3>
            <p className="text-xs text-white/90">
              You've reached your maximum earning limit for today ({packageName}).
            </p>
            <p className="text-xs text-white/80 mt-1">
              You earned {dailyEarning} ETB today. Come back tomorrow to continue earning!
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

// Navigation Menu Component
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
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 hover:bg-gray-100 rounded-lg transition-colors flex flex-col items-center gap-1 bg-white shadow-sm"
      >
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
        <div className="w-6 h-0.5 bg-gray-600 rounded-full" />
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slideDown">
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

          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-around">
              <button onClick={() => { onDeposit(); setIsOpen(false); }} className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-xl flex items-center justify-center">
                  <img src={depositImage} alt="Deposit" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-700">Deposit</span>
              </button>
              <button onClick={() => { onWithdraw(); setIsOpen(false); }} className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#fff8e1] to-[#ffecb3] rounded-xl flex items-center justify-center">
                  <img src={withdrawImage} alt="Withdraw" className="w-6 h-6 object-contain" />
                </div>
                <span className="text-xs font-medium text-gray-700">Withdraw</span>
              </button>
              <button onClick={() => { window.location.href = '/gift'; setIsOpen(false); }} className="flex flex-col items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-12 h-12 bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2] rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#ff9800]" />
                </div>
                <span className="text-xs font-medium text-gray-700">Gift</span>
              </button>
            </div>
          </div>

          <div className="p-2 border-b border-gray-100">
            <button onClick={() => setShowQuickStats(!showQuickStats)} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-[#7acc00]" />
                <span className="text-sm font-medium text-gray-700">Quick Stats</span>
              </div>
              {showQuickStats ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
            </button>

            {showQuickStats && (
              <div className="p-3 space-y-2 animate-fadeIn">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">VIP Level</span>
                  <span className="text-xs font-semibold text-[#7acc00]">{profile?.vip_level || 'Basic'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Main Balance</span>
                  <span className="text-xs font-semibold">{profile?.balance?.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-xs text-gray-600">Withdrawable</span>
                  <span className="text-xs font-semibold">{profile?.withdrawable_balance?.toLocaleString()} ETB</span>
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

          <div className="p-2">
            <button onClick={() => { window.location.href = '/profile'; setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <User className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">My Profile</span>
            </button>
            <button onClick={() => { window.location.href = '/transactions'; setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <History className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Transaction History</span>
            </button>
            <button onClick={() => { window.location.href = '/settings'; setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <Settings className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Settings</span>
            </button>
            <button onClick={() => { window.location.href = '/help'; setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <HelpCircle className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Help Center</span>
            </button>
          </div>

          <div className="p-2 border-t border-gray-100">
            <button onClick={() => { onLogout(); setIsOpen(false); }} className="w-full flex items-center gap-3 p-3 hover:bg-red-50 rounded-lg transition-colors text-red-600">
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
    <button onClick={onClick} className="fixed right-4 top-24 z-50">
      <img src={giftCodeImage} alt="Gift" className="w-16 h-16 object-contain hover:scale-110 transition-transform" />
      <button onClick={(e) => { e.stopPropagation(); setIsVisible(false); }} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600">
        ×
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
    <p className="text-sm text-white/80 mb-4">Upgrade to VIP and start earning real money from your listening time!</p>
    <div className="space-y-2 mb-4">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-[#B0FC38]" />
        <span>Earn 0.05416 ETB per minute</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-[#B0FC38]" />
        <span>Daily income added to wallet</span>
      </div>
    </div>
    <button onClick={() => window.location.href = '/vip-packages'} className="w-full py-2 bg-white text-[#2d3a2d] font-semibold rounded-xl hover:bg-white/90 transition-colors">
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
          <p className="text-gray-700 mb-4">You're currently on a free plan. To start earning real money from listening, you need to upgrade to a VIP package.</p>
          
          <div className="bg-[#f0f9e8] p-4 rounded-xl mb-4 border border-[#7acc00]/30">
            <h4 className="font-semibold text-[#2d3a2d] mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7acc00]" />
              VIP Benefits:
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-[#7acc00] font-bold">•</span>Earn 0.05416 ETB per minute of listening</li>
              <li className="flex items-start gap-2"><span className="text-[#7acc00] font-bold">•</span>Daily income added to your wallet</li>
              <li className="flex items-start gap-2"><span className="text-[#7acc00] font-bold">•</span>Access to exclusive premium content</li>
              <li className="flex items-start gap-2"><span className="text-[#7acc00] font-bold">•</span>Higher withdrawal limits</li>
            </ul>
          </div>
          
          <p className="text-xs text-gray-500 mb-4">Free users can listen but won't accumulate earnings. Deposit first and upgrade to start earning.</p>
          
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">Later</button>
            <button onClick={() => { onUpgrade(); onClose(); }} className="flex-1 py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg transition-all">Upgrade Now</button>
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
            <p className="text-xs text-white/90">You've been listening for 5 minutes! Keep going to earn more.</p>
            <button onClick={onClose} className="mt-2 text-xs text-white/80 hover:text-white underline">Got it</button>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// View Confirmation Modal
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

          <p className="text-sm text-gray-600 mb-2">You are about to play: <span className="font-semibold text-gray-800">{trackName}</span></p>
          
          <div className={`p-3 rounded-xl mb-4 border ${canEarn ? 'bg-[#f0f9e8] border-[#7acc00]/20' : 'bg-gray-100 border-gray-200'}`}>
            {canEarn ? (
              <>
                <p className="text-xs text-gray-700 mb-2">⚠️ <span className="font-bold">Earning Active:</span> You will earn for {Math.floor(duration / 60)} minute song.</p>
                <p className="text-xs text-gray-700">🔍 Our system will track your listening time. Enjoy the music!</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-700 mb-2">🎵 <span className="font-bold">Free Listening:</span> You're on a free plan.</p>
                <p className="text-xs text-gray-700">You can listen for free. Upgrade to VIP to start earning money!</p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors rounded-xl">Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-gradient-to-r from-[#7acc00] to-[#B0FC38] text-white font-semibold rounded-xl hover:shadow-lg transition-all">
              {canEarn ? 'Listen & Earn' : 'Listen Free'}
            </button>
          </div>
          
          {!canEarn && (
            <button onClick={() => { onClose(); window.location.href = '/vip-packages'; }} className="w-full mt-3 py-2 text-center text-sm text-[#7acc00] font-semibold hover:underline">
              Upgrade to Start Earning →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Download Error Notification Component
const DownloadErrorNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown w-full max-w-sm px-4">
      <div className="bg-red-500 rounded-xl shadow-2xl p-4 border-l-4 border-red-700">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white">{message}</p>
          </div>
          <button onClick={() => { setIsVisible(false); onClose(); }} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// Download Success Notification Component
const DownloadSuccessNotification = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown w-full max-w-sm px-4">
      <div className="bg-[#7acc00] rounded-xl shadow-2xl p-4 border-l-4 border-[#2d5a2d]">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-white">{message}</p>
          </div>
          <button onClick={() => { setIsVisible(false); onClose(); }} className="text-white/60 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
};

// Hot Music Banner Component - 2x2 grid
const HotMusicBanner = ({ tracks, onPlayTrack }: { tracks: MusicTrack[]; onPlayTrack: (track: MusicTrack) => void }) => {
  // Take first 4 tracks for the banner
  const hotTracks = tracks.slice(0, 4);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-5 h-5 text-orange-500" />
        <h3 className="text-sm font-bold text-gray-800">Hot Music 🔥</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {hotTracks.map((track) => (
          <button
            key={track.id}
            onClick={() => onPlayTrack(track)}
            className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group hover:ring-2 hover:ring-[#7acc00] transition-all"
          >
            <img
              src={track.artwork}
              alt={track.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-xs text-white font-semibold truncate">{track.title}</p>
                <p className="text-[10px] text-gray-300 truncate">{track.artist}</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-[#7acc00] text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Music Section Component
const MusicSection = ({ 
  onEarningsUpdate,
  canEarn,
  onUpgradeClick,
  userPackage,
  dailyEarnedMinutes,
  setDailyEarnedMinutes,
  setTodayEarnedAmount,
  setShowMaxEarningNotif
}: { 
  onEarningsUpdate: (earnings: number) => void;
  canEarn: boolean;
  onUpgradeClick: () => void;
  userPackage: VipMusicPackage | null;
  dailyEarnedMinutes: number;
  setDailyEarnedMinutes: (minutes: number) => void;
  setTodayEarnedAmount: (amount: number) => void;
  setShowMaxEarningNotif: (show: boolean) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | DownloadedTrack | null>(null);
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
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [showDownloaded, setShowDownloaded] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fiveMinuteTriggered = useRef(false);
  const maxEarningTriggered = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('downloadedTracks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDownloadedTracks(parsed);
      } catch (e) {
        console.error('Failed to load downloaded tracks:', e);
      }
    }
  }, []);

  const hasReachedMaxEarning = () => {
    if (!userPackage) return false;
    return dailyEarnedMinutes >= userPackage.dailyLimit;
  };

  // Load trending on mount from iTunes API
  useEffect(() => {
    fetchMusicFromAPI('top hits 2024');
  }, []);

  // Fetch music from iTunes API - can load 500+ tracks
  const fetchMusicFromAPI = async (query: string, loadMore: boolean = false) => {
    if (!query.trim() && !loadMore) return;
    
    setLoading(true);
    try {
      let url;
      if (loadMore && nextPageUrl) {
        url = nextPageUrl;
      } else {
        url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50&offset=${loadMore ? tracks.length : 0}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.results) {
        const validTracks = data.results
          .filter((t: any) => t.previewUrl)
          .map((t: any) => ({
            id: `itunes-${t.trackId}`,
            title: t.trackName,
            artist: t.artistName,
            artwork: t.artworkUrl100?.replace('100x100', '300x300') || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300',
            audioUrl: t.previewUrl,
            duration: Math.floor(t.trackTimeMillis / 1000) || 180,
            genre: t.primaryGenreName || 'Various'
          }));
        
        if (loadMore) {
          setTracks(prev => [...prev, ...validTracks]);
        } else {
          setTracks(validTracks);
          setTrendingTracks(validTracks.slice(0, 10));
        }
        
        if (validTracks.length === 50) {
          setNextPageUrl(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=50&offset=${tracks.length + 50}`);
        } else {
          setNextPageUrl(null);
        }
      }
    } catch (e) {
      console.error('Music search failed:', e);
    }
    setLoading(false);
  };

  const loadMoreTracks = () => {
    if (nextPageUrl) {
      fetchMusicFromAPI(searchQuery, true);
    }
  };

  const searchMusic = (query: string) => {
    if (!query.trim()) return;
    fetchMusicFromAPI(query);
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
      audioRef.current.src = pendingTrack.audioUrl;
      audioRef.current.play().catch(e => console.log('Playback failed:', e));
    }
    setPendingTrack(null);
  };

  const playDownloadedTrack = (track: DownloadedTrack) => {
    if (currentTrack?.id === track.id && isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    } else if (currentTrack?.id === track.id && !isPlaying) {
      setIsPlaying(true);
      if (audioRef.current) audioRef.current.play().catch(e => console.log('Playback failed:', e));
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
      setListeningTimer(0);
      if (audioRef.current && track.audioUrl) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play().catch(e => console.log('Playback failed:', e));
      }
    }
  };

  const pauseTrack = () => {
    setIsPlaying(false);
    if (audioRef.current) audioRef.current.pause();
  };

  const resumeTrack = () => {
    setIsPlaying(true);
    if (audioRef.current) audioRef.current.play().catch(e => console.log('Playback failed:', e));
  };

  const stopTrack = () => {
    setIsPlaying(false);
    setCurrentTrack(null);
    setProgress(0);
    setListeningTimer(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && currentTrack) {
      setProgress(audioRef.current.currentTime);
      if (canEarn && !hasReachedMaxEarning() && !('audioBlob' in currentTrack)) {
        const earningsPerSecond = 0.05416 / 60;
        setEarnedAmount(prev => prev + earningsPerSecond);
        onEarningsUpdate(earningsPerSecond);
      }
    }
  };

  const handleTrackEnd = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  const skipTrack = () => {
    const list = tracks.length > 0 ? tracks : trendingTracks;
    if (!currentTrack || list.length === 0 || 'audioBlob' in currentTrack) return;
    const idx = list.findIndex(t => t.id === (currentTrack as MusicTrack).id);
    const next = list[(idx + 1) % list.length];
    playTrack(next);
  };

  const closeCurrentTrack = () => stopTrack();

  const downloadTrack = async (track: MusicTrack) => {
    try {
      setDownloadProgress(0);
      setDownloadError(null);
      
      if (downloadedTracks.some(t => t.id === track.id)) {
        setDownloadError('This track is already downloaded!');
        setDownloadProgress(null);
        return;
      }

      setDownloadProgress(30);
      const response = await fetch(track.audioUrl);
      if (!response.ok) throw new Error('Download failed - network error');
      
      setDownloadProgress(70);
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const downloadedTrack: DownloadedTrack = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        audioBlob: blob,
        audioUrl: audioUrl,
        duration: track.duration,
        downloadedAt: new Date().toISOString()
      };

      const updated = [...downloadedTracks, downloadedTrack];
      setDownloadedTracks(updated);
      
      const trackData = updated.map(t => ({ ...t, audioBlob: null, audioUrl: '' }));
      localStorage.setItem('downloadedTracks', JSON.stringify(trackData));
      
      setDownloadProgress(100);
      setTimeout(() => {
        setDownloadProgress(null);
        setDownloadSuccess('✓ Track downloaded successfully!');
      }, 500);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('Download failed. Please check your connection and try again.');
      setDownloadProgress(null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const displayTracks = tracks.length > 0 ? tracks : trendingTracks;

  const handleCategoryClick = (catName: string) => {
    setSelectedCategory(catName);
    
    const categoryQueries: Record<string, string> = {
      'Ethiopian': 'ethiopian music',
      'Ethio-Jazz': 'ethiopian jazz',
      'Pop': 'pop music',
      'Hip Hop': 'hip hop',
      'Afrobeat': 'afrobeat',
      'Amapiano': 'amapiano',
      'Reggae': 'reggae',
      'Gym': 'workout music',
      'Motivation': 'motivational',
      'Rock': 'rock music',
      'Jazz': 'jazz',
      'Classical': 'classical'
    };
    
    const query = categoryQueries[catName] || catName;
    fetchMusicFromAPI(query);
  };

  const scrollCategories = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-0">
      <audio ref={audioRef} onTimeUpdate={handleTimeUpdate} onEnded={handleTrackEnd} />

      {downloadError && <DownloadErrorNotification message={downloadError} onClose={() => setDownloadError(null)} />}
      {downloadSuccess && <DownloadSuccessNotification message={downloadSuccess} onClose={() => setDownloadSuccess(null)} />}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-[#7acc00]" />
          <span className="text-sm font-bold text-gray-800">Listen & Earn</span>
        </div>
        <div className="flex items-center gap-2">
          {canEarn ? (
            <>
              <span className="text-xs text-[#7acc00] font-semibold bg-[#7acc00]/10 px-2 py-1" style={{ borderRadius: '0' }}>
                +{earnedAmount.toFixed(3)} ETB
              </span>
              {userPackage && (
                <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1" style={{ borderRadius: '0' }}>
                  {Math.floor(dailyEarnedMinutes / 60)}h {dailyEarnedMinutes % 60}m / {Math.floor(userPackage.dailyLimit / 60)}h
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-500 font-semibold bg-gray-100 px-2 py-1" style={{ borderRadius: '0' }}>
              Free Listening
            </span>
          )}
        </div>
      </div>

      <VIPBenefitsCard onUpgrade={onUpgradeClick} />
      
      <DownloadedTracksPlayer 
        tracks={downloadedTracks}
        onPlayTrack={playDownloadedTrack}
        currentTrack={currentTrack as DownloadedTrack}
        isPlaying={isPlaying}
        onStop={stopTrack}
        onPause={pauseTrack}
        onResume={resumeTrack}
      />

      {/* Hot Music Banner - 2x2 Grid */}
      {displayTracks.length > 0 && (
        <HotMusicBanner tracks={displayTracks} onPlayTrack={playTrack} />
      )}

      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 500+ songs, artists, genres..."
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

      <div className="relative mb-3">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 lg:hidden">
          <button onClick={() => scrollCategories('left')} className="p-1 bg-white rounded-full shadow-md">
            <ChevronLeft className="w-4 h-4 text-[#7acc00]" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 lg:hidden">
          <button onClick={() => scrollCategories('right')} className="p-1 bg-white rounded-full shadow-md">
            <ChevronRight className="w-4 h-4 text-[#7acc00]" />
          </button>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 px-6 lg:px-0 lg:grid lg:grid-cols-8 lg:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[
            { icon: Headphones, name: 'Ethiopian', color: 'from-amber-500 to-yellow-500' },
            { icon: Music, name: 'Ethio-Jazz', color: 'from-orange-500 to-red-500' },
            { icon: Radio, name: 'Pop', color: 'from-pink-500 to-rose-500' },
            { icon: Radio, name: 'Hip Hop', color: 'from-purple-500 to-indigo-500' },
            { icon: Headphones, name: 'Afrobeat', color: 'from-yellow-600 to-orange-600' },
            { icon: Music, name: 'Amapiano', color: 'from-blue-600 to-indigo-600' },
            { icon: Radio, name: 'Reggae', color: 'from-green-700 to-green-500' },
            { icon: Music, name: 'Gym', color: 'from-red-500 to-orange-500' },
            { icon: Music, name: 'Motivation', color: 'from-emerald-500 to-teal-500' },
            { icon: Headphones, name: 'Rock', color: 'from-gray-700 to-gray-500' },
            { icon: ListMusic, name: 'Jazz', color: 'from-indigo-500 to-purple-500' },
            { icon: Music, name: 'Classical', color: 'from-stone-500 to-stone-700' },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`flex flex-col items-center gap-1 p-2 hover:bg-gray-50 transition-colors relative flex-shrink-0 w-16 ${
                  isSelected ? 'border-b-2 border-black' : ''
                }`}
                style={{ borderRadius: '0' }}
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${cat.color} flex items-center justify-center`} style={{ borderRadius: '0' }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 truncate w-full text-center">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentTrack && (
        <div className="bg-gradient-to-br from-[#1a2a1a] to-[#2d4a2d] p-3 mb-3 shadow-lg relative" style={{ borderRadius: '0' }}>
          <button onClick={closeCurrentTrack} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10" style={{ borderRadius: '0' }}>
            <X className="w-4 h-4" />
          </button>

          {!('audioBlob' in currentTrack) && (
            <button onClick={() => downloadTrack(currentTrack as MusicTrack)} className="absolute -top-2 left-2 w-7 h-7 bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10" style={{ borderRadius: '0' }} title="Download for offline">
              <Download className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <img src={currentTrack.artwork} alt={currentTrack.title} className="w-14 h-14 object-cover shadow-md" style={{ borderRadius: '0' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{currentTrack.title}</p>
              <p className="text-xs text-white/60 truncate">{currentTrack.artist}</p>
              <div className="flex items-center gap-1 mt-1">
                <Music className="w-3 h-3 text-[#7acc00]" />
                <span className="text-[10px] text-[#B0FC38]">
                  {'audioBlob' in currentTrack ? 'Offline Mode' : (canEarn ? 'Earn 0.05416 ETB/min' : 'Free Listening')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 bg-[#7acc00] flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95" style={{ borderRadius: '0' }}>
                {isPlaying ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
              </button>
              {!('audioBlob' in currentTrack) && (
                <button onClick={skipTrack} className="p-2 hover:bg-white/10 transition-colors" style={{ borderRadius: '0' }}>
                  <SkipForward className="w-4 h-4 text-white/70" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-white/40 mb-1">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(currentTrack.duration)}</span>
            </div>
            <div className="h-1 bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7acc00] to-[#B0FC38] transition-all" style={{ width: `${(progress / currentTrack.duration) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 overflow-hidden shadow-sm" style={{ marginBottom: '0' }}>
        <div className="p-3 border-b border-gray-100 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-700">
            {tracks.length > 0 ? `${tracks.length} Tracks Found` : '🔥 Trending Now'}
          </span>
          {selectedCategory !== 'trending' && (
            <span className="text-xs text-[#7acc00] font-semibold">{selectedCategory}</span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex items-center justify-center py-8"><Loader className="w-6 h-6 text-[#7acc00] animate-spin" /></div>
          ) : displayTracks.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No tracks found. Try a different search.</div>
          ) : (
            <>
              {displayTracks.map((track) => (
                <div key={track.id} className="flex items-center gap-3 p-3 hover:bg-[#f8fdf5] transition-colors border-b border-gray-50">
                  <button onClick={() => playTrack(track)} className="flex-1 flex items-center gap-3 min-w-0">
                    <div className="relative">
                      <img src={track.artwork} alt={track.title} className="w-11 h-11 object-cover" style={{ borderRadius: '0' }} />
                      {currentTrack?.id === track.id && isPlaying && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center" style={{ borderRadius: '0' }}>
                          <Volume2 className="w-4 h-4 text-white animate-pulse" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-semibold text-gray-800 truncate">{track.title}</p>
                      <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] text-gray-400">{formatTime(track.duration)}</span>
                    </div>
                  </button>
                  
                  <button onClick={() => downloadTrack(track)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Download for offline" disabled={downloadProgress !== null}>
                    <Download className="w-4 h-4 text-[#7acc00]" />
                  </button>
                </div>
              ))}
              
              {/* Load More Button */}
              {nextPageUrl && (
                <button
                  onClick={loadMoreTracks}
                  disabled={loading}
                  className="w-full py-3 text-sm text-[#7acc00] font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More Tracks'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Track count footer */}
      {tracks.length > 0 && (
        <div className="mt-2 text-center">
          <span className="text-[10px] text-gray-400">
            {tracks.length} tracks loaded • Search for more
          </span>
        </div>
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>

      <ViewConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmPlay}
        trackName={pendingTrack?.title || ''}
        duration={pendingTrack?.duration || 180}
        canEarn={canEarn}
      />

      <FiveMinuteNotification isOpen={showFiveMinuteNotif} onClose={() => setShowFiveMinuteNotif(false)} />
      
      <UpgradeNotification isOpen={showUpgradeNotif} onClose={() => setShowUpgradeNotif(false)} onUpgrade={onUpgradeClick} />
    </div>
  );
};

// Customer Service Modal
const CustomerServiceModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative overflow-hidden bg-gradient-to-r from-[#7acc00] to-[#B0FC38] rounded-t-2xl p-6">
          <div className="absolute top-2 right-2 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
          </div>
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
            <a key={index} href={channel.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-[#7acc00]/10 transition-colors border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#7acc00]/20 flex items-center justify-center">
                  {index === 0 ? <img src={customerServiceImage} className="w-5 h-5" /> : index === 1 ? <MessageCircle className="w-5 h-5 text-[#7acc00]" /> : <Users className="w-5 h-5 text-[#7acc00]" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{channel.label}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500"><Send className="w-3 h-3" />{channel.handle}</div>
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
  <button onClick={onClick} className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 overflow-hidden bg-gradient-to-br from-[#7acc00] to-[#B0FC38] flex items-center justify-center">
    <img src={customerServiceImage} alt="Support" className="w-8 h-8" />
    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
    </span>
  </button>
);

const Dashboard = () => {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGift, setShowGift] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showTelegram, setShowTelegram] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  const [dailyIncome, setDailyIncome] = useState(0);
  const [timeUntilNextTransfer, setTimeUntilNextTransfer] = useState('');
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [userPackage, setUserPackage] = useState<VipMusicPackage | null>(null);
  const [dailyEarnedMinutes, setDailyEarnedMinutes] = useState(0);
  const [todayEarnedAmount, setTodayEarnedAmount] = useState(0);
  const [showMaxEarningNotif, setShowMaxEarningNotif] = useState(false);

  const [canEarn, setCanEarn] = useState(false);

  useEffect(() => {
    const fromLogin = location.state?.fromLogin;
    if (fromLogin && !loading && user) {
      setShowAnnouncement(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state, loading, user]);

  useEffect(() => {
    if (!loading && !user) {
      setIsRedirecting(true);
      setTimeout(() => navigate('/login'), 500);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setUserDetails({
        full_name: profile.full_name || null,
        phone: profile.phone || '',
        email: profile.email || null,
        vip_level: profile.vip_level || 'Basic',
        balance: profile.balance || 0,
        withdrawable_balance: profile.withdrawable_balance || 0,
        total_investment: 0,
        total_earnings: profile.withdrawable_balance || 0,
        referral_code: profile.referral_code || null
      });
    }
  }, [profile]);

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

  useEffect(() => {
    const lastDate = localStorage.getItem('lastListeningDate');
    const today = new Date().toDateString();
    
    if (lastDate !== today) {
      setDailyEarnedMinutes(0);
      setTodayEarnedAmount(0);
      localStorage.setItem('lastListeningDate', today);
      localStorage.setItem('dailyEarnedMinutes', '0');
      localStorage.setItem('todayEarnedAmount', '0');
    } else {
      const savedMinutes = localStorage.getItem('dailyEarnedMinutes');
      const savedAmount = localStorage.getItem('todayEarnedAmount');
      if (savedMinutes) setDailyEarnedMinutes(parseInt(savedMinutes));
      if (savedAmount) setTodayEarnedAmount(parseFloat(savedAmount));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dailyEarnedMinutes', dailyEarnedMinutes.toString());
    localStorage.setItem('todayEarnedAmount', todayEarnedAmount.toString());
  }, [dailyEarnedMinutes, todayEarnedAmount]);

  const maxEarningTriggered = useRef(false);

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

  const handleMusicEarnings = (earnings: number) => {
    setTodayEarnings(prev => prev + earnings);
  };

  const handleUpgradeClick = () => {
    setIsRedirecting(true);
    setTimeout(() => navigate('/vip-packages'), 500);
  };

  const handleLogout = async () => {
    setIsRedirecting(true);
    await signOut();
    setTimeout(() => navigate('/login'), 500);
  };

  if (loading || !profile || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f9f0]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#7acc00] font-semibold animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f9f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
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
            <h1 className="text-xl font-bold text-gray-800">Music Dashboard</h1>
          </div>
          <div className="w-10" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12 space-y-4">
            {/* Music Section with Hot Banner */}
            <MusicSection 
              onEarningsUpdate={handleMusicEarnings}
              canEarn={canEarn}
              onUpgradeClick={handleUpgradeClick}
              userPackage={userPackage}
              dailyEarnedMinutes={dailyEarnedMinutes}
              setDailyEarnedMinutes={setDailyEarnedMinutes}
              setTodayEarnedAmount={setTodayEarnedAmount}
              setShowMaxEarningNotif={setShowMaxEarningNotif}
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

      <GiftModal isOpen={showGift} onClose={() => setShowGift(false)} />
      <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} message={successMessage} />
      <AnnouncementModal isOpen={showAnnouncement} onClose={() => { setShowAnnouncement(false); setShowTelegram(true); }} />
      <TelegramModal isOpen={showTelegram} onClose={() => setShowTelegram(false)} />
      
      <MaxEarningNotification 
        isOpen={showMaxEarningNotif} 
        onClose={() => setShowMaxEarningNotif(false)}
        packageName={userPackage?.name || 'VIP'}
        dailyEarning={userPackage?.dailyEarningTarget || 0}
      />
    </div>
  );
};

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slideDown { animation: slideDown 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-fadeIn { animation: fadeIn 0.3s ease-in; }
  `;
  document.head.appendChild(style);
}

export default Dashboard;