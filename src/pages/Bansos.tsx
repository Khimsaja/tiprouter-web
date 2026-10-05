import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../components/chrome";
import { useSession } from "../lib/session";
import { api, type GachaState } from "../lib/api";

type Claimed = Extract<GachaState, { claimed: true }>;

const TIER_ODDS = [
  { h: 1, p: "30%" },
  { h: 2, p: "20%" },
  { h: 3, p: "15%" },
  { h: 6, p: "15%" },
  { h: 12, p: "12%" },
  { h: 24, p: "8%" },
];
const TIERS = TIER_ODDS.map((t) => t.h);

const SPIN_ERR: Record<string, string> = {
  ip_used: "IP ini udah pernah dipakai gacha. Satu IP cuma 1x.",
  rate_limited: "Terlalu banyak percobaan, tunggu beberapa menit.",
  mint_failed: "Key gagal dibuat, coba lagi sebentar.",
  gacha_off: "Gacha lagi belum aktif, coba sebentar lagi.",
  unauthorized: "Sesi habis, login lagi ya.",
};

function fmtRemain(sec: number) {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return p(h) + ":" + p(m) + ":" + p(ss);
}

const CSS = `
.bn-badge{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--green);color:var(--green);font-size:13px;font-weight:700;padding:7px 13px;border-radius:999px}
.bn-badge .pulse{width:8px;height:8px;border-radius:50%;background:var(--green);animation:bnPulse 2s infinite}
@keyframes bnPulse{0%{box-shadow:0 0 0 0 rgba(31,157,85,.45)}70%{box-shadow:0 0 0 9px rgba(31,157,85,0)}100%{box-shadow:0 0 0 0 rgba(31,157,85,0)}}
.bn-h1{font-size:clamp(36px,6vw,56px);font-weight:800;line-height:1.05;letter-spacing:-.02em;margin:16px 0 12px}
.bn-h1 em{font-style:normal;color:var(--faint)}
.bn-sub{color:var(--mut);font-size:clamp(15px,2.4vw,17px);max-width:620px;line-height:1.6}
.bn-sub b{color:var(--txt)}
.bn-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px;align-items:start}
.bn-card{margin-top:0}
.bn-card h2{font-size:12.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;gap:10px}
.bn-note{font-size:12.5px;color:var(--faint);margin-top:12px;line-height:1.55}
.bn-steps{display:flex;flex-direction:column;gap:14px}
.bn-step{display:flex;gap:14px}
.bn-step .n{flex:none;width:32px;height:32px;border-radius:50%;background:var(--txt);color:var(--bg);display:grid;place-items:center;font-weight:800;font-size:15px}
.bn-step p{color:var(--mut);font-size:15px;line-height:1.55;padding-top:5px}
.bn-step p b{color:var(--txt)}
.bn-rules{list-style:none;display:flex;flex-direction:column;gap:10px}
.bn-rules li{color:var(--mut);font-size:14.5px;line-height:1.55;padding-left:22px;position:relative}
.bn-rules li:before{content:"";position:absolute;left:2px;top:9px;width:7px;height:7px;border-radius:2px;background:var(--txt)}
.bn-rules li b{color:var(--txt)}
.bn-rules li a{font-weight:700;text-decoration:underline}
.bn-full{grid-column:1/-1}
.bn-foot-note{margin-top:36px;color:var(--faint);font-size:13px;text-align:center;line-height:1.7}
.bn-foot-note a{font-weight:700;text-decoration:underline}
.bn-tiers{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:16px}
.bn-tier{border:1px solid var(--border);border-radius:14px;padding:16px 10px;text-align:center;background:var(--panel);transition:all .12s}
.bn-tier .h{font-size:26px;font-weight:800;letter-spacing:-.02em;color:var(--txt)}
.bn-tier .u{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-top:2px}
.bn-tier .p{font-size:11.5px;font-weight:700;color:var(--faint);margin-top:6px;font-family:var(--font-mono)}
.bn-tier.lit{border-color:var(--txt);box-shadow:0 0 0 1px var(--txt);transform:scale(1.03)}
.bn-tier.win{border-color:var(--green);box-shadow:0 0 0 1px var(--green)}
.bn-tier.jackpot .h{color:var(--green)}
.bn-spin{text-align:center;margin-top:22px}
.bn-spin .btn{font-size:16px;padding:14px 34px}
.bn-spin .muted{margin-top:10px}
.bn-keybox{font-family:var(--font-mono);font-size:14px;word-break:break-all;background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-top:14px;color:var(--txt)}
.bn-btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.bn-remain{font-family:var(--font-mono);font-size:30px;font-weight:800;letter-spacing:.02em;text-align:center;margin-top:6px;color:var(--txt)}
.bn-pill{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:3px 10px;border-radius:99px;border:1px solid var(--border);color:var(--mut)}
.bn-pill.ok{color:var(--green);border-color:var(--green)}
.bn-pill.exp{color:var(--red);border-color:var(--red)}
.bn-center{text-align:center}
@media (max-width:880px){.bn-grid{grid-template-columns:1fr}.bn-tiers{grid-template-columns:repeat(2,1fr)}}
@media (max-width:560px){
  .bn-h1{font-size:34px}
  .bn-spin .btn{width:100%}
}
`;

