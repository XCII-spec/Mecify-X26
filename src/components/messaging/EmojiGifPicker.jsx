import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile, Image, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const GIPHY_KEY = 'dc6zaTOxFJmzC';

export default function EmojiGifPicker({ onEmojiSelect, onGifSelect, onClose }) {
  const [tab, setTab] = useState('emoji');
  const [gifSearch, setGifSearch] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loadingGifs, setLoadingGifs] = useState(false);
  const ref = useRef(null);

  // Fermer en cliquant dehors
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Charger des GIFs trending au départ
  useEffect(() => {