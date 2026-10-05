import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "../components/chrome";

const CSS = `
.ld-hero{padding:22px 0 4px}
.ld-hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:36px;align-items:start}
.ld-hero-grid>*{min-width:0}
.ld-eyebrow{font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--faint);margin-bottom:16px}
.ld-eyebrow b{color:var(--txt)}
.ld-h1{font-size:clamp(38px,5vw,54px);line-height:1.05;letter-spacing:-.03em;font-weight:800}
.ld-h1 em{font-style:normal;color:var(--faint)}
.ld-sub{margin-top:16px;font-size:16.5px;line-height:1.6;color:var(--mut);max-width:480px}
.ld-hero-cta{display:flex;gap:10px;margin-top:26px;flex-wrap:wrap}
.ld-hero-note{margin-top:14px;font-size:13px;color:var(--faint)}
.ld-hero-stats{display:grid;grid-template-columns:repeat(4,auto);gap:10px 26px;margin-top:34px}
.ld-hero-stats .n{font-size:21px;font-weight:800;letter-spacing:-.02em}
.ld-hero-stats .l{font-size:12px;color:var(--faint);margin-top:2px}
.ld-label{font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.ld-stats-head{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ld-stats-head .r{font-size:12px;color:var(--faint)}
.ld-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:16px}
.ld-metric{border:1px solid var(--border);border-radius:12px;padding:12px 13px}
.ld-metric .k{font-size:10px;font-weight:700;letter-spacing:.12em;color:var(--faint);text-transform:uppercase}
.ld-metric .v{font-family:var(--font-mono);font-size:15px;font-weight:700;margin-top:5px;letter-spacing:-.02em;white-space:nowrap}
.ld-metric .s{font-size:11px;color:var(--faint);margin-top:2px}
.ld-topmodels{margin-top:16px;border-top:1px solid var(--border);padding-top:10px}
.ld-topmodels .th,.ld-topmodels .tr{display:grid;grid-template-columns:1fr 52px 52px 72px;gap:8px;font-size:12.5px;padding:6px 2px;align-items:center}
.ld-topmodels .th{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint);padding-bottom:2px}
.ld-topmodels .tr{border-top:1px solid var(--border);font-family:var(--font-mono)}
.ld-topmodels .tr span:first-child{font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ld-topmodels .num{text-align:right;color:var(--mut)}
.ld-live-list{list-style:none;margin-top:12px;border-top:1px solid var(--border);padding-top:6px;min-height:196px}
.ld-live-row{display:flex;align-items:center;gap:9px;padding:7px 2px;font-size:13px;border-bottom:1px solid var(--border)}
.ld-live-row:last-child{border-bottom:none}
.ld-live-check{color:var(--green);display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:var(--hover);flex:none}
.ld-live-model{font-family:var(--font-mono);font-weight:600;font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ld-live-meta{color:var(--faint);font-size:12px;margin-left:auto;white-space:nowrap}
.ld-live-ok{color:var(--green);font-weight:700;font-size:12px;white-space:nowrap}
.ld-live-age{color:var(--faint);font-size:11.5px;white-space:nowrap;min-width:64px;text-align:right}
.ld-live-row.enter{animation:ldSlideIn .5s ease}
@keyframes ldSlideIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
.ld-stats-foot{display:flex;align-items:center;gap:8px;margin-top:10px;padding-top:12px;border-top:1px solid var(--border);font-size:12.5px;color:var(--mut)}
.ld-stats-foot .r{margin-left:auto;color:var(--faint);font-size:12px}
.ld-stats-note{font-size:11.5px;color:var(--faint);margin-top:8px;line-height:1.5}
.ld-avail{margin-top:22px;display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:22px;align-items:center}
.ld-avail h2{font-size:25px;letter-spacing:-.02em;margin-top:8px;font-weight:800}
.ld-avail .fact .k{font-size:10.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.ld-avail .fact .v{font-size:19px;font-weight:800;margin-top:5px;letter-spacing:-.01em}
.ld-avail .fact .s{font-size:12px;color:var(--faint);margin-top:2px;line-height:1.45}
.ld-section{padding:56px 0 4px;scroll-margin-top:104px}
.ld-sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:22px;flex-wrap:wrap}
.ld-sec{font-size:clamp(27px,3.4vw,36px);letter-spacing:-.025em;line-height:1.12;font-weight:800;margin-top:10px}
.ld-sec em{font-style:normal;color:var(--faint)}
.ld-lead{color:var(--mut);font-size:15.5px;line-height:1.6;max-width:560px;margin-top:10px}
.ld-model-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.ld-model-card{margin-top:0}
.ld-model-card .top{display:flex;align-items:center;justify-content:space-between;gap:10px}
.ld-model-card .fam{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.ld-mchip{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:var(--green);border:1px solid var(--green);padding:3px 9px;border-radius:999px;white-space:nowrap}
.ld-mchip i{width:6px;height:6px;border-radius:50%;background:var(--green)}
.ld-model-card h3{font-family:var(--font-mono);font-size:16px;font-weight:700;margin-top:12px;letter-spacing:-.01em;word-break:break-all}
.ld-model-card p{font-size:13.5px;color:var(--mut);line-height:1.55;margin-top:7px}
.ld-model-card.cta-tile{background:var(--hover)}
.ld-model-card.cta-tile h3{font-family:var(--font-sans)}
.ld-model-card.cta-tile a{font-weight:600;text-decoration:underline}
.ld-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
.ld-step{margin-top:0}
.ld-step .verb{display:flex;align-items:center;gap:10px;font-size:19px;font-weight:800;letter-spacing:-.01em}
.ld-step .verb span{font-family:var(--font-mono);font-size:12px;font-weight:700;color:var(--bg);background:var(--txt);border-radius:999px;padding:4px 10px}
.ld-step p{font-size:14px;color:var(--mut);line-height:1.6;margin-top:12px}
.ld-step code{font-family:var(--font-mono);font-size:12.5px;background:var(--hover);padding:1px 7px;border-radius:7px;word-break:break-all}
.ld-config{margin-top:12px}
.ld-config-row{display:grid;grid-template-columns:170px 1fr;gap:16px;align-items:center;padding:13px 0;border-top:1px solid var(--border)}
.ld-config-row:first-of-type{border-top:none}
.ld-config-row .k{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.ld-codebox{display:flex;align-items:center;gap:10px;background:#111;color:#d4d4d8;border-radius:10px;padding:10px 10px 10px 16px;border:1px solid var(--border)}
.ld-codebox code{font-family:var(--font-mono);font-size:13.5px;overflow-x:auto;white-space:nowrap;flex:1;scrollbar-width:none}
.ld-codebox code::-webkit-scrollbar{display:none}
.ld-copy-btn{flex:none;border:1px solid #3f3f46;background:#262626;color:#fff;font-size:12px;font-weight:600;padding:6px 13px;border-radius:999px;cursor:pointer;font-family:var(--font-sans)}
.ld-copy-btn:hover{background:#3f3f46}
.ld-config-row .plain{font-size:14.5px;color:var(--mut);line-height:1.55}
.ld-sample{background:#111;color:#dce7f5;border-radius:10px;padding:18px;overflow-x:auto;font-family:var(--font-mono);font-size:12.5px;line-height:1.65;margin-top:16px;border:1px solid var(--border);white-space:pre}
.ld-sample .c{color:#8fa8c8}
.ld-sample .s{color:#a8d8b9}
.ld-price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:22px}
.ld-price{margin-top:0;display:flex;flex-direction:column;position:relative}
.ld-price .plan-name{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--faint)}
.ld-price .amount{font-size:33px;font-weight:800;letter-spacing:-.03em;margin-top:12px}
.ld-price .per{font-size:12.5px;color:var(--faint);margin-top:4px}
.ld-price ul{list-style:none;margin:20px 0 24px;display:grid;gap:9px}
.ld-price ul li{font-size:14px;color:var(--mut);padding-left:22px;position:relative;line-height:1.45}
.ld-price ul li::before{content:"";position:absolute;left:0;top:5px;width:13px;height:13px;border-radius:50%;background:var(--hover) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 6.5 4.8 9 10 3' stroke='%231F9D55' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/8px no-repeat}
.ld-price .btn{margin-top:auto;width:100%}
.ld-price.pop{background:var(--txt);color:var(--bg);border-color:var(--txt)}
.ld-price.pop .plan-name{color:var(--bg);opacity:.55}
.ld-price.pop .per{color:var(--bg);opacity:.55}
.ld-price.pop ul li{color:var(--bg);opacity:.85}
.ld-price.pop .btn{background:var(--bg);color:var(--txt);border-color:var(--bg)}
.ld-pop-tag{position:absolute;top:-11px;right:20px;background:var(--txt);color:var(--bg);border:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.06em;padding:5px 12px;border-radius:999px}
.ld-price-note{font-size:13px;color:var(--faint);line-height:1.6;margin-top:16px;text-align:center}
.ld-compare{margin-top:20px;padding:8px 24px}
.ld-compare .row{display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:14px;padding:14px 0;border-top:1px solid var(--border);font-size:14px;align-items:center}
.ld-compare .row:first-child{border-top:none}
.ld-compare .row.head{font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
.ld-compare .k{color:var(--faint);font-weight:600}
.ld-compare .us{font-weight:700}
.ld-compare .them{color:var(--mut)}
.ld-faq{display:grid;gap:10px;margin-top:22px}
.ld-faq details{margin-top:0;padding:4px 22px}
.ld-faq summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:15px 0;list-style:none;display:flex;justify-content:space-between;align-items:center;gap:14px}
.ld-faq summary::-webkit-details-marker{display:none}
.ld-faq summary::after{content:"+";font-size:20px;font-weight:400;color:var(--faint);flex:none}
.ld-faq details[open ] summary::after{content:"–"}
.ld-faq details p{font-size:14.5px;color:var(--mut);line-height:1.65;padding:0 0 18px}
.ld-final{margin:64px 0 0;padding:50px 32px;text-align:center;border-radius:14px;background:var(--txt);color:var(--bg)}
.ld-final h2{font-size:clamp(27px,3.6vw,38px);letter-spacing:-.025em;line-height:1.15;font-weight:800}
.ld-final h2 em{font-style:normal;opacity:.55}
.ld-final p{opacity:.65;font-size:15.5px;margin:14px auto 26px;max-width:460px;line-height:1.6}
.ld-final .btn{background:var(--bg);color:var(--txt);border-color:var(--bg)}
.reveal{opacity:0;transform:translateY(16px);transition:opacity .6s ease,transform .6s ease}
.reveal.in{opacity:1;transform:none}
@media (max-width:960px){
  .ld-hero-grid{grid-template-columns:1fr;gap:28px}
  .ld-model-grid,.ld-price-grid,.ld-steps{grid-template-columns:repeat(2,1fr)}
  .ld-avail{grid-template-columns:1fr 1fr}
}
@media (max-width:640px){
  .ld-metrics{grid-template-columns:repeat(2,1fr)}
  .ld-topmodels .th,.ld-topmodels .tr{grid-template-columns:1fr 44px 44px 62px;font-size:11.5px}
  .ld-model-grid,.ld-price-grid,.ld-steps{grid-template-columns:1fr}
  .ld-avail{grid-template-columns:1fr}
  .ld-config-row{grid-template-columns:1fr;gap:8px}
  .ld-compare{padding:4px 18px}
  .ld-compare .row{grid-template-columns:1fr;font-size:13.5px;gap:4px;padding:12px 0}
  .ld-compare .row.head{display:none}
  .ld-hero-stats{grid-template-columns:repeat(2,1fr);gap:14px 20px}
  .ld-live-meta .tok{display:none}
}
@media (prefers-reduced-motion: reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .ld-live-row.enter{animation:none}
}
`;

