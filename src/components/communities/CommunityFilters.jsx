import React from 'react';
import { Crown, Award, Gem, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_CONFIG = {
  bronze: {
    icon: Medal,
    color: 'from-amber-700 to-amber-500',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    label: 'Bronze',
    threshold: 1000,
  },
  silver: {
    icon: Award,
    color: 'from-gray-400 to-gray-300',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
    label: 'Argent',
    threshold: 10000,
  },
  gold: {
    icon: Crown,
    color: 'from-yellow-500 to-yellow-400',
    bgColor: 'bg-yellow-100',