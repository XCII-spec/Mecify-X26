import React from 'react';
import { motion } from 'framer-motion';
import { Users, Heart, Eye, MessageSquare, TrendingUp } from 'lucide-react';

export default function StatsCard({ stats }) {
  const statItems = [
    {
      icon: Users,
      label: 'Followers',
      value: stats?.follower_count || 0,
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Heart,
      label: 'Likes',
      value: stats?.total_likes || 0,
      color: 'from-pink-500 to-rose-600',
    },
    {
      icon: Eye,
      label: 'Vues',
      value: stats?.total_views || 0,
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: MessageSquare,
      label: 'Posts',
      value: stats?.total_posts || 0,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num;
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
        >
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
            <item.icon className="w-5 h-5 text-white" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(item.value)}
          </div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}