const MODELS = [
  { id: "deepseek-v4-flash", fam: "DeepSeek", note: "Model andalan untuk coding dan chat. Cepat, pintar, dan stabil untuk pemakaian harian yang berat." },
  { id: "deepseek-v-4.1-flash", fam: "DeepSeek", note: "Generasi 4.1, reasoning lebih rapi." },
  { id: "qwen3.8-flash", fam: "Qwen", note: "Ringan, respons kilat, enak buat otomasi." },
  { id: "glm-5-3-flash", fam: "GLM", note: "Kuat di bahasa dan tugas umum." },
  { id: "mimo-v2.5", fam: "MiMo", note: "Seimbang untuk chat dan penalaran." },
  { id: "mimo-v2.6-flash", fam: "MiMo", note: "Varian flash, latensi rendah." },
  { id: "muse-spark-1.3", fam: "Meta", note: "Model cepat untuk tugas kreatif." },
  { id: "longcat-2.5-preview", fam: "LongCat", note: "Konteks panjang untuk dokumen besar." },
  { id: "fledge-alpha", fam: "Fledge", note: "Model eksperimental, serba bisa." },
  { id: "jev-1.13", fam: "JEV", note: "Ringan untuk integrasi cepat." },
  { id: "space-bunny", fam: "Space", note: "Karakter santai untuk chat kasual." },
  { id: "hy4-preview", fam: "HY", note: "Preview generasi terbaru." },
];

