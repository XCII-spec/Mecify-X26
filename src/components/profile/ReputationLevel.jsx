import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp } from 'lucide-react';

export default function ReputationLevel({ level = 1, points = 0 }) {
  const nextLevelPoints = level * 1000;
  const progress = (points % 1000) / 1000 * 100;

  const getLevelColor = (lvl) => {
    if (lvl >= 50) return 'from-purple-600 to-pink-600';
    if (lvl >= 30) return 'from-violet-600 to-purple-600';
    if (lvl >= 10) return 'from-blue-600 to-violet-600';
    return 'from-gray-600 to-gray-500';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center shadow-lg`}>
            <Star className="w-6 h-6 text-white" fill="white" />
          </div>
          <div>
            <div className="text-sm text-gray-500">Niveau de réputation</div>
            <div className="text-2xl font-bold text-gray-900">Niveau {level}</div>