import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Video, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BadgeDisplay from '@/components/badges/BadgeDisplay';
import CallInterface from '@/components/messaging/CallInterface';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(email) {
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-pink-500 to-rose-500',
  ];
  const index = email ? email.charCodeAt(0) % colors.length : 0;
  return colors[index];
}

export default function MemberCard({ member, userBadge, isFriend, onAddFriend, onMessage, onCall, currentUser }) {
  const [activeCall, setActiveCall] = useState(null);

  if (activeCall) {
    return (
      <CallInterface
        participant={activeCall.participant}
        type={activeCall.type}
        currentUser={currentUser}
        onEnd={() => setActiveCall(null)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex flex-col items-center text-center">
        {member?.avatar_url ? (
          <div className="relative mb-3">
            <img src={member.avatar_url} alt={member.full_name} className="w-20 h-20 rounded-full object-cover" />
            {userBadge && userBadge !== 'none' && (
              <div className="absolute -bottom-1 -right-1">
                <BadgeDisplay badge={userBadge} size="sm" />
              </div>
            )}
          </div>
        ) : (
          <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(member.email)} flex items-center justify-center text-white text-2xl font-bold mb-3 relative`}>
            {getInitials(member.full_name)}
            {userBadge && userBadge !== 'none' && (
              <div className="absolute -bottom-1 -right-1">
                <BadgeDisplay badge={userBadge} size="sm" />
              </div>
            )}
          </div>
        )}
        <h3 className="font-semibold text-lg text-gray-900">{member.full_name || member.email}</h3>
        <p className="text-sm text-gray-500 mb-4">{member.email}</p>
        
        <div className="space-y-2 w-full">
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onMessage?.(member)}
              className="flex-1 bg-violet-600 hover:bg-violet-700"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            {!isFriend && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddFriend?.(member)}
                className="hover:bg-violet-50 hover:text-violet-600"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveCall({ participant: member, type: 'audio' })}
              className="flex-1 hover:bg-green-50 hover:text-green-600"
            >
              <Phone className="w-4 h-4 mr-1" />
              Appel
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveCall({ participant: member, type: 'video' })}
              className="flex-1 hover:bg-blue-50 hover:text-blue-600"
            >
              <Video className="w-4 h-4 mr-1" />
              Vidéo
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}