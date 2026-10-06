import { useEffect, useRef, useState } from "react";
import { Dices, Gift, Upload } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { localeTag, useLang } from "../lib/i18n";

const CSS = `
.sw-h1{font-size:clamp(34px,6vw,54px);font-weight:800;line-height:1.05;letter-spacing:-.02em;margin:6px 0 10px}
.sw-h1 em{font-style:normal;color:var(--faint)}
.sw-layout{display:grid;grid-template-columns:1fr 340px;gap:14px;margin-top:26px;align-items:start}
.sw-layout>*{min-width:0}
@media (max-width:880px){.sw-layout{grid-template-columns:1fr}}
.sw-wheel-card{margin-top:0;text-align:center;padding:26px 22px 30px}
.sw-stage{position:relative;width:min(82vw,480px);margin:6px auto 4px;aspect-ratio:1/1}
.sw-stage canvas{width:100%;height:100%;display:block}
.sw-pointer{position:absolute;top:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:15px solid transparent;border-right:15px solid transparent;border-top:26px solid var(--txt);z-index:3}
.sw-hub{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:34%;height:34%;border-radius:50%;background:var(--panel);border:1px solid var(--border);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:8px}
.sw-hub .hub-label{font-size:10.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.sw-hub .hub-value{font-size:clamp(26px,6.4vw,40px);font-weight:800;line-height:1;color:var(--txt);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sw-hub .hub-value.pop{animation:swPop .45s cubic-bezier(.2,1.6,.4,1)}
@keyframes swPop{0%{transform:scale(.55)}100%{transform:scale(1)}}
.sw-hub .hub-name{font-size:clamp(12px,3vw,15px);font-weight:700;color:var(--faint);max-width:92%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sw-hub .hub-name:empty{display:none}
.sw-spin-btn{margin-top:18px;font-size:17px;padding:15px 42px}
.sw-range-info{margin-top:12px;color:var(--faint);font-size:13.5px;min-height:18px}
.sw-panel{margin-top:0}
.sw-panel h2{font-size:15px;letter-spacing:.02em;margin-bottom:14px;color:var(--txt)}
.sw-modes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.sw-mode-btn{appearance:none;cursor:pointer;border:1px solid var(--border);background:var(--panel);color:var(--mut);font-size:14px;font-weight:800;padding:12px 8px;border-radius:10px;transition:all .15s;font-family:var(--font-sans)}
.sw-mode-btn.active{background:var(--txt);color:var(--bg);border-color:var(--txt)}
.sw-field-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sw-field input{font-size:17px;font-weight:600}
.sw-presets{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.sw-preset{appearance:none;cursor:pointer;border:1px solid var(--border);background:var(--panel);color:var(--mut);font-size:13px;font-weight:700;padding:8px 13px;border-radius:999px;transition:all .15s;font-family:var(--font-sans)}
.sw-preset:hover{border-color:var(--mut);color:var(--txt)}
.sw-check{display:flex;align-items:center;gap:9px;margin-top:16px;font-size:14px;color:var(--mut);cursor:pointer;user-select:none;font-weight:500}
.sw-check input{width:17px;height:17px;padding:0;flex:none;accent-color:var(--txt)}
.sw-sound-row{display:flex;align-items:center;justify-content:space-between;margin-top:16px;padding-top:16px;border-top:1px dashed var(--border)}
.sw-sound-row span{font-size:14px;color:var(--mut)}
.sw-switch{position:relative;width:46px;height:26px;flex:none;display:block;margin:0}
.sw-switch input{opacity:0;width:0;height:0;padding:0}
.sw-track{position:absolute;inset:0;border-radius:999px;background:var(--hover);transition:.2s;cursor:pointer}
.sw-track:before{content:"";position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;top:3px;left:3px;transition:.2s;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.sw-switch input:checked + .sw-track{background:var(--txt)}
.sw-switch input:checked + .sw-track:before{transform:translateX(20px)}
.sw-history{margin-top:20px}
.sw-history-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.sw-history-head h2{margin:0}
.sw-clear-btn{appearance:none;border:0;background:none;color:var(--txt);font-size:13px;font-weight:700;cursor:pointer;padding:4px 2px;font-family:var(--font-sans)}
.sw-clear-btn:hover{text-decoration:underline}
.sw-chips{display:flex;flex-wrap:wrap;gap:8px}
.sw-chip{background:var(--hover);color:var(--txt);font-weight:700;font-size:14.5px;padding:7px 13px;border-radius:999px;border:1px solid var(--border);animation:swPop .3s ease}
.sw-chip:first-child{background:var(--txt);color:var(--bg)}
.sw-empty-history{color:var(--faint);font-size:13.5px}
.sw-pool-area textarea{min-height:150px;resize:vertical;font-size:14px;line-height:1.6;font-family:var(--font-mono)}
.sw-pool-actions{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.sw-pool-btn{appearance:none;cursor:pointer;border:1px solid var(--border);background:var(--panel);color:var(--mut);font-size:13px;font-weight:700;padding:9px 14px;border-radius:999px;transition:all .15s;font-family:var(--font-sans);display:inline-block;margin:0}
.sw-pool-btn:hover{border-color:var(--mut);color:var(--txt)}
.sw-pool-hint{font-size:12.5px;color:var(--faint);margin-top:10px;line-height:1.55}
.sw-pool-list{margin-top:12px}
.sw-pool-list-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:13px;font-weight:700;color:var(--mut)}
.sw-pool-scroll{max-height:240px;overflow-y:auto;display:flex;flex-wrap:wrap;gap:6px;padding-right:2px}
.sw-pool-chip{display:inline-flex;align-items:center;gap:6px;background:var(--hover);border:1px solid var(--border);font-size:12.5px;font-weight:700;color:var(--txt);padding:5px 6px 5px 11px;border-radius:999px}
.sw-pool-chip .nm{font-weight:600;color:var(--mut)}
.sw-pool-chip button{appearance:none;border:0;cursor:pointer;width:18px;height:18px;border-radius:50%;background:var(--border);color:var(--mut);font-size:11px;line-height:1;display:grid;place-items:center;padding:0}
.sw-pool-chip button:hover{background:var(--red);color:#fff}
.sw-foot-note{margin-top:36px;color:var(--faint);font-size:13px;text-align:center;line-height:1.6}
`;

