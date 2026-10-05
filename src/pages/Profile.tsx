import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, type Config } from "../lib/api";
import { useSession } from "../lib/session";

const PAGE_STYLE = `
.tgwrap{margin-top:14px;min-height:44px}
.tgwrap:empty{margin-top:0;min-height:0}
`;

const METHOD_NAMES: Record<string, string> = { google: "Google", github: "GitHub", apikey: "API key", telegram: "Telegram" };
const PROVIDER_NAMES: Record<string, string> = { google: "Google", github: "GitHub", apikey: "API key" };

export default function Profile() {
  const { me, logout } = useSession();
  const navigate = useNavigate();
  const [cfg, setCfg] = useState<Config | null>(null);
  const tgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  const showWidget = !!me && !me.telegram && !!cfg?.telegramBot;

  // Telegram connect widget: inject only when a bot is configured and the
  // account is not connected yet (1:1 with source renderTelegram).
  useEffect(() => {
    if (!showWidget || !cfg?.telegramBot || !tgRef.current || tgRef.current.childNodes.length) return;
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.setAttribute("data-telegram-login", cfg.telegramBot);
    s.setAttribute("data-size", "large");
    s.setAttribute("data-radius", "999");
    s.setAttribute("data-auth-url", "/auth/telegram/connect");
    s.setAttribute("data-request-access", "write");
    tgRef.current.appendChild(s);
  }, [showWidget, cfg]);

  if (!me) return null;

  const method = me.providers.map((p) => METHOD_NAMES[p] || p).join(", ") || "-";

  const tgMeta = me.telegram
    ? "Terhubung sebagai @" + (me.telegram.username || me.telegram.firstName || me.telegram.id)
    : cfg?.telegramBot
      ? "Klik tombol Telegram di bawah, key dari bot langsung ketemu."
      : "Koneksi Telegram belum tersedia.";

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <PageHead title="Profil" sub="Info akun dan koneksi login kamu." />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>Profil kamu</h2>
        <div className="kv">
          <span className="k">Nama</span>
          <span className="v">{me.user.name || "-"}</span>
        </div>
        <div className="kv">
          <span className="k">Email</span>
          <span className="v">{me.user.email || "-"}</span>
        </div>
        <div className="kv">
          <span className="k">Masuk pakai</span>
          <span className="v">{method}</span>
        </div>
      </div>
      <div className="card">
        <h2>Koneksi akun</h2>
        <div>
          {cfg
            ? (["google", "github", "apikey"] as const).map((p) => {
                const connected = me.providers.includes(p);
                const action = connected ? (
                  <span className="chip ok">Terhubung</span>
                ) : p === "apikey" ? (
                  <span className="chip">dari bot</span>
                ) : cfg[p] ? (
                  <a className="btn" style={{ padding: "9px 16px" }} href={"/auth/" + p + "/start"}>
                    Hubungkan
                  </a>
                ) : (
                  <span className="chip warn">Belum tersedia</span>
                );
                return (
                  <div className="row" key={p}>
                    <div>
                      <p className="who">{PROVIDER_NAMES[p]}</p>
                      <p className="meta">{connected ? "Udah nyambung ke akun ini." : "Belum terhubung."}</p>
                    </div>
                    <div className="right">{action}</div>
                  </div>
                );
              })
            : null}
        </div>
        <div className="row">
          <div>
            <p className="who">Telegram</p>
            <p className="meta">{tgMeta}</p>
          </div>
          <div className="right">
            {me.telegram ? (
              <span className="chip ok">Terhubung</span>
            ) : cfg && !cfg.telegramBot ? (
              <span className="chip warn">Belum tersedia</span>
            ) : null}
          </div>
        </div>
        <div className="tgwrap" ref={tgRef}>
          {me.telegram ? (
            <form method="post" action="/auth/telegram/disconnect">
              <button className="btn" type="submit">
                Putuskan Telegram
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <div className="card">
        <h2>Sesi</h2>
        <p>Kamu lagi login di perangkat ini. Klik Keluar kalau udah selesai, apalagi di perangkat punya orang lain.</p>
        <div className="btns">
          <button
            className="btn logoutBtn"
            type="button"
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
          >
            Keluar dari akun
          </button>
        </div>
      </div>
    </>
  );
}
