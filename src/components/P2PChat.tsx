import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Image, Paperclip, Shield, AlertCircle,
  CheckCircle, Clock, Download, X, ZoomIn
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { p2pService } from '@/services/p2pService';
import { ChatMessage, Trade } from '@/types/p2p';
import { useDropzone } from 'react-dropzone';

interface P2PChatProps {
  trade: Trade;
  onClose: () => void;
}

const P2PChat: React.FC<P2PChatProps> = ({ trade, onClose }) => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    p2pService.subscribe('newMessage', handleNewMessage);

    return () => {
      p2pService.unsubscribe('newMessage', handleNewMessage);
    };
  }, [trade.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = () => {
    const msgs = p2pService.getChatMessages(trade.id);
    setMessages(msgs);
    if (user) {
      p2pService.markMessagesAsRead(trade.id, user.id);
    }
  };

  const handleNewMessage = (data: { tradeId: string; message: ChatMessage }) => {
    if (data.tradeId === trade.id) {
      setMessages(prev => [...prev, data.message]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim()) return;

    try {
      await p2pService.sendMessage(
        trade.id,
        user.id,
        profile?.name || 'User',
        newMessage
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setLoading(true);
    try {
      // Convert to base64 for demo (in production, upload to server)
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        await p2pService.sendMessage(
          trade.id,
          user.id,
          profile?.name || 'User',
          '📸 Sent an image',
          'image',
          imageUrl
        );
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isBuyer = user?.id === trade.buyer.id;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg border">
      {/* Chat Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {isBuyer ? trade.seller.name[0] : trade.buyer.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {isBuyer ? trade.seller.name : trade.buyer.name}
              {(isBuyer ? trade.seller.verified : trade.buyer.verified) && (
                <Shield className="w-4 h-4 text-blue-500" />
              )}
            </h3>
            <p className="text-xs text-gray-500">
              Trade #{trade.id.slice(-8)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Trade Info Bar */}
      <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-gray-500">Amount:</span>
            <span className="ml-2 font-medium">{trade.crypto.amount} {trade.crypto.symbol}</span>
          </div>
          <div>
            <span className="text-gray-500">Total:</span>
            <span className="ml-2 font-medium">${trade.fiat.amount.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500">
            Expires in {Math.max(0, Math.floor((trade.expiresAt.getTime() - Date.now()) / 60000))} min
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            {msg.type === 'system' ? (
              <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs max-w-[80%] flex items-center gap-2">
                <AlertCircle className="w-3 h-3" />
                {msg.message}
              </div>
            ) : (
              <div className={`max-w-[70%] ${msg.userId === user?.id ? 'items-end' : 'items-start'}`}>
                {msg.userId !== user?.id && (
                  <p className="text-xs text-gray-500 mb-1 ml-1">{msg.userName}</p>
                )}
                <div
                  className={`px-3 py-2 rounded-lg ${
                    msg.userId === user?.id
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.type === 'image' ? (
                    <div className="space-y-2">
                      <img
                        src={msg.imageUrl}
                        alt="Shared"
                        className="max-w-full max-h-48 rounded-lg cursor-pointer hover:opacity-90"
                        onClick={() => setSelectedImage(msg.imageUrl || null)}
                      />
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.message}</p>
                  )}
                  <p className={`text-xs mt-1 ${
                    msg.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-3 py-2 pr-20 bg-gray-100 dark:bg-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute right-2 bottom-2 flex gap-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              >
                <Image className="w-4 h-4 text-gray-500" />
              </button>
              <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Payment Status Actions */}
        {trade.status === 'pending' && isBuyer && (
          <button
            onClick={() => p2pService.updateTradeStatus(trade.id, 'paid')}
            className="w-full mt-3 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
          >
            I've Paid
          </button>
        )}

        {trade.status === 'paid' && !isBuyer && (
          <button
            onClick={() => p2pService.updateTradeStatus(trade.id, 'confirmed')}
            className="w-full mt-3 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Confirm Payment & Release
          </button>
        )}

        {trade.status !== 'completed' && trade.status !== 'disputed' && (
          <button
            onClick={() => {
              const reason = prompt('Please describe the issue:');
              if (reason) {
                p2pService.createDispute(trade.id, user?.id || '', reason, []);
              }
            }}
            className="w-full mt-2 py-2 border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50"
          >
            Dispute Trade
          </button>
        )}
      </div>
    </div>
  );
};

export default P2PChat;