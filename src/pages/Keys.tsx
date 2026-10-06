import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import { PageHead } from "../components/DashLayout";
import Turnstile, { type TurnstileHandle } from "../components/Turnstile";
import { api, daysLeft, fmtDate, fmtNum, type KeyItem } from "../lib/api";
import { tr, useLang } from "../lib/i18n";

type KeysData = { keys: KeyItem[]; reason?: string };

function AddKeyCard({ onLinked }: { onLinked: () => void }) {
  const { t } = useLang();
  const [key, setKey] = useState("");
  const [tsToken, setTsToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [cfg, setCfg] = useState<{ turnstileSiteKey?: string | null } | null>(null);
  const tsRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    api.config().then(setCfg).catch(() => setCfg({}));
  }, []);

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (busy) return;
    setErr("");
    setOk("");
    setBusy(true);
    try {
      const d = await api.linkKey(key.trim(), tsToken);
      setOk(t("Key {label} berhasil dihubungkan.", { label: d.label || "" }));
      setKey("");
      tsRef.current?.reset();
      setTsToken(null);
      onLinked();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (msg.includes("key_linked_to_other_account")) setErr(t("Key ini sudah terhubung ke akun lain."));
      else if (msg.includes("invalid_key")) setErr(t("Key tidak valid. Cek lagi key-nya."));
      else if (msg.includes("key_revoked")) setErr(t("Key ini sudah dicabut."));
      else if (msg.includes("key_expired")) setErr(t("Key ini sudah kedaluwarsa."));
      else if (msg.includes("turnstile_failed")) setErr(t("Verifikasi anti-bot gagal. Coba lagi."));
      else setErr(t("Gagal menghubungkan key. Coba lagi."));
      tsRef.current?.reset();
      setTsToken(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginTop: 20 }}>
      <h2>
        <KeyRound size={18} style={{ verticalAlign: "-3px", marginRight: 8 }} />
        {t("Hubungkan API key")}
      </h2>
      <p>{t("Punya key dari pembelian atau gacha? Tempel di sini biar muncul di dashboard ini.")}</p>
      <form className="keyform" style={{ marginTop: 14, paddingTop: 0, borderTop: 0 }} onSubmit={submit}>
        <label htmlFor="linkKeyInput">{t("API key kamu")}</label>
        <input
          id="linkKeyInput"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="tip_..."
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />
        {cfg?.turnstileSiteKey ? <Turnstile ref={tsRef} siteKey={cfg.turnstileSiteKey} onToken={setTsToken} /> : null}
        <div className="btns">
          <button className="btn primary" type="submit" disabled={busy || !key.trim() || (!!cfg?.turnstileSiteKey && !tsToken)}>
            {busy ? t("Menghubungkan...") : t("Hubungkan key")}
          </button>
        </div>
        <p className={"err" + (err ? " show" : "")}>{err}</p>
        {ok ? <p style={{ color: "var(--ok, #22c55e)" }}>{ok}</p> : null}
      </form>
    </div>
  );
}

function useKeys(refresh: number): KeysData | null {
  const [data, setData] = useState<KeysData | null>(null);
  useEffect(() => {
    let alive = true;
    setData(null);
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
  }, [refresh]);
  return data;
}

