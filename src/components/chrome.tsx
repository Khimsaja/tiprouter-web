import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useSession } from "../lib/session";

function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tiprouter-theme", theme); } catch { /* ignore */ }
  }, [theme]);
  return (
    <button className="theme-toggle" aria-label="Ganti tema gelap / terang" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function SiteHeader() {
  const { me } = useSession();
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
          <img src="/logo-icon.png" alt="Logo TipRouter" />
          TipRouter
        </Link>
        <button className="burger" aria-label="Buka menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
        <nav className={"main" + (open ? " open" : "")}>
          <a href="/#model" onClick={anchor("#model")}>Model</a>
          <a href="/#harga" onClick={anchor("#harga")}>Harga</a>
          <NavLink to="/bansos" onClick={() => setOpen(false)}>Bansos</NavLink>
          <a href="/#cara-pakai" onClick={anchor("#cara-pakai")}>Cara Pakai</a>
          <a href="/#faq" onClick={anchor("#faq")}>FAQ</a>
          <NavLink to="/profile" className={akunActive ? "active" : ""} onClick={() => setOpen(false)}>Akun Saya</NavLink>
          <NavLink to="/beli" className="mnav-cta" onClick={() => setOpen(false)}>Beli Sekarang</NavLink>
        </nav>
        {me ? (
          <Link className="btn sm" to="/dashboard">Dashboard</Link>
        ) : (
          <Link className="btn sm" to="/login">Masuk</Link>
        )}
        <Link className="btn primary sm" to="/beli">Beli Sekarang</Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site">
      <div className="foot">
        <span className="foot-brand">
          <img src="/logo-icon.png" alt="Logo TipRouter" />
          <span><strong>TipRouter</strong> — API key AI unlimited dari Indonesia.</span>
        </span>
        <code>https://tiprouter.my.id/v1</code>
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
