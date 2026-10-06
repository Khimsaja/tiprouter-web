import { Activity, ArrowDownToLine, ArrowUpFromLine, CheckCircle2, ListOrdered } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { fmtNum } from "../lib/api";
import { localeTag, tr, useLang } from "../lib/i18n";
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
      <div className="wrap">
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "18px 0 6px" }}>
          {t("Statistik jaringan")}
        </h1>
        <p style={{ color: "var(--mut)", fontSize: 14, margin: "0 0 18px" }}>
          {t("Data asli 24 jam terakhir dari jaringan TipRouter (agregat anonim — tanpa nama pengguna, isi chat, atau data key). Diperbarui tiap menit.")}
        </p>

        {error && !stats && (
          <div className="card" style={{ marginBottom: 14 }}>
            <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Statistik lagi tidak bisa dimuat. Coba refresh halaman.")}</p>
          </div>
        )}

        <div className="stats" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
          {cards.map((c) => (
            <div className="stat" key={c.label}>
              <div className="lab" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {c.icon}
                {c.label}
              </div>
              <div className="val">{c.value}</div>
              <div className="sub2">{c.sub}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ListOrdered size={16} />
            {t("Model terlaris")}
          </h2>
          <p style={{ marginTop: 0 }}>{t("10 model dengan request terbanyak dalam 24 jam terakhir.")}</p>
          {(stats?.top_models ?? []).map((m) => {
            const rate = m.hits > 0 ? (m.ok / m.hits) * 100 : 0;
            return (
              <div className="row" key={m.model}>
                <div>
                  <p className="who" style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{m.model}</p>
                  <p className="meta" style={{ margin: "2px 0 0", fontSize: 12, color: "var(--mut)" }}>
                    {rate.toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% {t("sukses")}
                  </p>
                </div>
                <div className="right" style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{fmtNum(m.hits)}</div>
                  <div style={{ fontSize: 12, color: "var(--mut)" }}>{fmtNum(m.ok)} OK</div>
                </div>
              </div>
            );
          })}
          {!stats && !error && <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Memuat…")}</p>}
        </div>
      </div>
    </PublicLayout>
  );
}
