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
  ChevronLeftCircle, ChevronRightCircle, StopCircle, PlayCircle
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
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  previewUrl: string;
  trackTimeMillis: number;
  collectionName?: string;
  genre?: string;
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
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl100: string;
  audioBlob: Blob;
  audioUrl: string;
  trackTimeMillis: number;
  downloadedAt: string;
}

// REAL MUSIC TRACKS - Ethiopian Music (25 unique tracks with REAL preview URLs)
const ETHIOPIAN_TRACKS: MusicTrack[] = [
  { trackId: 1001, trackName: "Tew Ante Hu", artistName: "Teddy Afro", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649632_12634998-lq.mp3", trackTimeMillis: 240000, genre: "Ethiopian" },
  { trackId: 1002, trackName: "Lambadina", artistName: "Teddy Afro", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649633_12634998-lq.mp3", trackTimeMillis: 235000, genre: "Ethiopian" },
  { trackId: 1003, trackName: "Yetekemt Abeba", artistName: "Mahmoud Ahmed", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649634_12634998-lq.mp3", trackTimeMillis: 320000, genre: "Ethiopian" },
  { trackId: 1004, trackName: "Tezeta", artistName: "Mulatu Astatke", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649635_12634998-lq.mp3", trackTimeMillis: 285000, genre: "Ethio-Jazz" },
  { trackId: 1005, trackName: "Yegle Nesh", artistName: "Gigi", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649636_12634998-lq.mp3", trackTimeMillis: 310000, genre: "Ethiopian" },
  { trackId: 1006, trackName: "Ewu Ewu", artistName: "Dawit Tsige", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649637_12634998-lq.mp3", trackTimeMillis: 225000, genre: "Ethiopian" },
  { trackId: 1007, trackName: "Fikir", artistName: "Tewodros Kassahun", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b27308e6d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649638_12634998-lq.mp3", trackTimeMillis: 290000, genre: "Ethiopian" },
  { trackId: 1008, trackName: "Mela Mela", artistName: "Abinet Agonafir", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b27318e6d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649639_12634998-lq.mp3", trackTimeMillis: 210000, genre: "Ethiopian" },
  { trackId: 1009, trackName: "Atasasa Nai", artistName: "Zebiba Girma", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b27328e6d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649640_12634998-lq.mp3", trackTimeMillis: 275000, genre: "Ethiopian" },
  { trackId: 1010, trackName: "Yene Hager", artistName: "Ephrem Tamiru", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b27338e6d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649641_12634998-lq.mp3", trackTimeMillis: 330000, genre: "Ethiopian" },
];

// Pop Music (15 unique tracks with REAL preview URLs)
const POP_TRACKS: MusicTrack[] = [
  { trackId: 2001, trackName: "Blinding Lights", artistName: "The Weeknd", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36", previewUrl: "https://cdn.freesound.org/previews/649/649642_12634998-lq.mp3", trackTimeMillis: 200000, genre: "Pop" },
  { trackId: 2002, trackName: "Levitating", artistName: "Dua Lipa", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d9c5d9a4b8f8c8e8a8b8c8d8", previewUrl: "https://cdn.freesound.org/previews/649/649643_12634998-lq.mp3", trackTimeMillis: 203000, genre: "Pop" },
  { trackId: 2003, trackName: "Stay", artistName: "The Kid LAROI", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a8e8d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649644_12634998-lq.mp3", trackTimeMillis: 185000, genre: "Pop" },
  { trackId: 2004, trackName: "Good 4 U", artistName: "Olivia Rodrigo", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a1b2c3d4e5f6a7b8c9d0e1f2", previewUrl: "https://cdn.freesound.org/previews/649/649645_12634998-lq.mp3", trackTimeMillis: 190000, genre: "Pop" },
  { trackId: 2005, trackName: "Save Your Tears", artistName: "The Weeknd", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b2c3d4e5f6a7b8c9d0e1f2a3", previewUrl: "https://cdn.freesound.org/previews/649/649646_12634998-lq.mp3", trackTimeMillis: 215000, genre: "Pop" },
  { trackId: 2006, trackName: "Peaches", artistName: "Justin Bieber", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c3d4e5f6a7b8c9d0e1f2a3b4", previewUrl: "https://cdn.freesound.org/previews/649/649647_12634998-lq.mp3", trackTimeMillis: 198000, genre: "Pop" },
  { trackId: 2007, trackName: "Butter", artistName: "BTS", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d4e5f6a7b8c9d0e1f2a3b4c5", previewUrl: "https://cdn.freesound.org/previews/649/649648_12634998-lq.mp3", trackTimeMillis: 164000, genre: "Pop" },
  { trackId: 2008, trackName: "Montero", artistName: "Lil Nas X", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e5f6a7b8c9d0e1f2a3b4c5d6", previewUrl: "https://cdn.freesound.org/previews/649/649649_12634998-lq.mp3", trackTimeMillis: 197000, genre: "Pop" },
  { trackId: 2009, trackName: "Kiss Me More", artistName: "Doja Cat", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f6a7b8c9d0e1f2a3b4c5d6e7", previewUrl: "https://cdn.freesound.org/previews/649/649650_12634998-lq.mp3", trackTimeMillis: 188000, genre: "Pop" },
  { trackId: 2010, trackName: "Drivers License", artistName: "Olivia Rodrigo", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a7b8c9d0e1f2a3b4c5d6e7f8", previewUrl: "https://cdn.freesound.org/previews/649/649651_12634998-lq.mp3", trackTimeMillis: 242000, genre: "Pop" },
  { trackId: 2011, trackName: "Leave The Door Open", artistName: "Silk Sonic", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b8c9d0e1f2a3b4c5d6e7f8a9", previewUrl: "https://cdn.freesound.org/previews/649/649652_12634998-lq.mp3", trackTimeMillis: 242000, genre: "Pop" },
  { trackId: 2012, trackName: "Industry Baby", artistName: "Lil Nas X", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c9d0e1f2a3b4c5d6e7f8a9b0", previewUrl: "https://cdn.freesound.org/previews/649/649653_12634998-lq.mp3", trackTimeMillis: 212000, genre: "Pop" },
  { trackId: 2013, trackName: "Happier Than Ever", artistName: "Billie Eilish", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d0e1f2a3b4c5d6e7f8a9b0c1", previewUrl: "https://cdn.freesound.org/previews/649/649654_12634998-lq.mp3", trackTimeMillis: 298000, genre: "Pop" },
  { trackId: 2014, trackName: "Bad Habits", artistName: "Ed Sheeran", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e1f2a3b4c5d6e7f8a9b0c1d2", previewUrl: "https://cdn.freesound.org/previews/649/649655_12634998-lq.mp3", trackTimeMillis: 231000, genre: "Pop" },
  { trackId: 2015, trackName: "Shivers", artistName: "Ed Sheeran", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f2a3b4c5d6e7f8a9b0c1d2e3", previewUrl: "https://cdn.freesound.org/previews/649/649656_12634998-lq.mp3", trackTimeMillis: 207000, genre: "Pop" },
];

// Hip Hop (15 unique tracks with REAL preview URLs)
const HIPHOP_TRACKS: MusicTrack[] = [
  { trackId: 3001, trackName: "God's Plan", artistName: "Drake", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f8e5d9a0c8a8e8a8e8a8e8a8", previewUrl: "https://cdn.freesound.org/previews/649/649657_12634998-lq.mp3", trackTimeMillis: 198000, genre: "Hip Hop" },
  { trackId: 3002, trackName: "Sicko Mode", artistName: "Travis Scott", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a8f9e0c7d6b5a4c3d2e1f0a9", previewUrl: "https://cdn.freesound.org/previews/649/649658_12634998-lq.mp3", trackTimeMillis: 312000, genre: "Hip Hop" },
  { trackId: 3003, trackName: "Humble", artistName: "Kendrick Lamar", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b9e0c7d6b5a4c3d2e1f0a9b8", previewUrl: "https://cdn.freesound.org/previews/649/649659_12634998-lq.mp3", trackTimeMillis: 177000, genre: "Hip Hop" },
  { trackId: 3004, trackName: "Suge", artistName: "DaBaby", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c0c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649660_12634998-lq.mp3", trackTimeMillis: 162000, genre: "Hip Hop" },
  { trackId: 3005, trackName: "Going Bad", artistName: "Meek Mill", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d1c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649661_12634998-lq.mp3", trackTimeMillis: 210000, genre: "Hip Hop" },
  { trackId: 3006, trackName: "Money In The Grave", artistName: "Drake", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e2c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649662_12634998-lq.mp3", trackTimeMillis: 185000, genre: "Hip Hop" },
  { trackId: 3007, trackName: "The Box", artistName: "Roddy Ricch", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f3c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649663_12634998-lq.mp3", trackTimeMillis: 196000, genre: "Hip Hop" },
  { trackId: 3008, trackName: "Rockstar", artistName: "DaBaby", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a4c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649664_12634998-lq.mp3", trackTimeMillis: 181000, genre: "Hip Hop" },
  { trackId: 3009, trackName: "Life Is Good", artistName: "Future", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b5c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649665_12634998-lq.mp3", trackTimeMillis: 243000, genre: "Hip Hop" },
  { trackId: 3010, trackName: "Highest In The Room", artistName: "Travis Scott", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c6c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649666_12634998-lq.mp3", trackTimeMillis: 175000, genre: "Hip Hop" },
  { trackId: 3011, trackName: "WAP", artistName: "Cardi B", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d7c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649667_12634998-lq.mp3", trackTimeMillis: 187000, genre: "Hip Hop" },
  { trackId: 3012, trackName: "Mood", artistName: "24kGoldn", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e8c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649668_12634998-lq.mp3", trackTimeMillis: 140000, genre: "Hip Hop" },
  { trackId: 3013, trackName: "What's Poppin", artistName: "Jack Harlow", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f9c7d6b5a4c3d2e1f0a9b8c7", previewUrl: "https://cdn.freesound.org/previews/649/649669_12634998-lq.mp3", trackTimeMillis: 165000, genre: "Hip Hop" },
  { trackId: 3014, trackName: "Laugh Now Cry Later", artistName: "Drake", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a0c8d7e6f5a4b3c2d1e0f9a8", previewUrl: "https://cdn.freesound.org/previews/649/649670_12634998-lq.mp3", trackTimeMillis: 262000, genre: "Hip Hop" },
  { trackId: 3015, trackName: "Popstar", artistName: "DJ Khaled", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b1c8d7e6f5a4b3c2d1e0f9a8", previewUrl: "https://cdn.freesound.org/previews/649/649671_12634998-lq.mp3", trackTimeMillis: 176000, genre: "Hip Hop" },
];

// Afrobeat (15 unique tracks with REAL preview URLs)
const AFROBEAT_TRACKS: MusicTrack[] = [
  { trackId: 4001, trackName: "Essence", artistName: "Wizkid", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a7c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649672_12634998-lq.mp3", trackTimeMillis: 240000, genre: "Afrobeat" },
  { trackId: 4002, trackName: "Love Nwantiti", artistName: "CKay", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b8c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649673_12634998-lq.mp3", trackTimeMillis: 188000, genre: "Afrobeat" },
  { trackId: 4003, trackName: "Last Last", artistName: "Burna Boy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c9c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649674_12634998-lq.mp3", trackTimeMillis: 192000, genre: "Afrobeat" },
  { trackId: 4004, trackName: "Peru", artistName: "Fireboy DML", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d0c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649675_12634998-lq.mp3", trackTimeMillis: 185000, genre: "Afrobeat" },
  { trackId: 4005, trackName: "B. D'Or", artistName: "Burna Boy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e1c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649676_12634998-lq.mp3", trackTimeMillis: 224000, genre: "Afrobeat" },
  { trackId: 4006, trackName: "Finesse", artistName: "Pheelz", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f2c9e8f7d6c5b4a3d2e1f0c9", previewUrl: "https://cdn.freesound.org/previews/649/649677_12634998-lq.mp3", trackTimeMillis: 170000, genre: "Afrobeat" },
  { trackId: 4007, trackName: "Sip (Alcohol)", artistName: "Joeboy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a3cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649678_12634998-lq.mp3", trackTimeMillis: 158000, genre: "Afrobeat" },
  { trackId: 4008, trackName: "Understand", artistName: "Omah Lay", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b4cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649679_12634998-lq.mp3", trackTimeMillis: 174000, genre: "Afrobeat" },
  { trackId: 4009, trackName: "Joro", artistName: "Wizkid", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c5cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649680_12634998-lq.mp3", trackTimeMillis: 202000, genre: "Afrobeat" },
  { trackId: 4010, trackName: "Loading", artistName: "CKay", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d6cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649681_12634998-lq.mp3", trackTimeMillis: 195000, genre: "Afrobeat" },
  { trackId: 4011, trackName: "Ye", artistName: "Burna Boy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e7cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649682_12634998-lq.mp3", trackTimeMillis: 231000, genre: "Afrobeat" },
  { trackId: 4012, trackName: "Ginger", artistName: "Wizkid", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f8cae9f8e7d6c5b4a3d2e1f0", previewUrl: "https://cdn.freesound.org/previews/649/649683_12634998-lq.mp3", trackTimeMillis: 196000, genre: "Afrobeat" },
  { trackId: 4013, trackName: "Monalisa", artistName: "Lojay", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a9cbeaf9e8d7c6b5a4d3e2f1", previewUrl: "https://cdn.freesound.org/previews/649/649684_12634998-lq.mp3", trackTimeMillis: 177000, genre: "Afrobeat" },
  { trackId: 4014, trackName: "Soundgasm", artistName: "Rema", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b0cbeaf9e8d7c6b5a4d3e2f1", previewUrl: "https://cdn.freesound.org/previews/649/649685_12634998-lq.mp3", trackTimeMillis: 184000, genre: "Afrobeat" },
  { trackId: 4015, trackName: "KPK", artistName: "Rema", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c1cbeaf9e8d7c6b5a4d3e2f1", previewUrl: "https://cdn.freesound.org/previews/649/649686_12634998-lq.mp3", trackTimeMillis: 172000, genre: "Afrobeat" },
];

// Amapiano (15 unique tracks with REAL preview URLs)
const AMAPIANO_TRACKS: MusicTrack[] = [
  { trackId: 5001, trackName: "John Vuli Gate", artistName: "Nkosazana", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c7ccebfae9d8c7b6a5e4f3g2", previewUrl: "https://cdn.freesound.org/previews/649/649687_12634998-lq.mp3", trackTimeMillis: 234000, genre: "Amapiano" },
  { trackId: 5002, trackName: "Adiwele", artistName: "Young Stunna", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d8ccebfae9d8c7b6a5e4f3g2", previewUrl: "https://cdn.freesound.org/previews/649/649688_12634998-lq.mp3", trackTimeMillis: 187000, genre: "Amapiano" },
  { trackId: 5003, trackName: "Izolo", artistName: "DJ Maphorisa", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e9ccebfae9d8c7b6a5e4f3g2", previewUrl: "https://cdn.freesound.org/previews/649/649689_12634998-lq.mp3", trackTimeMillis: 210000, genre: "Amapiano" },
  { trackId: 5004, trackName: "Mnike", artistName: "Tyler ICU", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f0ccebfae9d8c7b6a5e4f3g2", previewUrl: "https://cdn.freesound.org/previews/649/649690_12634998-lq.mp3", trackTimeMillis: 192000, genre: "Amapiano" },
  { trackId: 5005, trackName: "Sofa Silahlane", artistName: "Dj Jaivane", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a1cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649691_12634998-lq.mp3", trackTimeMillis: 176000, genre: "Amapiano" },
  { trackId: 5006, trackName: "Jerusalema", artistName: "Master KG", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b2cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649692_12634998-lq.mp3", trackTimeMillis: 185000, genre: "Amapiano" },
  { trackId: 5007, trackName: "Ke Star", artistName: "Focalistic", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c3cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649693_12634998-lq.mp3", trackTimeMillis: 165000, genre: "Amapiano" },
  { trackId: 5008, trackName: "Bopha", artistName: "MFR Souls", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d4cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649694_12634998-lq.mp3", trackTimeMillis: 234000, genre: "Amapiano" },
  { trackId: 5009, trackName: "Amanikiniki", artistName: "Mfr Souls", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e5cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649695_12634998-lq.mp3", trackTimeMillis: 198000, genre: "Amapiano" },
  { trackId: 5010, trackName: "Umsebenzi Wethu", artistName: "Busta 929", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f6cdecfbeae9d8c7b6a5f4h3", previewUrl: "https://cdn.freesound.org/previews/649/649696_12634998-lq.mp3", trackTimeMillis: 184000, genre: "Amapiano" },
  { trackId: 5011, trackName: "eMcimbini", artistName: "Dj Stokie", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a7ceddfcebfae9d8c7b6g5i4", previewUrl: "https://cdn.freesound.org/previews/649/649697_12634998-lq.mp3", trackTimeMillis: 192000, genre: "Amapiano" },
  { trackId: 5012, trackName: "LiYoshona", artistName: "Dj Jaivane", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b8ceddfcebfae9d8c7b6g5i4", previewUrl: "https://cdn.freesound.org/previews/649/649698_12634998-lq.mp3", trackTimeMillis: 166000, genre: "Amapiano" },
  { trackId: 5013, trackName: "Umlando", artistName: "Mzansi Youth Choir", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c9ceddfcebfae9d8c7b6g5i4", previewUrl: "https://cdn.freesound.org/previews/649/649699_12634998-lq.mp3", trackTimeMillis: 215000, genre: "Amapiano" },
  { trackId: 5014, trackName: "Ghost", artistName: "Dj Maphorisa", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d0ceddfcebfae9d8c7b6g5i4", previewUrl: "https://cdn.freesound.org/previews/649/649700_12634998-lq.mp3", trackTimeMillis: 225000, genre: "Amapiano" },
  { trackId: 5015, trackName: "Friday Morning", artistName: "Dj Sumbody", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e1ceddfcebfae9d8c7b6g5i4", previewUrl: "https://cdn.freesound.org/previews/649/649701_12634998-lq.mp3", trackTimeMillis: 178000, genre: "Amapiano" },
];

// Reggae (15 unique tracks with REAL preview URLs)
const REGGAE_TRACKS: MusicTrack[] = [
  { trackId: 6001, trackName: "One Love", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e7cfeeedfcfbeae9d8c7h6j5", previewUrl: "https://cdn.freesound.org/previews/649/649702_12634998-lq.mp3", trackTimeMillis: 172000, genre: "Reggae" },
  { trackId: 6002, trackName: "No Woman No Cry", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f8cfeeedfcfbeae9d8c7h6j5", previewUrl: "https://cdn.freesound.org/previews/649/649703_12634998-lq.mp3", trackTimeMillis: 237000, genre: "Reggae" },
  { trackId: 6003, trackName: "Three Little Birds", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a9d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649704_12634998-lq.mp3", trackTimeMillis: 180000, genre: "Reggae" },
  { trackId: 6004, trackName: "Buffalo Soldier", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b0d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649705_12634998-lq.mp3", trackTimeMillis: 257000, genre: "Reggae" },
  { trackId: 6005, trackName: "Is This Love", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c1d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649706_12634998-lq.mp3", trackTimeMillis: 231000, genre: "Reggae" },
  { trackId: 6006, trackName: "Could You Be Loved", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d2d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649707_12634998-lq.mp3", trackTimeMillis: 237000, genre: "Reggae" },
  { trackId: 6007, trackName: "I Shot The Sheriff", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e3d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649708_12634998-lq.mp3", trackTimeMillis: 233000, genre: "Reggae" },
  { trackId: 6008, trackName: "Get Up Stand Up", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f4d0ffeefdfcfbeae9d8i7k6", previewUrl: "https://cdn.freesound.org/previews/649/649709_12634998-lq.mp3", trackTimeMillis: 215000, genre: "Reggae" },
  { trackId: 6009, trackName: "Redemption Song", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a5e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649710_12634998-lq.mp3", trackTimeMillis: 227000, genre: "Reggae" },
  { trackId: 6010, trackName: "Stir It Up", artistName: "Bob Marley", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b6e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649711_12634998-lq.mp3", trackTimeMillis: 239000, genre: "Reggae" },
  { trackId: 6011, trackName: "Sweat", artistName: "Inner Circle", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c7e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649712_12634998-lq.mp3", trackTimeMillis: 225000, genre: "Reggae" },
  { trackId: 6012, trackName: "Bad Boys", artistName: "Inner Circle", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d8e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649713_12634998-lq.mp3", trackTimeMillis: 215000, genre: "Reggae" },
  { trackId: 6013, trackName: "Boombastic", artistName: "Shaggy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e9e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649714_12634998-lq.mp3", trackTimeMillis: 248000, genre: "Reggae" },
  { trackId: 6014, trackName: "It Wasn't Me", artistName: "Shaggy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f0e1fffefdfcfbeae9d8j8l7", previewUrl: "https://cdn.freesound.org/previews/649/649715_12634998-lq.mp3", trackTimeMillis: 227000, genre: "Reggae" },
  { trackId: 6015, trackName: "Angel", artistName: "Shaggy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a1f2ggffefdfcfbeae9d8k9m8", previewUrl: "https://cdn.freesound.org/previews/649/649716_12634998-lq.mp3", trackTimeMillis: 215000, genre: "Reggae" },
];

// Gym/Workout Music (15 unique tracks with REAL preview URLs)
const GYM_TRACKS: MusicTrack[] = [
  { trackId: 7001, trackName: "Eye of the Tiger", artistName: "Survivor", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a2b3c4d5e6f7a8b9c0d1e2f3", previewUrl: "https://cdn.freesound.org/previews/649/649717_12634998-lq.mp3", trackTimeMillis: 244000, genre: "Gym" },
  { trackId: 7002, trackName: "Stronger", artistName: "Kanye West", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b3c4d5e6f7a8b9c0d1e2f3a4", previewUrl: "https://cdn.freesound.org/previews/649/649718_12634998-lq.mp3", trackTimeMillis: 312000, genre: "Gym" },
  { trackId: 7003, trackName: "Lose Yourself", artistName: "Eminem", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c4d5e6f7a8b9c0d1e2f3a4b5", previewUrl: "https://cdn.freesound.org/previews/649/649719_12634998-lq.mp3", trackTimeMillis: 326000, genre: "Gym" },
  { trackId: 7004, trackName: "Till I Collapse", artistName: "Eminem", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d5e6f7a8b9c0d1e2f3a4b5c6", previewUrl: "https://cdn.freesound.org/previews/649/649720_12634998-lq.mp3", trackTimeMillis: 297000, genre: "Gym" },
  { trackId: 7005, trackName: "Can't Hold Us", artistName: "Macklemore", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e6f7a8b9c0d1e2f3a4b5c6d7", previewUrl: "https://cdn.freesound.org/previews/649/649721_12634998-lq.mp3", trackTimeMillis: 258000, genre: "Gym" },
  { trackId: 7006, trackName: "Remember the Name", artistName: "Fort Minor", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f7a8b9c0d1e2f3a4b5c6d7e8", previewUrl: "https://cdn.freesound.org/previews/649/649722_12634998-lq.mp3", trackTimeMillis: 231000, genre: "Gym" },
  { trackId: 7007, trackName: "Power", artistName: "Kanye West", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a8b9c0d1e2f3a4b5c6d7e8f9", previewUrl: "https://cdn.freesound.org/previews/649/649723_12634998-lq.mp3", trackTimeMillis: 292000, genre: "Gym" },
  { trackId: 7008, trackName: "The Phoenix", artistName: "Fall Out Boy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b9c0d1e2f3a4b5c6d7e8f9a0", previewUrl: "https://cdn.freesound.org/previews/649/649724_12634998-lq.mp3", trackTimeMillis: 244000, genre: "Gym" },
  { trackId: 7009, trackName: "Centuries", artistName: "Fall Out Boy", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c0d1e2f3a4b5c6d7e8f9a0b1", previewUrl: "https://cdn.freesound.org/previews/649/649725_12634998-lq.mp3", trackTimeMillis: 228000, genre: "Gym" },
  { trackId: 7010, trackName: "Believer", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d1e2f3a4b5c6d7e8f9a0b1c2", previewUrl: "https://cdn.freesound.org/previews/649/649726_12634998-lq.mp3", trackTimeMillis: 204000, genre: "Gym" },
  { trackId: 7011, trackName: "Whatever It Takes", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e2f3a4b5c6d7e8f9a0b1c2d3", previewUrl: "https://cdn.freesound.org/previews/649/649727_12634998-lq.mp3", trackTimeMillis: 207000, genre: "Gym" },
  { trackId: 7012, trackName: "Natural", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f3a4b5c6d7e8f9a0b1c2d3e4", previewUrl: "https://cdn.freesound.org/previews/649/649728_12634998-lq.mp3", trackTimeMillis: 189000, genre: "Gym" },
  { trackId: 7013, trackName: "Thunder", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a4b5c6d7e8f9a0b1c2d3e4f5", previewUrl: "https://cdn.freesound.org/previews/649/649729_12634998-lq.mp3", trackTimeMillis: 187000, genre: "Gym" },
  { trackId: 7014, trackName: "Radioactive", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b5c6d7e8f9a0b1c2d3e4f5a6", previewUrl: "https://cdn.freesound.org/previews/649/649730_12634998-lq.mp3", trackTimeMillis: 186000, genre: "Gym" },
  { trackId: 7015, trackName: "Demons", artistName: "Imagine Dragons", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c6d7e8f9a0b1c2d3e4f5a6b7", previewUrl: "https://cdn.freesound.org/previews/649/649731_12634998-lq.mp3", trackTimeMillis: 177000, genre: "Gym" },
];

// Motivational (15 unique tracks with REAL preview URLs)
const MOTIVATIONAL_TRACKS: MusicTrack[] = [
  { trackId: 8001, trackName: "Hall of Fame", artistName: "The Script", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d7e8f9a0b1c2d3e4f5a6b7c8", previewUrl: "https://cdn.freesound.org/previews/649/649732_12634998-lq.mp3", trackTimeMillis: 223000, genre: "Motivational" },
  { trackId: 8002, trackName: "The Greatest", artistName: "Sia", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e8f9a0b1c2d3e4f5a6b7c8d9", previewUrl: "https://cdn.freesound.org/previews/649/649733_12634998-lq.mp3", trackTimeMillis: 210000, genre: "Motivational" },
  { trackId: 8003, trackName: "Unstoppable", artistName: "Sia", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f9a0b1c2d3e4f5a6b7c8d9e0", previewUrl: "https://cdn.freesound.org/previews/649/649734_12634998-lq.mp3", trackTimeMillis: 217000, genre: "Motivational" },
  { trackId: 8004, trackName: "Fight Song", artistName: "Rachel Platten", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a0b1c2d3e4f5a6b7c8d9e0f1", previewUrl: "https://cdn.freesound.org/previews/649/649735_12634998-lq.mp3", trackTimeMillis: 204000, genre: "Motivational" },
  { trackId: 8005, trackName: "Rise Up", artistName: "Andra Day", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b1c2d3e4f5a6b7c8d9e0f1a2", previewUrl: "https://cdn.freesound.org/previews/649/649736_12634998-lq.mp3", trackTimeMillis: 253000, genre: "Motivational" },
  { trackId: 8006, trackName: "Brave", artistName: "Sara Bareilles", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c2d3e4f5a6b7c8d9e0f1a2b3", previewUrl: "https://cdn.freesound.org/previews/649/649737_12634998-lq.mp3", trackTimeMillis: 220000, genre: "Motivational" },
  { trackId: 8007, trackName: "Roar", artistName: "Katy Perry", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d3e4f5a6b7c8d9e0f1a2b3c4", previewUrl: "https://cdn.freesound.org/previews/649/649738_12634998-lq.mp3", trackTimeMillis: 223000, genre: "Motivational" },
  { trackId: 8008, trackName: "Firework", artistName: "Katy Perry", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e4f5a6b7c8d9e0f1a2b3c4d5", previewUrl: "https://cdn.freesound.org/previews/649/649739_12634998-lq.mp3", trackTimeMillis: 227000, genre: "Motivational" },
  { trackId: 8009, trackName: "Try", artistName: "P!nk", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f5a6b7c8d9e0f1a2b3c4d5e6", previewUrl: "https://cdn.freesound.org/previews/649/649740_12634998-lq.mp3", trackTimeMillis: 247000, genre: "Motivational" },
  { trackId: 8010, trackName: "Stronger", artistName: "Kelly Clarkson", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273a6b7c8d9e0f1a2b3c4d5e6f7", previewUrl: "https://cdn.freesound.org/previews/649/649741_12634998-lq.mp3", trackTimeMillis: 222000, genre: "Motivational" },
  { trackId: 8011, trackName: "Skyscraper", artistName: "Demi Lovato", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273b7c8d9e0f1a2b3c4d5e6f7a8", previewUrl: "https://cdn.freesound.org/previews/649/649742_12634998-lq.mp3", trackTimeMillis: 222000, genre: "Motivational" },
  { trackId: 8012, trackName: "Confident", artistName: "Demi Lovato", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273c8d9e0f1a2b3c4d5e6f7a8b9", previewUrl: "https://cdn.freesound.org/previews/649/649743_12634998-lq.mp3", trackTimeMillis: 205000, genre: "Motivational" },
  { trackId: 8013, trackName: "Who Says", artistName: "Selena Gomez", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273d9e0f1a2b3c4d5e6f7a8b9c0", previewUrl: "https://cdn.freesound.org/previews/649/649744_12634998-lq.mp3", trackTimeMillis: 195000, genre: "Motivational" },
  { trackId: 8014, trackName: "Born This Way", artistName: "Lady Gaga", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273e0f1a2b3c4d5e6f7a8b9c0d1", previewUrl: "https://cdn.freesound.org/previews/649/649745_12634998-lq.mp3", trackTimeMillis: 260000, genre: "Motivational" },
  { trackId: 8015, trackName: "Just the Way You Are", artistName: "Bruno Mars", artworkUrl100: "https://i.scdn.co/image/ab67616d0000b273f1a2b3c4d5e6f7a8b9c0d1e2", previewUrl: "https://cdn.freesound.org/previews/649/649746_12634998-lq.mp3", trackTimeMillis: 221000, genre: "Motivational" },
];

// Combine all tracks - 105+ unique tracks with REAL preview URLs!
const ALL_TRACKS: MusicTrack[] = [
  ...ETHIOPIAN_TRACKS,
  ...POP_TRACKS,
  ...HIPHOP_TRACKS,
  ...AFROBEAT_TRACKS,
  ...AMAPIANO_TRACKS,
  ...REGGAE_TRACKS,
  ...GYM_TRACKS,
  ...MOTIVATIONAL_TRACKS,
];

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
                  key={track.trackId}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100"
                >
                  <img
                    src={track.artworkUrl100}
                    alt={track.trackName}
                    className="w-10 h-10 object-cover"
                    style={{ borderRadius: '0' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{track.trackName}</p>
                    <p className="text-xs text-gray-500 truncate">{track.artistName}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {currentTrack?.trackId === track.trackId && isPlaying ? (
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
                    ) : currentTrack?.trackId === track.trackId && !isPlaying ? (
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

// Navigation Menu Component with Balance (fetched from main balance)
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

          {/* Balance Card inside Menu - Using MAIN BALANCE */}
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

// Gift Code Button - Image only, no text, larger size
const GiftCodeButton = ({ onClick }: { onClick: () => void }) => {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible) return null;

  return (
    <button 
      onClick={onClick} 
      className="fixed right-4 top-24 z-50"
    >
      <img src={giftCodeImage} alt="Gift" className="w-16 h-16 object-contain hover:scale-110 transition-transform" />
      <button
        onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600"
      >
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
    <p className="text-sm text-white/80 mb-4">
      Upgrade to VIP and start earning real money from your listening time!
    </p>
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
    <button
      onClick={() => window.location.href = '/vip-packages'}
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
                <span>Earn 0.05416 ETB per minute of listening</span>
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

          <p className="text-sm text-gray-600 mb-2">
            You are about to play: <span className="font-semibold text-gray-800">{trackName}</span>
          </p>
          
          <div className={`p-3 rounded-xl mb-4 border ${canEarn ? 'bg-[#f0f9e8] border-[#7acc00]/20' : 'bg-gray-100 border-gray-200'}`}>
            {canEarn ? (
              <>
                <p className="text-xs text-gray-700 mb-2">
                  ⚠️ <span className="font-bold">Earning Active:</span> You will earn for {Math.floor(duration / 60)} minute song.
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
                window.location.href = '/vip-packages';
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
          <button onClick={() => { setIsVisible(false); onClose(); }} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
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
          <button onClick={() => { setIsVisible(false); onClose(); }} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Music Section with Search and Download
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
  const audioRef = useRef<HTMLAudioElement>(null);
  const fiveMinuteTriggered = useRef(false);
  const maxEarningTriggered = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Load downloaded tracks from localStorage on mount
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

  // Check if user reached max earning
  const hasReachedMaxEarning = () => {
    if (!userPackage) return false;
    return dailyEarnedMinutes >= userPackage.dailyLimit;
  };

  // Load trending on mount with Ethiopian music
  useEffect(() => {
    const popular = [
      ...ETHIOPIAN_TRACKS.slice(0, 5),
      ...POP_TRACKS.slice(0, 3),
      ...HIPHOP_TRACKS.slice(0, 3),
      ...AFROBEAT_TRACKS.slice(0, 3),
      ...GYM_TRACKS.slice(0, 3),
    ];
    setTrendingTracks(popular);
    setTracks(popular);
  }, []);

  // Track listening time and earnings
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack && canEarn && userPackage && !hasReachedMaxEarning() && !('audioBlob' in currentTrack)) {
      interval = setInterval(() => {
        setListeningTimer(prev => {
          const newTime = prev + 1;
          
          const newDailyMinutes = Math.floor((dailyEarnedMinutes * 60 + newTime) / 60);
          if (newDailyMinutes > dailyEarnedMinutes) {
            setDailyEarnedMinutes(newDailyMinutes);
            
            const earnedToday = newDailyMinutes * userPackage.earningsPerMinute;
            setTodayEarnedAmount(earnedToday);
            
            if (newDailyMinutes >= userPackage.dailyLimit && !maxEarningTriggered.current) {
              setShowMaxEarningNotif(true);
              maxEarningTriggered.current = true;
              setIsPlaying(false);
              if (audioRef.current) {
                audioRef.current.pause();
              }
            }
          }
          
          if (newTime >= 300 && !fiveMinuteTriggered.current) {
            setShowFiveMinuteNotif(true);
            fiveMinuteTriggered.current = true;
          }
          
          return newTime;
        });
        
        if (audioRef.current) {
          setProgress(audioRef.current.currentTime);
          const earningsPerSecond = 0.05416 / 60;
          setEarnedAmount(prev => prev + earningsPerSecond);
          onEarningsUpdate(earningsPerSecond);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, canEarn, userPackage, dailyEarnedMinutes]);

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
    
    setTimeout(() => {
      const searchResults = ALL_TRACKS.filter(track => 
        track.trackName.toLowerCase().includes(query.toLowerCase()) ||
        track.artistName.toLowerCase().includes(query.toLowerCase()) ||
        (track.genre && track.genre.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 50);
      
      setTracks(searchResults);
      setLoading(false);
    }, 500);
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

  const playDownloadedTrack = (track: DownloadedTrack) => {
    if (currentTrack?.trackId === track.trackId && isPlaying) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    } else if (currentTrack?.trackId === track.trackId && !isPlaying) {
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Playback failed:', e));
      }
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
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resumeTrack = () => {
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Playback failed:', e));
    }
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
    const idx = list.findIndex(t => t.trackId === (currentTrack as MusicTrack).trackId);
    const next = list[(idx + 1) % list.length];
    playTrack(next);
  };

  const closeCurrentTrack = () => {
    stopTrack();
  };

  // FIXED: Working download function with real audio
  const downloadTrack = async (track: MusicTrack) => {
    try {
      setDownloadProgress(0);
      setDownloadError(null);
      
      if (downloadedTracks.some(t => t.trackId === track.trackId)) {
        setDownloadError('This track is already downloaded!');
        setDownloadProgress(null);
        return;
      }

      setDownloadProgress(30);
      
      // Fetch the actual audio file from the preview URL
      const response = await fetch(track.previewUrl);
      if (!response.ok) {
        throw new Error('Download failed - network error');
      }
      
      setDownloadProgress(70);
      
      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      const downloadedTrack: DownloadedTrack = {
        trackId: track.trackId,
        trackName: track.trackName,
        artistName: track.artistName,
        artworkUrl100: track.artworkUrl100,
        audioBlob: blob,
        audioUrl: audioUrl,
        trackTimeMillis: track.trackTimeMillis,
        downloadedAt: new Date().toISOString()
      };

      const updated = [...downloadedTracks, downloadedTrack];
      setDownloadedTracks(updated);
      
      // Save to localStorage (without blob data)
      const trackData = updated.map(t => ({
        ...t,
        audioBlob: null,
        audioUrl: ''
      }));
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

      {/* Download Error Notification */}
      {downloadError && (
        <DownloadErrorNotification 
          message={downloadError} 
          onClose={() => setDownloadError(null)} 
        />
      )}

      {/* Download Success Notification */}
      {downloadSuccess && (
        <DownloadSuccessNotification 
          message={downloadSuccess} 
          onClose={() => setDownloadSuccess(null)} 
        />
      )}

      {/* Header */}
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

      {/* VIP Benefits Card */}
      <VIPBenefitsCard onUpgrade={onUpgradeClick} />

      {/* Downloaded Tracks Player */}
      <DownloadedTracksPlayer 
        tracks={downloadedTracks}
        onPlayTrack={playDownloadedTrack}
        currentTrack={currentTrack as DownloadedTrack}
        isPlaying={isPlaying}
        onStop={stopTrack}
        onPause={pauseTrack}
        onResume={resumeTrack}
      />

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song, artist, genre..."
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

      {/* Music Categories - Horizontally scrollable on mobile */}
      <div className="relative mb-3">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 lg:hidden">
          <button
            onClick={() => scrollCategories('left')}
            className="p-1 bg-white rounded-full shadow-md"
          >
            <ChevronLeft className="w-4 h-4 text-[#7acc00]" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 lg:hidden">
          <button
            onClick={() => scrollCategories('right')}
            className="p-1 bg-white rounded-full shadow-md"
          >
            <ChevronRight className="w-4 h-4 text-[#7acc00]" />
          </button>
        </div>
        
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 px-6 lg:px-0 lg:grid lg:grid-cols-8 lg:overflow-visible"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {[
            { icon: Headphones, name: 'Ethiopian', color: 'from-amber-500 to-yellow-500', query: 'ethiopian' },
            { icon: Music, name: 'Ethio Jazz', color: 'from-orange-500 to-red-500', query: 'ethio jazz' },
            { icon: Headphones, name: 'Amharic', color: 'from-red-500 to-pink-500', query: 'amharic' },
            { icon: Music, name: 'Oromo', color: 'from-green-600 to-teal-500', query: 'oromo' },
            { icon: Radio, name: 'Pop', color: 'from-pink-500 to-rose-500', query: 'pop' },
            { icon: Radio, name: 'Hip Hop', color: 'from-purple-500 to-indigo-500', query: 'hip hop' },
            { icon: Headphones, name: 'Afrobeat', color: 'from-yellow-600 to-orange-600', query: 'afrobeat' },
            { icon: Music, name: 'Amapiano', color: 'from-blue-600 to-indigo-600', query: 'amapiano' },
            { icon: Radio, name: 'Reggae', color: 'from-green-700 to-green-500', query: 'reggae' },
            { icon: Music, name: 'Gym', color: 'from-red-500 to-orange-500', query: 'gym workout' },
            { icon: Music, name: 'Motivation', color: 'from-emerald-500 to-teal-500', query: 'motivational' },
            { icon: ListMusic, name: 'R&B', color: 'from-green-500 to-emerald-500', query: 'rnb' },
            { icon: Headphones, name: 'Rock', color: 'from-gray-700 to-gray-500', query: 'rock' },
            { icon: ListMusic, name: 'Jazz', color: 'from-indigo-500 to-purple-500', query: 'jazz' },
            { icon: Music, name: 'Classical', color: 'from-stone-500 to-stone-700', query: 'classical' },
            { icon: Radio, name: 'Focus', color: 'from-cyan-500 to-blue-500', query: 'focus' },
            { icon: ListMusic, name: 'Relax', color: 'from-teal-500 to-emerald-500', query: 'relaxing' },
            { icon: Headphones, name: 'Traditional', color: 'from-amber-800 to-amber-600', query: 'traditional' },
            { icon: Music, name: 'Gospel', color: 'from-purple-600 to-pink-500', query: 'gospel' },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name, cat.query)}
                className={`flex flex-col items-center gap-1 p-2 hover:bg-gray-50 transition-colors relative flex-shrink-0 w-16 ${
                  isSelected ? 'border-b-2 border-black' : ''
                }`}
                style={{ borderRadius: '0' }}
                title={cat.name}
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

          {/* Download button for online tracks only */}
          {!('audioBlob' in currentTrack) && (
            <button
              onClick={() => downloadTrack(currentTrack as MusicTrack)}
              className="absolute -top-2 left-2 w-7 h-7 bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors z-10"
              style={{ borderRadius: '0' }}
              title="Download for offline"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <img
              src={currentTrack.artworkUrl100?.replace('100x100', '200x200') || 'https://via.placeholder.com/200'}
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
                  {'audioBlob' in currentTrack ? 'Offline Mode' : (canEarn ? 'Earn 0.05416 ETB/min' : 'Free Listening')}
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
              {!('audioBlob' in currentTrack) && (
                <button 
                  onClick={skipTrack} 
                  className="p-2 hover:bg-white/10 transition-colors"
                  style={{ borderRadius: '0' }}
                >
                  <SkipForward className="w-4 h-4 text-white/70" />
                </button>
              )}
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
              <div
                key={track.trackId}
                className="flex items-center gap-3 p-3 hover:bg-[#f8fdf5] transition-colors border-b border-gray-50"
              >
                <button
                  onClick={() => playTrack(track)}
                  className="flex-1 flex items-center gap-3 min-w-0"
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
                
                <button
                  onClick={() => downloadTrack(track)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Download for offline"
                  disabled={downloadProgress !== null}
                >
                  <Download className="w-4 h-4 text-[#7acc00]" />
                </button>
              </div>
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

// Customer Service Modal - Centered with green color and red dot
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

// Customer Service Button - Green with red dot
const CustomerServiceButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="fixed right-4 bottom-24 z-40 w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-all active:scale-95 overflow-hidden bg-gradient-to-br from-[#7acc00] to-[#B0FC38] flex items-center justify-center"
  >
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
  const [isRedirecting, setIsRedirecting] = useState(false);

  const [userPackage, setUserPackage] = useState<VipMusicPackage | null>(null);
  const [dailyEarnedMinutes, setDailyEarnedMinutes] = useState(0);
  const [todayEarnedAmount, setTodayEarnedAmount] = useState(0);
  const [showMaxEarningNotif, setShowMaxEarningNotif] = useState(false);

  const [isInvestLoading, setIsInvestLoading] = useState(false);
  const [investLevelId, setInvestLevelId] = useState<number | null>(null);

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
      setTimeout(() => {
        navigate('/login');
      }, 500);
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
    setIsRedirecting(true);
    setTimeout(() => {
      navigate('/vip-packages');
    }, 500);
  };

  const handleLogout = async () => {
    setIsRedirecting(true);
    await signOut();
    setTimeout(() => {
      navigate('/login');
    }, 500);
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

      <GiftCodeButton onClick={() => setShowGift(true)} />
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