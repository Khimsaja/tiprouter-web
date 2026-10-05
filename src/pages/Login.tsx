import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PublicLayout } from "../components/chrome";
import { api, type Config } from "../lib/api";
import { useSession } from "../lib/session";

const KEY_ERR: Record<string, string> = {
  rate_limited: "Kebanyakan percobaan gagal. Tunggu beberapa menit, lalu coba lagi.",
  key_revoked: "Key ini sudah dinonaktifkan. Hubungi admin atau beli key baru di bot.",
  key_expired: "Masa aktif key ini sudah habis. Beli paket baru di halaman Beli ya.",
  lookup_failed: "Server lagi bermasalah. Coba lagi sebentar lagi.",
};
const KEY_ERR_DEFAULT = "Key-nya nggak dikenali. Pastikan key lengkap dan nggak ada spasi kepotong.";

// Key form styles live in index.css (.keyform/.tgwrap are page-shell classes
// from the vanilla build); keep them local to this page like the source did.
const PAGE_STYLE = `
.keyform{margin-top:18px;border-top:1px solid var(--border);padding-top:16px}
.tgwrap{margin-top:18px;border-top:1px solid var(--border);padding-top:16px;display:flex;justify-content:center;min-height:48px}
.tgwrap:empty{border-top:0;padding-top:0;margin-top:0;min-height:0}
`;

export default function Login() {
  const { me, loading, refresh } = useSession();
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<Config | null>(null);
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const tgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  // Telegram login widget: inject only once the config names a bot (1:1 with source).
  useEffect(() => {
    if (!cfg?.telegramBot || !tgRef.current || tgRef.current.childNodes.length) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", cfg.telegramBot);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "999");
    s.setAttribute("data-auth-url", "/auth/telegram/connect");
    s.setAttribute("data-request-access", "write");
    tgRef.current.appendChild(s);
  }, [cfg]);

  if (loading) return null;
  if (me) return <Navigate to="/dashboard" replace />;

  const providerNote =
    cfg && !cfg.google && !cfg.github && !cfg.telegramBot
      ? "Login Google/GitHub lagi disiapin. Sementara masuk pakai API key di atas, atau beli dulu lewat bot Telegram."
      : "";

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.apikeyLogin(key);
      await refresh();
      navigate("/dashboard");
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      setErr(KEY_ERR[code] ?? KEY_ERR_DEFAULT);
      setBusy(false);
    }
  }

  return (
    <PublicLayout>
      <style>{PAGE_STYLE}</style>
      <h1 className="page">
        Masuk ke <em>TipRouter.</em>
      </h1>
      <p className="sub">
        Lihat key kamu, sisa masa aktif, dan perpanjang paket. Paling cepat: masuk pakai API key kamu.
        Bisa juga pakai Google atau GitHub, lalu hubungkan Telegram biar key dari bot langsung ketemu.
      </p>
      <div className="card">
        <h2>Pilih cara masuk</h2>
        <p>Pakai API key kamu, langsung masuk tanpa daftar apa-apa.</p>
        <form className="keyform" style={{ marginTop: 14, paddingTop: 0, borderTop: 0 }} onSubmit={submit}>
          <label htmlFor="apikeyInput">API key kamu</label>
          <input
            id="apikeyInput"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="tip_..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <div className="btns">
            <button className="btn primary" type="submit" disabled={busy}>
              {busy ? "Dicek..." : "Masuk dengan API key"}
            </button>
          </div>
          <p className={"err" + (err ? " show" : "")}>{err}</p>
        </form>
        <div className="keyform">
          <label>Atau masuk dengan akun</label>
          <div className="btns" style={{ marginTop: 0 }}>
            {cfg && !cfg.google ? (
              <a className="btn" aria-disabled="true" style={{ opacity: 0.45 }}>
                Masuk dengan Google
              </a>
            ) : (
              <a className="btn" href="/auth/google/start">
                Masuk dengan Google
              </a>
            )}
            {cfg && !cfg.github ? (
              <a className="btn" aria-disabled="true" style={{ opacity: 0.45 }}>
                Masuk dengan GitHub
              </a>
            ) : (
              <a className="btn" href="/auth/github/start">
                Masuk dengan GitHub
              </a>
            )}
          </div>
        </div>
        <div className="tgwrap" ref={tgRef} />
        <p className="muted" style={{ marginTop: 14 }}>
          {providerNote}
        </p>
      </div>
    </PublicLayout>
  );
}
