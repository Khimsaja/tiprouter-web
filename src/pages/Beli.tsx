import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicLayout } from "../components/chrome";
import Turnstile, { type TurnstileHandle } from "../components/Turnstile";
import { api, rp, PACKAGES, type Config, type OrderStatus, type CryptoInfo } from "../lib/api";
import QRCode from "react-qr-code";
import { useSession } from "../lib/session";
import { localeTag, useLang } from "../lib/i18n";

// Package-grid / QR styles from the vanilla beli page (index.css only carries
// the shared components: card, btn, err, keybox, dot, hidden...).
const PAGE_STYLE = `
.pkgs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:20px}
.pkg{display:grid;gap:3px;text-align:left;padding:16px;border-radius:14px;background:var(--panel);border:1px solid var(--border);color:var(--txt);cursor:pointer;font-family:inherit;width:100%}
.pkg:hover{border-color:var(--mut)}
.pkg.on{border-color:var(--txt);box-shadow:0 0 0 1px var(--txt)}
.pkg-name{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.pkg-price{font-size:21px;font-weight:800;letter-spacing:-.02em}
.pkg-days{font-size:12.5px;color:var(--faint)}
.qrimg{display:block;width:250px;height:250px;margin:14px auto;border-radius:12px;background:#fff;padding:8px;box-sizing:border-box}
.paytabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.paytab{padding:9px 16px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--txt);font:inherit;font-size:14px;cursor:pointer}
.paytab.on{background:var(--txt);color:var(--bg);border-color:var(--txt);font-weight:600}
.addrbox{display:flex;gap:8px;align-items:center;justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:8px 10px;margin:8px auto;max-width:420px;font-size:13px}
.addrbox .btn{padding:6px 12px;font-size:13px;flex-shrink:0}
.amt{font-size:30px;font-weight:800;letter-spacing:-.02em;text-align:center}
.count{text-align:center;font-family:var(--font-mono);font-size:13px;color:var(--mut);margin-top:4px}
`;

