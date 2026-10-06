import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Gift, KeyRound, LayoutDashboard, ListOrdered, Sparkles, BookOpenText, CircleUserRound, Users } from "lucide-react";
import { useSession } from "../lib/session";
import { useLang } from "../lib/i18n";
import { PublicLayout } from "./chrome";

const LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/dashboard/keys", label: "API Keys", icon: KeyRound },
  { to: "/dashboard/usage", label: "Usage", icon: ListOrdered },
  { to: "/dashboard/models", label: "Model", icon: Sparkles },
  { to: "/dashboard/panduan", label: "Panduan", icon: BookOpenText },
  { to: "/bansos", label: "Gacha Bansos", icon: Gift },
  { to: "/referral", label: "Referral", icon: Users },
  { to: "/profile", label: "Profil", icon: CircleUserRound, group: "Akun" },
];

export default function DashLayout() {
  const { me, loading } = useSession();
  const { t } = useLang();
  const location = useLocation();
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

  return (
    <PublicLayout wide>
      <div className="dash">
        <aside className="side">
          <div className="mechip">
            {avatar ? <img src={avatar} alt="" /> : null}
            <div>
              <p className="nm">{me.user.name || t("pembeli")}</p>
              <p className="em">{emailLine}</p>
            </div>
          </div>
          <nav className="snav">
            {LINKS.map((l) => (
              <span key={l.to} style={{ display: "contents" }}>
                {l.group ? <p className="navgroup">{t(l.group)}</p> : null}
                <NavLink to={l.to} end={l.end} className={({ isActive }) => (isActive ? "on" : "")}>
                  <span className="ic"><l.icon size={16} /></span>
                  {t(l.label)}
                </NavLink>
              </span>
            ))}
          </nav>
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
