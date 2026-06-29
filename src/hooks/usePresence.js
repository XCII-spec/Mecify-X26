import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * API helper (remplace db)
 * 👉 À connecter plus tard à ton backend réel
 */
const api = {
  listPresence: async () => [],
  updatePresence: async () => {},
  createPresence: async () => {},
  subscribe: () => () => {},
};

// Hook: met à jour ton statut online/offline
export function useMyPresence(userEmail) {
  useEffect(() => {
    if (!userEmail) return;

    let interval;

    const setOnline = async () => {
      try {
        await api.updatePresence(userEmail, {
          is_online: true,
          status: "online",
          last_seen: new Date().toISOString(),
        });
      } catch (e) {}
    };

    const setOffline = async () => {
      try {
        await api.updatePresence(userEmail, {
          is_online: false,
          status: "offline",
          last_seen: new Date().toISOString(),
        });
      } catch (e) {}
    };

    setOnline();

    interval = setInterval(setOnline, 30000);

    const handleVisibilityChange = () => {
      if (document.hidden) setOffline();
      else setOnline();
    };

    window.addEventListener("beforeunload", setOffline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", setOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      setOffline();
    };
  }, [userEmail]);
}

// Hook: récupérer présence
export function usePresence(emails = []) {
  const queryClient = useQueryClient();

  const { data: presenceList = [] } = useQuery({
    queryKey: ["presence", emails.join(",")],
    queryFn: api.listPresence,
    enabled: emails.length > 0,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!emails.length) return;

    const unsub = api.subscribe(() => {
      queryClient.invalidateQueries({ queryKey: ["presence"] });
    });

    return unsub;
  }, [emails.join(",")]);

  const getPresence = (email) => {
    const p = presenceList.find((x) => x.user_email === email);

    if (!p) {
      return { is_online: false, status: "offline" };
    }

    const lastSeen = p.last_seen ? new Date(p.last_seen) : null;
    const isRecent =
      lastSeen && lastSeen > new Date(Date.now() - 2 * 60 * 1000);

    return {
      is_online: Boolean(p.is_online && isRecent),
      status: p.is_online && isRecent ? p.status || "online" : "offline",
      last_seen: p.last_seen,
    };
  };

  return { getPresence };
}
