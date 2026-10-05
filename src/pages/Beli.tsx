import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { PublicLayout } from "../components/chrome";
import { api, rp, PACKAGES, type OrderStatus } from "../lib/api";
import { useSession } from "../lib/session";

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
.amt{font-size:30px;font-weight:800;letter-spacing:-.02em;text-align:center}
.count{text-align:center;font-family:var(--font-mono);font-size:13px;color:var(--mut);margin-top:4px}
`;

const ORDER_ERR: Record<string, string> = {
  invalid_email: "Emailnya belum bener.",
  invalid_package: "Pilih paket dulu.",
  gateway_off: "Pembayaran lagi belum aktif, coba sebentar lagi.",
  gateway_failed: "QRIS gagal dibuat, coba lagi.",
  busy: "Lagi ramai, coba lagi sebentar.",
  rate_limited: "Terlalu banyak percobaan, tunggu beberapa menit.",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const mmss = (sec: number) => String(Math.floor(sec / 60)).padStart(2, "0") + ":" + String(sec % 60).padStart(2, "0");

export default function Beli() {
  const { me } = useSession();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailLocked, setEmailLocked] = useState(false);
  const [orderErr, setOrderErr] = useState("");
  const [creating, setCreating] = useState(false);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [amount, setAmount] = useState(0);
  const [qrisId, setQrisId] = useState<string | null>(null);
  const [countDown, setCountDown] = useState("10:00");
  const [payStatus, setPayStatus] = useState("Menunggu pembayaran\u2026");
  const [cancelHidden, setCancelHidden] = useState(false);
  const [payVisible, setPayVisible] = useState(false);

  const [doneKey, setDoneKey] = useState<string | null>(null);
  const [keyExpires, setKeyExpires] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    ? `Kamu lagi login, key nempel ke akun ${email}. Nggak usah isi manual.`
    : "Buat label key + bukti order. Kalau kamu lagi login, otomatis keisi dari akun Google/GitHub kamu.";

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
          setPayStatus("Pembayaran masuk setelah batas 10 menit. Hubungi admin ya, sebut nominal persisnya biar dibantu.");
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
          setPayStatus("Waktu habis. Buat QRIS baru ya.");
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

  const beginPayment = (id: string, amt: number, qris: string | null, expiresAt: string, scroll: boolean) => {
    expiresAtRef.current = expiresAt;
    orderIdRef.current = id;
    setOrderId(id);
    setAmount(amt);
    setQrisId(qris);
    setCancelHidden(false);
    setPayStatus("Menunggu pembayaran\u2026");
    setCountDown("10:00");
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
        beginPayment(resumeId, d.amount, d.qrisId ?? null, d.expiresAt, false);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeId]);

  async function createOrder() {
    setOrderErr("");
    setCreating(true);
    try {
      const d = await api.createOrder(selected ?? "", email.trim());
      setDoneKey(null);
      beginPayment(d.id, d.amount, d.qrisId, d.expiresAt, true);
      setSearchParams({ order: d.id }, { replace: true });
    } catch (e) {
      const code = (e as { code?: string }).code;
      setOrderErr(code ? (ORDER_ERR[code] ?? "Gagal bikin order, coba lagi.") : "Jaringan bermasalah, coba lagi.");
    } finally {
      setCreating(false);
    }
  }

  async function cancel() {
    if (!orderId) return;
    if (!confirm("Batalkan pembayaran ini? QRIS-nya langsung nggak berlaku.")) return;
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

  function copyKey() {
    if (!doneKey || !navigator.clipboard) return;
    navigator.clipboard.writeText(doneKey).then(() => {
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1500);
    });
  }

  const payDisabled = creating || !(selected && EMAIL_RE.test(email.trim()));

  return (
    <PublicLayout>
      <style>{PAGE_STYLE}</style>
      <h1 className="page">
        Beli paket <em>TipRouter.</em>
      </h1>
      <p className="sub">
        Pilih paket, bayar pakai QRIS (e-wallet / m-banking apa aja), API key langsung keluar di layar begitu
        pembayaran terdeteksi. Tanpa daftar, tanpa nunggu admin.
      </p>

      <div className="card">
        <h2>1. Pilih paket</h2>
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
                {p.days} hari &middot; {p.blurb}
              </span>
            </button>
          ))}
          <a
            className="pkg"
            href="https://t.me/tiprouter_bot"
            target="_blank"
            rel="noopener"
            style={{ textDecoration: "none" }}
          >
            <span className="pkg-name">Custom</span>
            <span className="pkg-price">Chat dulu</span>
            <span className="pkg-days">Di luar daftar? Tanya admin</span>
          </a>
        </div>
        <div style={{ display: "block", marginTop: 18, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <label htmlFor="emailInput">2. Email kamu</label>
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
          <p className={"err" + (orderErr ? " show" : "")}>{orderErr}</p>
          <div className="btns">
            <button className="btn primary" type="button" disabled={payDisabled} onClick={createOrder}>
              {creating ? "Bikin QRIS\u2026" : "Buat QRIS Pembayaran"}
            </button>
          </div>
          <p className="muted" style={{ marginTop: 10 }}>
            Harga akhir ditambah kode unik Rp1&ndash;500 biar pembayaranmu gampang dicocokin. Bayar persis nominal yang
            tampil ya.
          </p>
        </div>
      </div>

      {payVisible && (
        <div className="card" ref={payCardRef}>
          <h2>3. Scan &amp; bayar</h2>
          <p>Pakai e-wallet / m-banking apa aja. Jangan ubah nominalnya.</p>
          <p className="amt">{rp(amount)}</p>
          {qrisId && <img className="qrimg" src={"/qr/" + qrisId} alt="QRIS pembayaran" />}
          <p className="count">
            Sisa waktu <span>{countDown}</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 8 }}>
            <span className="dot" />
            <span>{payStatus}</span>
          </p>
          <div className="btns">
            {!cancelHidden && (
              <button className="btn" type="button" onClick={cancel}>
                Batalkan pembayaran
              </button>
            )}
          </div>
        </div>
      )}

      {doneKey !== null && (
        <div className="card" ref={doneCardRef}>
          <h2>Pembayaran diterima</h2>
          <p>Ini API key kamu. Simpan baik-baik, jangan dishare ke siapa pun.</p>
          <div className="keybox">{doneKey}</div>
          <div className="btns">
            <button className="btn primary" type="button" onClick={copyKey}>
              {copied ? "Tersalin" : "Salin Key"}
            </button>
            <Link className="btn" to="/login">
              Masuk pakai key ini
            </Link>
          </div>
          {keyExpires && (
            <p className="muted" style={{ marginTop: 10 }}>
              Masa aktif key sampai{" "}
              {new Date(keyExpires).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.
            </p>
          )}
          <p className="muted">
            Base URL: <span className="mono">https://tiprouter.my.id/v1</span> &middot; format OpenAI. Panduan lengkap
            ada di halaman Panduan setelah masuk.
          </p>
        </div>
      )}
    </PublicLayout>
  );
}
