import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download, FileJson, FileSpreadsheet, Image as ImageIcon } from "lucide-react";
import { drawUsageCard, computeCandles } from "../lib/usageImage";
import { PageHead } from "../components/DashLayout";
import { api, fmtNum, type KeyItem } from "../lib/api";
import { useLang } from "../lib/i18n";

type KeysData = { keys: KeyItem[]; reason?: string };
type ExportRow = {
  ts: string; key_id: string; model: string | null; provider: string | null;
  input_tokens: number; output_tokens: number; status: string | null;
  http_status: number | null; latency_ms: number | null; stream: boolean | null;
};
type ExportData = { rows: ExportRow[]; truncated: boolean; keys: { id: string; label: string }[] };

const PAGE_STYLE = `
.ubar-row{padding:12px 0;border-bottom:1px solid var(--border-soft)}
.ubar-row:last-child{border-bottom:0}
.ubar-top{display:flex;justify-content:space-between;gap:12px;font-size:14px}
.ubar-top .n{font-weight:600}
.ubar-top .t{font-weight:600;font-family:var(--font-mono);font-size:13px}
.xfilters{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin:14px 0}
.xfield{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--mut)}
.xfield input,.xfield select{background:rgba(255,255,255,.7);border:1px solid rgba(148,163,184,.55);border-radius:10px;padding:8px 10px;font-size:13.5px;color:var(--txt);max-width:100%}
.xfield input[type="date"]{font-family:inherit}
.xpresets{display:flex;gap:6px}
.xpresets button{border:1px solid rgba(125,211,252,.6);background:rgba(255,255,255,.6);color:var(--accent);border-radius:999px;padding:7px 13px;font-size:12.5px;font-weight:600;cursor:pointer}
.xpresets button.on{background:linear-gradient(90deg,#0ea5e9,#0284c7);color:#fff;border-color:transparent;font-weight:700;box-shadow:0 4px 14px rgba(14,165,233,.35)}
.xactions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.xsum{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--mut);margin:10px 0}
.xsum b{color:var(--txt);font-family:var(--font-mono)}
`;

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

const dayMs = 24 * 60 * 60 * 1000;
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

