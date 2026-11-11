import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Ticket, Github } from "lucide-react";

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" style={{ flex: "none" }}>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 30.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}
import { PublicLayout } from "../components/chrome";
import Turnstile, { type TurnstileHandle } from "../components/Turnstile";
import { api, rp, PACKAGES, promoDiscountLabel, usdIdr, toUsd, type Config, type OrderStatus, type CryptoInfo, type KeyItem } from "../lib/api";
import QRCode from "react-qr-code";
import { useSession } from "../lib/session";
import { useActivePromos } from "../lib/useActivePromos";
import { getLang, trEn } from "../lib/i18n";

// Package-grid / QR styles from the vanilla beli page (index.css only carries
// the shared components: card, btn, err, keybox, dot, hidden...).
const PAGE_STYLE = `
.pkgs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin-top:20px}
.pkg{display:grid;gap:3px;text-align:left;padding:16px;border-radius:14px;background:var(--panel);border:1px solid var(--border);color:var(--txt);cursor:pointer;font-family:inherit;width:100%}
.pkg:hover{border-color:var(--mut)}
.pkg.on{border-color:var(--txt);box-shadow:0 0 0 1px var(--txt)}
.pkg-name{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut)}
.pkg-price{font-size:21px;font-weight:800;letter-spacing:-.02em}
.pkg-usd{font-size:13px;font-weight:600;color:var(--faint)}
.pkg-days{font-size:12.5px;color:var(--faint)}
.qrimg{display:block;width:250px;height:250px;margin:14px auto;border-radius:12px;background:#fff;padding:8px;box-sizing:border-box}
.paytabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.paytab{padding:9px 16px;border-radius:10px;border:1px solid var(--border);background:transparent;color:var(--txt);font:inherit;font-size:14px;cursor:pointer}
.paytab.on{background:var(--txt);color:var(--bg);border-color:var(--txt);font-weight:600}
.addrbox{display:flex;gap:8px;align-items:center;justify-content:space-between;border:1px solid var(--border);border-radius:10px;padding:8px 10px;margin:8px auto;max-width:420px;font-size:13px}
.addrbox .btn{padding:6px 12px;font-size:13px;flex-shrink:0}
.amt{font-size:30px;font-weight:800;letter-spacing:-.02em;text-align:center}
.count{text-align:center;font-family:var(--font-mono);font-size:13px;color:var(--mut);margin-top:4px}
.custombox{margin-top:14px;border:1px dashed var(--border);border-radius:12px;padding:16px;background:var(--panel)}
.customgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-top:10px}
.customgrid label{font-size:12.5px;color:var(--mut);display:block;margin-bottom:4px}
.customgrid input{width:100%;padding:10px 12px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--txt);font:inherit;font-size:15px;box-sizing:border-box}
.customnote{font-size:12.5px;color:var(--faint);margin-top:10px}
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
  extend_login_required: "Login dulu buat bisa perpanjang key lama.",
  extend_not_yours: "Key yang dipilih bukan milik akunmu.",
  extend_key_invalid: "Key yang dipilih udah nggak valid. Pilih key lain atau bikin key baru.",
  extend_gacha_not_allowed: "Key gacha nggak bisa diperpanjang — kalau udah expired ya hangus. Beli key baru aja.",
  promo_not_for_package: "Kode promo ini cuma berlaku buat paket tertentu.",
  promo_invalid: "Format kode promo nggak valid.",
  promo_not_found: "Kode promo nggak ketemu. Cek lagi tulisannya.",
  promo_inactive: "Kode promo ini udah dinonaktifkan.",
  promo_expired: "Kode promo ini udah kedaluwarsa.",
  promo_exhausted: "Kuota kode promo ini udah habis.",
  promo_already_redeemed: "Kode promo ini udah pernah dipakai di akun / jaringan ini.",
  login_required: "Beli sekarang wajib login. Masuk dulu pakai Google/GitHub ya.",
};
const PROMO_ERR: Record<string, string> = {
  promo_invalid: "Format kode promo nggak valid.",
  promo_not_found: "Kode promo nggak ketemu. Cek lagi tulisannya.",
  promo_inactive: "Kode promo ini udah dinonaktifkan.",
  promo_expired: "Kode promo ini udah kedaluwarsa.",
  promo_exhausted: "Kuota kode promo ini udah habis.",
  promo_already_redeemed: "Kode promo ini udah pernah dipakai di akun / jaringan ini.",
  promo_not_for_package: "Kode promo ini cuma berlaku buat paket tertentu.",
  rate_limited: "Terlalu banyak percobaan, tunggu beberapa menit.",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mmss = (sec: number) => String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");

export default function Beli() {
  const { me, loading: sessionLoading } = useSession();
  // /buy is English-only (global buyers): every string on this page resolves
  // against the EN dict no matter what the site language toggle says.
  const t = trEn;
  const [searchParams, setSearchParams] = useSearchParams();

  const [selected, setSelected] = useState<string | null>(null);
  // Kurs USD->IDR buat tampilan konversi harga (display only).
  const [fx, setFx] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    usdIdr().then((r) => { if (alive) setFx(r); });
    return () => { alive = false; };
  }, []);
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [orderErr, setOrderErr] = useState("");
  const [creating, setCreating] = useState(false);
  // Kode promo (opsional).
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  // Cooldown anti-spam tombol cek kode: aktif 60 dtk setelah kena 429.
  const [promoCooldown, setPromoCooldown] = useState(false);
  const promoCooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (promoCooldownTimer.current) clearTimeout(promoCooldownTimer.current); }, []);
  // Kode promo cuma valid buat paket yang dipilih saat validasi — reset kalau paket diganti.
  useEffect(() => { clearPromo(); }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps
  // Info promo aktif + sisa kuota (poll 60 dtk).
  const activePromos = useActivePromos();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [qrisId, setQrisId] = useState<string | null>(null);
  // Payload QRIS mentah: kalau ada, QR dirender lokal (react-qr-code) tanpa
  // bergantung ke api.qrserver.com — itu penyebab kotak putih kadang-kadang.
  const [qrisPayload, setQrisPayload] = useState<string | null>(null);
  const [qrFailed, setQrFailed] = useState(false);
  const [qrKey, setQrKey] = useState(0);
  const [payMethod, setPayMethod] = useState<"qris" | "solana" | "base">("qris");
  const [crypto, setCrypto] = useState<CryptoInfo | null>(null);
  const [addrCopied, setAddrCopied] = useState(false);
  const [amtCopied, setAmtCopied] = useState(false);
  const [countDown, setCountDown] = useState("10:00");
  const [payStatus, setPayStatus] = useState("Menunggu pembayaran\u2026");
  const [cancelHidden, setCancelHidden] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const [doneKey, setDoneKey] = useState<string | null>(null);
  const [keyExpires, setKeyExpires] = useState<string | null>(null);
  const [wasExtended, setWasExtended] = useState(false);
  const [myKeys, setMyKeys] = useState<KeyItem[] | null>(null);
  const [keyMode, setKeyMode] = useState<"extend" | "new">("extend");
  const [extendKeyId, setExtendKeyId] = useState("");
  const [copied, setCopied] = useState(false);
  const [cfg, setCfg] = useState<Config | null>(null);
  const [tsToken, setTsToken] = useState<string | null>(null);
  // Custom package configurator
  const [customDays, setCustomDays] = useState(30);
  const [customRpm, setCustomRpm] = useState(150);
  const [customConc, setCustomConc] = useState(4);
  const tsRef = useRef<TurnstileHandle>(null);

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  useEffect(() => {
    if (!me) { setMyKeys(null); return; }
    api.keys()
      .then((d) => {
        const list = (d.keys ?? []).filter((k) => k.status !== "revoked");
        list.sort((a, b) => {
          const sa = a.status === "active" ? 0 : 1, sb = b.status === "active" ? 0 : 1;
          if (sa !== sb) return sa - sb;
          return Date.parse(b.expiresAt ?? b.createdAt) - Date.parse(a.expiresAt ?? a.createdAt);
        });
        setMyKeys(list);
        if (list.length > 0) setExtendKeyId(list[0].id);
      })
      .catch(() => setMyKeys([]));
  }, [me]);

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

  // /buy stays English-only: keep <html lang> English while this page is
  // mounted (title/meta are forced EN centrally in applyTitle), and restore
  // the toggle's language when leaving the page.
  useEffect(() => {
    document.documentElement.lang = "en";
    return () => {
      document.documentElement.lang = getLang() === "en" ? "en" : "id";
    };
  }, []);

  const emailNote = emailLocked
    ? t("Kamu lagi login, key nempel ke akun {email}. Nggak usah isi manual.", { email })
    : t("Buat label key + bukti order. Kalau kamu lagi login, otomatis keisi dari akun Google/GitHub kamu.");

  const showDone = useCallback((d: OrderStatus) => {
    setDoneKey(d.key ?? "");
    setWasExtended(!!d.extended);
    setKeyExpires(d.keyExpires ?? null);
    setOrderCode(d.orderCode ?? null);
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
        if (d.status === "minted") {
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

  const beginPayment = (id: string, amt: number, qris: string | null, expiresAt: string, scroll: boolean, method: "qris" | "solana" | "base" = "qris", ci: CryptoInfo | null = null, code: string | null = null, qp: string | null = null) => {
    expiresAtRef.current = expiresAt;
    orderIdRef.current = id;
    setOrderId(id);
    setOrderCode(code);
    setCodeCopied(false);
    setAmount(amt);
    setQrisId(qris);
    setQrisPayload(qp);
    setQrFailed(false);
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
        if (d.status === "minted") {
          showDone(d);
          return;
        }
        if (d.status === "expired") return;
        beginPayment(resumeId, d.amount, d.qrisId ?? null, d.expiresAt, false, (d.payMethod as "qris" | "solana" | "base") ?? "qris", d.crypto ?? null, d.orderCode ?? null, d.qrisPayload ?? null);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function applyPromo(forceCode?: string) {
    const code = (forceCode ?? promoInput).trim().toUpperCase();
    if (!code) return;
    if (!selected || selected === "custom") { setPromoMsg(t("Pilih paket dulu sebelum pakai kode promo.")); return; }
    setPromoChecking(true);
    setPromoMsg("");
    try {
      const d = await api.promoValidate(code, selected);
      if (d.valid) {
        setPromo(d.code ?? code);
        setPromoDiscount(d.discount_idr ?? 0);
        setPromoMsg(t("Kode {code} dipakai: hemat {disc}.", { code: d.code ?? code, disc: rp(d.discount_idr ?? 0) }));
      } else {
        setPromo(null);
        setPromoDiscount(0);
        setPromoMsg(t(PROMO_ERR[d.error ?? ""] ?? "Kode promo nggak valid."));
      }
    } catch (e) {
      // 429 jangan dibalas "coba lagi" generik — itu yang bikin buyer spam klik.
      const code = (e as { code?: string })?.code;
      const status = (e as { status?: number })?.status;
      if (status === 429 || code === "rate_limited") {
        setPromoMsg(t(PROMO_ERR.rate_limited));
        setPromoCooldown(true);
        if (promoCooldownTimer.current) clearTimeout(promoCooldownTimer.current);
        promoCooldownTimer.current = setTimeout(() => setPromoCooldown(false), 60 * 1000);
      } else {
        setPromoMsg(t("Gagal cek kode promo, coba lagi."));
      }
    } finally {
      setPromoChecking(false);
    }
  }

  function clearPromo() {
    setPromo(null);
    setPromoDiscount(0);
    setPromoInput("");
    setPromoMsg("");
  }

  async function createOrder() {
    setOrderErr("");
    setCreating(true);
    try {
      const d = await api.createOrder(selected ?? "", email.trim(), tsToken, payMethod, keyMode === "extend" && extendKeyId ? extendKeyId : undefined, promo);
      setDoneKey(null);
      const ci: CryptoInfo | null = d.crypto ?? (d.address && d.usdcAmount ? { chain: d.chain ?? payMethod, address: d.address, usdcAmount: d.usdcAmount, rate: d.rate, reference: d.reference, solanaPayUrl: d.solanaPayUrl } : null);
      beginPayment(d.id, d.amount, d.qrisId ?? null, d.expiresAt, true, payMethod, ci, d.orderCode ?? null, d.qrisPayload ?? null);
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
      copyTimer.current = setTimeout(() => { setAddrCopied(false); setAmtCopied(false); setCodeCopied(false); }, 1500);
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

  // Checkbox persetujuan S&K — wajib dicentang sebelum bisa bayar.
  const [agreed, setAgreed] = useState(false);
  const payDisabled = creating || !(selected && EMAIL_RE.test(email.trim())) || (!!cfg?.turnstileSiteKey && !tsToken) || !agreed;

  return (
    <PublicLayout>
      <style>{PAGE_STYLE}</style>
      <h1 className="page">
        {t("Beli paket")} <em>TipRouter.</em>
      </h1>
      <p className="sub">
        {t("Login pakai Google/GitHub, pilih paket, bayar pakai QRIS atau USDC (Solana / Base), API key langsung keluar di layar begitu pembayaran terdeteksi.")}
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
              <span className="pkg-price">{rp(p.price)}{toUsd(p.price, fx) && <span className="pkg-usd"> · {toUsd(p.price, fx)}</span>}</span>
              <span className="pkg-days">
                {t("{days} hari", { days: p.days })} &middot; {t(p.blurb)}
              </span>
            </button>
          ))}
          <button
            type="button"
            className={"pkg" + (selected === "custom" ? " on" : "")}
            onClick={() => setSelected("custom")}
          >
            <span className="pkg-name">Custom</span>
            <span className="pkg-price">{t("Atur sendiri")}</span>
            <span className="pkg-days">{t("RPM, concurrent & hari bebas")}</span>
          </button>
        </div>
        {selected === "custom" && (
          <div className="custombox">
            <b>{t("Paket custom")}</b>
            <div className="customgrid">
              <div>
                <label htmlFor="customDays">{t("Masa aktif (hari)")}</label>
                <input id="customDays" type="number" min={1} max={365} value={customDays}
                  onChange={(e) => setCustomDays(Math.max(1, Math.min(365, Number(e.target.value) || 1)))} />
              </div>
              <div>
                <label htmlFor="customRpm">{t("Request per menit")}</label>
                <input id="customRpm" type="number" min={10} max={10000} step={10} value={customRpm}
                  onChange={(e) => setCustomRpm(Math.max(10, Math.min(10000, Number(e.target.value) || 10)))} />
              </div>
              <div>
                <label htmlFor="customConc">{t("Max concurrent")}</label>
                <input id="customConc" type="number" min={1} max={100} value={customConc}
                  onChange={(e) => setCustomConc(Math.max(1, Math.min(100, Number(e.target.value) || 1)))} />
              </div>
            </div>
            <p className="customnote">{t("Harga dihitung admin sesuai spek. Klik tombol di bawah, pesananmu terkirim otomatis ke admin via Telegram.")}</p>
            <a
              className="btn primary"
              style={{ textDecoration: "none", display: "inline-block", marginTop: 6 }}
              href={`https://t.me/hermestele?text=${encodeURIComponent(
                `Hello admin, I'd like to order a custom TipRouter plan:\n- Duration: ${customDays} days\n- Requests per minute: ${customRpm}\n- Max concurrent: ${customConc}\n\nPlease let me know the price. Thank you.`
              )}`}
              target="_blank"
              rel="noopener"
            >
              {t("Chat admin & pesan custom")}
            </a>
          </div>
        )}
        {!sessionLoading && !me ? (
          <div style={{ marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <h2>{t("Login dulu buat beli")}</h2>
            <p className="muted" style={{ marginTop: 6 }}>
              {t("Beli sekarang wajib login. Masuk pakai Google atau GitHub, abis itu kamu balik lagi ke sini buat lanjut bayar. Key otomatis nempel ke akunmu.")}
            </p>
            <div className="btns">
              <a className="btn primary" href="/auth/google/start?next=/buy" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <GoogleIcon />
                {t("Masuk dengan Google")}
              </a>
              <a className="btn" href="/auth/github/start?next=/buy" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Github size={17} />
                {t("Masuk dengan GitHub")}
              </a>
            </div>
          </div>
        ) : (
          <>
        {selected && selected !== "custom" && (
          <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 14 }}>
            {activePromos && activePromos.length > 0 && !promo && (
              <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
                {activePromos.map((p) => (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => { setPromoInput(p.code); applyPromo(p.code); }}
                    disabled={promoChecking || promoCooldown}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, textAlign: "left",
                      padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                      border: "1px solid rgba(52,211,153,.4)", background: "rgba(52,211,153,.08)",
                      color: "var(--txt)", font: "inherit", width: "100%",
                    }}
                  >
                    <Ticket size={17} style={{ flex: "none", color: "#34d399" }} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontFamily: "var(--mono, monospace)", letterSpacing: ".04em" }}>{p.code}</strong>
                      <span className="muted" style={{ marginLeft: 8, fontSize: 13 }}>
                        {t("diskon {d}", { d: promoDiscountLabel(p) })}
                        {p.remaining != null ? ` · ${t("sisa {n}/{m}", { n: p.remaining, m: p.max_uses ?? 0 })}` : ""}
                      </span>
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399", flex: "none" }}>{t("Pakai")}</span>
                  </button>
                ))}
              </div>
            )}
            <label htmlFor="promoInput">{t("Kode promo (opsional)")}</label>
            {promo ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontFamily: "var(--mono, monospace)", background: "rgba(52,211,153,.12)", color: "#34d399", border: "1px solid rgba(52,211,153,.4)", borderRadius: 8, padding: "4px 10px" }}>{promo}</span>
                <span className="muted">{t("Hemat {disc}", { disc: rp(promoDiscount) })}</span>
                <button type="button" onClick={clearPromo} style={{ marginLeft: "auto", background: "none", border: "none", color: "var(--mut)", cursor: "pointer", textDecoration: "underline", fontSize: 13 }}>
                  {t("Hapus")}
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                <input
                  id="promoInput"
                  type="text"
                  placeholder={t("cth: HEMAT10")}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  style={{ textTransform: "uppercase", fontFamily: "inherit" }}
                  maxLength={32}
                />
                <button type="button" className="btn" onClick={() => applyPromo()} disabled={promoChecking || promoCooldown || !promoInput.trim()}>
                  {promoChecking ? t("Cek…") : promoCooldown ? t("Tunggu…") : t("Pakai")}
                </button>
              </div>
            )}
            {promoMsg && <p className="muted" style={{ marginTop: 6 }}>{promoMsg}</p>}
          </div>
        )}
        {selected !== "custom" && (
        <div style={{ display: "block", marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <label htmlFor="emailInput">{t("2. Email kamu")}</label>
          <input
            id="emailInput"
            type="email"
            placeholder={t("nama@email.com")}
            autoComplete="email"
            style={{ fontFamily: "inherit" }}
            value={email}
            readOnly={emailLocked}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="muted" style={{ marginTop: 6 }}>
            {emailNote}
          </p>
          {me && myKeys && myKeys.filter((k) => k.source?.kind !== "gacha").length > 0 && (
            <div style={{ marginTop: 18 }}>
              <label>{t("3. Key tujuan")}</label>
              <div className="paytabs" role="radiogroup" aria-label={t("3. Key tujuan")}>
                <button type="button" className={"paytab" + (keyMode === "extend" ? " on" : "")} onClick={() => setKeyMode("extend")}>
                  {t("Perpanjang key lama")}
                </button>
                <button type="button" className={"paytab" + (keyMode === "new" ? " on" : "")} onClick={() => setKeyMode("new")}>
                  {t("Buat key baru")}
                </button>
              </div>
              {keyMode === "extend" && (
                <>
                  <select
                    value={extendKeyId}
                    onChange={(e) => setExtendKeyId(e.target.value)}
                    style={{ fontFamily: "inherit", marginTop: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--panel)", color: "var(--txt)", fontSize: 14 }}
                  >
                    {myKeys.filter((k) => k.source?.kind !== "gacha").map((k) => (
                      <option key={k.id} value={k.id}>
                        {(k.prefix ?? "tip_") + "…" + (k.hint ?? "") + " \u00b7 " + (k.status === "active"
                          ? t("aktif sampai {date}", { date: new Date(k.expiresAt ?? k.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) })
                          : t("expired {date}", { date: new Date(k.expiresAt ?? k.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) }))}
                      </option>
                    ))}
                  </select>
                  <p className="muted" style={{ marginTop: 6 }}>
                    {t("Masa aktif key yang dipilih nambah sesuai paket yang dibeli. Key yang udah expired juga bisa diperpanjang \u2014 aktif lagi dihitung dari sekarang.")}
                  </p>
                </>
              )}
            </div>
          )}
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
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 16, cursor: "pointer", fontSize: 14, lineHeight: 1.55 }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{ marginTop: 3, width: 17, height: 17, flex: "none", accentColor: "var(--txt)", cursor: "pointer" }}
            />
            <span>
              {t("Saya sudah membaca dan menyetujui")}{" "}
              <Link to="/terms" target="_blank" rel="noopener" style={{ textDecoration: "underline", fontWeight: 600 }} onClick={(e) => e.stopPropagation()}>
                {t("Syarat & Ketentuan")}
              </Link>
              {t(" TipRouter.")}
            </span>
          </label>
          <div className="btns" style={{ marginTop: 14 }}>
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
        </div>
        )}
          </>
        )}
      </div>

      {payVisible && (
        <div className="card" ref={payCardRef}>
          <h2>{t(payMethod === "qris" ? "4. Scan & bayar" : "4. Kirim pembayaran")}</h2>
          {payMethod === "qris" ? (
            <>
              <p>{t("Pakai e-wallet / m-banking apa aja. Jangan ubah nominalnya.")}</p>
              <p className="amt">{rp(amount)}{toUsd(amount, fx) && <span className="pkg-usd"> · {toUsd(amount, fx)}</span>}</p>
              {qrisPayload ? (
                <div className="qrimg"><QRCode value={qrisPayload} size={234} style={{ width: "100%", height: "auto" }} /></div>
              ) : qrisId && !qrFailed ? (
                <img key={qrKey} className="qrimg" src={"/qr/" + qrisId} alt={t("QRIS pembayaran")} onError={() => setQrFailed(true)} />
              ) : qrisId ? (
                <div className="qrimg" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <p className="muted" style={{ margin: 0, fontSize: 13 }}>{t("QR gagal dimuat. Coba muat ulang, atau buat pembayaran baru kalau sudah kedaluwarsa.")}</p>
                  <button className="btn" type="button" onClick={() => { setQrFailed(false); setQrKey((k) => k + 1); }}>{t("Muat ulang QR")}</button>
                </div>
              ) : null}
            </>
          ) : crypto ? (
            <>
              <p>{t(payMethod === "solana" ? "Scan pakai wallet Solana (Phantom, Solflare, dll). Nominal & referensi keisi otomatis." : "Kirim dari wallet apa aja pakai jaringan Base. Hanya USDC native.")}</p>
              <p className="amt">{crypto.usdcAmount.toLocaleString("en-US", { maximumFractionDigits: 6 })} <span style={{ fontSize: "0.55em" }}>USDC</span></p>
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
                <span className="mono">{crypto.usdcAmount.toLocaleString("en-US", { maximumFractionDigits: 6 })} USDC</span>
                <button className="btn" type="button" onClick={() => copyText(String(crypto.usdcAmount), setAmtCopied)}>{amtCopied ? t("Tersalin") : t("Salin nominal")}</button>
              </div>
              <p className="muted" style={{ marginTop: 10 }}>
                {t("Kirim persis nominal di atas. Biaya jaringan (gas) ditanggung wallet kamu, bukan dari nominal ini.")}
              </p>
            </>
          ) : null}
          {orderCode && (
            <div className="addrbox">
              <span style={{ fontSize: 12.5, color: "var(--mut)" }}>{t("ID Transaksi")}</span>
              <span className="mono" style={{ fontWeight: 700, letterSpacing: "0.04em" }}>{orderCode}</span>
              <button className="btn" type="button" onClick={() => copyText(orderCode, setCodeCopied)}>{codeCopied ? t("Tersalin") : t("Salin")}</button>
            </div>
          )}
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
          {wasExtended ? (
            <>
              <h2>{t("Key diperpanjang")}</h2>
              <p>{t("Masa aktif key-mu udah nambah sesuai paket yang dibeli. Key yang sama, masa aktif yang baru.")}</p>
              <div className="btns">
                <Link className="btn primary" to="/dashboard/keys">
                  {t("Lihat key saya")}
                </Link>
              </div>
            </>
          ) : (
            <>
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
            </>
          )}
          {keyExpires && (
            <p className="muted" style={{ marginTop: 10 }}>
              {t("Masa aktif key sampai {date}.", {
                date: new Date(keyExpires).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }),
              })}
            </p>
          )}
          {orderCode && (
            <p className="muted" style={{ marginTop: 6 }}>
              {t("ID Transaksi")}: <span className="mono" style={{ fontWeight: 700 }}>{orderCode}</span>
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
