import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, Mic, MicOff, VideoOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(email) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
  ];
  const index = email ? email.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

export default function CallInterface({ participant, type, onEnd, currentUser }) {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);