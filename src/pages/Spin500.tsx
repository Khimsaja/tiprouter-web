import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../components/chrome";
import { useLang } from "../lib/i18n";

// Angka tebakan peserta:
const TEBAKAN = [...new Set([7,45,67,298,234,27,44,482,237,69,77,334,32,1,333,212,476,42,145,222,3,393,484,69,314,63,248])].sort((a, b) => a - b);
const TAU = Math.PI * 2;
const POOL_SIZE = 500;
const SEGS = 24;

const CSS = `
.sp5-wrap{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin-top:20px}
.sp5-card{background:var(--glass-t2);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid var(--border);box-shadow:var(--glass-shadow-t2),inset 0 1px 0 var(--glass-hi);border-radius:16px;padding:22px;width:100%;max-width:420px}
.sp5-card h2{font-size:16px;margin-bottom:14px;color:var(--accent)}
.sp5-wheel{width:100%;max-width:340px;display:block;margin:0 auto}
.sp5-res{text-align:center;font-size:14px;color:var(--mut);margin-top:12px;min-height:28px}
.sp5-res b{color:var(--accent);font-size:26px;font-family:var(--font-mono)}
.sp5-res .kena{color:#4ADE80;font-weight:700}
.sp5-nums{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:6px}
.sp5-num{background:rgba(255,255,255,.55);border:1px solid var(--border);border-radius:12px;padding:16px 4px;text-align:center;font-size:22px;font-weight:800;font-family:var(--font-mono);transition:all .3s}
.sp5-num.hit{border-color:var(--accent);color:var(--accent);transform:scale(1.06);box-shadow:0 0 0 1px var(--accent),0 8px 20px rgba(14,165,233,.2)}
.sp5-tebakan{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}
.sp5-tb{background:rgba(255,255,255,.55);border:1px solid var(--border);border-radius:10px;padding:8px 12px;font-size:15px;font-weight:700;font-family:var(--font-mono);transition:all .3s}
.sp5-tb.kena{border-color:#4ADE80;color:#4ADE80;box-shadow:0 0 12px rgba(74,222,128,.25)}
.sp5-log{margin-top:14px;font-size:13px;color:var(--mut);max-height:120px;overflow:auto}
.sp5-log div{padding:4px 0;border-bottom:1px dashed var(--border)}
`;

function randInt(max: number): number {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0] % max;
}

