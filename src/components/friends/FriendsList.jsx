
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { motion } from 'framer-motion';
import { UserPlus, Check, X, MessageCircle, Users, Loader2, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
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

export default function FriendsList({ userEmail, onStartConversation }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [activeCall, setActiveCall] = useState(null);
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({
    queryKey: ['friends', userEmail],
    queryFn: () => db.entities.Friend.filter({ user_email: userEmail }),
    enabled: !!userEmail,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => db.entities.User.list(),
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendEmail) => {
      const existingFriend = friends.find(
        f => (f.user_email === userEmail && f.friend_email === friendEmail) ||
             (f.user_email === friendEmail && f.friend_email === userEmail)
      );

      if (existingFriend) {
        toast.error('Cette personne est déjà dans vos contacts');
        return;
      }

      const friendUser = users.find(u => u.email === friendEmail);
      
      await db.entities.Friend.create({
        user_email: userEmail,
        friend_email: friendEmail,
        friend_name: friendUser?.full_name || friendEmail,
        status: 'pending',
        requested_by: userEmail,
      });

      await db.entities.Friend.create({
        user_email: friendEmail,
        friend_email: userEmail,
        friend_name: users.find(u => u.email === userEmail)?.full_name || userEmail,
        status: 'pending',
        requested_by: userEmail,
      });

      await db.entities.Notification.create({
        recipient_email: friendEmail,
        sender_email: userEmail,
        sender_name: users.find(u => u.email === userEmail)?.full_name || userEmail,
        type: 'follow',
        content: 'vous a envoyé une demande d\'ami',
        priority: 'normal',
      });

      toast.success('Demande envoyée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      setShowAddModal(false);
      setSearchEmail('');
    },
  });

  const acceptFriendMutation = useMutation({
    mutationFn: async (friend) => {
      await db.entities.Friend.update(friend.id, {
        ...friend,
        status: 'accepted',
      });

      const reverseFriend = friends.find(
        f => f.user_email === friend.friend_email && f.friend_email === friend.user_email
      );

      if (reverseFriend) {
        await db.entities.Friend.update(reverseFriend.id, {
          ...reverseFriend,
          status: 'accepted',
        });
      }

      toast.success('Demande acceptée');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friend) => {
      await db.entities.Friend.delete(friend.id);

      const reverseFriend = friends.find(
        f => f.user_email === friend.friend_email && f.friend_email === friend.user_email
      );

      if (reverseFriend) {
        await db.entities.Friend.delete(reverseFriend.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      toast.success('Contact retiré');
    },
  });

  const pendingRequests = friends.filter(f => f.status === 'pending' && f.requested_by !== userEmail);
  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const sentRequests = friends.filter(f => f.status === 'pending' && f.requested_by === userEmail);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => db.auth.me(),
  });

  if (activeCall) {
    return (
      <CallInterface
        participant={activeCall.participant}
        type={activeCall.type}
        currentUser={user}
        onEnd={() => setActiveCall(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-violet-600" />
          <h2 className="text-2xl font-bold text-gray-900">Contacts</h2>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-violet-600 to-purple-600"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Ajouter un contact
        </Button>
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-violet-50 rounded-2xl p-6 border-2 border-violet-200">
          <h3 className="font-semibold text-lg mb-4 text-violet-900">
            Demandes reçues ({pendingRequests.length})
          </h3>
          <div className="space-y-3">
            {pendingRequests.map((friend) => {
              const friendUser = users.find(u => u.email === friend.friend_email);
              return (
                <div key={friend.id} className="flex items-center justify-between bg-white rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {friendUser?.avatar_url ? (
                      <img src={friendUser.avatar_url} alt={friend.friend_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarColor(friend.friend_email)} flex items-center justify-center text-white font-semibold`}>
                        {getInitials(friend.friend_name)}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{friend.friend_name}</div>
                      <div className="text-sm text-gray-500">{friend.friend_email}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptFriendMutation.mutate(friend)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFriendMutation.mutate(friend)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {acceptedFriends.map((friend) => {
          const friendUser = users.find(u => u.email === friend.friend_email);
          return (
            <motion.div
              key={friend.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col items-center text-center">
                {friendUser?.avatar_url ? (
                  <img src={friendUser.avatar_url} alt={friend.friend_name} className="w-20 h-20 rounded-full object-cover mb-3" />
                ) : (
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(friend.friend_email)} flex items-center justify-center text-white text-2xl font-bold mb-3`}>
                    {getInitials(friend.friend_name)}
                  </div>
                )}
                <h3 className="font-semibold text-lg text-gray-900">{friend.friend_name}</h3>
                <p className="text-sm text-gray-500 mb-4">{friend.friend_email}</p>
                <div className="space-y-2 w-full">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onStartConversation?.(friendUser)}
                      className="flex-1 bg-violet-600 hover:bg-violet-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeFriendMutation.mutate(friend)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveCall({ participant: friendUser, type: 'audio' })}
                      className="flex-1 hover:bg-green-50 hover:text-green-600"
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Appel
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveCall({ participant: friendUser, type: 'video' })}
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
        })}
      </div>

      {acceptedFriends.length === 0 && pendingRequests.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
          <p>Aucun contact pour le moment</p>
        </div>
      )}

      {/* Add Friend Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              placeholder="Email de la personne"
              type="email"
            />
            <Button
              onClick={() => addFriendMutation.mutate(searchEmail)}
              disabled={!searchEmail || addFriendMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600"
            >
              {addFriendMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Envoyer la demande
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
