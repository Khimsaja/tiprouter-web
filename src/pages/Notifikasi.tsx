import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BellRing, Info } from "lucide-react";
import { api, fmtDate, type NotifItem } from "../lib/api";
import { useLang } from "../lib/i18n";
import { PageHead } from "../components/DashLayout";
import { KIND_ICON, timeAgo } from "../components/NotifBell";

const PAGE = 20;

export default function Notifikasi() {
  const { t, lang } = useLang();
  const [items, setItems] = useState<NotifItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [limit, setLimit] = useState(PAGE);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (lim: number) => {
    setLoading(true);
    try {
      const r = await api.notifications(lim);
      setItems(r.items);
      setUnread(r.unread);
      setDone(r.items.length < lim);
    } catch {
      /* abaikan */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  const more = () => {
    const nl = limit + PAGE;
    setLimit(nl);
    load(nl);
  };

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
    <div>
      <PageHead
        title={t("Notifikasi")}
        sub={t("Pengumuman admin, bonus referral, status pembayaran, dan pengingat key.")}
      />
      <div className="nt-card">
        <div className="nt-head">
          <span className="nt-count">
            {unread > 0 ? t("{n} belum dibaca", { n: unread }) : t("Semua sudah dibaca")}
          </span>
          {unread > 0 && (
            <button className="link-btn" onClick={markAll}>
              {t("Tandai semua dibaca")}
            </button>
          )}
        </div>
        {items.length === 0 && !loading && (
          <p className="notif-empty" style={{ padding: "28px 18px" }}>
            <BellRing size={20} style={{ opacity: 0.5 }} />
            <br />
            {t("Belum ada notifikasi.")}
          </p>
        )}
        {items.map((n) => {
          const K = KIND_ICON[n.kind] ?? Info;
          const inner = (
            <>
              <span className={"notif-ic k-" + n.kind}>
                <K size={17} />
              </span>
              <span className="notif-tx">
                <span className="notif-title">{n.title}</span>
                <span className="notif-body">{n.body}</span>
                <span className="notif-meta">
                  {n.sender} · {timeAgo(n.createdAt, lang)} · {fmtDate(n.createdAt)}
                </span>
              </span>
              {!n.read && <span className="notif-dot" />}
            </>
          );
          return n.link ? (
            <Link key={n.id} to={n.link} className={"notif-item big" + (n.read ? "" : " unread")}>
              {inner}
            </Link>
          ) : (
            <div key={n.id} className={"notif-item big" + (n.read ? "" : " unread")}>
              {inner}
            </div>
          );
        })}
        {!done && items.length > 0 && (
          <div style={{ padding: "14px", textAlign: "center" }}>
            <button className="btn sm" onClick={more} disabled={loading}>
              {t("Muat lagi")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