export default function Spin500() {
  const { t } = useLang();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [spinRes, setSpinRes] = useState<string>(t("Klik PUTAR untuk mengundi"));
  const [drawn, setDrawn] = useState<number[]>([]);
  const [rolling, setRolling] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const CX = 180, CY = 180, R = 168;
    const arc = TAU / SEGS;
    const angle = angleRef.current;
    ctx.clearRect(0, 0, 360, 360);
    for (let i = 0; i < SEGS; i++) {
      const a0 = angle + i * arc, a1 = a0 + arc;
      ctx.beginPath(); ctx.moveTo(CX, CY); ctx.arc(CX, CY, R, a0, a1); ctx.closePath();
      ctx.fillStyle = i % 2 ? "#0C4A6E" : "#0369A1";
      ctx.fill();
      ctx.save();
      ctx.translate(CX, CY); ctx.rotate(a0 + arc / 2);
      ctx.textAlign = "right"; ctx.fillStyle = "#E0F2FE";
      ctx.font = "bold 12px system-ui"; ctx.textBaseline = "middle";
      const lo = Math.floor((i * POOL_SIZE) / SEGS) + 1;
      const hi = Math.floor(((i + 1) * POOL_SIZE) / SEGS);
      ctx.fillText(`${lo}-${hi}`, R - 12, 0);
      ctx.restore();
    }
    ctx.beginPath();
    ctx.moveTo(CX - 12, 6); ctx.lineTo(CX + 12, 6); ctx.lineTo(CX, 30); ctx.closePath();
    ctx.fillStyle = "#0284C7"; ctx.fill();
    ctx.beginPath(); ctx.arc(CX, CY, 26, 0, TAU);
    ctx.fillStyle = "#0284C7"; ctx.fill();
    ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 13px system-ui";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("SPIN", CX, CY);
  }, []);

  useEffect(() => { draw(); }, [draw]);

  const spinOnce = (): Promise<number> => {
    return new Promise((resolve) => {
      const winner = 1 + randInt(POOL_SIZE);
      const arc = TAU / SEGS;
      const seg = Math.min(SEGS - 1, Math.floor(((winner - 1) / POOL_SIZE) * SEGS));
      const jitter = (randInt(1000) / 1000 - 0.5) * arc * 0.7;
      const targetAngle = -Math.PI / 2 - (seg * arc + arc / 2) + jitter;
      const turns = 5 + randInt(3);
      let final = targetAngle;
      while (final < angleRef.current + turns * TAU) final += TAU;
      const start = angleRef.current, dur = 3500, t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / dur);
        const e = 1 - Math.pow(1 - p, 4);
        angleRef.current = start + (final - start) * e;
        draw();
        if (p < 1) requestAnimationFrame(tick);
        else resolve(winner);
      };
      requestAnimationFrame(tick);
    });
  };

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setSpinRes(t("Mengundi..."));
    const winner = await spinOnce();
    setDrawn((d) => [...d, winner]);
    const kena = TEBAKAN.includes(winner);
    setSpinRes(
      t("Keluar") + ": " + winner + (kena ? ` — <span class="kena">${t("KENA! Ada yang nebak angka ini")}</span>` : "")
    );
    setSpinning(false);
  };

  const pick10 = async () => {
    if (rolling) return;
    setRolling(true);
    // Undi dari pool 1-500 sampai 10 angka tebakan kena (hijau). Tidak reset otomatis.
    const used = new Set<number>(drawn);
    const hits = new Set<number>(drawn.filter((n) => TEBAKAN.includes(n)));
    const result = [...drawn];
    const MAX_DRAWS = 2000; // pengaman biar nggak infinite
    let draws = 0;
    while (hits.size < 10 && draws < MAX_DRAWS) {
      draws++;
      let n = 1 + randInt(POOL_SIZE);
      while (used.has(n)) n = 1 + randInt(POOL_SIZE);
      used.add(n);
      result.push(n);
      setDrawn([...result]);
      if (TEBAKAN.includes(n)) {
        hits.add(n);
        await new Promise((r) => setTimeout(r, 700)); // jeda dramatis pas kena
      } else {
        await new Promise((r) => setTimeout(r, 90));
      }
    }
    setRolling(false);
    const kenaList = [...hits].sort((a, b) => a - b);
    setLog((l) => [
      new Date().toLocaleTimeString("id-ID") + ` → 10 pemenang: ${kenaList.join(", ")} (${draws} undian)`,
      ...l,
    ].slice(0, 20));
  };

  const reset = () => {
    setDrawn([]);
    setSpinRes(t("Klik PUTAR untuk mengundi"));
    setLog([]);
  };

  return (
    <PublicLayout>
      <style>{CSS}</style>
      <h1 className="page">
        {t("Undian")} <em>1–500.</em>
      </h1>
      <p className="sub">{t("Pool undian 1–500 · ") + TEBAKAN.length + t(" angka tebakan peserta")}</p>
      <div className="sp5-wrap">
        <div className="sp5-card">
          <h2>{t("Roda Undian")}</h2>
          <canvas ref={canvasRef} className="sp5-wheel" width={360} height={360} />
          <button className="btn primary" style={{ width: "100%", marginTop: 14 }} disabled={spinning || rolling} onClick={spin}>
            {spinning ? t("Mengundi...") : t("PUTAR")}
          </button>
          <div className="sp5-res" dangerouslySetInnerHTML={{ __html: spinRes.replace(/: (\d+)/, ': <b>$1</b>') }} />
          <button className="btn primary" style={{ width: "100%", marginTop: 8 }} disabled={spinning || rolling} onClick={pick10}>
            {rolling ? t("Mengundi...") + ` (${drawn.filter((n) => TEBAKAN.includes(n)).length}/10)` : t("UNDI SAMPAI 10 KENA")}
          </button>
          <button className="btn" style={{ width: "100%", marginTop: 8 }} onClick={reset}>
            {t("Reset")}
          </button>
          {drawn.length > 0 && (
            <>
              <h2 style={{ marginTop: 16 }}>{t("Angka keluar")}</h2>
              <div className="sp5-nums">
                {drawn.map((n, i) => (
                  <div key={i} className={"sp5-num hit"}>{n}</div>
                ))}
              </div>
            </>
          )}
          <div className="sp5-log">{log.map((l, i) => <div key={i}>{l}</div>)}</div>
        </div>
        <div className="sp5-card">
          <h2>{t("Angka Tebakan Peserta") + ` (${TEBAKAN.length})`}</h2>
          <div className="sp5-tebakan">
            {TEBAKAN.map((n) => (
              <div key={n} className={"sp5-tb" + (drawn.includes(n) ? " kena" : "")}>{n}</div>
            ))}
          </div>
          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            {t("Tebakan yang cocok dengan angka undian menyala hijau.")}
          </p>
        </div>
      </div>
      <p style={{ marginTop: 22 }}>
        <Link to="/spinwheel" style={{ color: "var(--mut)", fontSize: 13 }}>← {t("Kembali ke Spin Wheel utama")}</Link>
      </p>
    </PublicLayout>
  );
}
