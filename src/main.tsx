import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { SessionProvider } from "./lib/session";
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
import "./index.css";

function NotFound() {
  return (
    <PublicLayout>
      <h1 className="page">Halaman nggak ketemu.</h1>
      <p className="sub">Alamat ini nggak ada di TipRouter. Balik ke <a href="/" style={{ textDecoration: "underline" }}>beranda</a> aja.</p>
    </PublicLayout>
  );
}

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/bansos", element: <Bansos /> },
  { path: "/spinwheel", element: <Spinwheel /> },
  { path: "/login", element: <Login /> },
  { path: "/beli", element: <Beli /> },
  { path: "/akun", element: <Navigate to="/profile" replace /> },
  {
    element: <DashLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/dashboard/keys", element: <Keys /> },
      { path: "/dashboard/usage", element: <Usage /> },
      { path: "/dashboard/models", element: <Models /> },
      { path: "/dashboard/panduan", element: <Panduan /> },
      { path: "/gacha", element: <Navigate to="/bansos" replace /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

const TITLES: Record<string, { t: string; d?: string }> = {
  "/": { t: "TipRouter — API Key AI Unlimited" },
  "/bansos": { t: "Gacha Bansos — TipRouter", d: "Gacha Bansos TipRouter: satu putaran gratis per akun, dapet API key pribadi 1–24 jam. Login dan putar." },
  "/spinwheel": { t: "Spin Wheel Angka Acak — TipRouter", d: "Putar roda dan dapatkan angka acak dari rentang pilihanmu, 1 sampai 10.000. Buat undian, giveaway, atau milih nomor." },
  "/login": { t: "Masuk — TipRouter" },
  "/beli": { t: "Beli API Key AI — TipRouter", d: "Beli API key AI unlimited: pilih paket, bayar QRIS, key langsung keluar. Trial mulai Rp3.000." },
  "/dashboard": { t: "Dashboard — TipRouter" },
  "/dashboard/keys": { t: "API Keys — TipRouter" },
  "/dashboard/usage": { t: "Usage — TipRouter" },
  "/dashboard/models": { t: "Model — TipRouter" },
  "/dashboard/panduan": { t: "Panduan — TipRouter" },
  "/profile": { t: "Profil — TipRouter" },
};

function applyTitle(pathname: string) {
  const hit = TITLES[pathname];
  document.title = hit?.t ?? "TipRouter — API Key AI Unlimited";
  if (hit?.d) {
    document.querySelector('meta[name="description"]')?.setAttribute("content", hit.d);
  }
}
applyTitle(window.location.pathname);
router.subscribe((state) => applyTitle(state.location.pathname));

createRoot(document.getElementById("root")!).render(
  <SessionProvider>
    <RouterProvider router={router} />
  </SessionProvider>,
);
