import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { SessionProvider } from "./lib/session";
import { LangProvider, applyTitle, useLang } from "./lib/i18n";
import { PublicLayout } from "./components/chrome";
import DashLayout from "./components/DashLayout";
import Landing from "./pages/Landing";
import Bansos from "./pages/Bansos";
import Spinwheel from "./pages/Spinwheel";
import Login from "./pages/Login";
import Beli from "./pages/Beli";
import Dashboard from "./pages/Dashboard";
import Keys from "./pages/Keys";
import Usage from "./pages/Usage";
import Models from "./pages/Models";
import Panduan from "./pages/Panduan";
import Profile from "./pages/Profile";
import Syarat from "./pages/Syarat";
import ProxyPage from "./pages/Proxy";
import Referral from "./pages/Referral";
import Notifikasi from "./pages/Notifikasi";
import Statistik from "./pages/Statistik";
import Playground from "./pages/Playground";
import "./index.css";

function NotFound() {
  const { t } = useLang();
  return (
    <PublicLayout>
      <h1 className="page">{t("Halaman nggak ketemu.")}</h1>
      <p className="sub">
        {t("Alamat ini nggak ada di TipRouter. Balik ke")}{" "}
        <a href="/" style={{ textDecoration: "underline" }}>
          {t("beranda")}
        </a>{" "}
        {t("aja.")}
      </p>
    </PublicLayout>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/bansos", element: <Bansos /> },
  { path: "/spinwheel", element: <Spinwheel /> },
  { path: "/login", element: <Login /> },
  { path: "/beli", element: <Beli /> },
  { path: "/syarat", element: <Syarat /> },
  { path: "/proxy", element: <ProxyPage /> },
  { path: "/statistik", element: <Statistik /> },
  { path: "/playground", element: <Playground /> },
  { path: "/akun", element: <Navigate to="/profile" replace /> },
  {
    element: <DashLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/keys", element: <Keys /> },
      { path: "/dashboard/usage", element: <Usage /> },
      { path: "/dashboard/models", element: <Models /> },
      { path: "/dashboard/playground", element: <Playground embedded /> },
      { path: "/dashboard/panduan", element: <Panduan /> },
      { path: "/gacha", element: <Navigate to="/bansos" replace /> },
      { path: "/profile", element: <Profile /> },
      { path: "/referral", element: <Referral /> },
      { path: "/notifikasi", element: <Notifikasi /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

applyTitle(window.location.pathname);
router.subscribe((state) => applyTitle(state.location.pathname));

// Capture referral code from ?ref= into a 30-day cookie + localStorage.
// The auth backend reads the cookie at signup (Google/GitHub/Telegram OAuth).
try {
  const m = new URLSearchParams(window.location.search).get("ref");
  if (m && /^[A-Za-z0-9]{4,16}$/.test(m)) {
    const v = m.toUpperCase();
    document.cookie = "tr_ref=" + v + "; max-age=" + 30 * 24 * 3600 + "; path=/; SameSite=Lax";
    localStorage.setItem("tr_ref", v);
  }
} catch { /* ignore */ }

createRoot(document.getElementById("root")!).render(
  <LangProvider>
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>
  </LangProvider>,
);
