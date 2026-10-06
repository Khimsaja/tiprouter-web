import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Download, Search } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { api, fmtNum, type ProxyItem } from "../lib/api";
import { useLang } from "../lib/i18n";

const PROTOCOLS = ["", "http", "https", "socks4", "socks5"] as const;
const ANONS = ["", "elite", "anonymous", "transparent"] as const;
const PER = 50;

const proxyUrl = (p: ProxyItem) => `${p.protocol}://${p.ip}:${p.port}`;

export default function Proxy() {
  const { t } = useLang();
  const [protocol, setProtocol] = useState<string>("");
  const [country, setCountry] = useState("");
  const [anonymity, setAnonymity] = useState("");
  const [maxlat, setMaxlat] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<ProxyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<{ by_country: Record<string, number>; by_protocol: Record<string, number>; total: number } | null>(null);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const r = await api.proxies({ protocol, country, anonymity, q, page, limit: PER, maxlat: maxlat ? Number(maxlat) : undefined, sort: sortBy || undefined });
      setItems(r.items);
      setTotal(r.total);
      setUpdatedAt(r.updatedAt);
      if (r.stats) setStats(r.stats);
    } catch {
      setError(t("Sumber proxy lagi tidak bisa dijangkau. Coba lagi sebentar."));
    } finally {
      setLoading(false);
    }
  }, [protocol, country, anonymity, q, page, maxlat, sortBy, t]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setSelected(new Set()); }, [protocol, country, anonymity, q, maxlat, sortBy]);

  const countries = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.by_country).sort((a, b) => b[1] - a[1]);
  }, [stats]);

  const pages = Math.max(1, Math.ceil(total / PER));

  const toggle = (p: ProxyItem) => {
    const key = proxyUrl(p);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const allOnPageSelected = items.length > 0 && items.every((p) => selected.has(proxyUrl(p)));
  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) items.forEach((p) => next.delete(proxyUrl(p)));
      else items.forEach((p) => next.add(proxyUrl(p)));
      return next;
    });
  };

  const copyText = async (text: string, mark: string) => {
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
    setCopied(mark);
    setTimeout(() => setCopied((c) => (c === mark ? null : c)), 1600);
  };

  const download = (list: string[], name: string) => {
    const blob = new Blob([list.join("\n") + "\n"], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  const downloadFiltered = async () => {
    try {
      const r = await api.proxies({ protocol, country, anonymity, q, page: 1, limit: 10000, maxlat: maxlat ? Number(maxlat) : undefined, sort: sortBy || undefined });
      download(r.items.map(proxyUrl), "tiprouter-proxies.txt");
    } catch { /* ignore */ }
  };

  return (
    <PublicLayout>
      <h1 className="page">
        {t("Proxy")} <em>{t("gratis.")}</em>
      </h1>
      <p className="sub">
        {t("Daftar proxy publik gratis (HTTP, HTTPS, SOCKS4, SOCKS5) yang diperbarui tiap beberapa menit. Filter, pilih, lalu salin atau download. Tanpa login.")}
      </p>

      <div className="stats" style={{ marginTop: 18 }}>
        <div className="stat">
          <div className="lbl">{t("TOTAL PROXY")}</div>
          <div className="val">{stats ? fmtNum(stats.total) : "…"}</div>
          <div className="sub2">{t("dari {countries} negara", { countries: stats ? fmtNum(Object.keys(stats.by_country).length) : "…" })}</div>
        </div>
        <div className="stat">
          <div className="lbl">HTTP / HTTPS</div>
          <div className="val">{stats ? fmtNum((stats.by_protocol.http || 0)) : "…"}</div>
          <div className="sub2">{t("{n} mendukung SSL", { n: stats ? fmtNum(stats.by_protocol.https || 0) : "…" })}</div>
        </div>
        <div className="stat">
          <div className="lbl">SOCKS5</div>
          <div className="val">{stats ? fmtNum(stats.by_protocol.socks5 || 0) : "…"}</div>
          <div className="sub2">SOCKS4: {stats ? fmtNum(stats.by_protocol.socks4 || 0) : "…"}</div>
        </div>
        <div className="stat">
          <div className="lbl">{t("TERAKHIR DIPERBARUI")}</div>
          <div className="val" style={{ fontSize: 17 }}>{updatedAt ? new Date(updatedAt).toLocaleTimeString() : "…"}</div>
          <div className="sub2">{t("diperbarui tiap beberapa menit")}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <div className="chiprow" role="tablist" aria-label={t("Protokol")}>
          {PROTOCOLS.map((p) => (
            <button key={p || "all"} className={"chip" + (protocol === p ? " on" : "")} onClick={() => setProtocol(p)}>
              {p === "" ? t("Semua") : p.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="proxy-filters">
          <select value={country} onChange={(e) => setCountry(e.target.value)} aria-label={t("Negara")}>
            <option value="">{t("Semua negara")}</option>
            {countries.map(([code, n]) => (
              <option key={code} value={code}>{code} ({fmtNum(n)})</option>
            ))}
          </select>
          <select value={anonymity} onChange={(e) => setAnonymity(e.target.value)} aria-label={t("Anonimitas")}>
            <option value="">{t("Semua anonimitas")}</option>
            {ANONS.filter(Boolean).map((a) => (
              <option key={a} value={a}>{a[0].toUpperCase() + a.slice(1)}</option>
            ))}
          </select>
          <select value={maxlat} onChange={(e) => setMaxlat(e.target.value)} aria-label={t("Maks latency")}>
            <option value="">{t("Latency: semua")}</option>
            <option value="100">≤ 100 ms</option>
            <option value="200">≤ 200 ms</option>
            <option value="500">≤ 500 ms</option>
            <option value="1000">≤ 1000 ms</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label={t("Urutan")}>
            <option value="">{t("Urutan: bawaan")}</option>
            <option value="latency">{t("Tercepat")}</option>
            <option value="uptime">{t("Uptime tertinggi")}</option>
          </select>
          <div className="proxy-search">
            <Search size={15} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Cari IP, kota, ISP…")} aria-label={t("Cari")} />
          </div>
        </div>

        <div className="btns" style={{ marginTop: 12 }}>
          <button className="btn sm" onClick={() => copyText([...selected].join("\n"), "sel")} disabled={selected.size === 0}>
            {copied === "sel" ? <Check size={14} /> : <Copy size={14} />} {t("Salin terpilih")} ({selected.size})
          </button>
          <button className="btn sm" onClick={() => download([...selected], "tiprouter-proxies-terpilih.txt")} disabled={selected.size === 0}>
            <Download size={14} /> {t("Download terpilih")}
          </button>
          <button className="btn sm" onClick={downloadFiltered} disabled={total === 0}>
            <Download size={14} /> {t("Download semua hasil filter")} ({fmtNum(total)})
          </button>
        </div>

        {error ? <p className="err" style={{ marginTop: 12 }}>{error}</p> : null}

        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th><input type="checkbox" checked={allOnPageSelected} onChange={togglePage} aria-label={t("Pilih semua di halaman ini")} /></th>
                <th>Proxy</th>
                <th>{t("Negara")}</th>
                <th>{t("Anonimitas")}</th>
                <th>Uptime</th>
                <th>Latency</th>
                <th>ISP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const u = proxyUrl(p);
                return (
                  <tr key={u} className={selected.has(u) ? "sel" : ""}>
                    <td><input type="checkbox" checked={selected.has(u)} onChange={() => toggle(p)} aria-label={u} /></td>
                    <td><code>{u}</code></td>
                    <td>{p.country_code || "-"}<span className="muted"> {p.city || ""}</span></td>
                    <td>{p.anonymity || "-"}</td>
                    <td>{p.uptime_percent != null ? p.uptime_percent.toFixed(0) + "%" : "-"}</td>
                    <td>{p.latency_ms != null ? Math.round(p.latency_ms) + " ms" : "-"}</td>
                    <td className="muted">{p.isp || "-"}</td>
                    <td>
                      <button className="icon-btn" onClick={() => copyText(u, u)} aria-label={t("Salin") + " " + u}>
                        {copied === u ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 && !error && (
                <tr><td colSpan={8} className="muted" style={{ textAlign: "center", padding: 22 }}>{t("Tidak ada proxy yang cocok dengan filter ini.")}</td></tr>
              )}
              {loading && (
                <tr><td colSpan={8} className="muted" style={{ textAlign: "center", padding: 22 }}>{t("Mengambil daftar proxy…")}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="btns" style={{ marginTop: 12, justifyContent: "space-between" }}>
          <span className="muted">{t("Menampilkan {from}–{to} dari {total}", { from: total === 0 ? 0 : (page - 1) * PER + 1, to: Math.min(total, page * PER), total: fmtNum(total) })}</span>
          <span className="btns">
            <button className="btn sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>{t("Sebelumnya")}</button>
            <button className="btn sm" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>{t("Berikutnya")}</button>
          </span>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14 }}>
        <h2>{t("Catatan pemakaian")}</h2>
        <p style={{ marginTop: 8 }}>
          {t("Proxy-proxy ini publik dan gratis, jadi kecepatan dan keaktifannya tidak dijamin — bisa lambat atau mati sewaktu-waktu. Jangan pakai untuk login akun penting atau data sensitif, dan patuhi aturan situs yang kamu akses.")}
        </p>
        <p className="muted" style={{ marginTop: 8 }}>
          {t("Data diperbarui otomatis tiap beberapa menit.")}
        </p>
      </div>
    </PublicLayout>
  );
}
