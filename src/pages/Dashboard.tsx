import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity, Check, Copy, Eye, EyeOff, Gauge, Globe, KeyRound, Zap } from "lucide-react";
import { PageHead } from "../components/DashLayout";
import { api, daysLeft, fmtDate, fmtNum, type KeyItem } from "../lib/api";
import { tr, useLang } from "../lib/i18n";

const BASE_URL = "https://tiprouter.my.id/v1";

const DASH_STYLE = `
.dash-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:20px}
.dash-row3{display:grid;grid-template-columns:minmax(0,65%) minmax(0,35%);gap:12px;margin-top:12px}
.dash-row3 .card{margin-top:0}
.dash-kpi{display:flex;flex-direction:column;gap:2px}
.dash-kpi .kpi-ico{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;box-shadow:0 4px 12px rgba(14,165,233,.35);margin-bottom:8px}
.dash-kpi .val.mono{font-family:var(--font-mono);font-size:22px}
.dash-cc{border-radius:16px;padding:22px;margin-top:16px}
.dash-cc h2{font-size:16px;font-weight:700;letter-spacing:-.01em;margin-bottom:4px}
.copyrow{display:flex;gap:10px;align-items:stretch;margin-top:12px}
.copyrow .url{flex:1;min-width:0;font-family:var(--font-mono);font-size:13px;padding:10px 12px;border-radius:10px;background:rgba(15,23,42,.9);border:1px solid rgba(100,116,139,.45);color:#f1f5f9;display:flex;align-items:center;overflow-x:auto;white-space:nowrap}
.copyrow .url.light{background:rgba(255,255,255,.7);border:1px solid var(--border-soft);color:var(--txt)}
.copyrow .btn{width:auto}
.cfg-pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.cfg-pills .btn.sm.on{border-color:rgba(16,185,129,.5);color:var(--green)}
.dash-sec{font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);margin:18px 0 4px}
.health-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid var(--border-soft)}
.health-row:last-child{border-bottom:0}
.health-row .mid{font-family:var(--font-mono);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width: 900px){.dash-grid3{grid-template-columns:repeat(2,minmax(0,1fr))}.dash-row3{grid-template-columns:1fr}}
@media (max-width: 640px){.dash-grid3{grid-template-columns:1fr}}
`;

type KeysData = { keys: KeyItem[]; reason?: string };

