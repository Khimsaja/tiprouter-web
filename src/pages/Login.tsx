import { useEffect, useRef, useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Github } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import Turnstile, { type TurnstileHandle } from "../components/Turnstile";
import { api, type Config } from "../lib/api";
import { useSession } from "../lib/session";
import { useLang } from "../lib/i18n";

const KEY_ERR: Record<string, string> = {
  rate_limited: "Kebanyakan percobaan gagal. Tunggu beberapa menit, lalu coba lagi.",
  key_revoked: "Key ini sudah dinonaktifkan. Hubungi admin atau beli key baru di bot.",
  key_expired: "Masa aktif key ini sudah habis. Beli paket baru di halaman Beli ya.",
  lookup_failed: "Server lagi bermasalah. Coba lagi sebentar lagi.",
  turnstile_failed: "Verifikasi anti-bot gagal. Selesaikan verifikasinya, lalu coba lagi.",
};
const KEY_ERR_DEFAULT = "Key-nya nggak dikenali. Pastikan key lengkap dan nggak ada spasi kepotong.";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none" }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 30.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

// Key form styles live in index.css (.keyform/.tgwrap are page-shell classes
// from the vanilla build); keep them local to this page like the source did.
const PAGE_STYLE = `
.keyform{margin-top:18px;border-top:1px solid var(--border);padding-top:16px}
.tgwrap{margin-top:18px;border-top:1px solid var(--border);padding-top:16px;display:flex;justify-content:center;min-height:48px}
.tgwrap:empty{border-top:0;padding-top:0;margin-top:0;min-height:0}
`;

export default function Login() {
  const { me, loading, refresh } = useSession();
  const { t } = useLang();
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<Config | null>(null);
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const tsRef = useRef<TurnstileHandle>(null);
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
      ? t("Login Google/GitHub lagi disiapin. Sementara masuk pakai API key di atas, atau beli dulu lewat bot Telegram.")
      : "";

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await api.apikeyLogin(key, tsToken);
      await refresh();
      navigate("/dashboard");
    } catch (e) {
      const code = (e as { code?: string }).code ?? "";
      setErr(t(KEY_ERR[code] ?? KEY_ERR_DEFAULT));
      tsRef.current?.reset();
      setBusy(false);
    }
  }

  return (
    <PublicLayout>
      <style>{PAGE_STYLE}</style>
      <h1 className="page">
        {t("Masuk ke")} <em>TipRouter.</em>
      </h1>
      <p className="sub">
        {t("Lihat key kamu, sisa masa aktif, dan perpanjang paket. Paling cepat: masuk pakai API key kamu. Bisa juga pakai Google atau GitHub, lalu hubungkan Telegram biar key dari bot langsung ketemu.")}
      </p>
      <div className="card">
        <h2>{t("Pilih cara masuk")}</h2>
        <p>{t("Pakai API key kamu, langsung masuk tanpa daftar apa-apa.")}</p>
        <form className="keyform" style={{ marginTop: 14, paddingTop: 0, borderTop: 0 }} onSubmit={submit}>
          <label htmlFor="apikeyInput">{t("API key kamu")}</label>
          <input
            id="apikeyInput"
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="tip_..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          {cfg?.turnstileSiteKey ? <Turnstile ref={tsRef} siteKey={cfg.turnstileSiteKey} onToken={setTsToken} /> : null}
          <div className="btns">
            <button className="btn primary" type="submit" disabled={busy || (!!cfg?.turnstileSiteKey && !tsToken)}>
              {busy ? t("Dicek...") : t("Masuk dengan API key")}
            </button>
          </div>
          <p className={"err" + (err ? " show" : "")}>{err}</p>
        </form>
        <div className="keyform">
          <label>{t("Atau masuk dengan akun")}</label>
          <div className="btns" style={{ marginTop: 0 }}>
            {cfg && !cfg.google ? (
              <a className="btn" aria-disabled="true" style={{ opacity: 0.45 }}>
                <GoogleIcon />
                {t("Masuk dengan Google")}
              </a>
            ) : (
              <a className="btn" href="/auth/google/start">
                <GoogleIcon />
                {t("Masuk dengan Google")}
              </a>
            )}
            {cfg && !cfg.github ? (
              <a className="btn" aria-disabled="true" style={{ opacity: 0.45 }}>
                <Github size={17} />
                {t("Masuk dengan GitHub")}
              </a>
            ) : (
              <a className="btn" href="/auth/github/start">
                <Github size={17} />
                {t("Masuk dengan GitHub")}
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
