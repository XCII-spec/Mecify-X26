import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageCircle, CheckCheck, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePresence } from '@/hooks/usePresence';

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isToday(date)) return format(date, 'HH:mm', { locale: fr });
  if (isYesterday(date)) return 'Hier';
  return format(date, 'd MMM', { locale: fr });
}

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(email) {
  if (email === 'ai@messify.app') return 'bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500';
  const colors = [
    'bg-gradient-to-br from-violet-500 to-purple-600',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-emerald-500 to-teal-500',
    'bg-gradient-to-br from-orange-500 to-amber-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-indigo-500 to-violet-500',
  ];
  return colors[email ? email.charCodeAt(0) % colors.length : 0];
}

const statusColors = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  busy: 'bg-red-400',
  offline: 'bg-gray-300',
};

export default function ConversationList({ conversations, selectedId, onSelect, currentUserEmail }) {
  const [search, setSearch] = useState('');

  const otherEmails = conversations.map(conv =>
    conv.participants?.find(p => p !== currentUserEmail) || ''
  );
  const { getPresence } = usePresence(otherEmails);

  const filtered = conversations.filter(conv => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const names = conv.participant_names?.join(' ').toLowerCase() || '';
    const last = (conv.last_message || '').toLowerCase();
    const emails = conv.participants?.join(' ').toLowerCase() || '';
    return names.includes(q) || last.includes(q) || emails.includes(q);
  });

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="px-4 pb-3 pt-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="pl-9 pr-9 rounded-xl border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-300 text-sm h-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16 px-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-violet-400" />
            </div>
            <p className="text-gray-400 text-center text-sm">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucune conversation pour le moment'}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((conv, index) => {
              const otherParticipants = conv.participant_names?.filter((_, i) =>
                conv.participants[i] !== currentUserEmail
              ) || [];
              const displayName = otherParticipants.join(', ') || 'Conversation';
              const otherEmail = conv.participants?.find(p => p !== currentUserEmail) || '';
              const isSelected = selectedId === conv.id;
              const isLastSenderMe = conv.last_sender === currentUserEmail;
              const isAI = otherEmail === 'ai@messify.app';
              const presence = isAI ? { is_online: true, status: 'online' } : getPresence(otherEmail);

              return (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onSelect(conv)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200 border-b border-gray-50 dark:border-gray-800
                    ${isSelected
                      ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border-l-2 border-l-violet-500'
                      : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/50'
                    }`}
                >
                  {/* Avatar with presence */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(otherEmail)} flex items-center justify-center text-white font-semibold text-sm shadow-md`}>
                      {getInitials(otherParticipants[0] || otherEmail)}
                    </div>
                    {/* Presence dot */}
                    <span className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-900 ${
                      statusColors[presence.status] || statusColors.offline
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`font-semibold text-sm truncate ${isSelected ? 'text-violet-900 dark:text-violet-200' : 'text-gray-900 dark:text-gray-100'}`}>
                        {displayName}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {isLastSenderMe && <CheckCheck className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />}
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {conv.last_message || 'Nouvelle conversation'}
                      </p>
                    </div>
                    {presence.is_online && (
                      <p className="text-[10px] text-emerald-500 font-medium mt-0.5">● En ligne</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}