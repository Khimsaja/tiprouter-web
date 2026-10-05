import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Gift, KeyRound, LayoutDashboard, ListOrdered, LogOut, Sparkles, BookOpenText, CircleUserRound } from "lucide-react";
import { useSession } from "../lib/session";
import { PublicLayout } from "./chrome";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/usage", label: "Usage", icon: ListOrdered },
  { to: "/dashboard/models", label: "Model", icon: Sparkles },
  { to: "/dashboard/panduan", label: "Panduan", icon: BookOpenText },
  { to: "/bansos", label: "Gacha Bansos", icon: Gift },
  { to: "/profile", label: "Profil", icon: CircleUserRound, group: "Akun" },
];

export default function DashLayout() {
  const { me, loading, logout } = useSession();
  const location = useLocation();
  if (loading) {
    return (
      <PublicLayout wide>
        <p className="muted" style={{ marginTop: 40 }}>Memuat…</p>
      </PublicLayout>
    );
  }
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const emailLine =
    me.user.email ||
    (me.providers.includes("apikey") ? "Masuk pakai API key" : me.telegram ? "Telegram @" + (me.telegram.username || "") : "");
  const avatar = me.user.avatar || me.telegram?.photoUrl;

  return (
    <PublicLayout wide>
      <div className="dash">
        <aside className="side">
          <div className="mechip">
            {avatar ? <img src={avatar} alt="" /> : null}
            <div>
              <p className="nm">{me.user.name || "pembeli"}</p>
              <p className="em">{emailLine}</p>
            </div>
          </div>
          <nav className="snav">
            {LINKS.map((l) => (
              <span key={l.to} style={{ display: "contents" }}>
                {l.group ? <p className="navgroup">{l.group}</p> : null}
                <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "on" : "")}>
                  <span className="ic"><l.icon size={16} /></span>
                  {l.label}
                </NavLink>
              </span>
            ))}
          </nav>
          <div className="sidefoot">
            <button
              className="btn"
              style={{ width: "100%" }}
              onClick={async () => { await logout(); window.location.assign("/login"); }}
            >
              <LogOut size={15} /> Keluar
            </button>
          </div>
        </aside>
        <main>
          <Outlet />
        </main>
      </div>
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
