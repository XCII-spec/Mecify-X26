
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Users, MessageCircle, Users2, FileText, Key, Crown, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex items-center gap-4"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        ) : (
          <div className="text-3xl font-bold text-gray-900">{value}</div>
        )}
        <div className="text-sm text-gray-500 mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

export default function GlobalStats() {
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => db.entities.User.list(),
  });

  const { data: conversations = [], isLoading: loadingConvs } = useQuery({
    queryKey: ['adminConversations'],
    queryFn: () => db.entities.Conversation.list(),
  });

  const { data: communities = [], isLoading: loadingCommunities } = useQuery({
    queryKey: ['adminCommunities'],
    queryFn: () => db.entities.Community.list(),
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => db.entities.Post.list(),
  });

  const { data: codes = [], isLoading: loadingCodes } = useQuery({
    queryKey: ['subscriptionCodes'],
    queryFn: () => db.entities.SubscriptionCode.list(),
  });

  const subscribedUsers = users.filter(u => u.is_subscribed).length;
  const usedCodes = codes.filter(c => c.is_used).length;
  const availableCodes = codes.filter(c => !c.is_used).length;

  const stats = [
    { icon: Users, label: 'Utilisateurs inscrits', value: users.length, color: 'bg-violet-500', loading: loadingUsers },
    { icon: Crown, label: 'Abonnés actifs', value: subscribedUsers, color: 'bg-yellow-500', loading: loadingUsers },
    { icon: MessageCircle, label: 'Conversations', value: conversations.length, color: 'bg-blue-500', loading: loadingConvs },
    { icon: Users2, label: 'Communautés', value: communities.length, color: 'bg-emerald-500', loading: loadingCommunities },
    { icon: FileText, label: 'Posts publiés', value: posts.length, color: 'bg-pink-500', loading: loadingPosts },
    { icon: Key, label: 'Codes disponibles', value: availableCodes, color: 'bg-green-500', loading: loadingCodes },
    { icon: Key, label: 'Codes utilisés', value: usedCodes, color: 'bg-gray-400', loading: loadingCodes },
  ];

  const recentUsers = [...users]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-600" />
          Derniers inscrits
        </h3>
        {loadingUsers ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
        ) : (
          <div className="space-y-2">
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {u.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{u.full_name || '—'}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.is_subscribed && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Abonné
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                    {u.role || 'user'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
