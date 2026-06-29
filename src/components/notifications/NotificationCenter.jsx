
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, MessageCircle, Heart, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NOTIFICATION_ICONS = {
  message: MessageCircle,
  like: Heart,
  follow: Users,
  comment: MessageCircle,
  mention: MessageCircle,
};

export default function NotificationCenter({ userEmail }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: () => db.entities.Notification.filter({ recipient_email: userEmail }, '-created_date', 50),
    enabled: !!userEmail,
    refetchInterval: 8000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!userEmail) return;
    const unsubscribe = db.entities.Notification.subscribe((event) => {
      if (
        event.type === 'create' &&
        event.data?.recipient_email === userEmail
      ) {
        queryClient.invalidateQueries({ queryKey: ['notifications', userEmail] });
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('Messify', {
            body: `${event.data.sender_name || ''} ${event.data.content}`,
            icon: '/favicon.ico',
          });
        }
      }
    });
    return unsubscribe;
  }, [userEmail, queryClient]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId) => {
      const notif = notifications.find(n => n.id === notificationId);
      return db.entities.Notification.update(notificationId, { ...notif, is_read: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => 
        db.entities.Notification.update(n.id, { ...n, is_read: true })
      ));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId) => db.entities.Notification.delete(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="text-violet-600 hover:text-violet-700"
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notif) => {
                const Icon = NOTIFICATION_ICONS[notif.type] || Bell;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-violet-50/50' : ''}`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notif.priority === 'high' ? 'bg-red-100' : 'bg-violet-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${notif.priority === 'high' ? 'text-red-600' : 'text-violet-600'}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm">
                            <span className="font-semibold">{notif.sender_name}</span>
                            {' '}
                            <span className="text-gray-600">{notif.content}</span>
                          </p>
                          <button
                            onClick={() => deleteNotificationMutation.mutate(notif.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {format(new Date(notif.created_date), 'PPp', { locale: fr })}
                          </span>
                          
                          {!notif.is_read && (
                            <button
                              onClick={() => markAsReadMutation.mutate(notif.id)}
                              className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
