import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BottomNavigation } from '@/components/BottomNavigation';
import { X, ThumbsUp, Clock, BadgeCheck, Pin } from 'lucide-react';
import { Spinner } from '@/components/Spinner';
import dswLogo from '@/assets/dsw-logo.png';

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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchAnnouncements();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('announcements-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAnnouncements((prev) => {
              const newAnn = payload.new as Announcement;
              if (newAnn.is_pinned) {
                return [newAnn, ...prev];
              }
              // Insert after pinned items
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <X className="w-6 h-6 text-foreground" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-bold text-foreground">DSW | Official</h1>
            <p className="text-xs text-muted-foreground">dsw-official.com</p>
          </div>
          <div className="w-6" /> {/* spacer */}
        </div>

        {/* Title bar */}
        <div className="border-t border-border py-3">
          <h2 className="text-center text-primary text-xl font-bold">Official Announcements</h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner />
            <p className="text-muted-foreground mt-3 text-sm">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground text-lg">No announcements yet</p>
            <p className="text-muted-foreground/70 text-sm mt-1">Check back later for updates</p>
          </div>
        ) : (
          announcements.map((announcement) => {
            const isExpanded = expandedId === announcement.id;
            const contentPreview =
              announcement.content.length > 150 && !isExpanded
                ? announcement.content.slice(0, 150) + '...'
                : announcement.content;

            return (
              <div
                key={announcement.id}
                className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                {/* Pinned badge */}
                {announcement.is_pinned && (
                  <div className="bg-primary/10 px-4 py-1.5 flex items-center gap-1.5">
                    <Pin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold text-primary">Pinned</span>
                  </div>
                )}

                <div className="p-5">
                  {/* Author */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border">
                      <img src={dswLogo} alt="DSW" className="w-10 h-10 object-contain" />
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-base">{announcement.author_name}</h3>
                      {announcement.is_verified && (
                        <div className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">VERIFIED POST</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h4 className="font-bold text-foreground text-base mb-2">{announcement.title}</h4>

                  {/* Content */}
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">
                    {contentPreview}
                  </p>
                  {announcement.content.length > 150 && (
                    <button
                      onClick={() => toggleExpand(announcement.id)}
                      className="text-primary text-sm font-medium mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-border">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        {timeAgo(announcement.created_at)} ({formatDate(announcement.created_at)})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="text-sm font-medium">{announcement.likes_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Announcements;
