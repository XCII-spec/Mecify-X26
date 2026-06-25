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
    textColor: 'text-yellow-700',
    label: 'Or',
    threshold: 100000,
  },
  diamond: {
    icon: Gem,
    color: 'from-cyan-400 to-blue-500',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    label: 'Diamant',
    threshold: 500000,
  },
};

export function getBadgeForFollowers(followerCount) {
  if (followerCount >= 500000) return 'diamond';
  if (followerCount >= 100000) return 'gold';
  if (followerCount >= 10000) return 'silver';
  if (followerCount >= 1000) return 'bronze';
  return 'none';
}

export default function BadgeDisplay({ badge, size = 'md', showLabel = false, animated = true }) {
  if (!badge || badge === 'none') return null;

  const config = BADGE_CONFIG[badge];
  if (!config) return null;

  const Icon = config.icon;
  
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const containerSizes = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14',
  };

  const Component = animated ? motion.div : 'div';
  const animationProps = animated ? {
    whileHover: { scale: 1.1, rotate: 5 },
    transition: { type: 'spring', stiffness: 400, damping: 10 }
  } : {};

  if (showLabel) {
    return (
      <Component
        {...animationProps}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-md"
      >
        <div className={`${containerSizes[size]} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg`}>
          <Icon className={`${sizes[size]} text-white`} />
        </div>
        <span className={`font-semibold text-sm ${config.textColor}`}>
          {config.label}
        </span>
      </Component>
    );
  }

  return (
    <Component
      {...animationProps}
      className={`${containerSizes[size]} rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center shadow-lg ring-2 ring-white`}
      title={`Badge ${config.label}`}
    >
      <Icon className={`${sizes[size]} text-white`} />
    </Component>
  );
}