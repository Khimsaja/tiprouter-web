import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Bell, CheckCircle2, Info, Megaphone } from "lucide-react";
import { api, type NotifItem, type NotifKind } from "../lib/api";
import { useLang } from "../lib/i18n";
import { useSession } from "../lib/session";

export const KIND_ICON: Record<NotifKind, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  promo: Megaphone,
};

export function timeAgo(iso: string, lang: string): string {
  const s = Math.max(0, Math.floor((Date.now() - Date.parse(iso)) / 1000));
  if (lang === "en") {
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export default function NotifBell() {
  const { me } = useSession();
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.notifications(10);
      setItems(r.items);
      setUnread(r.unread);
    } catch {
      /* offline — diam saja */
    }
  }, []);

  useEffect(() => {
    if (!me) {
      setItems([]);
      setUnread(0);
      return;
    }
    load();
    const id = setInterval(load, 60000);
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [me, load]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  // Tandai yang terlihat sebagai dibaca sesaat setelah dropdown dibuka.
  useEffect(() => {
    if (!open) return;
    const ids = items.filter((i) => !i.read).map((i) => i.id);
    if (!ids.length) return;
    const tm = setTimeout(async () => {
      try {
        await api.notifRead(ids);
        setItems((p) => p.map((i) => ({ ...i, read: 1 })));
        setUnread((u) => Math.max(0, u - ids.length));
      } catch {
        /* abaikan */
      }
    }, 1200);
    return () => clearTimeout(tm);
  }, [open, items ]);

  if (!me) return null;

  const markAll = async () => {
    try {
      await api.notifReadAll();
      setItems((p) => p.map((i) => ({ ...i, read: 1 })));
      setUnread(0);
    } catch {
      /* abaikan */
    }
  };

  return (
    <div className="notif-wrap" ref={wrapRef}>
      <button
        className="icon-btn notif-btn"
        aria-label={t("Notifikasi")}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={18} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notif-drop" role="menu">
          <div className="notif-head">
            <b>{t("Notifikasi")}</b>
            {unread > 0 && (
              <button className="link-btn" onClick={markAll}>
                {t("Tandai semua dibaca")}
              </button>
            )}
          </div>
          <div className="notif-list">
            {items.length === 0 && <p className="notif-empty">{t("Belum ada notifikasi.")}</p>}
            {items.map((n) => {
              const K = KIND_ICON[n.kind] ?? Info;
              return (
                <Link
                  key={n.id}
                  to={n.link || "/notifications"}
                  className={"notif-item" + (n.read ? "" : " unread")}
                  onClick={() => setOpen(false)}
                >
                  <span className={"notif-ic k-" + n.kind}>
                    <K size={16} />
                  </span>
                  <span className="notif-tx">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-body">{n.body}</span>
                    <span className="notif-meta">
                      {n.sender} · {timeAgo(n.createdAt, lang)}
                    </span>
                  </span>
                  {!n.read && <span className="notif-dot" />}
                </Link>
              );
            })}
          </div>
          <Link to="/notifications" className="notif-all" onClick={() => setOpen(false)}>
            {t("Lihat semua")}
          </Link>
        </div>
      )}
    </div>
  );
}