const ORDER_ERR: Record<string, string> = {
  invalid_email: "Emailnya belum bener.",
  invalid_package: "Pilih paket dulu.",
  gateway_off: "Pembayaran lagi belum aktif, coba sebentar lagi.",
  gateway_failed: "QRIS gagal dibuat, coba lagi.",
  crypto_unavailable: "Pembayaran crypto lagi nggak tersedia, coba lagi nanti.",
  rate_unavailable: "Kurs lagi nggak bisa diambil, coba lagi.",
  busy: "Lagi ramai, coba lagi sebentar.",
  rate_limited: "Terlalu banyak percobaan, tunggu beberapa menit.",
  turnstile_failed: "Verifikasi anti-bot gagal. Selesaikan verifikasinya, lalu coba lagi.",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mmss = (sec: number) => String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");

export default function Beli() {
  const { me } = useSession();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [orderErr, setOrderErr] = useState("");
  const [creating, setCreating] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [qrisId, setQrisId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<"qris" | "solana" | "base">("qris");
  const [crypto, setCrypto] = useState<CryptoInfo | null>(null);
  const [addrCopied, setAddrCopied] = useState(false);
  const [amtCopied, setAmtCopied] = useState(false);
  const [countDown, setCountDown] = useState("10:00");
  const [payStatus, setPayStatus] = useState("Menunggu pembayaran\u2026");
  const [cancelHidden, setCancelHidden] = useState(false);
  const [payVisible, setPayVisible] = useState(false);

  const [doneKey, setDoneKey] = useState<string | null>(null);
  const [keyExpires, setKeyExpires] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [tsToken, setTsToken] = useState<string | null>(null);
  const tsRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  const orderIdRef = useRef<string | null>(null);
  orderIdRef.current = orderId;
  const expiresAtRef = useRef("");
  const payCardRef = useRef<HTMLDivElement>(null);
  const doneCardRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Prefill email from the session identity (server forces it anyway when logged in).
  const sessionEmail = me?.user.email ?? null;
  useEffect(() => {
    if (sessionEmail) {
      setEmail(sessionEmail);
      setEmailLocked(true);
    }
  }, [sessionEmail]);

  const emailNote = emailLocked
    ? t("Kamu lagi login, key nempel ke akun {email}. Nggak usah isi manual.", { email })
    : t("Buat label key + bukti order. Kalau kamu lagi login, otomatis keisi dari akun Google/GitHub kamu.");

  const showDone = useCallback((d: OrderStatus) => {
    setDoneKey(d.key ?? "");
    setKeyExpires(d.keyExpires ?? null);
    setPayVisible(false);
    requestAnimationFrame(() => doneCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  }, []);

  // Polling + countdown, mirroring startPolling()/stopTimers() in the source:
  // countdown ticks every 500ms, order status every 5s, both stop at 0 / terminal state.
  useEffect(() => {
    if (!payVisible || !orderId) return;
    const expireAt = Date.parse(expiresAtRef.current);
    let stopped = false;
    const tick = () => {
      const left = Math.max(0, Math.floor((expireAt - Date.now()) / 1000));
      setCountDown(mmss(left));
      if (left <= 0) {
        stopped = true;
        clearInterval(cdTimer);
        clearInterval(pollTimer);
      }
    };
    const pollOnce = async () => {
      const id = orderIdRef.current;
      if (!id || stopped) return;
      try {
        const d = await api.orderStatus(id);
        if (stopped) return;
        if (d.status === "minted" && d.key) {
          stopped = true;
          clearInterval(cdTimer);
          clearInterval(pollTimer);
          showDone(d);
          return;
        }
        if (d.status === "paid") {
          setPayStatus("Pembayaran diterima, key lagi dibuat\u2026");
          return;
        }
        if (d.status === "paid_late") {
          stopped = true;
          clearInterval(cdTimer);
          clearInterval(pollTimer);
          setPayStatus("Pembayaran masuk setelah batas waktu. Hubungi admin ya, sebut nominal persisnya biar dibantu.");
          setCancelHidden(true);
          return;
        }
        if (d.status === "cancelled") {
          stopped = true;
          clearInterval(cdTimer);
          clearInterval(pollTimer);
          setPayStatus("Order dibatalkan.");
          return;
        }
        if (d.status === "expired") {
          stopped = true;
          clearInterval(cdTimer);
          clearInterval(pollTimer);
          setPayStatus("Waktu habis. Buat pembayaran baru ya.");
          return;
        }
        setPayStatus("Menunggu pembayaran\u2026");
      } catch {
        /* source swallows poll errors silently */
      }
    };
    const cdTimer = setInterval(tick, 500);
    tick();
    const pollTimer = setInterval(pollOnce, 5000);
    void pollOnce();
    return () => {
      clearInterval(cdTimer);
      clearInterval(pollTimer);
    };
  }, [payVisible, orderId, showDone]);

  const beginPayment = (id: string, amt: number, qris: string | null, expiresAt: string, scroll: boolean, method: "qris" | "solana" | "base" = "qris", ci: CryptoInfo | null = null) => {
    expiresAtRef.current = expiresAt;
    orderIdRef.current = id;
    setOrderId(id);
    setAmount(amt);
    setQrisId(qris);
    setPayMethod(method);
    setCrypto(ci);
    setCancelHidden(false);
    setPayStatus("Menunggu pembayaran\u2026");
    setCountDown(method === "qris" ? "10:00" : "15:00");
    setPayVisible(true);
    if (scroll) requestAnimationFrame(() => payCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  // Resume an in-flight order from ?order=<id>, exactly like the source script.
  const resumeId = searchParams.get("order");
  const resumedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!resumeId || resumedRef.current === resumeId) return;
    resumedRef.current = resumeId;
    api
      .orderStatus(resumeId)
      .then((d) => {
        if (d.status === "minted" && d.key) {
          showDone(d);
          return;
        }
        if (d.status === "expired") return;
        beginPayment(resumeId, d.amount, d.qrisId ?? null, d.expiresAt, false, (d.payMethod as "qris" | "solana" | "base") ?? "qris", d.crypto ?? null);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function createOrder() {
    setOrderErr("");
    setCreating(true);
    try {
      const d = await api.createOrder(selected ?? "", email.trim(), tsToken, payMethod);
      setDoneKey(null);
      const ci: CryptoInfo | null = d.crypto ?? (d.address && d.usdcAmount ? { chain: d.chain ?? payMethod, address: d.address, usdcAmount: d.usdcAmount, rate: d.rate, reference: d.reference, solanaPayUrl: d.solanaPayUrl } : null);
      beginPayment(d.id, d.amount, d.qrisId ?? null, d.expiresAt, true, payMethod, ci);
      setSearchParams({ order: d.id }, { replace: true });
    } catch (e) {
      const code = (e as { code?: string }).code;
      setOrderErr(code ? (ORDER_ERR[code] ?? "Gagal bikin order, coba lagi.") : "Jaringan bermasalah, coba lagi.");
      tsRef.current?.reset();
    } finally {
      setCreating(false);
    }
  }

  async function cancel() {
    if (!orderId) return;
    if (!confirm(t(payMethod === "qris" ? "Batalkan pembayaran ini? QRIS-nya langsung nggak berlaku." : "Batalkan pembayaran ini? Kalau kamu udah kirim crypto, nggak bisa dibatalin dari sini."))) return;
    try {
      await api.cancelOrder(orderId);
    } catch {
      /* source hides the card regardless of the cancel response */
    }
    setPayVisible(false);
    setOrderId(null);
    orderIdRef.current = null;
    setSearchParams({}, { replace: true });
    setOrderErr("Order dibatalkan. Pilih paket lagi kalau mau lanjut.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function copyText(v: string, done: (b: boolean) => void) {
    if (!v || !navigator.clipboard) return;
    navigator.clipboard.writeText(v).then(() => {
      done(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => { setAddrCopied(false); setAmtCopied(false); }, 1500);
    });
  }

  function copyKey() {
    if (!doneKey || !navigator.clipboard) return;
    navigator.clipboard.writeText(doneKey).then(() => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    });
  }

  const payDisabled = creating || !(selected && EMAIL_RE.test(email.trim())) || (!!cfg?.turnstileSiteKey && !tsToken);

  return (
    <PublicLayout>
      <style>{PAGE_STYLE}</style>
      <h1 className="page">
        {t("Beli paket")} <em>TipRouter.</em>
      </h1>
      <p className="sub">
        {t("Pilih paket, bayar pakai QRIS atau USDC (Solana / Base), API key langsung keluar di layar begitu pembayaran terdeteksi. Tanpa daftar, tanpa nunggu admin.")}
      </p>

      <div className="card">
        <h2>{t("1. Pilih paket")}</h2>
        <div className="pkgs">
          {PACKAGES.map((p) => (
            <button
              key={p.key}
              type="button"
              className={"pkg" + (selected === p.key ? " on" : "")}
              onClick={() => setSelected(p.key)}
            >
              <span className="pkg-name">{p.name}</span>
              <span className="pkg-price">{rp(p.price)}</span>
              <span className="pkg-days">
                {t("{days} hari", { days: p.days })} &middot; {t(p.blurb)}
              </span>
            </button>
          ))}
          <a
            className="pkg"
            href="https://t.me/hermestele"
            target="_blank"
            rel="noopener"
            style={{ textDecoration: "none" }}
          >
            <span className="pkg-name">Custom</span>
            <span className="pkg-price">{t("Chat dulu")}</span>
            <span className="pkg-days">{t("Di luar daftar? Tanya admin")}</span>
          </a>
        </div>
        <div style={{ display: "block", marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <label htmlFor="emailInput">{t("2. Email kamu")}</label>
          <input
            id="emailInput"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            style={{ fontFamily: "inherit" }}
            value={email}
            readOnly={emailLocked}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="muted" style={{ marginTop: 6 }}>
            {emailNote}
          </p>
          <div style={{ marginTop: 18 }}>
            <label>{t("Metode pembayaran")}</label>
            <div className="paytabs">
              <button type="button" className={"paytab" + (payMethod === "qris" ? " on" : "")} onClick={() => setPayMethod("qris")}>QRIS</button>
              {cfg?.crypto?.solana ? <button type="button" className={"paytab" + (payMethod === "solana" ? " on" : "")} onClick={() => setPayMethod("solana")}>Solana · USDC</button> : null}
              {cfg?.crypto?.base ? <button type="button" className={"paytab" + (payMethod === "base" ? " on" : "")} onClick={() => setPayMethod("base")}>Base · USDC</button> : null}
            </div>
          </div>
          <p className={"err" + (orderErr ? " show" : "")}>{t(orderErr)}</p>
          {cfg?.turnstileSiteKey ? <Turnstile ref={tsRef} siteKey={cfg.turnstileSiteKey} onToken={setTsToken} /> : null}
          <div className="btns">
            <button className="btn primary" type="button" disabled={payDisabled} onClick={createOrder}>
              {creating ? t("Bikin pembayaran\u2026") : t("Buat Pembayaran")}
            </button>
          </div>
          {payMethod === "qris" ? (
            <p className="muted" style={{ marginTop: 10 }}>
              {t("Harga akhir ditambah kode unik Rp1–500 biar pembayaranmu gampang dicocokin. Bayar persis nominal yang tampil ya.")}
            </p>
          ) : (
            <p className="muted" style={{ marginTop: 10 }}>
              {t("Nominal dikonversi ke USDC pakai kurs live saat order dibuat, tanpa markup, dikunci 15 menit. Biaya jaringan ditanggung wallet kamu.")}
            </p>
          )}
          <p className="muted" style={{ marginTop: 6 }}>
            {t("Dengan melanjutkan pembelian, kamu menyetujui")}{" "}
            <Link to="/syarat" style={{ textDecoration: "underline" }}>
              {t("Syarat & Ketentuan")}
            </Link>
            {t(".")}
          </p>
        </div>
      </div>

      {payVisible && (
        <div className="card" ref={payCardRef}>
          <h2>{t(payMethod === "qris" ? "3. Scan & bayar" : "3. Kirim pembayaran")}</h2>
          {payMethod === "qris" ? (
            <>
              <p>{t("Pakai e-wallet / m-banking apa aja. Jangan ubah nominalnya.")}</p>
              <p className="amt">{rp(amount)}</p>
              {qrisId && <img className="qrimg" src={"/qr/" + qrisId} alt={t("QRIS pembayaran")} />}
            </>
          ) : crypto ? (
            <>
              <p>{t(payMethod === "solana" ? "Scan pakai wallet Solana (Phantom, Solflare, dll). Nominal & referensi keisi otomatis." : "Kirim dari wallet apa aja pakai jaringan Base. Hanya USDC native.")}</p>
              <p className="amt">{crypto.usdcAmount.toLocaleString(localeTag(), { maximumFractionDigits: 6 })} <span style={{ fontSize: "0.55em" }}>USDC</span></p>
              <p className="muted" style={{ textAlign: "center", marginTop: -6 }}>
                {t("Jaringan")}: {crypto.chain === "solana" ? "Solana" : "Base"}
              </p>
              {crypto.solanaPayUrl ? (
                <div className="qrimg"><QRCode value={crypto.solanaPayUrl} size={234} style={{ width: "100%", height: "auto" }} /></div>
              ) : (
                <div className="qrimg"><QRCode value={crypto.address} size={234} style={{ width: "100%", height: "auto" }} /></div>
              )}
              <div className="addrbox">
                <span className="mono" style={{ overflowWrap: "anywhere" }}>{crypto.address}</span>
                <button className="btn" type="button" onClick={() => copyText(crypto.address, setAddrCopied)}>{addrCopied ? t("Tersalin") : t("Salin alamat")}</button>
              </div>
              <div className="addrbox">
                <span className="mono">{crypto.usdcAmount.toLocaleString(localeTag(), { maximumFractionDigits: 6 })} USDC</span>
                <button className="btn" type="button" onClick={() => copyText(String(crypto.usdcAmount), setAmtCopied)}>{amtCopied ? t("Tersalin") : t("Salin nominal")}</button>
              </div>
              <p className="muted" style={{ marginTop: 10 }}>
                {t("Kirim persis nominal di atas. Biaya jaringan (gas) ditanggung wallet kamu, bukan dari nominal ini.")}
              </p>
            </>
          ) : null}
          <p className="count">
            {t("Sisa waktu")} <span>{countDown}</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 8 }}>
            <span className="dot" />
            <span>{t(payStatus)}</span>
          </p>
          <div className="btns">
            {!cancelHidden && (
              <button className="btn" type="button" onClick={cancel}>
                {t("Batalkan pembayaran")}
              </button>
            )}
          </div>
        </div>
      )}

      {doneKey !== null && (
        <div className="card" ref={doneCardRef}>
          <h2>{t("Pembayaran diterima")}</h2>
          <p>{t("Ini API key kamu. Simpan baik-baik, jangan dishare ke siapa pun.")}</p>
          <div className="keybox">{doneKey}</div>
          <div className="btns">
            <button className="btn primary" type="button" onClick={copyKey}>
              {copied ? t("Tersalin") : t("Salin Key")}
            </button>
            <Link className="btn" to="/login">
              {t("Masuk pakai key ini")}
            </Link>
          </div>
          {keyExpires && (
            <p className="muted" style={{ marginTop: 10 }}>
              {t("Masa aktif key sampai {date}.", {
                date: new Date(keyExpires).toLocaleString(localeTag(), { dateStyle: "long", timeStyle: "short" }),
              })}
            </p>
          )}
          <p className="muted">
            Base URL: <span className="mono">https://tiprouter.my.id/v1</span> &middot;{" "}
            {t("format OpenAI. Panduan lengkap ada di halaman Panduan setelah masuk.")}
          </p>
        </div>
      )}
    </PublicLayout>
  );
}
