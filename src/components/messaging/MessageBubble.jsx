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