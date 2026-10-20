import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, ClipboardCopy, Cpu, Gift, Globe, KeyRound, Lock } from "lucide-react";
import { localeTag, useLang } from "../lib/i18n";
import { useSession } from "../lib/session";

interface BansosDeepseekData {
  key: string;
  login_required: boolean;
  base_url: string;
  model: string;
  used_tokens: number;
  budget_tokens: number;
  active: boolean;
}

const POLL_MS = 30_000;

const fmtTok = (n: number) =>
  n >= 1e9
    ? (n / 1e9).toLocaleString(localeTag(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " B"
    : n >= 1e6
      ? (n / 1e6).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + " jt"
      : n.toLocaleString(localeTag());

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function Field({ icon, label, value, secret }: { icon: React.ReactNode; label: string; value: string; secret?: boolean }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (await copyText(value)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--mut)", marginBottom: 6 }}>
        {icon}
        {label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <code
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: secret ? 13 : 14,
            overflowX: "auto",
            whiteSpace: "nowrap",
            userSelect: "all",
          }}
        >
          {value}
        </code>
        <button
          className="btn sm"
          onClick={onCopy}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0 }}
          aria-label={label}
        >
          {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
          {copied ? "OK" : "Salin"}
        </button>
      </div>
    </div>
  );
}

function LockedField({ t, value }: { t: (s: string) => string; value: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--mut)", marginBottom: 6 }}>
        <KeyRound size={14} />
        {t("API key (login untuk buka)")}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 12px",
        }}
      >
        <code
          style={{
            flex: 1,
            minWidth: 0,
            fontSize: 14,
            overflowX: "auto",
            whiteSpace: "nowrap",
            userSelect: "none",
            filter: "blur(3px)",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          {value}
        </code>
        <span
          style={{ display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0, fontSize: 13, color: "var(--mut)" }}
        >
          <Lock size={14} />
        </span>
      </div>
      <Link
        to="/login"
        className="btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 10,
          textDecoration: "none",
        }}
      >
        <Lock size={15} />
        {t("Login untuk lihat & salin key")}
      </Link>
    </div>
  );
}

export default function BansosDeepseek() {
  const { t } = useLang();
  const { me } = useSession();
  const [data, setData] = useState<BansosDeepseekData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/stats/bansos-deepseek");
        if (!r.ok) throw new Error(String(r.status));
        const j = (await r.json()) as BansosDeepseekData;
        if (alive) {
          setData(j);
          setError(false);
        }
      } catch {
        if (alive) setError(true);
      }
    };
    load();
    const id = window.setInterval(load, POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [me]);

  const pct = data && data.budget_tokens > 0 ? Math.min(100, (data.used_tokens / data.budget_tokens) * 100) : 0;
  const exhausted = data && (!data.active || data.used_tokens >= data.budget_tokens);
  const locked = data && (data.login_required || !me);
  const budgetLabel = data ? fmtTok(data.budget_tokens) : "…";

  return (
    <section className="ld-section" id="bansos-deepseek">
      <p className="ld-label">{t("Bansos")}</p>
      <h2 className="ld-sec">
        {t("DeepSeek")} <em>{t("{budget} token, gratis.", { budget: budgetLabel })}</em>
      </h2>
      <p style={{ color: "var(--mut)", fontSize: 15, maxWidth: 640, margin: "0 0 18px" }}>
        {t("Satu API key bersama untuk semua orang — khusus model deepseek-v-4.1-flash, tanpa batas RPM, budget season ini 2 miliar token (progress kumulatif semua season, tidak direset). Login dulu untuk lihat & salin key-nya. Siapa cepat, dia dapat.")}
      </p>

      <div className="card reveal" style={{ maxWidth: 720 }}>
        {error && !data && (
          <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Data bansos lagi tidak bisa dimuat. Coba refresh halaman.")}</p>
        )}
        {!error && !data && <p style={{ color: "var(--mut)", fontSize: 14 }}>{t("Memuat…")}</p>}
        {data && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: exhausted ? "var(--red)" : "var(--green)",
                }}
              >
                <Gift size={15} />
                {exhausted ? t("Kuota habis") : t("Kuota tersedia")}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--mut)" }}>
                <Cpu size={14} />
                <code>{data.model}</code>
              </span>
            </div>

            <Field icon={<Globe size={14} />} label={t("Base URL")} value={data.base_url} />
            {locked ? (
              <LockedField t={t} value={data.key} />
            ) : (
              <Field icon={<KeyRound size={14} />} label={t("API key (klik Salin, langsung pakai)")} value={data.key} secret />
            )}

            <div style={{ marginTop: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--mut)" }}>{t("Pemakaian token")}</span>
                <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700 }}>
                  {fmtTok(data.used_tokens)} <span style={{ color: "var(--mut)", fontWeight: 400 }}>/ {fmtTok(data.budget_tokens)}</span>
                </span>
              </div>
              <div
                style={{ height: 10, borderRadius: 99, background: "var(--border)", overflow: "hidden" }}
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    borderRadius: 99,
                    background: pct >= 90 ? "var(--red)" : pct >= 70 ? "#d97706" : "var(--green)",
                    transition: "width .5s ease",
                  }}
                />
              </div>
              <p style={{ fontSize: 12.5, color: "var(--faint)", margin: "8px 0 0" }}>
                {exhausted ? (
                  <>
                    {t("Bansos global sudah habis. Masih ada bansos via gacha — ")}{" "}
                    <Link to="/bansos" style={{ color: "var(--txt)", fontWeight: 700 }}>
                      {t("yuk login sekarang dan mulai gacha.")}
                    </Link>
                  </>
                ) : (
                  t("Diperbarui tiap 30 detik. Setelah kuota season ini habis, key otomatis berhenti.")
                )}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
