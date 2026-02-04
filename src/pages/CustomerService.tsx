import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Spinner } from '@/components/Spinner';
import customerServiceIcon from '@/assets/customer-service.png';

interface Message {
  id: string;
  message: string;
  is_user: boolean;
  created_at: string;
}

const CustomerService = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const telegramLinks = [
    { label: t('Official Support'), url: 'https://t.me/Tiktokshoponline_suport', handle: '@DSW_Support' },
    { label: t('Public Channel'), url: 'https://t.me/etonlinejob1', handle: 'DSW Channel' },
    { label: t('Discussion Group'), url: 'https://t.me/+Jihv4uEOv0o0M2U0', handle: 'DSW Group' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // Add welcome message
        setMessages([{
          id: 'welcome',
          message: 'Welcome to DSW Support! How can we help you today?',
          is_user: false,
          created_at: new Date().toISOString(),
        }]);
      }
      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      message: messageText,
      is_user: true,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMessage]);

    // Save to database
    const { data: savedMessage } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: messageText,
        is_user: true,
      })
      .select()
      .single();

    if (savedMessage) {
      setMessages(prev => prev.map(m => m.id === tempUserMessage.id ? savedMessage : m));
    }

    // Auto-response
    setTimeout(async () => {
      const autoReply = "Thank you for your message. Our support team will respond shortly. For faster assistance, please contact us on Telegram.";
      
      const { data: replyMessage } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: autoReply,
          is_user: false,
        })
        .select()
        .single();

      if (replyMessage) {
        setMessages(prev => [...prev, replyMessage]);
      }
      setSending(false);
    }, 1000);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <img src={customerServiceIcon} alt="Support" className="w-8 h-8" />
            <div>
              <h1 className="text-lg font-bold text-foreground">{t('Customer Service')}</h1>
              <p className="text-xs text-muted-foreground">Online 24/7</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-4 flex flex-col">
        {/* Telegram Links */}
        <div className="mb-4 p-3 bg-primary/5 rounded-xl border border-primary/20">
          <p className="text-xs font-medium text-foreground mb-2 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Contact us on Telegram for faster support:
          </p>
          <div className="flex flex-wrap gap-2">
            {telegramLinks.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                {link.handle}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.is_user ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.is_user
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default CustomerService;
