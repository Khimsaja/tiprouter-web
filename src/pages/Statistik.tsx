import { useState } from "react";
import { Activity, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ClipboardCopy, ListOrdered } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { fmtNum, type PublicStats } from "../lib/api";
import { getLang, localeTag, tr, useLang } from "../lib/i18n";
import { usePublicStats } from "../lib/usePublicStats";

// Same compact style as the landing stats ("jt"/"rb") so both pages read identically.
const fmtCompact = (n: number) =>
  n >= 1e6
    ? (n / 1e6).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + tr(" jt")
    : n >= 1e3
      ? (n / 1e3).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + tr(" rb")
      : String(n);

export default function Statistik() {
  const { t } = useLang();
  const { stats, error } = usePublicStats();
  const [copied, setCopied] = useState(false);

  const sharePct = (hits: number) =>
    stats && stats.requests > 0
      ? (hits / stats.requests * 100).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
      : "–";

  // Laporan monospace siap tempel ke Telegram — datanya live dari API,
  // jadi tiap 24 jam angkanya otomatis ikut berubah.
  const buildReport = (): string => {
    if (!stats) return "";
    const id = getLang() === "id";
    const fi = (n: number) => n.toLocaleString(localeTag());
    const pct = (hits: number) =>
      stats.requests > 0
        ? (hits / stats.requests * 100).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
        : "0%";
    const date = new Date().toLocaleDateString(localeTag(), { day: "numeric", month: "long", year: "numeric" });
    const totalTok = stats.input_tokens + stats.output_tokens;
    const L: string[] = [];
    L.push(id ? "🏆 TOP 10 MODEL — TipRouter" : "🏆 TOP 10 MODELS — TipRouter");
    L.push(id ? `📆 ${date} · 24 jam terakhir` : `📆 ${date} · last 24 hours`);
    L.push("🌐 tiprouter.my.id");
    L.push("");
    L.push(`⚡ ${fi(stats.requests)} requests · 🪙 ${fi(totalTok)} tokens`);
    L.push("");
    const hTok = id ? "Token" : "Tokens";
    L.push(`${"#".padStart(2)}  ${"Model".padEnd(22)} ${"Request".padStart(8)} ${hTok.padStart(15)} ${"Share".padStart(6)}`);
    L.push("━".repeat(58));
    stats.top_models.forEach((m, i) => {
      const name = m.model.length > 22 ? m.model.slice(0, 21) + "…" : m.model;
      L.push(
        `${String(i + 1).padStart(2)}  ${name.padEnd(22)} ${fi(m.hits).padStart(8)} ${fi(m.tokens).padStart(15)} ${pct(m.hits).padStart(6)}`
      );
    });
    L.push("");
    if (id) {
      L.push("✨ 1 API key untuk semua model · OpenAI & Anthropic compatible");
      L.push("🎟️ Coba Trial Rp3.000 → tiprouter.my.id");
    } else {
      L.push("✨ 1 API key for all models · OpenAI & Anthropic compatible");
      L.push("🎟️ Try the IDR 3,000 Trial → tiprouter.my.id");
    }
    return L.join("\n");
  };

  const copyReport = async () => {
    if (!stats || copied) return;
    const text = buildReport();
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    };
    try {
      await navigator.clipboard.writeText(text);
      done();
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        if (document.execCommand("copy")) done();
      } catch {
        /* noop */
      }
      document.body.removeChild(ta);
    }
  };

  const cards = [
    {
      icon: <Activity size={16} />,
      label: t("Requests"),
      value: stats ? fmtNum(stats.requests) : "…",
      sub: t("24 jam terakhir"),
    },
    {
      icon: <ArrowUpFromLine size={16} />,
      label: t("Input tokens"),
      value: stats ? fmtCompact(stats.input_tokens) : "…",
      sub: t("token prompt"),
    },
    {
      icon: <ArrowDownToLine size={16} />,
      label: t("Output tokens"),
      value: stats ? fmtCompact(stats.output_tokens) : "…",
      sub: t("token completion"),
    },
    {
      icon: <CheckCircle2 size={16} />,
      label: t("Success rate"),
      value: stats
        ? (stats.success_rate * 100).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"
        : "…",
      sub: stats ? t("{n} sukses", { n: fmtNum(stats.ok) }) : t("tingkat sukses"),
    },
  ];

  return (
    <PublicLayout>
      <div>
        <div style={{ marginTop: 18 }}>
          <span className="badge-ok"><span className="pulse-dot" />{t("Online")}</span>
        </div>
        <h1 className="page" style={{ margin: "12px 0 6px" }}>
          {t("Statistik jaringan")}
        </h1>
        <p className="sub" style={{ margin: "0 0 18px" }}>
          {t("Data asli 24 jam terakhir dari jaringan TipRouter (agregat anonim — tanpa nama pengguna, isi chat, atau data key). Diperbarui tiap menit.")}
        </p>

        {error && !stats && (
          <div className="card" style={{ marginBottom: 14 }}>
            <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Statistik lagi tidak bisa dimuat. Coba refresh halaman.")}</p>
          </div>
        )}

        <div className="stats" style={{ gap: 10, marginBottom: 14 }}>
          {cards.map((c) => (
            <div className="stat" key={c.label}>
              <div className="lab" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {c.icon}
                {c.label}
              </div>
              <div className="val mono">{c.value}</div>
              <div className="sub2">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <ListOrdered size={16} />
              {t("Model terlaris")}
            </h2>
            <button className="btn sm" onClick={copyReport} disabled={!stats} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <ClipboardCopy size={14} />
              {copied ? t("Tersalin") : t("Salin format Telegram")}
            </button>
          </div>
          <p style={{ marginBottom: 0 }}>{t("10 model dengan request terbanyak dalam 24 jam terakhir.")}</p>
          <div className="ptable-wrap">
            <table className="ptable">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Model</th>
                  <th style={{ textAlign: "right" }}>Request</th>
                  <th style={{ textAlign: "right" }}>{t("Token")}</th>
                  <th style={{ textAlign: "right" }}>{t("Share")}</th>
                </tr>
              </thead>
              <tbody>
                {(stats?.top_models ?? []).map((m, i) => (
                  <tr key={m.model}>
                    <td style={{ color: "var(--mut)" }}>{i + 1}</td>
                    <td><code>{m.model}</code></td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtNum(m.hits)}</td>
                    <td style={{ textAlign: "right" }}>{fmtNum(m.tokens)}</td>
                    <td style={{ textAlign: "right", color: "var(--mut)" }}>{sharePct(m.hits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!stats && !error && <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Memuat…")}</p>}
        </div>
      </div>
    </PublicLayout>
  );
}
