import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Send } from "lucide-react";
import { useSession } from "../lib/session";
import { LanguageToggle, useLang } from "../lib/i18n";
import NotifBell from "./NotifBell";

function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tiprouter-theme", theme); } catch { /* ignore */ }
  }, [theme]);
  return (
    <button className="theme-toggle" aria-label={t("Ganti tema gelap / terang")} onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function SiteHeader() {
  const { me } = useSession();
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const akunActive = ["/dashboard", "/profile", "/gacha"].some((p) => location.pathname.startsWith(p));

  const anchor = (hash: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    if (location.pathname !== "/") navigate("/" + hash);
    else document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="site">
      <div className="nav">
        <Link className="brand" to="/">
          <img src="/logo-icon.png" alt={t("Logo TipRouter")} />
          <span className="brand-txt">TipRouter</span>
        </Link>
        <button className="burger" aria-label={t("Buka menu")} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <nav className={"main" + (open ? " open" : "")}>
          <a href="/#model" onClick={anchor("#model")}>{t("Model")}</a>
          <a href="/#pricing" onClick={anchor("#pricing")}>{t("Harga")}</a>
          <NavLink to="/gacha" onClick={() => setOpen(false)}>Bansos</NavLink>
          <NavLink to="/proxy" onClick={() => setOpen(false)}>{t("Proxy Gratis")}</NavLink>
          <NavLink to="/status" onClick={() => setOpen(false)}>{t("Status")}</NavLink>
          <a href="/#faq" onClick={anchor("#faq")}>FAQ</a>
          <NavLink to="/profile" className={akunActive ? "active" : ""} onClick={() => setOpen(false)}>{t("Akun Saya")}</NavLink>
          <NavLink to="/buy" className="mnav-cta" onClick={() => setOpen(false)}>{t("Beli Sekarang")}</NavLink>
          <div className="mnav-lang">
            <span>{t("Bahasa")}</span>
            <LanguageToggle />
          </div>
        </nav>
        {me ? (
          <Link className="btn sm" to="/dashboard">Dashboard</Link>
        ) : (
          <Link className="btn sm" to="/login">{t("Masuk")}</Link>
        )}
        <Link className="btn primary sm" to="/buy">{t("Beli Sekarang")}</Link>
        <LanguageToggle />
        <ThemeToggle />
        {me && <NotifBell />}
      </div>
    </header>
  );
}

export function SiteFooter() {
  const { t } = useLang();
  return (
    <footer className="site">
      <div className="foot">
        <span className="foot-brand">
          <img src="/logo-icon.png" alt={t("Logo TipRouter")} />
          <span><strong>TipRouter</strong> — {t("API key AI unlimited dari Indonesia.")}</span>
        </span>
        <code>https://tiprouter.my.id/v1</code>
        <Link to="/terms" style={{ textDecoration: "underline" }}>
          {t("Syarat & Ketentuan")}
        </Link>
        <Link to="/status" style={{ textDecoration: "underline" }}>
          {t("Status")}
        </Link>
        <a
          href="https://t.me/hermestele"
          target="_blank"
          rel="noopener"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "underline" }}
        >
          <Send size={13} />
          {t("Hubungi Admin")}
        </a>
        <span className="right">© 2026 TipRouter</span>
      </div>
    </footer>
  );
}

export function PublicLayout({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <>
      <SiteHeader />
      <div className={"wrap" + (wide ? " wide" : "")}>{children}</div>
      <SiteFooter />
    </>
  );
}