const PALETTE = ["#262626", "#3F3F46", "#18181B", "#52525B", "#0A0A0A", "#71717A", "#27272A", "#A1A1AA", "#171717", "#5B5B63"];
const MAX_LABELED = 36;

type PoolEntry = { number: number; name: string };
type RangeResult = { error: string | null; min: number; max: number; count: number };

const fmt = (n: number) => n.toLocaleString(localeTag());

// Fair uniform integer in [0, n) via crypto with rejection sampling.
function randomBelow(n: number): number {
  if (n <= 1) return 0;
  const max = Math.floor(4294967296 / n) * n;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    window.crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= max);
  return x % n;
}

function parsePoolLine(line: string): PoolEntry | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let m = trimmed.match(/^(\d{1,6})\s*[-|:,.)\]]?\s*(.*)$/);
  if (m) {
    return { number: parseInt(m[1], 10), name: (m[2] || "").trim() };
  }
  m = trimmed.match(/^(.*?)[\s,|\-:](\d{1,6})$/);
  if (m) {
    return { number: parseInt(m[2], 10), name: (m[1] || "").trim() };
  }
  return null;
}

export default function Spinwheel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);
  const poolInputRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [mode, setModeState] = useState<"range" | "pool">("range");
  const [errorMsg, setErrorMsg] = useState("");
  const [poolErrorMsg, setPoolErrorMsg] = useState("");
  const [rangeInfo, setRangeInfo] = useState("");
  const [hubValue, setHubValue] = useState("?");
  const [hubName, setHubName] = useState("");
  const [resultKey, setResultKey] = useState(0);
  const [spinLabel, setSpinLabel] = useState("PUTAR");
  const [spinning, setSpinning] = useState(false);
  const [rangeInvalid, setRangeInvalid] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [noRepeat, setNoRepeat] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [poolEntries, setPoolEntries] = useState<PoolEntry[]>([]);

  const { t } = useLang();

  const rotationRef = useRef(0);
  const spinningRef = useRef(false);
  const drawnRef = useRef<{ scope: string; drawn: Set<number> }>({ scope: "", drawn: new Set() });
  const poolDrawnRef = useRef<Set<number>>(new Set());
  const poolRef = useRef<PoolEntry[]>([]);
  const modeRef = useRef<"range" | "pool">("range");
  const noRepeatRef = useRef(false);
  const soundRef = useRef(true);
  const skippedRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const poolTimerRef = useRef<number | undefined>(undefined);
  const historyRef = useRef<string[]>([]);

  // ---- range helpers -------------------------------------------------------

  function readRange(): RangeResult {
    const min = parseInt(minRef.current?.value ?? "", 10);
    const max = parseInt(maxRef.current?.value ?? "", 10);
    if (Number.isNaN(min) || Number.isNaN(max))
      return { error: t('Isi dulu angka "Dari" dan "Sampai"-nya.'), min: 1, max: 100, count: 100 };
    if (min < 1 || max > 10000 || min > 10000 || max < 1)
      return { error: t("Rentang harus di dalam 1 sampai 10.000."), min: 1, max: 100, count: 100 };
    if (min > max) return { error: t('Angka "Dari" harus lebih kecil dari "Sampai".'), min: 1, max: 100, count: 100 };
    if (min === max)
      return { error: t('Rentangnya cuma satu angka — naikin "Sampai"-nya biar seru.'), min: 1, max: 100, count: 100 };
    return { error: null, min, max, count: max - min + 1 };
  }

  function availableNumbers(r: RangeResult): number[] | null {
    const scope = r.min + "-" + r.max;
    if (drawnRef.current.scope !== scope) drawnRef.current = { scope, drawn: new Set() };
    if (!noRepeatRef.current) return null; // null = whole range, no filtering needed
    const list: number[] = [];
    for (let n = r.min; n <= r.max; n++) if (!drawnRef.current.drawn.has(n)) list.push(n);
    return list;
  }

  function segmentCount(r: RangeResult): number {
    return r.count <= MAX_LABELED ? r.count : 24;
  }

  function poolSegmentCount(n: number): number {
    return n <= MAX_LABELED ? n : 24;
  }

  // ---- pool helpers --------------------------------------------------------

  function parsePool(): { entries: PoolEntry[]; skipped: number } {
    const lines = (poolInputRef.current?.value ?? "").split(/\r?\n/);
    const out: PoolEntry[] = [];
    let skipped = 0;
    lines.forEach((line) => {
      if (!line.trim()) return;
      const e = parsePoolLine(line);
      if (e) out.push(e);
      else skipped++;
    });
    return { entries: out, skipped };
  }

  function refreshPool(): { entries: PoolEntry[]; skipped: number } {
    const parsed = parsePool();
    const cur = poolRef.current;
    const same =
      cur.length === parsed.entries.length &&
      parsed.entries.every((e, i) => e.number === cur[i].number && e.name === cur[i].name);
    poolRef.current = parsed.entries;
    setPoolEntries(parsed.entries);
    if (!same) poolDrawnRef.current = new Set();
    if (parsed.skipped > 0) {
      skippedRef.current = true;
      setPoolErrorMsg(t("{n} baris dilewati (nggak ada nomornya). Cek format tiap baris: nomor - nama.", { n: parsed.skipped }));
    } else {
      skippedRef.current = false;
      setPoolErrorMsg("");
    }
    return parsed;
  }

  function poolLabeled(): boolean {
    return poolRef.current.length >= 2 && poolRef.current.length <= MAX_LABELED;
  }

  // ---- canvas drawing ------------------------------------------------------

  function drawPoolWheel(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    const n = poolRef.current.length;
    let segs = poolSegmentCount(Math.max(n, 2));
    if (segs < 2) segs = 2;
    const segAngle = (Math.PI * 2) / segs;
    const labeled = poolLabeled();

    ctx.clearRect(0, 0, size, size);

    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E5DCC8";
    ctx.stroke();

    for (let i = 0; i < segs; i++) {
      const start = rotation + i * segAngle;
      const end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.stroke();

      if (labeled && i < n) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + segAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 " + Math.max(13, Math.min(26, (radius * 0.62) / Math.sqrt(segs))) + "px -apple-system, 'Segoe UI', sans-serif";
        ctx.fillText(String(poolRef.current[i].number), radius - 14, 6);
        ctx.restore();
      }
    }

    if (n === 0) {
      ctx.save();
      ctx.fillStyle = "#7E97AC";
      ctx.font = "600 19px -apple-system, 'Segoe UI', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(t("Isi pool tebakan dulu"), cx, cy - 6);
      ctx.font = "500 14px -apple-system, 'Segoe UI', sans-serif";
      ctx.fillText(t("paste nomor atau upload file .txt"), cx, cy + 18);
      ctx.restore();
    }

    for (let p = 0; p < segs; p++) {
      const a = rotation + p * segAngle;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0284C7";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }
  }

  function drawWheel(rotation: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 10;
    let r = readRange();
    if (r.error) r = { error: null, min: 1, max: 100, count: 100 };
    const segs = segmentCount(r);
    const segAngle = (Math.PI * 2) / segs;

    ctx.clearRect(0, 0, size, size);

    // outer rim
    ctx.beginPath();
    ctx.arc(cx, cy, radius + 6, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#E5DCC8";
    ctx.stroke();

    for (let i = 0; i < segs; i++) {
      const start = rotation + i * segAngle;
      const end = start + segAngle;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, end);
      ctx.closePath();
      ctx.fillStyle = PALETTE[i % PALETTE.length];
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "rgba(255,255,255,.85)";
      ctx.stroke();

      if (r.count <= MAX_LABELED) {
        // label each segment with its number
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(start + segAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "700 " + Math.max(13, Math.min(26, (radius * 0.62) / Math.sqrt(segs))) + "px -apple-system, 'Segoe UI', sans-serif";
        ctx.fillText(String(r.min + i), radius - 14, 6);
        ctx.restore();
      }
    }

    // pegs on the rim
    for (let p = 0; p < segs; p++) {
      const a = rotation + p * segAngle;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#0284C7";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#fff";
      ctx.stroke();
    }
  }

  // ---- sound (tiny WebAudio ticks) ------------------------------------------

  function ensureAudio(): AudioContext | null {
    if (!soundRef.current) return null;
    if (!audioRef.current) {
      try {
        const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioRef.current = new AC();
      } catch {
        return null;
      }
    }
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    return audioRef.current;
  }

  function tick() {
    const ac = ensureAudio();
    if (!ac) return;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = "square";
    o.frequency.value = 1900;
    g.gain.setValueAtTime(0.035, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.03);
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.035);
  }

  function winSound() {
    const ac = ensureAudio();
    if (!ac) return;
    [523.25, 659.25, 783.99].forEach((f, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.value = f;
      const t = ac.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  }

  // ---- display updates -------------------------------------------------------

  function addHistoryValue(text: string) {
    historyRef.current = [text, ...historyRef.current].slice(0, 60);
    setHistory(historyRef.current.slice(0, 24));
  }

  function updateRangeInfo() {
    const r = readRange();
    if (r.error) {
      setErrorMsg(r.error);
      setRangeInvalid(true);
      setRangeInfo("");
    } else {
      setErrorMsg("");
      setRangeInvalid(false);
      const pool = availableNumbers(r);
      const remaining = pool ? pool.length : r.count;
      setRangeInfo(
        t("{count} angka dalam rentang {min} – {max}", { count: fmt(r.count), min: fmt(r.min), max: fmt(r.max) }) +
          (noRepeatRef.current ? t(" · sisa {n}", { n: fmt(remaining) }) : ""),
      );
    }
    drawWheel(rotationRef.current);
  }

  function updatePoolInfo() {
    const parsed = refreshPool();
    const n = parsed.entries.length;
    if (n < 2) {
      setPoolErrorMsg(
        n === 1
          ? t("Pool-nya baru 1 tebakan — tambahin lagi biar bisa diundi.")
          : t("Isi dulu pool-nya: paste daftar tebakan atau upload file .txt."),
      );
      setRangeInfo(n ? t("1 tebakan di pool") : "");
    } else {
      if (!skippedRef.current) setPoolErrorMsg("");
      let left = n;
      if (noRepeatRef.current) {
        left = 0;
        parsed.entries.forEach((_, i) => {
          if (!poolDrawnRef.current.has(i)) left++;
        });
      }
      setRangeInfo(
        t("{n} tebakan di pool", { n: fmt(n) }) +
          (noRepeatRef.current ? t(" · sisa {n}", { n: fmt(left) }) : "") +
          t(" · tiap orang peluangnya sama"),
      );
    }
    drawPoolWheel(rotationRef.current);
  }

  function updateDisplay() {
    if (modeRef.current === "pool") updatePoolInfo();
    else updateRangeInfo();
  }

  // ---- spinning --------------------------------------------------------------

  function spinPool() {
    if (spinningRef.current) return;
    refreshPool();
    const pool = poolRef.current;
    const n = pool.length;
    if (n < 2) {
      updatePoolInfo();
      return;
    }

    const candidates: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!noRepeatRef.current || !poolDrawnRef.current.has(i)) candidates.push(i);
    }
    if (candidates.length === 0) {
      setPoolErrorMsg(t('Semua orang di pool sudah keluar. Matikan "Tanpa pengulangan" atau isi pool baru.'));
      return;
    }
    const winIdx = candidates[randomBelow(candidates.length)];
    const winner = pool[winIdx];

    spinningRef.current = true;
    setSpinning(true);
    setSpinLabel("BERPUTAR…");
    setHubValue("…");
    setHubName("");

    const segs = poolSegmentCount(n);
    const segAngle = (Math.PI * 2) / segs;
    const labeled = poolLabeled();
    const pointerAngle = -Math.PI / 2;

    const current = rotationRef.current % (Math.PI * 2);
    let desired: number;
    if (labeled) {
      desired = pointerAngle - (winIdx * segAngle + segAngle / 2);
    } else {
      desired = pointerAngle - (randomBelow(360) * Math.PI) / 180;
    }
    let delta = desired - current;
    while (delta <= 0) delta += Math.PI * 2;
    const turns = 5 + randomBelow(3);
    const totalRotation = delta + turns * Math.PI * 2;
    const startRotation = rotationRef.current;
    const duration = 5200 + randomBelow(900);
    let startTime: number | null = null;
    let lastPegIndex = -1;

    function frame(now: number) {
      if (!startTime) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      rotationRef.current = startRotation + totalRotation * (1 - Math.pow(1 - t, 5));
      drawPoolWheel(rotationRef.current);

      const pegIndex = Math.floor((rotationRef.current % (Math.PI * 2)) / segAngle);
      if (pegIndex !== lastPegIndex) {
        lastPegIndex = pegIndex;
        if (t < 0.985) tick();
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinningRef.current = false;
        setSpinning(false);
        poolDrawnRef.current = new Set(poolDrawnRef.current).add(winIdx);
        setHubValue(fmt(winner.number));
        setHubName(winner.name || "");
        setResultKey((k) => k + 1);
        setSpinLabel("PUTAR LAGI");
        addHistoryValue(fmt(winner.number) + (winner.name ? " · " + winner.name : ""));
        winSound();
        updatePoolInfo();
      }
    }
    requestAnimationFrame(frame);
  }

  function spinRange() {
    const r = readRange();
    if (r.error || spinningRef.current) return;
    const pool = availableNumbers(r);
    let target: number;
    if (pool) {
      if (pool.length === 0) {
        setErrorMsg(t('Semua angka di rentang ini sudah keluar. Matikan "Tanpa pengulangan" atau ganti rentang.'));
        return;
      }
      target = pool[randomBelow(pool.length)];
    } else {
      target = r.min + randomBelow(r.count);
    }

    spinningRef.current = true;
    setSpinning(true);
    setSpinLabel("BERPUTAR…");
    setHubValue("…");
    setHubName("");

    const segs = segmentCount(r);
    const segAngle = (Math.PI * 2) / segs;
    const labeled = r.count <= MAX_LABELED;
    const pointerAngle = -Math.PI / 2;

    // Choose the final rotation so the pointer rests on the winning segment
    // (exact in labeled mode; a free offset otherwise).
    const current = rotationRef.current % (Math.PI * 2);
    let desired: number;
    if (labeled) {
      const idx = target - r.min;
      desired = pointerAngle - (idx * segAngle + segAngle / 2);
    } else {
      desired = pointerAngle - (randomBelow(360) * Math.PI) / 180;
    }
    let delta = desired - current;
    while (delta <= 0) delta += Math.PI * 2;
    const turns = 5 + randomBelow(3); // 5–7 full turns
    const totalRotation = delta + turns * Math.PI * 2;
    const startRotation = rotationRef.current;
    const duration = 5200 + randomBelow(900);
    let startTime: number | null = null;
    let lastPegIndex = -1;

    function easeOutQuint(t: number) {
      return 1 - Math.pow(1 - t, 5);
    }

    function frame(now: number) {
      if (!startTime) startTime = now;
      const t = Math.min(1, (now - startTime) / duration);
      rotationRef.current = startRotation + totalRotation * easeOutQuint(t);
      drawWheel(rotationRef.current);

      const pegIndex = Math.floor((rotationRef.current % (Math.PI * 2)) / segAngle);
      if (pegIndex !== lastPegIndex) {
        lastPegIndex = pegIndex;
        if (t < 0.985) tick();
      }

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        spinningRef.current = false;
        setSpinning(false);
        drawnRef.current.drawn.add(target);
        setHubValue(fmt(target));
        setResultKey((k) => k + 1);
        setSpinLabel("PUTAR LAGI");
        addHistoryValue(fmt(target));
        winSound();
        updateRangeInfo();
      }
    }
    requestAnimationFrame(frame);
  }

  function spin() {
    if (modeRef.current === "pool") spinPool();
    else spinRange();
  }

  // ---- mode & events -----------------------------------------------------------

  function setMode(m: "range" | "pool") {
    modeRef.current = m;
    setModeState(m);
    setHubValue("?");
    setHubName("");
    setSpinLabel("PUTAR");
    if (m === "pool") updatePoolInfo();
    else updateRangeInfo();
  }

  function removePoolEntry(idx: number) {
    const next = poolRef.current.filter((_, i) => i !== idx);
    poolRef.current = next;
    setPoolEntries(next);
    if (poolInputRef.current) {
      poolInputRef.current.value = next.map((e) => e.number + (e.name ? " - " + e.name : "")).join("\n");
    }
    updateDisplay();
  }

  // Initial paint + restore the saved pool (localStorage), like the original page.
  useEffect(() => {
    try {
      const savedPool = localStorage.getItem("tiprouter-spinwheel-pool");
      if (savedPool && poolInputRef.current) poolInputRef.current.value = savedPool;
    } catch {
      /* ignore */
    }
    updateDisplay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const poolRemaining = noRepeat
    ? poolEntries.filter((_, i) => !poolDrawnRef.current.has(i)).length
    : poolEntries.length;
  const spinDisabled = spinning || (mode === "range" ? rangeInvalid : poolEntries.length < 2);

  return (
    <PublicLayout wide>
      <style>{CSS}</style>
      <h1 className="sw-h1">
        Spin Wheel <em>{t("Angka")}</em>
      </h1>
      <p className="sub">
        {t("Putar roda dan dapatkan angka acak dari rentang pilihanmu — dari 1 sampai 10.000. Cocok buat undian, giveaway, atau milih nomor tanpa drama.")}
      </p>

      <div className="sw-layout">
        <section className="card sw-wheel-card">
          <div className="sw-stage">
            <div className="sw-pointer" />
            <canvas ref={canvasRef} width={600} height={600} />
            <div className="sw-hub">
              <div className="hub-label">{t("Hasil")}</div>
              <div key={resultKey} className={"hub-value" + (resultKey > 0 ? " pop" : "")}>
                {hubValue}
              </div>
              <div className="hub-name">{hubName}</div>
            </div>
          </div>
          <button className="btn primary sw-spin-btn" onClick={spin} disabled={spinDisabled}>
            {t(spinLabel)}
          </button>
          <div className="sw-range-info">{rangeInfo}</div>
        </section>

        <aside className="card sw-panel">
          <div className="sw-modes">
            <button
              type="button"
              className={"sw-mode-btn" + (mode === "range" ? " active" : "")}
              onClick={() => setMode("range")}
            >
              <Dices size={15} style={{ verticalAlign: -2 }} /> {t("Rentang Angka")}
            </button>
            <button
              type="button"
              className={"sw-mode-btn" + (mode === "pool" ? " active" : "")}
              onClick={() => setMode("pool")}
            >
              <Gift size={15} style={{ verticalAlign: -2 }} /> {t("Pool Tebakan")}
            </button>
          </div>

          {mode === "range" && (
            <div>
              <h2>{t("Atur Rentang")}</h2>
              <div className="sw-field-row">
                <div className="sw-field">
                  <label htmlFor="sw-min">{t("Dari")}</label>
                  <input ref={minRef} id="sw-min" type="number" min={1} max={10000} defaultValue={1} inputMode="numeric" onInput={updateRangeInfo} onChange={updateRangeInfo} />
                </div>
                <div className="sw-field">
                  <label htmlFor="sw-max">{t("Sampai")}</label>
                  <input ref={maxRef} id="sw-max" type="number" min={1} max={10000} defaultValue={100} inputMode="numeric" onInput={updateRangeInfo} onChange={updateRangeInfo} />
                </div>
              </div>
              <div className="sw-presets">
                {[
                  { min: 1, max: 10 },
                  { min: 1, max: 100 },
                  { min: 1, max: 1000 },
                  { min: 1, max: 10000 },
                ].map((p) => (
                  <button
                    key={p.max}
                    type="button"
                    className="sw-preset"
                    onClick={() => {
                      if (minRef.current) minRef.current.value = String(p.min);
                      if (maxRef.current) maxRef.current.value = String(p.max);
                      drawnRef.current = { scope: drawnRef.current.scope, drawn: new Set() };
                      updateRangeInfo();
                    }}
                  >
                    {"1–" + fmt(p.max)}
                  </button>
                ))}
              </div>
              <div className={"err" + (errorMsg ? " show" : "")}>{errorMsg}</div>
            </div>
          )}

          {mode === "pool" && (
            <div>
              <h2>{t("Pool Tebakan Giveaway")}</h2>
              <div className="sw-pool-area">
                <textarea
                  ref={poolInputRef}
                  placeholder={t("Paste tebakan di sini, satu baris per orang. Contoh:\n492 - MadWar\n8 - Rizky\n227 - Santony")}
                  onInput={() => {
                    window.clearTimeout(poolTimerRef.current);
                    poolTimerRef.current = window.setTimeout(updatePoolInfo, 250);
                  }}
                  onChange={() => {
                    try {
                      localStorage.setItem("tiprouter-spinwheel-pool", poolInputRef.current?.value ?? "");
                    } catch {
                      /* ignore */
                    }
                  }}
                />
                <div className="sw-pool-actions">
                  <label className="sw-pool-btn" htmlFor="sw-pool-file">
                    <Upload size={14} style={{ verticalAlign: -2 }} /> {t("Upload file .txt")}
                  </label>
                  <input
                    ref={fileRef}
                    id="sw-pool-file"
                    type="file"
                    accept=".txt,text/plain"
                    style={{ display: "none" }}
                    onChange={() => {
                      const f = fileRef.current?.files && fileRef.current.files[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (poolInputRef.current) poolInputRef.current.value = String(reader.result || "");
                        updatePoolInfo();
                      };
                      reader.readAsText(f);
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="sw-pool-btn"
                    onClick={() => {
                      if (poolInputRef.current) poolInputRef.current.value = "";
                      poolRef.current = [];
                      setPoolEntries([]);
                      poolDrawnRef.current = new Set();
                      updatePoolInfo();
                    }}
                  >
                    {t("Kosongkan")}
                  </button>
                </div>
                <p className="sw-pool-hint">
                  {t("Format fleksibel:")} <b>{t("nomor - nama")}</b>{t(" atau ")}<b>{t("nama nomor")}</b>{t(", pisah spasi/koma juga bisa. Nomor yang sama boleh dipakai banyak orang — yang diundi itu orangnya.")}
                </p>
                {poolEntries.length > 0 && (
                  <div className="sw-pool-list">
                    <div className="sw-pool-list-head">
                      <span>
                        {t("{n} tebakan di pool", { n: poolEntries.length })}
                        {noRepeat ? t(" · sisa {n}", { n: poolRemaining }) : ""}
                      </span>
                    </div>
                    <div className="sw-pool-scroll">
                      {poolEntries.map((e, i) => (
                        <span className="sw-pool-chip" key={i}>
                          <span>
                            {fmt(e.number)}
                            {e.name ? " · " : ""}
                            {e.name && <span className="nm">{e.name}</span>}
                          </span>
                          <button type="button" title={t("Hapus dari pool")} onClick={() => removePoolEntry(i)}>
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className={"err" + (poolErrorMsg ? " show" : "")}>{poolErrorMsg}</div>
              </div>
            </div>
          )}

          <label className="sw-check">
            <input
              type="checkbox"
              checked={noRepeat}
              onChange={(ev) => {
                noRepeatRef.current = ev.target.checked;
                setNoRepeat(ev.target.checked);
                updateDisplay();
              }}
            />
            <span>
              {mode === "pool"
                ? t("Tanpa pengulangan (yang sudah menang tidak ikut lagi)")
                : t("Tanpa pengulangan (angka yang sudah keluar tidak ikut lagi)")}
            </span>
          </label>
          <div className="sw-sound-row">
            <span>{t("Suara putaran")}</span>
            <label className="sw-switch">
              <input
                type="checkbox"
                checked={soundOn}
                onChange={(ev) => {
                  soundRef.current = ev.target.checked;
                  setSoundOn(ev.target.checked);
                }}
              />
              <span className="sw-track" />
            </label>
          </div>

          <div className="sw-history">
            <div className="sw-history-head">
              <h2>{t("Riwayat")}</h2>
              <button
                type="button"
                className="sw-clear-btn"
                onClick={() => {
                  historyRef.current = [];
                  setHistory([]);
                  drawnRef.current = { scope: drawnRef.current.scope, drawn: new Set() };
                  poolDrawnRef.current = new Set();
                  setHubValue("?");
                  setHubName("");
                  updateDisplay();
                }}
              >
                {t("Bersihkan")}
              </button>
            </div>
            <div className="sw-chips">
              {history.length === 0 ? (
                <span className="sw-empty-history">{t("Belum ada hasil. Putar rodanya!")}</span>
              ) : (
                history.map((h, i) => (
                  <span className="sw-chip" key={i}>
                    {h}
                  </span>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      <p className="sw-foot-note">{t("Angka dipilih secara acak murni di browser kamu — tidak ada yang diatur-atur.")}</p>
    </PublicLayout>
  );
}