function ExportSection({ keys }: { keys: KeyItem[] }) {
  const { t, lang } = useLang();
  const [preset, setPreset] = useState<number | "custom">(30);
  const [from, setFrom] = useState(() => toISODate(new Date(Date.now() - 30 * dayMs)));
  const [to, setTo] = useState(() => toISODate(new Date()));
  const [keyId, setKeyId] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);
  const [bgName, setBgName] = useState("");
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    api.me()
      .then((m) => {
        const n = m?.user?.name?.trim();
        if (n) { setUserName(n); return; }
        const em = m?.user?.email?.trim() || "";
        setUserName(em.includes("@") ? em.split("@")[0] : t("Pengguna TipRouter"));
      })
      .catch(() => setUserName(t("Pengguna TipRouter")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBgFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr(t("File harus gambar."));
      return;
    }
    // Read as data URL for reliability (works even if blob URL gets revoked)
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        setBgImg(img);
        setBgDataUrl(dataUrl);
        setBgName(f.name.length > 24 ? f.name.slice(0, 23) + "\u2026" : f.name);
        setErr("");
      };
      img.onerror = () => {
        setErr(t("Gagal memuat gambar. Coba file lain."));
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setErr(t("Gagal membaca file."));
    };
    reader.readAsDataURL(f);
  };

  const pickPreset = (days: number) => {
    setPreset(days);
    setTo(toISODate(new Date()));
    setFrom(toISODate(new Date(Date.now() - days * dayMs)));
  };

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("format", "json");
    q.set("limit", "500");
    q.set("from", new Date(from + "T00:00:00").toISOString());
    // 'to' is inclusive of the whole day, but the upstream API rejects future
    // timestamps — clamp to now (e.g. selecting today used to send tomorrow 00:00).
    const toEnd = new Date(new Date(to + "T00:00:00").getTime() + dayMs);
    const now = new Date();
    q.set("to", (toEnd > now ? now : toEnd).toISOString());
    if (keyId) q.set("keyId", keyId);
    if (model.trim()) q.set("model", model.trim());
    if (status) q.set("status", status);
    return q.toString();
  }, [from, to, keyId, model, status]);

  const csvUrl = `/api/usage/export?${query.replace("format=json", "format=csv")}`;

  useEffect(() => {
    if (keys.length === 0) return;
    let alive = true;
    setLoading(true);
    setErr("");
    fetch(`/api/usage/export?${query}`)
      .then(async (r) => {
        const j = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok) {
          setErr(j.error ? String(j.error) : "http_error");
          setData(null);
        } else {
          setData(j as ExportData);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setErr("http_error");
        setData(null);
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [query, keys.length]);

  const totals = useMemo(() => {
    if (!data) return null;
    let req = 0, tok = 0;
    for (const r of data.rows) {
      req += 1;
      tok += (r.input_tokens || 0) + (r.output_tokens || 0);
    }
    return { req, tok };
  }, [data]);

  const labelOf = (id: string) => keys.find((k) => k.id === id)?.label || id.slice(0, 8);

  return (
    <div className="card" style={{ marginTop: 14 }}>
      <h2>{t("Export penggunaan")}</h2>
      <p className="muted" style={{ marginTop: -6 }}>
        {t("Filter lalu unduh riwayat pemakaian token sebagai CSV atau JSON.")}
      </p>
      <div className="xfilters">
        <div className="xfield">
          <span>{t("Rentang")}</span>
          <div className="xpresets">
            {[7, 30, 90].map((d) => (
              <button key={d} className={preset === d ? "on" : ""} onClick={() => pickPreset(d)}>
                {d === 7 ? t("7 hari") : d === 30 ? t("30 hari") : t("90 hari")}
              </button>
            ))}
          </div>
        </div>
        <label className="xfield">
          <span>{t("Dari")}</span>
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => { setPreset("custom"); setFrom(e.target.value); }}
          />
        </label>
        <label className="xfield">
          <span>{t("Sampai")}</span>
          <input
            type="date"
            value={to}
            min={from}
            max={toISODate(new Date())}
            onChange={(e) => { setPreset("custom"); setTo(e.target.value); }}
          />
        </label>
        <label className="xfield">
          <span>{t("Key")}</span>
          <select value={keyId} onChange={(e) => setKeyId(e.target.value)}>
            <option value="">{t("Semua key")}</option>
            {keys.map((k) => (
              <option key={k.id} value={k.id}>{k.label}</option>
            ))}
          </select>
        </label>
        <label className="xfield">
          <span>{t("Model")}</span>
          <input
            type="text"
            placeholder={t("cth: deepseek")}
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ width: 150 }}
          />
        </label>
        <label className="xfield">
          <span>{t("Status")}</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("Semua")}</option>
            <option value="completed">{t("Sukses")}</option>
            <option value="failed">{t("Gagal")}</option>
            <option value="cancelled">{t("Batal")}</option>
          </select>
        </label>
      </div>

      {loading && <p className="muted">{t("Mengambil data…")}</p>}
      {err && <p style={{ color: "#ef4444" }}>{t("Gagal mengambil data")}: {err}</p>}
      {data && totals && (
        <>
          <div className="xsum">
            <span>{t("Request")}: <b>{fmtNum(totals.req)}</b></span>
            <span>{t("Token")}: <b>{fmtNum(totals.tok)}</b></span>
            {data.truncated && <span>({t("dibatasi 500 baris — sempitkan rentang untuk data penuh")})</span>}
          </div>
          {/* Ringkasan harian */}
          {(() => {
            const byDay = new Map<string, { req: number; input: number; output: number }>();
            for (const r of data.rows) {
              const d = new Date(r.ts);
              if (isNaN(d.getTime())) continue;
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
              const e = byDay.get(key) || { req: 0, input: 0, output: 0 };
              e.req += 1;
              e.input += r.input_tokens || 0;
              e.output += r.output_tokens || 0;
              byDay.set(key, e);
            }
            const days = [...byDay.entries()].sort((a, b) => b[0].localeCompare(a[0]));
            if (days.length === 0) return null;
            const fmtD = (iso: string) => {
              const [y, m, dd] = iso.split("-");
              return `${dd}/${m}/${y}`;
            };
            const asc = [...days].reverse();
            const maxReq = Math.max(...asc.map(([, v]) => v.req), 1);
            const cw = 560; const ch = 150; const cpad = 8;
            // Wider inset for the plotted points (labels are centered on them,
            // 5 chars wide) so first/last date labels never clip at the edges.
            const cpadX = 24;
            const cpts = asc.map(([, v], i) => ({
              x: cpadX + (asc.length > 1 ? (i / (asc.length - 1)) * (cw - cpadX * 2) : (cw - cpadX * 2) / 2),
              y: ch - 22 - (v.req / maxReq) * (ch - 44),
            }));
            const cline = cpts.map((pt, i) => `${i === 0 ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(" ");
            const carea = asc.length > 1 ? `${cline} L${cpts[cpts.length - 1].x.toFixed(1)},${ch - 22} L${cpts[0].x.toFixed(1)},${ch - 22} Z` : "";
            return (
              <>
              <h3 style={{ fontSize: 14, margin: "14px 0 4px" }}>{t("Request per hari")}</h3>
              <svg viewBox={`0 0 ${cw} ${ch}`} width="100%" role="img" aria-label={t("Request per hari")}>
                <defs>
                  <linearGradient id="usageArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1={cpad} x2={cw - cpad} y1={ch * f} y2={ch * f} stroke="rgba(100,116,139,.18)" strokeWidth="1" />
                ))}
                {carea ? <path d={carea} fill="url(#usageArea)" /> : null}
                {asc.length > 1 ? <path d={cline} fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /> : null}
                {cpts.map((pt, i) => (
                  <circle key={i} cx={pt.x} cy={pt.y} r="3.5" fill="#fff" stroke="#0EA5E9" strokeWidth="2" />
                ))}
                {cpts.map((pt, i) => (
                  <text key={i} x={pt.x} y={ch - 8} textAnchor="middle" fontSize="10" fill="var(--faint)" fontFamily="var(--font-mono)">
                    {fmtD(asc[i][0]).slice(0, 5)}
                  </text>
                ))}
              </svg>
              <div className="ptable-wrap" style={{ marginBottom: 16 }}>
                <table className="ptable">
                  <thead>
                    <tr>
                      <th>{t("Tanggal")}</th>
                      <th style={{ textAlign: "right" }}>{t("Request")}</th>
                      <th style={{ textAlign: "right" }}>{t("Token Masuk")}</th>
                      <th style={{ textAlign: "right" }}>{t("Token Keluar")}</th>
                      <th style={{ textAlign: "right" }}>{t("Total Token")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(([day, s]) => (
                      <tr key={day}>
                        <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>{fmtD(day)}</td>
                        <td style={{ textAlign: "right" }}>{fmtNum(s.req)}</td>
                        <td style={{ textAlign: "right" }}>{fmtNum(s.input)}</td>
                        <td style={{ textAlign: "right" }}>{fmtNum(s.output)}</td>
                        <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtNum(s.input + s.output)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            );
          })()}
          <div className="ptable-wrap">
            <table className="ptable">
              <thead>
                <tr>
                  <th>{t("Waktu")}</th>
                  <th>{t("Key")}</th>
                  <th>{t("Model")}</th>
                  <th style={{ textAlign: "right" }}>{t("Token")}</th>
                  <th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.slice(0, 15).map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                      {new Date(r.ts).toLocaleString()}
                    </td>
                    <td>{labelOf(r.key_id)}</td>
                    <td><code>{r.model || "–"}</code></td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>
                      {fmtNum((r.input_tokens || 0) + (r.output_tokens || 0))}
                    </td>
                    <td>{r.status === "completed" ? t("Sukses") : r.status === "failed" ? t("Gagal") : r.status === "cancelled" ? t("Batal") : r.status || "–"}</td>
                  </tr>
                ))}
                {data.rows.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--mut)" }}>{t("Tidak ada data pada rentang ini.")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="xfield" style={{ margin: "6px 0 12px" }}>
            <span>{t("Background kartu gambar (opsional)")}</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {bgImg ? (
                <>
                  <img src={bgDataUrl || bgImg.src} alt="" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 10, border: "1px solid var(--border)" }} />
                  <span className="muted" style={{ fontSize: 12.5 }}>{bgName}</span>
                  <button className="btn sm" onClick={() => { setBgImg(null); setBgDataUrl(null); setBgName(""); }}>
                    {t("Pakai default")}
                  </button>
                </>
              ) : (
                <label className="btn sm" style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <ImageIcon size={14} /> {t("Upload foto")}
                  <input type="file" accept="image/*" hidden onChange={(e) => onBgFile(e.target.files?.[0])} />
                </label>
              )}
            </div>
          </div>
          <div className="xactions">
            <button
              className="btn sm"
              onClick={async () => {
                try {
                  const r = await fetch(csvUrl);
                  if (!r.ok) throw new Error("fetch_failed");
                  const blob = await r.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `tiprouter-usage-${from}-${to}.csv`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch {
                  setErr(t("Gagal mengunduh CSV."));
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FileSpreadsheet size={14} /> {t("Export CSV")}
            </button>
            <button
              className="btn sm"
              onClick={async () => {
                try {
                  const r = await fetch(`/api/usage/export?${query}`);
                  if (!r.ok) throw new Error("fetch_failed");
                  const blob = await r.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `tiprouter-usage-${from}-${to}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch {
                  setErr(t("Gagal mengunduh JSON."));
                }
              }}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FileJson size={14} /> {t("Export JSON")}
            </button>
            <button
              className="btn sm"
              onClick={() => {
                if (!data) return;
                let input = 0, output = 0, ok = 0;
                const byModel = new Map<string, number>();
                for (const r of data.rows) {
                  input += r.input_tokens || 0;
                  output += r.output_tokens || 0;
                  if (r.status === "completed") ok += 1;
                  const m = r.model || "\u2013";
                  byModel.set(m, (byModel.get(m) || 0) + 1);
                }
                const topModel = [...byModel.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "\u2013";
                const fmtD = (iso: string) => {
                  const [y, m, dd] = iso.split("-");
                  return `${dd}/${m}/${y}`;
                };
                const imgData = {
                  period: `${fmtD(from)} \u2013 ${fmtD(to)}`,
                  userName: userName || t("Pengguna TipRouter"),
                  keyLabel: keyId ? labelOf(keyId) : t("Semua key"),
                  totalTokens: input + output,
                  requests: data.rows.length,
                  inputTokens: input,
                  outputTokens: output,
                  topModel,
                  successRate: data.rows.length > 0 ? (ok / data.rows.length) * 100 : 0,
                  truncated: !!data.truncated,
                  lang: (lang === "en" ? "en" : "id") as "id" | "en",
                  backgroundImage: bgImg,
                  candles: computeCandles(data.rows),
                };
                // Generate preview instead of direct download
                const cv = drawUsageCard(imgData);
                setPreviewUrl(cv.toDataURL("image/png"));
              }}
              disabled={!data}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ImageIcon size={14} /> {t("Export Gambar")}
            </button>
          </div>
          {/* Image preview modal */}
          {previewUrl && (
            <div className="modal-backdrop" onClick={() => setPreviewUrl(null)}>
              <div className="modal-card" style={{ maxWidth: 560, maxHeight: "90vh", overflow: "auto" }} onClick={(e) => e.stopPropagation()}>
                <h3 style={{ margin: "0 0 12px" }}>{t("Pratinjau Gambar")}</h3>
                <img
                  src={previewUrl}
                  alt={t("Pratinjau export gambar")}
                  style={{ width: "100%", borderRadius: 8, display: "block" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                  <button className="btn sm" onClick={() => setPreviewUrl(null)}>
                    {t("Tutup")}
                  </button>
                  <button
                    className="btn sm primary"
                    onClick={() => {
                      const a = document.createElement("a");
                      a.download = `tiprouter-usage-${Date.now()}.png`;
                      a.href = previewUrl;
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      setPreviewUrl(null);
                    }}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    <Download size={14} /> {t("Unduh PNG")}
                  </button>
                </div>
              </div>
            </div>
          )}
          <p className="muted" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <Download size={13} /> {t("File berisi seluruh baris (maks 20.000), bukan cuma pratinjau di atas.")}
          </p>
        </>
      )}
    </div>
  );
}

export default function Usage() {
  const { t } = useLang();
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];
  const ready = data !== null && !reason;

  const total = keys.reduce((a, k) => a + (Number(k.tokensConsumed) || 0), 0);
  const active = keys.filter((k) => k.status === "active").length;
  const top = keys.slice().sort((a, b) => (Number(b.tokensConsumed) || 0) - (Number(a.tokensConsumed) || 0))[0];

  let box: ReactNode;
  if (!data) {
    box = <p>{t("Mengambil data pemakaian.")}</p>;
  } else if (reason) {
    box = <ReasonMsg reason={reason} />;
  } else if (keys.length === 0) {
    box = <p>{t("Belum ada key, jadi belum ada pemakaian.")}</p>;
  } else {
    box = keys.map((k) => {
      const tok = Number(k.tokensConsumed) || 0;
      const pct = total > 0 ? Math.round((tok / total) * 100) : 0;
      return (
        <div className="ubar-row" key={k.id}>
          <div className="ubar-top">
            <span className="n">{k.label}</span>
            <span className="t">
              {t("{n} token", { n: fmtNum(tok) })} ({pct}%)
            </span>
          </div>
          <div className="bar">
            <i style={{ width: pct + "%" }} />
          </div>
        </div>
      );
    });
  }

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <PageHead title="Usage" sub={t("Pemakaian token dari semua key kamu (semua waktu).")} />
      <div className="stats">
        <div className="stat">
          <p className="lab">{t("Total token")}</p>
          <p className="val">{ready ? fmtNum(total) : "-"}</p>
          <p className="sub2">{t("semua key")}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Key aktif")}</p>
          <p className="val">{ready ? String(active) : "-"}</p>
          <p className="sub2">{ready ? t("dari {n} key", { n: keys.length }) : ""}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Total key")}</p>
          <p className="val">{ready ? String(keys.length) : "-"}</p>
          <p className="sub2">{t("yang ketemu di akun ini")}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Key terberat")}</p>
          <p className="val">{ready && top ? fmtNum(top.tokensConsumed) : "-"}</p>
          <p className="sub2">{ready && top ? top.label || "" : ""}</p>
        </div>
      </div>
      <div className="card">
        <h2>{t("Pemakaian per key")}</h2>
        <div>{box}</div>
        <p className="muted" style={{ marginTop: 12 }}>
          {t("Angka token dihitung dari semua request yang pernah jalan pakai key itu.")}
        </p>
      </div>
      {ready && keys.length > 0 && <ExportSection keys={keys} />}
    </>
  );
}