type LogEntry = { m: string; ms: number; tok: number; t: number };

// Live success log — real anonymized production successes (model, latency ms, output tokens, epoch s)
const LIVE_LOGS: LogEntry[] = [
  { m: "deepseek-v-4.1-flash", ms: 3241, tok: 410, t: 1791037928 },
  { m: "deepseek-v-4.1-flash", ms: 2696, tok: 402, t: 1791037926 },
  { m: "deepseek-v-4.1-flash", ms: 6620, tok: 928, t: 1791037924 },
  { m: "longcat-2.5-preview", ms: 17099, tok: 338, t: 1791037921 },
  { m: "glm-5-3-flash", ms: 26407, tok: 279, t: 1791037921 },
  { m: "deepseek-v-4.1-flash", ms: 2218, tok: 332, t: 1791037921 },
  { m: "deepseek-v-4.1-flash", ms: 2180, tok: 187, t: 1791037919 },
  { m: "deepseek-v-4.1-flash", ms: 9914, tok: 2197, t: 1791037914 },
  { m: "deepseek-v-4.1-flash", ms: 1500, tok: 109, t: 1791037912 },
  { m: "deepseek-v-4.1-flash", ms: 7413, tok: 742, t: 1791037908 },
  { m: "deepseek-v-4.1-flash", ms: 8923, tok: 403, t: 1791037908 },
  { m: "deepseek-v-4.1-flash", ms: 11787, tok: 665, t: 1791037905 },
  { m: "longcat-2.5-preview", ms: 16454, tok: 425, t: 1791037903 },
  { m: "deepseek-v-4.1-flash", ms: 7484, tok: 186, t: 1791037898 },
  { m: "deepseek-v-4.1-flash", ms: 7894, tok: 658, t: 1791037897 },
  { m: "glm-5-3-flash", ms: 14978, tok: 391, t: 1791037894 },
  { m: "glm-5-3-flash", ms: 8541, tok: 110, t: 1791037894 },
  { m: "deepseek-v-4.1-flash", ms: 12703, tok: 1405, t: 1791037891 },
  { m: "deepseek-v-4.1-flash", ms: 6207, tok: 997, t: 1791037889 },
  { m: "deepseek-v-4.1-flash", ms: 2453, tok: 350, t: 1791037889 },
  { m: "deepseek-v-4.1-flash", ms: 14975, tok: 2847, t: 1791037887 },
  { m: "muse-spark-1.3", ms: 4365, tok: 51, t: 1791037885 },
  { m: "deepseek-v-4.1-flash", ms: 1911, tok: 187, t: 1791037885 },
  { m: "deepseek-v-4.1-flash", ms: 4787, tok: 887, t: 1791037885 },
  { m: "muse-spark-1.3", ms: 22276, tok: 1552, t: 1791037884 },
  { m: "deepseek-v-4.1-flash", ms: 4617, tok: 1501, t: 1791037883 },
  { m: "deepseek-v-4.1-flash", ms: 6105, tok: 726, t: 1791037882 },
  { m: "glm-5-3-flash", ms: 1123, tok: 64, t: 1791037882 },
  { m: "muse-spark-1.3", ms: 9829, tok: 692, t: 1791037880 },
  { m: "deepseek-v-4.1-flash", ms: 4562, tok: 719, t: 1791037880 },
  { m: "deepseek-v-4.1-flash", ms: 2168, tok: 291, t: 1791037877 },
  { m: "deepseek-v-4.1-flash", ms: 3075, tok: 493, t: 1791037877 },
  { m: "glm-5-3-flash", ms: 63344, tok: 1661, t: 1791037877 },
  { m: "deepseek-v-4.1-flash", ms: 2327, tok: 835, t: 1791037874 },
  { m: "glm-5-3-flash", ms: 4337, tok: 64, t: 1791037871 },
  { m: "deepseek-v-4.1-flash", ms: 3602, tok: 1022, t: 1791037870 },
  { m: "glm-5-3-flash", ms: 5144, tok: 75, t: 1791037870 },
  { m: "deepseek-v-4.1-flash", ms: 3041, tok: 339, t: 1791037869 },
  { m: "deepseek-v-4.1-flash", ms: 2600, tok: 589, t: 1791037867 },
  { m: "glm-5-3-flash", ms: 57988, tok: 2870, t: 1791037865 },
  { m: "deepseek-v-4.1-flash", ms: 5086, tok: 816, t: 1791037863 },
  { m: "glm-5-3-flash", ms: 4675, tok: 106, t: 1791037863 },
  { m: "muse-spark-1.3", ms: 16273, tok: 1728, t: 1791037862 },
  { m: "muse-spark-1.3", ms: 14211, tok: 1382, t: 1791037860 },
  { m: "gpt-6-luna", ms: 16914, tok: 563, t: 1791037860 },
  { m: "deepseek-v-4.1-flash", ms: 3049, tok: 543, t: 1791037857 },
  { m: "glm-5-3-flash", ms: 9168, tok: 150, t: 1791037857 },
  { m: "qwen3.8-uncensored", ms: 2699, tok: 1, t: 1791037855 },
];