function useKeys(): KeysData | null {
  const [data, setData] = useState<KeysData | null>(null);
  useEffect(() => {
    let alive = true;
    api
      .keys()
      .then((d) => {
        if (alive) setData({ keys: d.keys || [], reason: d.reason });
      })
      .catch(() => {
        if (alive) setData({ keys: [], reason: "http_error" });
      });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

function StatusChip({ status }: { status: KeyItem["status"] }) {
  const { t } = useLang();
  if (status === "active") return <span className="chip ok">{t("Aktif")}</span>;
  if (status === "expired") return <span className="chip warn">{t("Habis")}</span>;
  return <span className="chip warn">{t("Nonaktif")}</span>;
}

function expiryText(k: KeyItem) {
  const left = daysLeft(k.expiresAt);
  if (!k.expiresAt) return tr("Tanpa masa habis");
  if (left === 0) return tr("Habis sejak {date}", { date: fmtDate(k.expiresAt) });
  if (left === 1) return tr("Sampai {date} (1 hari lagi)", { date: fmtDate(k.expiresAt) });
  return tr("Sampai {date} ({days} hari lagi)", { date: fmtDate(k.expiresAt), days: left ?? 0 });
}

function pctLeft(k: KeyItem) {
  if (!k.expiresAt || !k.createdAt) return null;
  const total = Date.parse(k.expiresAt) - Date.parse(k.createdAt);
  const leftMs = Date.parse(k.expiresAt) - Date.now();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((leftMs / total) * 100)));
}

function pickPrimaryKey(keys: KeyItem[]) {
  for (const k of keys) if (k.status === "active") return k;
  return keys[0] || null;
}

function ReasonMsg({ reason }: { reason?: string }) {
  const { t } = useLang();
  if (reason === "telegram_not_connected")
    return (
      <p>
        {t("Belum ada key yang ketemu buat akun ini.")}{" "}
        <Link to="/buy">{t("Beli API key")}</Link>{" "}
        {t("lewat web langsung keluar, atau hubungkan Telegram di menu Profil kalau key kamu dari bot.")}
      </p>
    );
  return <p>{t("Data key belum bisa diambil sekarang. Coba muat ulang halamannya sebentar lagi.")}</p>;
}

/** Lightweight inline SVG area chart of tokens per key (existing data only). */
function TokensChart({ keys }: { keys: KeyItem[] }) {
  const { t } = useLang();
  const vals = keys.map((k) => Number(k.tokensConsumed) || 0);
  const max = Math.max(...vals, 1);
  const w = 560;
  const h = 170;
  const pad = 8;
  // Wider inset for the plotted points (labels are centered on them, up to
  // 10 chars wide) so first/last x labels never clip at the SVG edges.
  const padX = 34;
  if (keys.length === 0) return null;
  if (keys.length === 1) {
    const bh = Math.max(8, ((vals[0] / max) * (h - 40)) | 0);
    return (
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={t("Token per key")}>
        <defs>
          <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad} x2={w - pad} y1={h * f} y2={h * f} stroke="rgba(100,116,139,.18)" strokeWidth="1" />
        ))}
        <rect x={w / 2 - 34} y={h - 24 - bh} width="68" height={bh} rx="8" fill="url(#dashArea)" stroke="#0EA5E9" strokeWidth="1.5" />
        <text x={w / 2} y={h - 8} textAnchor="middle" fontSize="11" fill="var(--faint)" fontFamily="var(--font-mono)">
          {keys[0].label}
        </text>
      </svg>
    );
  }
  const pts = vals.map((v, i) => {
    const x = padX + (i / (vals.length - 1)) * (w - padX * 2);
    const y = h - 24 - (v / max) * (h - 48);
    return { x, y };
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${h - 24} L${pts[0].x.toFixed(1)},${h - 24} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={t("Token per key")}>
      <defs>
        <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad} x2={w - pad} y1={h * f} y2={h * f} stroke="rgba(100,116,139,.18)" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#dashArea)" />
      <path d={line} fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#fff" stroke="#0EA5E9" strokeWidth="2" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={h - 8} textAnchor="middle" fontSize="10" fill="var(--faint)" fontFamily="var(--font-mono)">
          {(keys[i].label || "").slice(0, 10)}
        </text>
      ))}
    </svg>
  );
}

/**
 * Control center: base URL + masked primary key (same api.keySecret fetch
 * pattern as Keys.tsx KeySecretRow) + 1-click OpenAI-compatible config
 * exports. No regenerate endpoint exists in the API, so no such button.
 */
