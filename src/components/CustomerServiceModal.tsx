import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Headphones, MessageCircle, Mail, Send, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from database
  useEffect(() => {
    const loadMessages = async () => {
      if (!user || !showLiveChat) return;
      
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data && data.length > 0) {
        setMessages(data.map(msg => ({
          id: msg.id,
          text: msg.message,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at),
        })));
      } else {
        // Add welcome message if no messages exist
        setMessages([{
          id: 'welcome',
          text: 'Hello! Welcome to DSW support. How can I help you today?',
          isUser: false,
          timestamp: new Date(),
        }]);
      }
    };

    loadMessages();
  }, [user, showLiveChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user || loading) return;

    setLoading(true);
    const messageText = inputMessage.trim();
    setInputMessage('');

    // Add user message to UI immediately
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Save user message to database
    const { data: savedMsg } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        message: messageText,
        is_user: true,
      })
      .select()
      .single();

    if (savedMsg) {
      setMessages(prev => prev.map(m => 
        m.id === userMessage.id ? { ...m, id: savedMsg.id } : m
      ));
    }

    // Simulate agent response after a delay
    setTimeout(async () => {
      const responses = [
        'Thank you for your message. Our team is reviewing your query.',
        'I understand your concern. Let me help you with that.',
        'Please provide more details so we can assist you better.',
        'Our support team will get back to you shortly.',
        'We appreciate your patience. Your request is being processed.',
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      // Save agent response to database
      const { data: agentMsg } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          message: randomResponse,
          is_user: false,
        })
        .select()
        .single();

      if (agentMsg) {
        setMessages(prev => [...prev, {
          id: agentMsg.id,
          text: randomResponse,
          isUser: false,
          timestamp: new Date(agentMsg.created_at),
        }]);
      }
      
      setLoading(false);
    }, 1500);
  };

  const contactOptions = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Live Chat',
      description: '24/7 Online Support',
      action: () => setShowLiveChat(true),
    },
    {
      icon: <Send className="w-6 h-6" />,
      label: 'Telegram Support',
      description: '@Tiktokshoponline_suport',
      action: () => window.open('https://t.me/Tiktokshoponline_suport', '_blank'),
    },
    {
      icon: <Mail className="w-6 h-6" />,
      label: 'Telegram Channel',
      description: '@etonlinejob1',
      action: () => window.open('https://t.me/etonlinejob1', '_blank'),
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      label: 'Discussion Group',
      description: 'Join our community',
      action: () => window.open('https://t.me/+Jihv4uEOv0o0M2U0', '_blank'),
    },
  ];

  const handleClose = () => {
    setShowLiveChat(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            {showLiveChat && (
              <Button variant="ghost" size="icon" onClick={() => setShowLiveChat(false)} className="mr-1">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Headphones className="w-5 h-5 text-primary" />
            {showLiveChat ? 'Live Chat' : 'Customer Service'}
          </DialogTitle>
        </DialogHeader>

        {showLiveChat ? (
          <div className="flex flex-col flex-1 min-h-[300px]">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 px-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.isUser
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-muted text-foreground rounded-bl-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${msg.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat input */}
            <div className="flex gap-2 pt-3 border-t border-border">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" className="primary-gradient" disabled={loading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 py-4">
              {contactOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={option.action}
                  className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                >
                  <div className="p-3 rounded-full bg-primary/20 text-primary">
                    {option.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={handleClose}
              variant="outline"
              className="w-full border-border"
            >
              Close
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