const fmtID = (n: number) => n.toLocaleString("id-ID");
const fmtCompact = (n: number) =>
  n >= 1e6
    ? (n / 1e6).toFixed(1).replace(".", ",") + " jt"
    : n >= 1e3
      ? (n / 1e3).toFixed(1).replace(".", ",") + " rb"
      : String(n);

const MAX_ROWS = 7;

type LiveRow = { e: LogEntry; shownAt: number; key: number };

function ageText(shownAt: number) {
  const s = Math.max(0, Math.round((Date.now() - shownAt) / 1000));
  if (s < 5) return "baru saja";
  if (s < 60) return s + " dtk lalu";
  const m = Math.floor(s / 60);
  if (m < 60) return m + " mnt lalu";
  return Math.floor(m / 60) + " jam lalu";
}

function CopyBaseUrlBtn() {
  const [label, setLabel] = useState("Copy");
  const timer = useRef<number | undefined>(undefined);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText("https://tiprouter.my.id/v1");
      setLabel("Tersalin");
    } catch {
      setLabel("Gagal");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setLabel("Copy"), 1600);
  };
  return (
    <button className="ld-copy-btn" type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function StatsCard() {
  const metrics = useMemo(() => {
    const totalTok = LIVE_LOGS.reduce((a, e) => a + e.tok, 0);
    const usedModels = new Set(LIVE_LOGS.map((e) => e.m)).size;
    const sortedMs = [...LIVE_LOGS.map((e) => e.ms)].sort((a, b) => a - b);
    const median = sortedMs[Math.floor(sortedMs.length / 2)] || 0;
    const byModel = new Map<string, { n: number; tok: number; tps: number[] }>();
    LIVE_LOGS.forEach((e) => {
      let b = byModel.get(e.m);
      if (!b) {
        b = { n: 0, tok: 0, tps: [] };
        byModel.set(e.m, b);
      }
      b.n++;
      b.tok += e.tok;
      if (e.ms > 0) b.tps.push(e.tok / (e.ms / 1000));
    });
    const top = [...byModel.entries()]
      .sort((a, b) => b[1].n - a[1].n)
      .slice(0, 3)
      .map(([name, b]) => ({
        name,
        n: b.n,
        tps: b.tps.length ? String(Math.round(b.tps.reduce((x, y) => x + y, 0) / b.tps.length)) : "—",
        tok: fmtCompact(b.tok),
      }));
    return {
      requests: fmtID(LIVE_LOGS.length),
      tokens: fmtCompact(totalTok),
      models: String(usedModels),
      median: (median / 1000).toFixed(1).replace(".", ",") + " dtk",
      top,
    };
  }, []);

  const [rows, setRows] = useState<LiveRow[]>(() => {
    const t0 = Math.max(...LIVE_LOGS.map((e) => e.t));
    const started = Date.now();
    return LIVE_LOGS.slice(0, MAX_ROWS).map((e, i) => ({
      e,
      shownAt: started - (t0 - e.t) * 1000,
      key: i,
    }));
  });
  const [, setNowTick] = useState(0);
  const idxRef = useRef(MAX_ROWS);
  const keyRef = useRef(MAX_ROWS);

  useEffect(() => {
    const iv = window.setInterval(() => {
      if (document.hidden) return;
      const e = LIVE_LOGS[idxRef.current % LIVE_LOGS.length];
      idxRef.current++;
      const row: LiveRow = { e, shownAt: Date.now(), key: keyRef.current++ };
      setRows((prev) => [row, ...prev].slice(0, MAX_ROWS));
    }, 4000);
    const ages = window.setInterval(() => setNowTick((t) => t + 1), 15000);
    return () => {
      window.clearInterval(iv);
      window.clearInterval(ages);
    };
  }, []);

  return (
    <div className="card reveal" style={{ marginTop: 0 }}>
      <div className="ld-stats-head">
        <span className="ld-label">
          <span className="dot" />
          Stats &amp; Activity
        </span>
        <span className="r">telemetri produksi</span>
      </div>
      <div className="ld-metrics">
        <div className="ld-metric">
          <p className="k">Requests</p>
          <p className="v">{metrics.requests}</p>
          <p className="s">request sukses terakhir</p>
        </div>
        <div className="ld-metric">
          <p className="k">Tokens</p>
          <p className="v">{metrics.tokens}</p>
          <p className="s">output terukur</p>
        </div>
        <div className="ld-metric">
          <p className="k">Models Used</p>
          <p className="v">{metrics.models}</p>
          <p className="s">dari 12 model</p>
        </div>
        <div className="ld-metric">
          <p className="k">Median</p>
          <p className="v">{metrics.median}</p>
          <p className="s">detik per respons</p>
        </div>
      </div>
      <div className="ld-topmodels">
        <div className="th">
          <span>Top Models</span>
          <span style={{ textAlign: "right" }}>Req</span>
          <span style={{ textAlign: "right" }}>TPS</span>
          <span style={{ textAlign: "right" }}>Tokens</span>
        </div>
        <div>
          {metrics.top.map((t) => (
            <div className="tr" key={t.name}>
              <span>{t.name}</span>
              <span className="num">{t.n}</span>
              <span className="num">{t.tps}</span>
              <span className="num">{t.tok}</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="ld-live-list" aria-label="Log request sukses terbaru">
        {rows.map((r, i) => (
          <li className={"ld-live-row" + (i === 0 && r.key >= MAX_ROWS ? " enter" : "")} key={r.key}>
            <span className="ld-live-check">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6.5 4.8 9 10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="ld-live-model">{r.e.m}</span>
            <span className="ld-live-meta">
              {(r.e.ms / 1000).toFixed(1).replace(".", ",") + " dtk"}{" "}
              <span className="tok">· {fmtID(r.e.tok)} token</span>
            </span>
            <span className="ld-live-ok">200 OK</span>
            <span className="ld-live-age">{ageText(r.shownAt)}</span>
          </li>
        ))}
      </ul>
      <div className="ld-stats-foot">
        <span className="ld-label" style={{ color: "var(--green)" }}>
          <span className="dot" />
          Open for requests
        </span>
        <span className="r">tiprouter.my.id</span>
      </div>
      <p className="ld-stats-note">
        Diambil dari telemetri produksi TipRouter (dianonimkan — nama pengguna dan isi chat tidak pernah ditampilkan). Latensi = waktu sampai respons selesai.
      </p>
    </div>
  );
}

const PRICES = [
  {
    name: "Trial · 1 hari",
    amount: "Rp3.000",
    per: "Rp3.000 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 1 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Basic · 3 hari",
    amount: "Rp6.000",
    per: "Rp2.000 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 3 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Plus · 7 hari",
    amount: "Rp10.000",
    per: "Rp1.429 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 7 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Essential · 14 hari",
    amount: "Rp18.000",
    per: "Rp1.286 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 14 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Pro · 30 hari",
    amount: "Rp30.000",
    per: "Rp1.000 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 30 hari", "QRIS otomatis", "Perpanjang key yang sama"],
    pop: true,
  },
];

const FAQS = [
  {
    q: "Unlimited-nya beneran unlimited?",
    a: "Iya. Selama masa aktif key kamu, tidak ada batas jumlah token atau request harian. Batas wajarnya 150 request per menit per key, supaya server tetap enak dipakai semua orang.",
  },
  {
    q: "Kalau masa aktif habis, key saya bagaimana?",
    a: "Key berhenti bekerja sampai diperpanjang. Perpanjangan memakai key yang sama, jadi konfigurasi di aplikasi kamu tidak perlu diubah.",
  },
  {
    q: "Bisa dipakai di aplikasi apa saja?",
    a: "Semua aplikasi yang mendukung endpoint kompatibel OpenAI: chatbot, plugin coding, script Python atau Node, sampai tools seperti LibreChat. Cukup ganti base URL dan key.",
  },
  {
    q: "Bayar pakai apa?",
    a: "QRIS otomatis (GoPay dan e-wallet) lewat halaman Beli. Key muncul otomatis begitu pembayaran masuk, tanpa nunggu admin.",
  },
  {
    q: "Boleh dipakai untuk jualan lagi?",
    a: "Key untuk pemakaian pribadi dan tim kecil kamu. Kalau butuh skala bisnis atau dijual lagi, chat admin dulu supaya diatur paket yang cocok.",
  },
];

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);

  // Scroll to the section named by location.hash on mount (e.g. arriving from /#harga).
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (!el) return;
    const t = window.setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
    return () => window.clearTimeout(t);
  }, []);

  // Reveal-on-scroll, like the original IntersectionObserver pass.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <PublicLayout wide>
      <style>{CSS}</style>
      <div ref={rootRef}>
        <div className="ld-hero">
          <div className="ld-hero-grid">
            <div>
              <p className="ld-eyebrow">
                TipRouter / <b>Community API</b>
              </p>
              <h1 className="ld-h1">
                Satu key, semua model, <em>tanpa batas token.</em>
              </h1>
              <p className="ld-sub">
                Bayar sekali untuk masa aktif 1 sampai 30 hari, lalu pakai semua model AI sepuasnya. Tanpa hitung token, tanpa kartu kredit.
              </p>
              <div className="ld-hero-cta">
                <Link className="btn primary" to="/beli">
                  Beli Sekarang
                </Link>
                <a className="btn" href="#model">
                  Lihat Model
                </a>
              </div>
              <p className="ld-hero-note">Satu key untuk semua model. Pool bersama untuk developer Indonesia.</p>
              <div className="ld-hero-stats">
                <div>
                  <p className="n">12</p>
                  <p className="l">model AI aktif</p>
                </div>
                <div>
                  <p className="n">150</p>
                  <p className="l">request per menit</p>
                </div>
                <div>
                  <p className="n">1 mnt</p>
                  <p className="l">key langsung aktif</p>
                </div>
                <div>
                  <p className="n">QRIS</p>
                  <p className="l">dan e-wallet</p>
                </div>
              </div>
            </div>

            <StatsCard />
          </div>
        </div>

        <div className="card ld-avail reveal">
          <div>
            <p className="ld-label">
              <span className="dot" />
              Current Availability
            </p>
            <h2>Open for requests</h2>
          </div>
          <div className="fact">
            <p className="k">Remaining</p>
            <p className="v">Unlimited</p>
            <p className="s">selama masa aktif key kamu</p>
          </div>
          <div className="fact">
            <p className="k">Models</p>
            <p className="v">12 model</p>
            <p className="s">semua terbuka di setiap paket</p>
          </div>
          <div className="fact">
            <p className="k">Fair Use</p>
            <p className="v">150 req/mnt</p>
            <p className="s">per key, biar pool enak dipakai semua</p>
          </div>
        </div>

        <section className="ld-section" id="model">
          <div className="ld-sec-head">
            <div>
              <p className="ld-label">Available Models</p>
              <h2 className="ld-sec">
                12 model, <em>satu key.</em>
              </h2>
              <p className="ld-lead">
                Tidak ada tier model. Semua key membuka semua model di bawah ini, dari yang paling ringan sampai yang paling pintar.
              </p>
            </div>
          </div>
          <div className="ld-model-grid">
            {MODELS.map((m) => (
              <article className="card ld-model-card reveal" key={m.id}>
                <div className="top">
                  <span className="fam">{m.fam}</span>
                  <span className="ld-mchip">
                    <i />
                    Available
                  </span>
                </div>
                <h3>{m.id}</h3>
                <p>{m.note}</p>
              </article>
            ))}
            <article className="card ld-model-card cta-tile reveal">
              <div className="top">
                <span className="fam">Request</span>
              </div>
              <h3>Model lain menyusul.</h3>
              <p>
                Request model favorit kamu lewat{" "}
                <a href="https://t.me/tiprouter_bot" target="_blank" rel="noopener">
                  Telegram
                </a>
                , kami usahakan masuk daftar.
              </p>
            </article>
          </div>
        </section>

        <section className="ld-section" id="cara-pakai">
          <p className="ld-label">Cara Pakai</p>
          <h2 className="ld-sec">
            Mulai dalam <em>tiga langkah.</em>
          </h2>
          <div className="ld-steps">
            <div className="card ld-step reveal">
              <p className="verb">
                <span>01</span>Beli
              </p>
              <p>Buka halaman Beli, pilih paket, lalu bayar pakai QRIS. Key muncul otomatis begitu pembayaran masuk.</p>
            </div>
            <div className="card ld-step reveal">
              <p className="verb">
                <span>02</span>Pasang
              </p>
              <p>
                Arahkan base URL aplikasi kamu ke <code>https://tiprouter.my.id/v1</code>, lalu tempel key-nya.
              </p>
            </div>
            <div className="card ld-step reveal">
              <p className="verb">
                <span>03</span>Pakai
              </p>
              <p>
                Panggil model apa pun, misalnya <code>deepseek-v4-flash</code>. Format request sama persis dengan OpenAI.
              </p>
            </div>
          </div>

          <div className="card ld-config reveal">
            <p className="ld-label">API Configuration</p>
            <div className="ld-config-row">
              <span className="k">Base URL</span>
              <div className="ld-codebox">
                <code>https://tiprouter.my.id/v1</code>
                <CopyBaseUrlBtn />
              </div>
            </div>
            <div className="ld-config-row">
              <span className="k">API Key</span>
              <p className="plain">
                Key pribadi kamu muncul otomatis setelah pembayaran — format <b>tip_…</b>, aktif ±1 menit.
              </p>
            </div>
            <div className="ld-config-row">
              <span className="k">Format</span>
              <p className="plain">Kompatibel OpenAI. Aplikasi yang sudah jalan tinggal ganti base URL dan key.</p>
            </div>
            <pre className="ld-sample">
              <span className="c"># Format OpenAI. Ganti base URL dan key saja.</span>
              {"\n"}
              {"curl https://tiprouter.my.id/v1/chat/completions \\\n  -H "}
              <span className="s">"Authorization: Bearer KEY_KAMU"</span>
              {" \\\n  -d "}
              <span className="s">
                {'\'{"model": "deepseek-v4-flash",\n       "messages": [{"role": "user",\n       "content": "Halo!"}]}\''}
              </span>
            </pre>
          </div>
        </section>

        <section className="ld-section" id="harga">
          <p className="ld-label">Pricing</p>
          <h2 className="ld-sec">
            Pilih masa <em>aktifmu.</em>
          </h2>
          <p className="ld-lead">
            Semua paket membuka semua model yang sama. Bedanya cuma masa aktif, makin lama makin murah per hari. Bayar sekali; tidak ada yang auto-perpanjang.
          </p>
          <div className="ld-price-grid">
            {PRICES.map((p) => (
              <div className={"card ld-price reveal" + (p.pop ? " pop" : "")} key={p.name}>
                {p.pop && <span className="ld-pop-tag">Paling hemat</span>}
                <p className="plan-name">{p.name}</p>
                <p className="amount">{p.amount}</p>
                <p className="per">{p.per}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Link className="btn" to="/beli">
                  Beli Sekarang
                </Link>
              </div>
            ))}
            <div className="card ld-price reveal">
              <p className="plan-name">Butuh lebih lama?</p>
              <p className="amount">Custom</p>
              <p className="per">paket di luar daftar, tanya dulu</p>
              <ul>
                <li>Masa aktif fleksibel</li>
                <li>Buat tim atau jualan lagi</li>
              </ul>
              <a className="btn" href="https://t.me/tiprouter_bot" target="_blank" rel="noopener">
                Chat Bot
              </a>
            </div>
          </div>
          <p className="ld-price-note">
            Bayar otomatis via QRIS (GoPay dan e-wallet). Key dikirim otomatis begitu pembayaran masuk, tanpa nunggu admin. Tidak ada tagihan lanjutan.
          </p>

          <div className="card ld-compare reveal">
            <div className="row head">
              <span>Perbandingan</span>
              <span>TipRouter</span>
              <span>API resmi per token</span>
            </div>
            <div className="row">
              <span className="k">Skema biaya</span>
              <span className="us">Flat per masa aktif</span>
              <span className="them">Per token, fluktuatif</span>
            </div>
            <div className="row">
              <span className="k">Jumlah model</span>
              <span className="us">12 model, satu key</span>
              <span className="them">Satu key per provider</span>
            </div>
            <div className="row">
              <span className="k">Cara bayar</span>
              <span className="us">QRIS, transfer, e-wallet</span>
              <span className="them">Kartu kredit internasional</span>
            </div>
            <div className="row">
              <span className="k">Support</span>
              <span className="us">Bahasa Indonesia, via Telegram</span>
              <span className="them">Bahasa Inggris, via tiket</span>
            </div>
          </div>
        </section>

        <section className="ld-section" id="faq">
          <p className="ld-label">FAQ</p>
          <h2 className="ld-sec">
            Sering <em>ditanyakan.</em>
          </h2>
          <div className="ld-faq">
            {FAQS.map((f) => (
              <details className="card reveal" key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="ld-final reveal">
          <h2>
            Berhenti kena limit <em>hari ini.</em>
          </h2>
          <p>Satu key, 12 model, aktif dalam semenit. Masa aktif mulai dari 1 hari, tanpa kartu kredit.</p>
          <Link className="btn" to="/beli">
            Beli Sekarang
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
