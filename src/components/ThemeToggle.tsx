import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "../lib/i18n";

const LS_KEY = "tiprouter-theme";

type Theme = "light" | "dark";

/**
 * Theme switch as a segmented control (Sun | Moon), mirroring .lang-toggle:
 * one pill, two halves, active half filled. Persists to localStorage
 * "tiprouter-theme" and mirrors to <html data-theme>.
 *
 * localStorage alone proved unreliable: in some browsers/profiles the write
 * silently fails (or storage is cleared), so the toggle looked dark until
 * the next reload and then reset to light. So the choice is ALSO written
 * to a 1-year cookie of the same name, and the choice is read back from
 * localStorage first, cookie second. The inline script in index.html
 * applies the same fallback before first paint, so there is no flash.
 */
function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === "light" || v === "dark") return v;
  } catch { /* storage unavailable */ }
  try {
    const m = document.cookie.match(/(?:^|; )tiprouter-theme=(light|dark)(?:;|$)/);
    if (m) return m[1] as Theme;
  } catch { /* ignore */ }
  return null;
}

function persistTheme(theme: Theme) {
  try { localStorage.setItem(LS_KEY, theme); } catch { /* storage unavailable */ }
  try {
    document.cookie = `${LS_KEY}=${theme}; max-age=31536000; path=/; SameSite=Lax`;
  } catch { /* ignore */ }
}

export function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState<Theme>(
    () => readStoredTheme() ?? (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"),
  );
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    persistTheme(theme);
  }, [theme]);
  // Keep every toggle instance in sync when another tab changes the theme.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LS_KEY && (e.newValue === "light" || e.newValue === "dark")) setTheme(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <div className="theme-toggle" role="group" aria-label={t("Ganti tema gelap / terang")}>
      <button
        type="button"
        className={theme === "light" ? "on" : ""}
        onClick={() => setTheme("light")}
        aria-pressed={theme === "light"}
        aria-label={t("Mode terang")}
      >
        <Sun size={15} />
      </button>
      <button
        type="button"
        className={theme === "dark" ? "on" : ""}
        onClick={() => setTheme("dark")}
        aria-pressed={theme === "dark"}
        aria-label={t("Mode gelap")}
      >
        <Moon size={15} />
      </button>
    </div>
  );
}
