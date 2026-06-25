const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Hook to manage current user's presence
export function useMyPresence(userEmail) {
  const presenceIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;

    const setOnline = async () => {
      try {
        const existing = await db.entities.UserPresence.filter({ user_email: userEmail }, '-created_date', 1);
        if (existing.length > 0) {
          presenceIdRef.current = existing[0].id;
          await db.entities.UserPresence.update(existing[0].id, {
            is_online: true,
            status: 'online',
            last_seen: new Date().toISOString(),
          });
        } else {
          const p = await db.entities.UserPresence.create({
            user_email: userEmail,
            is_online: true,
            status: 'online',
            last_seen: new Date().toISOString(),
          });
          presenceIdRef.current = p.id;
        }
      } catch (e) {}
    };

    const setOffline = async () => {
      try {
        if (presenceIdRef.current) {
          await db.entities.UserPresence.update(presenceIdRef.current, {
            is_online: false,
            status: 'offline',
            last_seen: new Date().toISOString(),
          });
        }
      } catch (e) {}
    };

    setOnline();
    // Heartbeat every 30s
    intervalRef.current = setInterval(setOnline, 30000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setOffline();
      } else {
        setOnline();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [userEmail]);
}

// Hook to get presence of specific emails
export function usePresence(emails = []) {
  const queryClient = useQueryClient();

  const { data: presenceList = [] } = useQuery({
    queryKey: ['presence', emails.join(',')],
    queryFn: () => db.entities.UserPresence.list(),
    enabled: emails.length > 0,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (emails.length === 0) return;
    const unsub = db.entities.UserPresence.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ['presence'] });
    });
    return unsub;
  }, [emails.join(',')]);

  const getPresence = (email) => {
    const p = presenceList.find(pr => pr.user_email === email);
    if (!p) return { is_online: false, status: 'offline' };
    // Consider offline if last_seen > 2 minutes
    const lastSeen = p.last_seen ? new Date(p.last_seen) : null;
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000);
    const isRecentlyActive = lastSeen && lastSeen > twoMinAgo;
    return {
      is_online: p.is_online && isRecentlyActive,
      status: p.is_online && isRecentlyActive ? (p.status || 'online') : 'offline',
      last_seen: p.last_seen,
    };
  };

  return { getPresence };
}