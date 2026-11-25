import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useLang } from "../lib/i18n";

/**
 * Theme switch as a segmented control (Sun | Moon), mirroring .lang-toggle:
 * one pill, two halves, active half filled. Persists to localStorage
 * "tiprouter-theme" and mirrors to <html data-theme>.
 */
export function ThemeToggle() {
  const { t } = useLang();
  const [theme, setTheme] = useState(() => document.documentElement.getAttribute("data-theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tiprouter-theme", theme); } catch { /* ignore */ }
  }, [theme]);
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