function KeyControl({ primary }: { primary: KeyItem }) {
  const { t } = useLang();
  const [secret, setSecret] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const masked = (primary.prefix ?? "tip_") + "…" + (primary.hint ?? "") + "••••••••";
  const model = primary.models?.[0] ?? "deepseek-v4.1-flash";

  async function ensureSecret(): Promise<string | null> {
    if (secret) return secret;
    setBusy(true);
    try {
      const d = await api.keySecret(primary.id);
      setSecret(d.secret);
      return d.secret;
    } catch {
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function copyText(text: string, which: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied((c) => (c === which ? null : c)), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  async function toggle() {
    if (shown) {
      setShown(false);
      return;
    }
    const s = await ensureSecret();
    if (s) setShown(true);
  }

  function snippet(app: "cline" | "librechat" | "sillytavern", key: string) {
    if (app === "cline") {
      return JSON.stringify(
        { apiProvider: "openai-compatible", openAiBaseUrl: BASE_URL, openAiApiKey: key, openAiModelId: model },
        null,
        2
      );
    }
    if (app === "librechat") {
      return (
        `endpoints:\n  custom:\n    - name: "TipRouter"\n      apiKey: "${key}"\n      baseURL: "${BASE_URL}"\n      models:\n        default: ["${model}"]\n        fetch: false`
      );
    }
    return JSON.stringify({ api_url: BASE_URL, api_key: key, model }, null, 2);
  }

  async function copyConfig(app: "cline" | "librechat" | "sillytavern") {
    const s = await ensureSecret();
    if (!s) return;
    await copyText(snippet(app, s), app);
  }

  return (
    <div className="glass-t3 dash-cc">
      <h2>{t("Control center")}</h2>
      <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Sambungkan aplikasi kamu ke TipRouter dalam satu klik.")}</p>
      <p className="dash-sec">{t("Base URL")}</p>
      <div className="copyrow">
        <div className="url">{BASE_URL}</div>
        <button className="btn sm" type="button" onClick={() => void copyText(BASE_URL, "base")}>
          {copied === "base" ? <Check size={14} /> : <Copy size={14} />} {copied === "base" ? t("Tersalin") : t("Salin")}
        </button>
      </div>
      <p className="dash-sec">API Key</p>
      <div className="copyrow">
        <div className="url" style={{ fontFamily: "var(--font-mono)" }}>
          {shown && secret ? secret : masked}
        </div>
        <button className="iconbtn" type="button" onClick={() => void toggle()} disabled={busy} aria-label={shown ? t("Sembunyikan key") : t("Lihat key")} title={shown ? t("Sembunyikan") : t("Lihat key")} style={{ width: 38, height: 38, alignSelf: "center" }}>
          {shown ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button className="btn sm" type="button" onClick={async () => { const s = await ensureSecret(); if (s) await copyText(s, "key"); }} disabled={busy}>
          {copied === "key" ? <Check size={14} /> : <Copy size={14} />} {copied === "key" ? t("Tersalin") : t("Salin")}
        </button>
      </div>
      <p className="dash-sec">{t("Salin konfigurasi")}</p>
      <div className="cfg-pills">
        <button className={"btn sm" + (copied === "cline" ? " on" : "")} type="button" disabled={!secret || busy} onClick={() => void copyConfig("cline")}>
          Cline / Roo Code {copied === "cline" ? "· " + t("Tersalin") : ""}
        </button>
        <button className={"btn sm" + (copied === "librechat" ? " on" : "")} type="button" disabled={!secret || busy} onClick={() => void copyConfig("librechat")}>
          LibreChat {copied === "librechat" ? "· " + t("Tersalin") : ""}
        </button>
        <button className={"btn sm" + (copied === "sillytavern" ? " on" : "")} type="button" disabled={!secret || busy} onClick={() => void copyConfig("sillytavern")}>
          SillyTavern {copied === "sillytavern" ? "· " + t("Tersalin") : ""}
        </button>
      </div>
      {!secret ? <p style={{ color: "var(--faint)", fontSize: 12.5, marginTop: 8 }}>{t("Tampilkan key dulu untuk menyalin konfigurasi.")}</p> : null}
    </div>
  );
}

export default function Dashboard() {
  const { t } = useLang();
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];
  const primary = data && !reason ? pickPrimaryKey(keys) : null;
  const left = primary?.expiresAt ? (daysLeft(primary.expiresAt) ?? 0) : null;
  const pct = primary ? pctLeft(primary) : null;

  let statStatus = "-";
  let statStatusSub = "";
  let statDays = "-";
  let statDaysSub = "";
  let statTokens = "-";
  let progText = t("Mengambil data key.");
  let progWidth = 0;
  let summary: ReactNode = <p>{t("Mengambil data key.")}</p>;

  if (data && reason) {
    statStatus = reason === "telegram_not_connected" ? t("Belum terhubung") : "-";
    progText = t("Belum ada key yang kebaca buat akun ini. Beli API key lewat web, atau hubungkan Telegram kalau key kamu dari bot.");
    summary = <ReasonMsg reason={reason} />;
  } else if (data && !primary) {
    statStatus = t("Belum ada key");
    progText = t("Belum ada key, jadi belum ada masa aktif yang jalan.");
    summary = <p>{t("Belum ada key yang ketemu buat akun ini.")}</p>;
  } else if (primary) {
    statStatus = primary.status === "active" ? t("Aktif") : primary.status === "expired" ? t("Habis") : t("Nonaktif");
    statStatusSub = primary.label || "";
    statDays = primary.expiresAt ? (left === 0 ? t("Habis") : left === 1 ? t("1 hari") : t("{days} hari", { days: left ?? 0 })) : "∞";
    statDaysSub = primary.expiresAt ? t("sampai {date}", { date: fmtDate(primary.expiresAt) }) : t("tanpa masa habis");
    statTokens = fmtNum(primary.tokensConsumed);
    progText = primary.expiresAt
      ? left === 0
        ? t("Masa aktif key ini udah habis sejak {date}. Perpanjang biar bisa dipakai lagi.", { date: fmtDate(primary.expiresAt) })
        : left === 1
          ? t("Berlaku sampai {date} — sisa 1 hari.", { date: fmtDate(primary.expiresAt) })
          : t("Berlaku sampai {date} — sisa {days} hari.", { date: fmtDate(primary.expiresAt), days: left ?? 0 })
      : t("Key ini nggak punya masa habis. Santai, nggak perlu mikirin perpanjangan.");
    progWidth = pct === null ? 100 : pct;
    summary = keys.map((k) => (
      <div className="row" key={k.id}>
        <div>
          <p className="who">{k.label}</p>
          <p className="meta">
            {expiryText(k)} · {k.modelCount === 1 ? t("1 model") : t("{n} model", { n: k.modelCount || 0 })} · {k.tokensConsumed === 1 ? t("1 token") : t("{n} token", { n: fmtNum(k.tokensConsumed) })}
          </p>
        </div>
        <div className="right">
          <StatusChip status={k.status} />
        </div>
      </div>
    ));
  }

  const rpm = primary?.requestsPerMinute ?? 150;
  const healthModels = primary?.models?.slice(0, 8) ?? [];

  return (
    <>
      <style>{DASH_STYLE}</style>
      <PageHead title="Dashboard" sub={t("Ringkasan key dan masa aktif kamu.")} />
      {/* Row 1 — KPI glass cards */}
      <div className="dash-grid3">
        <div className="stat dash-kpi">
          <span className="kpi-ico"><Zap size={17} /></span>
          <p className="lab">{t("Paket aktif")}</p>
          <p className="val">{statStatusSub || statStatus}</p>
          <p className="sub2">
            {statStatus} · {statDays} {statDaysSub}
          </p>
          <div className="bar">
            <i style={{ width: progWidth + "%" }} />
          </div>
          <p className="sub2" style={{ marginTop: 6 }}>{progText}</p>
          <div className="btns" style={{ marginTop: 10 }}>
            <Link className="btn primary sm" to="/buy">
              {primary ? t("Perpanjang Paket") : t("Beli API key")}
            </Link>
          </div>
        </div>
        <div className="stat dash-kpi">
          <span className="kpi-ico"><Gauge size={17} /></span>
          <p className="lab">{t("Limit rate")}</p>
          <p className="val mono">{rpm} RPM</p>
          <p className="sub2">
            <span className="badge-ok"><span className="pulse-dot" />{statStatus}</span>
          </p>
          <p className="sub2" style={{ marginTop: 6 }}>{t("Limit per key (fair use).")}</p>
        </div>
        <div className="stat dash-kpi">
          <span className="kpi-ico"><Activity size={17} /></span>
          <p className="lab">{t("Token terpakai")}</p>
          <p className="val mono">{statTokens}</p>
          <p className="sub2">{t("semua waktu")}</p>
          <p className="sub2" style={{ marginTop: 6 }}>{(primary?.modelCount || 0) === 1 ? t("1 model") : t("{n} model", { n: primary?.modelCount || 0 })} {t("siap dipanggil")}</p>
        </div>
      </div>
      {/* Row 2 — control center */}
      {primary ? <KeyControl primary={primary} /> : null}
      {/* Row 3 — usage chart + model health */}
      <div className="dash-row3">
        <div className="card">
          <h2><Globe size={16} style={{ verticalAlign: "-3px", marginRight: 8 }} />{t("Token per key")}</h2>
          <p>{t("Pemakaian token dari semua key kamu (semua waktu).")}</p>
          {keys.length > 0 ? <TokensChart keys={keys} /> : <p style={{ marginTop: 12 }}>{t("Belum ada key yang ketemu buat akun ini.")}</p>}
        </div>
        <div className="card">
          <h2><KeyRound size={16} style={{ verticalAlign: "-3px", marginRight: 8 }} />{t("Model online")}</h2>
          <p>{t("Model yang bisa kamu panggil pakai key kamu.")}</p>
          {healthModels.length > 0 ? (
            <div style={{ marginTop: 6 }}>
              {healthModels.map((m) => (
                <div className="health-row" key={m}>
                  <span className="mid">{m}</span>
                  <span className="badge-ok"><span className="pulse-dot" />{t("Online")}</span>
                </div>
              ))}
            </div>
          ) : primary?.modelAccessMode && primary.modelAccessMode !== "whitelist" ? (
            <p style={{ marginTop: 12 }}>{t("Key kamu bisa manggil semua model yang tersedia di TipRouter.")}</p>
          ) : (
            <p style={{ marginTop: 12 }}>{t("Daftar model buat key ini belum kebaca. Coba muat ulang halamannya.")}</p>
          )}
        </div>
      </div>
      <div className="card">
        <h2>{t("Key kamu")}</h2>
        <div>{summary}</div>
      </div>
    </>
  );
}
