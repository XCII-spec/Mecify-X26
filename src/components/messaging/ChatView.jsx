

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2, Phone, Video, Smile, X, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import CallInterface from './CallInterface';
import EmojiGifPicker from './EmojiGifPicker';
import FileUploadButton from './FileUploadButton';
import MessageBubble, { getAvatarColor, getInitials } from './MessageBubble';
import { usePresence } from '@/hooks/usePresence';

const statusColors = { online: 'bg-emerald-400', away: 'bg-amber-400', busy: 'bg-red-400', offline: 'bg-gray-300' };

export default function ChatView({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onBack,
  isLoading,
  isSending
}) {
  const [newMessage, setNewMessage] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const otherParticipants = conversation?.participant_names?.filter((_, i) =>
    conversation.participants[i] !== currentUser?.email
  ) || [];
  const displayName = otherParticipants.join(', ') || 'Conversation';
  const otherEmail = conversation?.participants?.find(p => p !== currentUser?.email) || '';
  const isAI = otherEmail === 'ai@messify.app';

  const { getPresence } = usePresence(otherEmail && !isAI ? [otherEmail] : []);
  const presence = isAI ? { is_online: true, status: 'online' } : getPresence(otherEmail);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read
  useEffect(() => {
    if (!conversation || !messages.length || !currentUser) return;
    const unread = messages.filter(
      msg => msg.sender_email !== currentUser.email && !msg.read_by?.includes(currentUser.email)
    );
    if (unread.length > 0) {
      unread.forEach(msg => {
        db.entities.Message.update(msg.id, {
          ...msg,
          read_by: [...(msg.read_by || []), currentUser.email],
          status: 'read',
        }).catch(console.error);
      });
    }
  }, [conversation?.id, messages, currentUser]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    setShowPicker(false);
    const text = newMessage.trim();
    setNewMessage('');

    const msgData = { content: text, type: 'text' };
    if (replyTo) {
      msgData.reply_to_content = replyTo.content?.slice(0, 80);
      msgData.reply_to_sender = replyTo.sender_name || replyTo.sender_email;
      msgData.reply_to_id = replyTo.id;
    }
    setReplyTo(null);
    await onSendMessage(msgData);
  };

  const handleGifSelect = async (gifUrl) => {
    setShowPicker(false);
    await onSendMessage({ content: gifUrl, type: 'gif' });
  };

  const handleFileSent = async ({ file_url, file_name, file_size, message_type }) => {
    await onSendMessage({ content: file_name, type: message_type, file_url, file_name, file_size });
  };

  if (activeCall) {
    return (
      <CallInterface
        participant={activeCall.participant}
        type={activeCall.type}
        currentUser={currentUser}
        onEnd={() => setActiveCall(null)}
      />
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
            <Send className="w-10 h-10 text-violet-400" />
          </div>
          <p className="text-gray-400 text-lg">Sélectionnez une conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden rounded-full hover:bg-violet-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="relative">
            <div className={`w-10 h-10 rounded-full ${getAvatarColor(otherEmail)} flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
              {getInitials(otherParticipants[0] || otherEmail)}
            </div>
            <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-gray-900 ${statusColors[presence.status] || statusColors.offline}`} />
          </div>

          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{displayName}</h2>
            <p className={`text-xs font-medium ${presence.is_online ? 'text-emerald-500' : 'text-gray-400'}`}>
              {presence.is_online ? '● En ligne' : '● Hors ligne'}
            </p>
          </div>
        </div>

        {!isAI && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveCall({ participant: { email: otherEmail, full_name: displayName }, type: 'audio' })}
              className="rounded-full hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 w-9 h-9"
              title="Appel audio"
            >
              <Phone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveCall({ participant: { email: otherEmail, full_name: displayName }, type: 'video' })}
              className="rounded-full hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/30 w-9 h-9"
              title="Appel vidéo"
            >
              <Video className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-900">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, index) => {
              const isMe = msg.sender_email === currentUser?.email;
              const showAvatar = !isMe && (index === 0 || messages[index - 1]?.sender_email !== msg.sender_email);
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isMe={isMe}
                  showAvatar={showAvatar}
                  currentUserEmail={currentUser?.email}
                  onReply={setReplyTo}
                />
              );
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-violet-50/50 dark:bg-violet-900/10 flex items-center gap-3"
          >
            <Reply className="w-4 h-4 text-violet-500 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-violet-600">{replyTo.sender_name || replyTo.sender_email}</p>
              <p className="text-xs text-gray-500 truncate">{replyTo.content}</p>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 relative">
          {showPicker && (
            <EmojiGifPicker
              onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)}
              onGifSelect={handleGifSelect}
              onClose={() => setShowPicker(false)}
            />
          )}
          <FileUploadButton onFileSent={handleFileSent} />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setShowPicker(v => !v)}
            className={`w-9 h-9 rounded-full flex-shrink-0 transition-colors ${showPicker ? 'text-violet-600 bg-violet-50' : 'text-gray-400 hover:text-violet-600 hover:bg-violet-50'}`}
          >
            <Smile className="w-5 h-5" />
          </Button>
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSubmit(e)}
            placeholder={replyTo ? `Répondre à ${replyTo.sender_name || ''}...` : 'Écrivez votre message...'}
            className="flex-1 rounded-full border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 transition-all px-5 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim() || isSending}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/30 disabled:opacity-50 flex-shrink-0"
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
