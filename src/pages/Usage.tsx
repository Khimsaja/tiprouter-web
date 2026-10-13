import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";
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
.ubar-row{padding:12px 0;border-bottom:1px solid var(--border)}
.ubar-row:last-child{border-bottom:0}
.ubar-top{display:flex;justify-content:space-between;gap:12px;font-size:14px}
.ubar-top .n{font-weight:600}
.ubar-top .t{font-weight:600;font-family:var(--mono);font-size:13px}
.xfilters{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;margin:14px 0}
.xfield{display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--mut)}
.xfield input,.xfield select{background:var(--bg);border:1px solid var(--border);border-radius:9px;padding:8px 10px;font-size:13.5px;color:var(--txt);max-width:100%}
.xfield input[type="date"]{font-family:inherit}
.xpresets{display:flex;gap:6px}
.xpresets button{border:1px solid var(--border);background:transparent;color:var(--mut);border-radius:999px;padding:7px 13px;font-size:12.5px;cursor:pointer}
.xpresets button.on{background:var(--txt);color:var(--bg);border-color:var(--txt);font-weight:700}
.xactions{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.xsum{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--mut);margin:10px 0}
.xsum b{color:var(--txt);font-family:var(--mono)}
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
        <Link to="/beli">{t("Beli API key")}</Link>{" "}
        {t("lewat web langsung keluar, atau hubungkan Telegram di menu Profil kalau key kamu dari bot.")}
      </p>
    );
  return <p>{t("Data key belum bisa diambil sekarang. Coba muat ulang halamannya sebentar lagi.")}</p>;
}

const dayMs = 24 * 60 * 60 * 1000;
const toISODate = (d: Date) => d.toISOString().slice(0, 10);

function ExportSection({ keys }: { keys: KeyItem[] }) {
  const { t } = useLang();
  const [preset, setPreset] = useState<number | "custom">(30);
  const [from, setFrom] = useState(() => toISODate(new Date(Date.now() - 30 * dayMs)));
  const [to, setTo] = useState(() => toISODate(new Date()));
  const [keyId, setKeyId] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState<ExportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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
                    <td style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                      {new Date(r.ts).toLocaleString()}
                    </td>
                    <td>{labelOf(r.key_id)}</td>
                    <td><code>{r.model || "–"}</code></td>
                    <td style={{ textAlign: "right", fontFamily: "var(--mono)" }}>
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
          <div className="xactions">
            <a className="btn sm" href={csvUrl} download style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <FileSpreadsheet size={14} /> {t("Export CSV")}
            </a>
            <a
              className="btn sm"
              href={`/api/usage/export?${query}`}
              download
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <FileJson size={14} /> {t("Export JSON")}
            </a>
          </div>
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