export default function Bansos() {
  const { me: user, loading: sessionLoading } = useSession();
  const [checking, setChecking] = useState(false);
  const [ipUsed, setIpUsed] = useState(false);
  const [result, setResult] = useState<Claimed | null>(null);
  const [lit, setLit] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [err, setErr] = useState("");
  const [copyLabel, setCopyLabel] = useState("Salin Key");
  const [remainSec, setRemainSec] = useState<number | null>(null);
  const timers = useRef<number[]>([]);
  const copyTimer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(copyTimer.current);
    },
    [],
  );

  // Once logged in, check whether this account already claimed.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    setChecking(true);
    api
      .gacha()
      .then((d) => {
        if (!alive) return;
        setChecking(false);
        if (d.claimed) setResult(d);
        else if (d.ipUsed) setIpUsed(true);
      })
      .catch(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  // Live remaining countdown while a result is on screen.
  useEffect(() => {
    if (!result) return;
    const tick = () => setRemainSec(Math.floor((Date.parse(result.expiresAt) - Date.now()) / 1000));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [result]);

  function animateTo(hours: number, done: () => void) {
    const target = Math.max(0, TIERS.indexOf(hours));
    const steps = 24 + target;
    let i = 0;
    const step = () => {
      setLit(i % TIERS.length);
      if (i >= steps) {
        setLit(target);
        timers.current.push(window.setTimeout(done, 350));
        return;
      }
      i++;
      timers.current.push(window.setTimeout(step, 60 + Math.pow(i / steps, 2) * 260));
    };
    step();
  }

  async function spin() {
    if (spinning) return;
    setSpinning(true);
    setErr("");
    try {
      const d = await api.gachaSpin();
      if (!d.claimed) throw Object.assign(new Error("unexpected"), { code: "" });
      animateTo(d.durationHours, () => {
        setSpinning(false);
        setResult(d);
      });
    } catch (e) {
      setSpinning(false);
      if (e instanceof TypeError) {
        setErr("Jaringan bermasalah, coba lagi.");
      } else {
        const code = (e as { code?: string }).code ?? "";
        setErr(SPIN_ERR[code] ?? "Gagal muter gacha, coba lagi.");
      }
    }
  }

  function copyKey() {
    if (!result) return;
    if (!navigator.clipboard) return;
    void navigator.clipboard.writeText(result.key).then(() => {
      setCopyLabel("Tersalin");
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopyLabel("Salin Key"), 1500);
    });
  }

  const expired = !!result && (result.expired || (remainSec !== null && remainSec <= 0));

  return (
    <PublicLayout wide>
      <style>{CSS}</style>
      <div className="bn-badge">
        <span className="pulse" /> Gacha Bansos — 1x putaran gratis per akun
      </div>
      <h1 className="bn-h1">
        Gacha <em>Bansos</em>
      </h1>
      <p className="bn-sub">
        Putar sekali, dapet <b>API key pribadi gratis</b> — unlimited token, semua model buyer, durasinya acak{" "}
        <b>1 sampai 24 jam</b>. Nggak ada key bersama lagi; key hasil gacha nempel ke akun kamu sendiri.
      </p>

      <div className="bn-grid">
        <section className="card bn-card bn-full">
          <h2>Mesin Gacha</h2>
          <p className="bn-note" style={{ marginTop: 0 }}>
            Enam tingkat hadiah, peluangnya terbuka apa adanya:
          </p>
          <div className="bn-tiers">
            {TIER_ODDS.map((t, i) => {
              const cls =
                "bn-tier" +
                (t.h === 24 ? " jackpot" : "") +
                (lit === i ? " lit" : "") +
                (result && result.durationHours === t.h ? " win" : "");
              return (
                <div className={cls} key={t.h}>
                  <p className="h">{t.h}</p>
                  <p className="u">{t.h === 24 ? "jam · jackpot" : "jam"}</p>
                  <p className="p">peluang {t.p}</p>
                </div>
              );
            })}
          </div>

          {!result ? (
            <div className="bn-spin">
              {sessionLoading ? (
                <p className="muted">Ngecek sesi kamu…</p>
              ) : !user ? (
                <>
                  <Link className="btn primary" to="/login">
                    Masuk buat Muter Gacha
                  </Link>
                  <p className="muted">
                    Login pakai Google, GitHub, atau API key yang udah kamu punya. Gratis, tanpa bayar, tanpa daftar
                    ribet.
                  </p>
                </>
              ) : (
                <>
                  <button className="btn primary" type="button" disabled={spinning || ipUsed || checking} onClick={spin}>
                    {spinning ? "Lagi muter…" : checking ? "Ngecek jatah…" : "🎁 Putar Gacha"}
                  </button>
                  <p className="muted">
                    {ipUsed
                      ? "IP ini udah pernah dipakai gacha. Satu IP cuma boleh 1x, biar nggak diternak bot."
                      : "Sekali seumur akun. Hasilnya ditentukan server, bukan keberuntungan browser."}
                  </p>
                </>
              )}
            </div>
          ) : null}
          <p className={"err" + (err ? " show" : "")} style={{ textAlign: "center" }}>
            {err}
          </p>
        </section>

        {result ? (
          <section className="card bn-card bn-full">
            <h2>
              {result.durationHours >= 24 ? "JACKPOT! Key gacha kamu (24 jam)" : "Key gacha kamu (" + result.durationHours + " jam)"}
            </h2>
            <p>
              <span className={"bn-pill " + (expired ? "exp" : "ok")}>{expired ? "Habis" : "Aktif"}</span>
            </p>
            <div className="bn-keybox">{result.key}</div>
            <div className="bn-btns">
              <button className="btn primary" type="button" onClick={copyKey}>
                {copyLabel}
              </button>
              <Link className="btn" to="/dashboard/keys">
                Lihat di API Keys
              </Link>
            </div>
            <p className="muted bn-center" style={{ marginTop: 16 }}>
              Sisa masa aktif
            </p>
            <p className="bn-remain">{remainSec === null ? "--:--:--" : fmtRemain(remainSec)}</p>
            <p className="muted bn-center">
              Berlaku sampai {new Date(result.expiresAt).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}.
            </p>
            <p className="bn-note">
              Base URL: <span className="mono">https://tiprouter.my.id/v1</span> · format OpenAI. Key berhenti sendiri
              pas sisa waktunya habis.
            </p>
          </section>
        ) : null}

        <section className="card bn-card">
          <h2>Cara Main</h2>
          <div className="bn-steps">
            <div className="bn-step">
              <span className="n">1</span>
              <p>
                <b>Masuk dulu</b> — pakai Google, GitHub, atau API key TipRouter yang udah kamu punya.
              </p>
            </div>
            <div className="bn-step">
              <span className="n">2</span>
              <p>
                <b>Putar gacha</b> — satu kali putaran, server yang nentuin dapet berapa jam (1–24 jam).
              </p>
            </div>
            <div className="bn-step">
              <span className="n">3</span>
              <p>
                <b>Colok key-nya</b> — base URL <b>tiprouter.my.id/v1</b>, isi key hasil gacha, pilih model apa aja.
              </p>
            </div>
          </div>
        </section>

        <section className="card bn-card">
          <h2>Aturan Main</h2>
          <ul className="bn-rules">
            <li>
              Tiap akun cuma bisa gacha <b>1x</b> — tercatat per akun <b>dan</b> per IP di server, nggak bisa diakalin
              refresh.
            </li>
            <li>
              Key gacha itu <b>key pribadi</b>: unlimited token, semua model paket berbayar, mati sendiri pas durasinya
              habis.
            </li>
            <li>Hasil putaran final — durasi yang keluar nggak bisa ditukar atau diulang.</li>
            <li>
              Habis masa gacha dan mau lanjut tanpa putus? <Link to="/beli">Paket TipRouter</Link> mulai Rp3.000, key
              langsung aktif.
            </li>
          </ul>
        </section>
      </div>

      <p className="bn-foot-note">
        Gacha Bansos adalah program gratis dari <Link to="/">TipRouter</Link> — satu putaran, satu key.
        <br />
        Peluang tiap tingkat tampil apa adanya; hasil ditentukan server secara acak.
      </p>
    </PublicLayout>
  );
}
