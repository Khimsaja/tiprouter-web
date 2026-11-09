import { Activity, AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { fmtNum, type PublicModelHealth } from "../lib/api";
import { localeTag, useLang } from "../lib/i18n";
import { usePublicStats } from "../lib/usePublicStats";

type Health = "fast" | "slow" | "down" | "nodata";

const healthOf = (m: PublicModelHealth): Health => {
  if (m.hits <= 0) return "nodata";
  const r = m.ok / m.hits;
  if (r >= 0.9) return "fast";
  if (r >= 0.5) return "slow";
  return "down";
};

// Urutan tampil: rasio sukses terbesar di atas; yang belum ada data paling bawah.
const ratio = (m: PublicModelHealth) => (m.hits > 0 ? m.ok / m.hits : -1);

export default function Status() {
  const { t } = useLang();
  const { stats, error } = usePublicStats(30_000);

  const META: Record<Health, { color: string; icon: React.ReactNode; label: string }> = {
    fast: { color: "var(--green)", icon: <CheckCircle2 size={15} />, label: t("Upstream cepat") },
    slow: { color: "#d97706", icon: <AlertTriangle size={15} />, label: t("Upstream lambat") },
    down: { color: "var(--red)", icon: <XCircle size={15} />, label: t("Bermasalah") },
    nodata: { color: "var(--mut)", icon: <MinusCircle size={15} />, label: t("Belum ada data") },
  };

  const rows = (stats?.model_health_1h ?? [])
    .slice()
    .sort((a, b) => ratio(b) - ratio(a) || b.hits - a.hits);

  const down = rows.filter((m) => healthOf(m) === "down").length;
  const slow = rows.filter((m) => healthOf(m) === "slow").length;

  const pct = (m: PublicModelHealth) =>
    m.hits > 0
      ? ((m.ok / m.hits) * 100).toLocaleString(localeTag(), { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "%"
      : "–";

  return (
    <PublicLayout>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: "18px 0 6px" }}>
          {t("Status model")}
        </h1>
        <p style={{ color: "var(--mut)", fontSize: 14, margin: "0 0 18px" }}>
          {t("Tingkat keberhasilan tiap model dalam 1 jam terakhir, dihitung dari traffic asli jaringan TipRouter. Diperbarui tiap 30 detik.")}
        </p>

        {error && !stats && (
          <div className="card" style={{ marginBottom: 14 }}>
            <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Status lagi tidak bisa dimuat. Coba refresh halaman.")}</p>
          </div>
        )}

        {stats && (
          <div
            className="card"
            style={{
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderLeft: `3px solid ${down > 0 ? "var(--red)" : slow > 0 ? "#d97706" : "var(--green)"}`,
            }}
          >
            <Activity size={18} style={{ flexShrink: 0, color: down > 0 ? "var(--red)" : slow > 0 ? "#d97706" : "var(--green)" }} />
            <p style={{ margin: 0, fontWeight: 700 }}>
              {down > 0
                ? t("{n} model bermasalah", { n: down })
                : slow > 0
                  ? t("{n} model upstream lambat", { n: slow })
                  : t("Semua model upstream cepat")}
            </p>
          </div>
        )}

        <div className="card">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {rows.map((m) => {
              const h = healthOf(m);
              const meta = META[h];
              const p = m.hits > 0 ? Math.round((m.ok / m.hits) * 100) : 0;
              return (
                <div key={m.model}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <code style={{ fontSize: 14, fontWeight: 700 }}>{m.model}</code>
                    <span
                      style={{
                        marginLeft: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12.5,
                        fontWeight: 700,
                        color: meta.color,
                      }}
                    >
                      {meta.icon}
                      {meta.label}
                      <span style={{ color: "var(--mut)", fontWeight: 600 }}>
                        · {pct(m)} · {fmtNum(m.hits)} {t("req")}
                      </span>
                    </span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 99,
                      background: "var(--border)",
                      overflow: "hidden",
                    }}
                    role="progressbar"
                    aria-valuenow={p}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={m.model}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${p}%`,
                        borderRadius: 99,
                        background: meta.color,
                        transition: "width .5s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {rows.length === 0 && !error && (
              <p style={{ color: "var(--mut)", fontSize: 14, margin: 0 }}>{t("Memuat…")}</p>
            )}
          </div>
          <p style={{ marginTop: 16, marginBottom: 0, fontSize: 13 }}>
            {t("Hijau ≥90% berhasil · kuning 50–90% · merah <50% dalam 1 jam terakhir. Request yang kena rate-limit atau dibatalkan sendiri oleh client tidak dihitung sebagai gagal.")}
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
