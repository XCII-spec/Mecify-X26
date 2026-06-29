
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCheck, Check, FileText, Download, Reply, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import MessageReactions from './MessageReactions';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function getAvatarColor(email) {
  if (email === 'ai@messify.app') return 'bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500';
  const colors = [
    'bg-gradient-to-br from-violet-500 to-purple-600',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-orange-500 to-amber-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
  ];
  return colors[email ? email.charCodeAt(0) % colors.length : 0];
}

function isGif(content) {
  return content && (
    (content.startsWith('https://media') && content.includes('giphy')) ||
    (content.startsWith('https://') && content.match(/\.(gif)(\?|$)/i))
  );
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function MessageContent({ msg, isMe }) {
  const type = msg.message_type || (isGif(msg.content) ? 'gif' : 'text');

  if (type === 'gif' || isGif(msg.content)) {
    return <img src={msg.content || msg.file_url} alt="GIF" className="rounded-2xl max-w-[220px] shadow-md" loading="lazy" />;
  }

  if (type === 'image') {
    return (
      <a href={msg.file_url} target="_blank" rel="noopener noreferrer">
        <img src={msg.file_url} alt={msg.file_name || 'Image'} className="rounded-2xl max-w-[260px] shadow-md hover:opacity-90 transition-opacity cursor-pointer" loading="lazy" />
      </a>
    );
  }

  if (type === 'pdf' || type === 'file') {
    return (
      <a href={msg.file_url} target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[200px] max-w-[280px] transition-opacity hover:opacity-90 ${
          isMe ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white' : 'bg-white border border-gray-100 shadow-md text-gray-800'
        }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isMe ? 'bg-white/20' : 'bg-violet-50'}`}>
          <FileText className={`w-5 h-5 ${isMe ? 'text-white' : 'text-violet-600'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{msg.file_name || 'Fichier'}</p>
          {msg.file_size && <p className={`text-xs ${isMe ? 'text-white/70' : 'text-gray-400'}`}>{formatFileSize(msg.file_size)}</p>}
        </div>
        <Download className={`w-4 h-4 flex-shrink-0 ${isMe ? 'text-white/80' : 'text-gray-400'}`} />
      </a>
    );
  }

  return (
    <div className={`px-4 py-2.5 rounded-2xl ${
      isMe
        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-br-sm shadow-lg shadow-violet-500/25'
        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm shadow-md border border-gray-100 dark:border-gray-700'
    }`}>
      <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
      {msg.is_edited && <p className="text-[10px] opacity-60 mt-0.5 text-right">modifié</p>}
    </div>
  );
}

export default function MessageBubble({ msg, isMe, showAvatar, currentUserEmail, onReply }) {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(msg.content || '');

  const handleDelete = async () => {
    await db.entities.Message.delete(msg.id);
  };

  const handleEdit = async () => {
    if (!editValue.trim()) return;
    await db.entities.Message.update(msg.id, { ...msg, content: editValue, is_edited: true });
    setEditing(false);
  };

  const canEdit = isMe && msg.message_type === 'text' && !msg.is_ai_message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
      className={`flex items-end gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isMe && (
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-medium ${showAvatar ? getAvatarColor(msg.sender_email) : 'bg-transparent'}`}>
          {showAvatar && getInitials(msg.sender_name)}
        </div>
      )}

      <div className={`max-w-[70%] flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
        {/* Reply preview */}
        {msg.reply_to_content && (
          <div className={`text-xs px-3 py-1.5 rounded-xl border-l-2 border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-gray-500 dark:text-gray-400 max-w-full truncate mb-0.5`}>
            <span className="font-medium text-violet-600 dark:text-violet-300">{msg.reply_to_sender}</span>
            <p className="truncate">{msg.reply_to_content}</p>
          </div>
        )}

        {/* Message content or edit input */}
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditing(false); }}
              className="rounded-xl text-sm"
              autoFocus
            />
            <Button size="sm" onClick={handleEdit} className="h-8 bg-violet-600 hover:bg-violet-700">OK</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="h-8">✕</Button>
          </div>
        ) : (
          <div className="relative flex items-center gap-1">
            {/* Action buttons (appear on hover) */}
            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className={`flex items-center gap-0.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-full px-1 py-0.5 shadow-lg ${isMe ? 'order-first mr-1' : 'order-last ml-1'}`}
                >
                  <button
                    onClick={() => onReply && onReply(msg)}
                    className="p-1 rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/30 text-gray-400 hover:text-violet-600 transition-colors"
                    title="Répondre"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => { setEditing(true); setEditValue(msg.content); }}
                      className="p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Modifier"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isMe && (
                    <button
                      onClick={handleDelete}
                      className="p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            <MessageContent msg={msg} isMe={isMe} />
          </div>
        )}

        <MessageReactions msg={msg} currentUserEmail={currentUserEmail} isMe={isMe} />
        <div className="flex items-center gap-1 px-1">
          <span className="text-[10px] text-gray-400">
            {format(new Date(msg.created_date), 'HH:mm', { locale: fr })}
          </span>
          {isMe && (
            msg.status === 'read'
              ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              : msg.status === 'delivered'
                ? <CheckCheck className="w-3.5 h-3.5 text-gray-400" />
                : <Check className="w-3.5 h-3.5 text-gray-400" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
