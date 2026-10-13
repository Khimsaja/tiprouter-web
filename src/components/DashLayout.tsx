import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Gift, KeyRound, LayoutDashboard, ListOrdered, Sparkles, BookOpenText, CircleUserRound, Users, Menu, X, FlaskConical, Bell, History } from "lucide-react";
import { useSession } from "../lib/session";
import { useLang } from "../lib/i18n";
import { PublicLayout } from "./chrome";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/usage", label: "Usage", icon: ListOrdered },
  { to: "/dashboard/models", label: "Model", icon: Sparkles },
  { to: "/dashboard/playground", label: "Playground", icon: FlaskConical },
  { to: "/dashboard/riwayat", label: "Riwayat", icon: History },
  { to: "/dashboard/panduan", label: "Panduan", icon: BookOpenText },
  { to: "/bansos", label: "Gacha Bansos", icon: Gift },
  { to: "/referral", label: "Referral", icon: Users },
  { to: "/notifikasi", label: "Notifikasi", icon: Bell },
  { to: "/profile", label: "Profil", icon: CircleUserRound, group: "Akun" },
];

function SideContent({ mechip, onNavigate }: { mechip: React.ReactNode; onNavigate?: () => void }) {
  const { t } = useLang();
  return (
    <>
      {mechip}
      <nav className="snav">
        {LINKS.map((l) => (
          <span key={l.to} style={{ display: "contents" }}>
            {l.group ? <p className="navgroup">{t(l.group)}</p> : null}
            <NavLink to={l.to} end={l.end} onClick={onNavigate} className={({ isActive }) => (isActive ? "on" : "")}>
              <span className="ic"><l.icon size={16} /></span>
              {t(l.label)}
            </NavLink>
          </span>
        ))}
      </nav>
    </>
  );
}

export default function DashLayout() {
  const { me, loading } = useSession();
  const { t } = useLang();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer ]);

  if (loading) {
    return (
      <PublicLayout wide>
        <p className="muted" style={{ marginTop: 40 }}>{t("Memuat…")}</p>
      </PublicLayout>
    );
  }
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const emailLine =
    me.user.email ||
    (me.providers.includes("apikey") ? t("Masuk pakai API key") : me.telegram ? "Telegram @" + (me.telegram.username || "") : "");
  const avatar = me.user.avatar || me.telegram?.photoUrl;

  const mechip = (
    <div className="mechip">
      {avatar ? <img src={avatar} alt="" /> : null}
      <div>
        <p className="nm">{me.user.name || t("pembeli")}</p>
        <p className="em">{emailLine}</p>
      </div>
    </div>
  );

  return (
    <PublicLayout wide>
      <div className="dash">
        <aside className="side">
          <SideContent mechip={mechip} />
        </aside>
        <main>
          <button type="button" className="dashmenu-btn" onClick={() => setDrawer(true)} aria-label={t("Buka menu dashboard")}>
            <Menu size={18} />
            <span>{t("Menu dashboard")}</span>
          </button>
          <Outlet />
        </main>
      </div>
      <div
        className={`drawer-backdrop${drawer ? " open" : ""}`}
        onClick={() => setDrawer(false)}
        aria-hidden={!drawer}
      />
      <aside className={`drawer${drawer ? " open" : ""}`} aria-hidden={!drawer} aria-label={t("Menu dashboard")}>
        <div className="drawer-head">
          <button type="button" onClick={() => setDrawer(false)} aria-label={t("Tutup menu")}>
            <X size={18} />
          </button>
        </div>
        <SideContent mechip={mechip} onNavigate={() => setDrawer(false)} />
      </aside>
    </PublicLayout>
  );
}

export function PageHead({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="phead">
      <h1>{title}</h1>
      <p className="sub">{sub}</p>
    </div>
  );
}
