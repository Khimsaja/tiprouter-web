import { useEffect, useState } from "react";
import { api, type PublicStats } from "./api";

/**
 * Live public network stats (24h rolling window), refreshed every `pollMs`.
 * The endpoint is cached 60s server-side, so polling is cheap by design.
 * Skips background refreshes when the tab is hidden; refetches on focus.
 */
export function usePublicStats(pollMs = 60_000): { stats: PublicStats | null; error: boolean } {
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const s = await api.publicStats();
        if (!alive) return;
        setStats(s);
        setError(false);
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    const iv = window.setInterval(() => {
      if (!document.hidden) load();
    }, pollMs);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      alive = false;
      window.clearInterval(iv);
      window.removeEventListener("focus", onFocus);
    };
  }, [pollMs]);

  return { stats, error };
}
