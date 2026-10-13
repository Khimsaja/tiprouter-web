import { useEffect, useState } from "react";
import { api, type ActivePromo } from "./api";

// Daftar kode promo aktif + sisa kuota, di-poll berkala biar angkanya real-time.
export function useActivePromos(pollMs = 60000): ActivePromo[] | null {
  const [promos, setPromos] = useState<ActivePromo[] | null>(null);
  useEffect(() => {
    let alive = true;
    const load = () => {
      api
        .promoActive()
        .then((d) => {
          if (alive) setPromos(d.promos ?? []);
        })
        .catch(() => {
          /* biarkan tampilan terakhir / kosong */
        });
    };
    load();
    const iv = setInterval(load, pollMs);
    return () => {
      alive = false;
      clearInterval(iv);
    };
  }, [pollMs]);
  return promos;
}