function KeySecretRow({ k }: { k: KeyItem }) {
  const { t } = useLang();
  const [secret, setSecret] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [gone, setGone] = useState(false);

  if (gone) {
    return (
      <div className="kv">
        <span className="k">{t("Prefix")}</span>
        <span className="v mono">{k.prefix ? k.prefix + "........" : "-"}</span>
      </div>
    );
  }

  const masked = (k.prefix ?? "tip_") + "••••••••••••";

  async function ensureSecret(): Promise<string | null> {
    if (secret) return secret;
    setBusy(true);
    try {
      const d = await api.keySecret(k.id);
      setSecret(d.secret);
      return d.secret;
    } catch {
      setGone(true);
      return null;
    } finally {
      setBusy(false);
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

  async function copy() {
    const s = await ensureSecret();
    if (!s) return;
    try {
      await navigator.clipboard.writeText(s);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="kv">
      <span className="k">API Key</span>
      <span className="v mono" style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: shown ? "normal" : "nowrap", wordBreak: shown ? "break-all" : undefined }}>
          {shown && secret ? secret : masked}
        </span>
        <button type="button" className="iconbtn" onClick={toggle} disabled={busy} aria-label={shown ? t("Sembunyikan key") : t("Lihat key")} title={shown ? t("Sembunyikan") : t("Lihat key")}>
          {shown ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
        <button type="button" className="iconbtn" onClick={copy} disabled={busy} aria-label={t("Salin key")} title={t("Salin key")}>
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </span>
    </div>
  );
}

function StatusChip({ status }: { status: KeyItem["status"] }) {
  const { t } = useLang();
  if (status === "active") return <span className="chip ok">{t("Aktif")}</span>;
  if (status === "expired") return <span className="chip warn">{t("Habis")}</span>;
  return <span className="chip warn">{t("Nonaktif")}</span>;
}

function SourceChip({ k }: { k: KeyItem }) {
  const { t } = useLang();
  if (!k.source) return <span className="chip">-</span>;
  const cls = k.source.kind === "gacha" ? "chip src-gacha" : "chip src-beli";
  const label = k.source.kind === "gacha" ? t("Gacha Bansos") : t("Pembelian");
  let detail = k.source.detail;
  if (detail && k.source.kind === "gacha" && detail.endsWith(" jam")) {
    detail = t("{n} jam", { n: detail.slice(0, -" jam".length).trim() });
  }
  return (
    <span className={cls}>
      {label}
      {detail ? " · " + detail : ""}
    </span>
  );
}

function expiryText(k: KeyItem) {
  const left = daysLeft(k.expiresAt);
  if (!k.expiresAt) return tr("Tanpa masa habis");
  return left === 0
    ? tr("Habis sejak {date}", { date: fmtDate(k.expiresAt) })
    : tr("Sampai {date} ({days} hari lagi)", { date: fmtDate(k.expiresAt), days: left ?? 0 });
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

export default function Keys() {
  const { t } = useLang();
  const [refresh, setRefresh] = useState(0);
  const data = useKeys(refresh);
  const reason = data?.reason;
  const keys = data?.keys ?? [];

  let body: ReactNode;
  if (!data) {
    body = <p>{t("Mengambil data key.")}</p>;
  } else if (reason) {
    body = <ReasonMsg reason={reason} />;
  } else if (keys.length === 0) {
    body = (
      <>
        <p>
          {t("Belum ada key yang cocok buat akun ini. Kalau key kamu dari bot, hubungkan Telegram di menu Profil. Belum punya key? Beli lewat web, key langsung keluar.")}
        </p>
        <div className="btns">
          <Link className="btn primary" to="/beli">
            {t("Beli API key")}
          </Link>
        </div>
      </>
    );
  } else {
    const nBeli = keys.filter((k) => k.source?.kind === "beli").length;
    const nGacha = keys.filter((k) => k.source?.kind === "gacha").length;
    body = (
      <>
        <p style={{ marginTop: 0 }}>
          {t("{n} key", { n: keys.length })}: <b>{t("{n} hasil beli", { n: nBeli })}</b> · <b>{t("{n} hasil gacha bansos", { n: nGacha })}</b>
        </p>
        {keys.map((k, i) => (
          <Fragment key={k.id}>
            {i > 0 ? <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} /> : null}
            <div style={{ padding: "6px 0 2px" }}>
              <div className="kv">
                <span className="k">{t("Label")}</span>
                <span className="v">{k.label}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Sumber")}</span>
                <span className="v">
                  <SourceChip k={k} />
                </span>
              </div>
              {k.revealable ? (
                <KeySecretRow k={k} />
              ) : (
                <div className="kv">
                  <span className="k">{t("Prefix")}</span>
                  <span className="v mono">{k.prefix ? k.prefix + "........" : "-"}</span>
                </div>
              )}
              <div className="kv">
                <span className="k">{t("Status")}</span>
                <span className="v">
                  <StatusChip status={k.status} />
                </span>
              </div>
              <div className="kv">
                <span className="k">{t("Dibuat")}</span>
                <span className="v">{k.createdAt ? fmtDate(k.createdAt) : "-"}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Masa berlaku")}</span>
                <span className="v">{expiryText(k)}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Token terpakai")}</span>
                <span className="v">{fmtNum(k.tokensConsumed)}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Limit request")}</span>
                <span className="v">{k.requestsPerMinute ? t("{n}/menit", { n: k.requestsPerMinute }) : t("150/menit (fair use)")}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Request barengan")}</span>
                <span className="v">{k.maxConcurrentRequests ? t("maks {n}", { n: k.maxConcurrentRequests }) : "-"}</span>
              </div>
              <div className="kv">
                <span className="k">{t("Model tersedia")}</span>
                <span className="v">{t("{n} model", { n: k.modelCount || 0 })}</span>
              </div>
            </div>
          </Fragment>
        ))}
        <div className="btns">
          <Link className="btn primary" to="/beli">
            {t("Beli API Key Lagi")}
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="API Keys" sub={t("Detail key kamu: status, masa berlaku, dan limit.")} />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t("API key kamu")}</h2>
        <div>{body}</div>
      </div>
      <AddKeyCard onLinked={() => setRefresh((r) => r + 1)} />
    </>
  );
}
