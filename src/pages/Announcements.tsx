import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ArrowLeft, ThumbsUp, Clock, BadgeCheck, Pin, Bell, Calendar, MessageCircle, ThumbsUp as ThumbsUpFilled } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import dswLogo from '@/assets/dsw-logo.png';
import { SuccessModal } from '@/components/SuccessModal';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author_name: string;
  is_verified: boolean;
  likes_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface UserLike {
  id: string;
  user_id: string;
  announcement_id: string;
  created_at: string;
}

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const Announcements = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userLikes, setUserLikes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [likingId, setLikingId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAnnouncements(data as Announcement[]);
    }
    setIsLoading(false);
  };

  const fetchUserLikes = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('announcement_likes')
      .select('announcement_id')
      .eq('user_id', user.id);

    if (!error && data) {
      setUserLikes(new Set(data.map(like => like.announcement_id)));
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    if (user) {
      fetchUserLikes();
    }

    // Subscribe to realtime changes for announcements
    const announcementsChannel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAnn = payload.new as Announcement;
            setAnnouncements((prev) => {
              if (newAnn.is_pinned) {
                return [newAnn, ...prev];
              }
              const pinnedCount = prev.filter((a) => a.is_pinned).length;
              return [...prev.slice(0, pinnedCount), newAnn, ...prev.slice(pinnedCount)];
            });
          } else if (payload.eventType === 'UPDATE') {
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === (payload.new as Announcement).id ? (payload.new as Announcement) : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setAnnouncements((prev) => prev.filter((a) => a.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    // Subscribe to realtime changes for likes
    const likesChannel = supabase
      .channel('likes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcement_likes',
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const like = payload.new as UserLike;
            if (like.user_id === user?.id) {
              setUserLikes(prev => new Set(prev).add(like.announcement_id));
            }
            // Update likes count in announcements
            setAnnouncements(prev => 
              prev.map(a => 
                a.id === like.announcement_id 
                  ? { ...a, likes_count: a.likes_count + 1 } 
                  : a
              )
            );
          } else if (payload.eventType === 'DELETE') {
            const oldLike = payload.old as UserLike;
            if (oldLike.user_id === user?.id) {
              setUserLikes(prev => {
                const newSet = new Set(prev);
                newSet.delete(oldLike.announcement_id);
                return newSet;
              });
            }
            // Update likes count in announcements
            setAnnouncements(prev => 
              prev.map(a => 
                a.id === oldLike.announcement_id 
                  ? { ...a, likes_count: Math.max(0, a.likes_count - 1) } 
                  : a
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(announcementsChannel);
      supabase.removeChannel(likesChannel);
    };
  }, [user]);

  const handleLike = async (announcementId: string) => {
    if (!user) {
      setSuccessMessage('Please login to like announcements');
      setShowSuccess(true);
      return;
    }

    setLikingId(announcementId);
    const isLiked = userLikes.has(announcementId);

    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('announcement_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('announcement_id', announcementId);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('announcement_likes')
          .insert({
            user_id: user.id,
            announcement_id: announcementId
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setSuccessMessage('Failed to process like. Please try again.');
      setShowSuccess(true);
    } finally {
      setLikingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9]">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7acc00]/10 to-[#B0FC38]/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#00c853]/10 to-[#7acc00]/10 rounded-full blur-3xl" />
      
      {/* Simple Green Header - No rounded corners */}
      <div className="relative" style={{ background: 'linear-gradient(135deg, #7acc00, #B0FC38)' }}>
        <div className="px-4 pt-6 pb-6 relative z-10">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-white" />
                <h1 className="text-xl font-bold text-white">Announcements</h1>
              </div>
            </div>
            <div className="w-6" />
          </div>
        </div>
      </div>

      {/* Simple white bar with no rounding */}
      <div className="bg-white py-3 border-b border-[#e2e8e2]">
        <div className="max-w-md mx-auto px-4">
          <p className="text-center text-sm text-[#2d3a2d] font-medium">
            Official announcements from DSW Team
          </p>
        </div>
      </div>

      {/* Content - No outer rounded corners */}
      <div className="relative max-w-md mx-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner size="lg" />
            <p className="text-[#6b7b6b] mt-3 text-sm">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <MessageCircle className="w-16 h-16 text-[#6b7b6b] mb-3 opacity-50" />
            <p className="text-[#2d3a2d] font-medium text-lg">No announcements yet</p>
            <p className="text-[#6b7b6b] text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const isExpanded = expandedId === announcement.id;
            const isLiked = userLikes.has(announcement.id);
            const isLiking = likingId === announcement.id;
            const contentPreview =
              announcement.content.length > 200 && !isExpanded
                ? announcement.content.slice(0, 200) + '...'
                : announcement.content;

            return (
              <div
                key={announcement.id}
                className="bg-white"
              >
                {/* Pinned indicator - minimal */}
                {announcement.is_pinned && (
                  <div className="flex items-center gap-1.5 px-4 pt-3">
                    <Pin className="w-3.5 h-3.5 text-[#7acc00]" />
                    <span className="text-xs font-medium text-[#7acc00]">Pinned</span>
                  </div>
                )}

                <div className="p-4">
                  {/* Author - minimal */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 flex items-center justify-center">
                      <img src={dswLogo} alt="DSW" className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <h3 className="font-semibold text-[#2d3a2d] text-sm">{announcement.author_name}</h3>
                        {announcement.is_verified && (
                          <BadgeCheck className="w-4 h-4 text-[#7acc00]" />
                        )}
                      </div>
                      <span className="text-xs text-[#6b7b6b]">Admin</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-[#2d3a2d] text-base mb-2">{announcement.title}</h4>

                  {/* Content - minimal background */}
                  <div className="text-[#6b7b6b] text-sm leading-relaxed whitespace-pre-line">
                    {contentPreview}
                  </div>
                  
                  {announcement.content.length > 200 && (
                    <button
                      onClick={() => toggleExpand(announcement.id)}
                      className="text-[#7acc00] text-sm font-medium mt-1 hover:text-[#B0FC38] transition-colors"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Footer - minimal */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#e2e8e2]">
                    <div className="flex items-center gap-3 text-xs text-[#6b7b6b]">
                      <span>{formatDate(announcement.created_at)}</span>
                      <span>•</span>
                      <span>{timeAgo(announcement.created_at)}</span>
                    </div>
                    
                    <button
                      onClick={() => handleLike(announcement.id)}
                      disabled={isLiking}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-[#f1f5f1] transition-colors disabled:opacity-50"
                    >
                      {isLiked ? (
                        <ThumbsUpFilled className="w-4 h-4 text-[#7acc00]" />
                      ) : (
                        <ThumbsUp className="w-4 h-4 text-[#6b7b6b]" />
                      )}
                      <span className={`text-sm font-medium ${isLiked ? 'text-[#7acc00]' : 'text-[#6b7b6b]'}`}>
                        {announcement.likes_count}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNavigation />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Announcements;