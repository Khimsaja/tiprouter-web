import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Send, Ticket, X } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { localeTag, tr, useLang } from "../lib/i18n";
import { usePublicStats } from "../lib/usePublicStats";
import { useActivePromos } from "../lib/useActivePromos";
import BansosDeepseek from "../components/BansosDeepseek";
import { promoDiscountLabel, usdIdr, toUsd } from "../lib/api";

const CSS = `
.ld-refbar{display:flex;align-items:flex-start;gap:10px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:11px 15px;font-size:13.5px;color:var(--mut);margin-bottom:14px;line-height:1.5}
.ld-refbar b{color:var(--txt)}
.ld-refbar .tag{background:#fff;color:#000;font-weight:800;font-size:11px;padding:3px 9px;border-radius:99px;letter-spacing:.06em;flex-shrink:0;margin-top:1px}
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
.ld-hero-stats{display:grid;grid-template-columns:repeat(5,auto);gap:10px 26px;margin-top:34px}
.ld-hero-stats .n{font-size:26px;font-weight:800;letter-spacing:-.02em}
.ld-hero-stats .l{font-size:12px;color:var(--faint);margin-top:2px}
.tgmodal-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);z-index:90;display:flex;align-items:center;justify-content:center;padding:20px;animation:tgfade .25s ease}
.tgmodal{position:relative;max-width:380px;width:100%;background:var(--panel);border:1px solid var(--border);border-radius:20px;padding:32px 28px;text-align:center;box-shadow:0 24px 60px rgba(0,0,0,.35);animation:tgpop .3s cubic-bezier(.2,1.4,.4,1)}
.tgmodal .tic{width:64px;height:64px;border-radius:50%;background:#229ED9;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:#fff}
.tgmodal h3{font-size:20px;font-weight:800;letter-spacing:-.02em;margin:0 0 8px}
.tgmodal p{font-size:14px;color:var(--mut);line-height:1.55;margin:0 0 20px}
.tgmodal .btn{display:inline-flex;align-items:center;gap:8px;text-decoration:none}
.tgmodal .close{position:absolute;top:10px;right:12px;background:none;border:0;color:var(--faint);cursor:pointer;padding:6px;font-size:18px;line-height:1}
.tgmodal .close:hover{color:var(--txt)}
.tgmodal .later{display:block;margin-top:12px;background:none;border:0;color:var(--faint);font-size:13px;cursor:pointer;font-family:inherit}
.tgmodal .later:hover{color:var(--mut);text-decoration:underline}
@keyframes tgfade{from{opacity:0}to{opacity:1}}
@keyframes tgpop{from{opacity:0;transform:scale(.92) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@media (max-width:560px){.tgmodal{padding:26px 20px}}
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
.ld-topmodels.cols3 .th,.ld-topmodels.cols3 .tr{grid-template-columns:1fr 64px 64px}
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
.ld-price .usd{font-size:13px;color:var(--faint);margin-top:2px;font-weight:600}
.ld-price .per{font-size:12.5px;color:var(--faint);margin-top:4px}
.ld-price ul{list-style:none;margin:20px 0 24px;display:grid;gap:9px}
.ld-price ul li{font-size:14px;color:var(--mut);padding-left:22px;position:relative;line-height:1.45}
.ld-price ul li::before{content:"";position:absolute;left:0;top:5px;width:13px;height:13px;border-radius:50%;background:var(--hover) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2 6.5 4.8 9 10 3' stroke='%231F9D55' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/8px no-repeat}
.ld-price .btn{margin-top:auto;width:100%}
.ld-price.pop{border-color:var(--txt);box-shadow:0 0 0 1px var(--txt)}
.ld-price.pop .btn{background:var(--btn);color:var(--btn-t);border-color:var(--btn)}
.ld-pop-tag{position:absolute;top:-11px;right:20px;background:var(--txt);color:var(--bg);border:1px solid var(--border);font-size:11px;font-weight:700;letter-spacing:.06em;padding:5px 12px;border-radius:999px}
.ld-price-note{font-size:13px;color:var(--faint);line-height:1.6;margin-top:16px;text-align:center}
.ld-promo-strip{display:grid;gap:10px;margin-top:20px}
.ld-promo{display:flex;align-items:center;gap:14px;padding:14px 18px;border:1px solid var(--border);border-radius:12px;background:var(--hover)}
.ld-promo-ic{flex:none;width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:rgba(52,211,153,.12);color:#34d399}
.ld-promo-tx{flex:1;min-width:0}
.ld-promo-code{font-family:var(--font-mono);font-weight:800;font-size:15px;letter-spacing:.04em}
.ld-promo-code span{font-family:var(--font-sans);font-weight:600;font-size:13px;color:var(--mut);letter-spacing:0;margin-left:10px}
.ld-promo-left{font-size:12.5px;color:var(--faint);margin-top:3px}
.ld-promo .btn{flex:none}
@media(max-width:640px){.ld-promo{flex-wrap:wrap}.ld-promo .btn{width:100%}}
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
  .ld-topmodels.cols3 .th,.ld-topmodels.cols3 .tr{grid-template-columns:1fr 56px 56px}
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

// fam/note marketing per model; the ID list itself is fetched live from the
// 'tiprouter new' template via /api/template-models (FALLBACK_MODELS if offline).
const MODEL_META: Record<string, { fam: string; note: string }> = {
  "deepseek-v-4.1-flash": { fam: "DeepSeek", note: "Generasi 4.1, reasoning lebih rapi." },
  "deepseek-v4.1-flash": { fam: "DeepSeek", note: "Varian 4.1 yang cepat dan stabil buat pemakaian harian." },
  "fledge-alpha": { fam: "Fledge", note: "Model eksperimental, serba bisa." },
  "gemini-3.8-flash": { fam: "Gemini", note: "Generasi Gemini terbaru, cepat dan serba bisa." },
  "glm-5-3-flash": { fam: "GLM", note: "Kuat di bahasa dan tugas umum." },
  "gpt-6-luna": { fam: "GPT", note: "Flagship generasi terbaru, paling pintar." },
  "hy4-preview": { fam: "HY", note: "Preview generasi terbaru." },
  "jev-1.13": { fam: "JEV", note: "Ringan untuk integrasi cepat." },
  "ling-3.1-flash": { fam: "Ling", note: "Ringan dan responsif buat chat harian." },
  "longcat-2.5-preview": { fam: "LongCat", note: "Konteks panjang untuk dokumen besar." },
  "mimo-v2.5": { fam: "MiMo", note: "Seimbang untuk chat dan penalaran." },
  "mimo-v2.6.flash": { fam: "MiMo", note: "Varian flash, latensi rendah." },
  "muse-spark-1.3": { fam: "Meta", note: "Model cepat untuk tugas kreatif." },
  "qwen-3.8-27b": { fam: "Qwen", note: "Ringan, respons kilat, enak buat otomasi." },
  "space-bunny": { fam: "Space", note: "Karakter santai untuk chat kasual." },
};
const FALLBACK_MODELS = Object.keys(MODEL_META);

const fmtID = (n: number) => n.toLocaleString(localeTag());
const fmtCompact = (n: number) =>
  n >= 1e6
    ? (n / 1e6).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + tr(" jt")
    : n >= 1e3
      ? (n / 1e3).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + tr(" rb")
      : String(n);

function CopyBaseUrlBtn() {
  const { t } = useLang();
  const [label, setLabel] = useState("Copy");
  const timer = useRef<number | undefined>(undefined);
  const onClick = async () => {
    try {
      await navigator.clipboard.writeText("https://tiprouter.my.id/v1");
      setLabel(t("Tersalin"));
    } catch {
      setLabel(t("Gagal"));
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
  const { t } = useLang();
  const { stats, error } = usePublicStats();
  const loading = !stats && !error;

  const top = (stats?.top_models ?? []).slice(0, 5);
  const pct = (r: number) => (r * 100).toLocaleString(localeTag(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
  const val = (v: string) => (loading ? "\u2026" : v);

  return (
    <div className="card reveal" style={{ marginTop: 0 }}>
      <div className="ld-stats-head">
        <span className="ld-label">
          <span className="dot" />
          {t("Statistik live")}
        </span>
        <span className="r">{t("24 jam terakhir")}</span>
      </div>
      <div className="ld-metrics">
        <div className="ld-metric">
          <p className="k">{t("Requests")}</p>
          <p className="v">{stats ? fmtID(stats.requests) : val("")}</p>
          <p className="s">{t("total request")}</p>
        </div>
        <div className="ld-metric">
          <p className="k">{t("Input tokens")}</p>
          <p className="v">{stats ? fmtCompact(stats.input_tokens) : val("")}</p>
          <p className="s">{t("token prompt")}</p>
        </div>
        <div className="ld-metric">
          <p className="k">{t("Output tokens")}</p>
          <p className="v">{stats ? fmtCompact(stats.output_tokens) : val("")}</p>
          <p className="s">{t("token completion")}</p>
        </div>
        <div className="ld-metric">
          <p className="k">{t("Success rate")}</p>
          <p className="v">{stats ? pct(stats.success_rate) : val("")}</p>
          <p className="s">{stats ? t("{n} sukses", { n: fmtID(stats.ok) }) : t("tingkat sukses")}</p>
        </div>
      </div>
      <div className="ld-topmodels cols3">
        <div className="th">
          <span>{t("Model terlaris")}</span>
          <span style={{ textAlign: "right" }}>{t("Req")}</span>
          <span style={{ textAlign: "right" }}>{t("Sukses")}</span>
        </div>
        <div>
          {top.map((m) => (
            <div className="tr" key={m.model}>
              <span>{m.model}</span>
              <span className="num">{fmtID(m.hits)}</span>
              <span className="num">{fmtID(m.ok)}</span>
            </div>
          ))}
          {loading && (
            <div className="tr"><span>{t("Memuat\u2026")}</span><span className="num">\u2026</span><span className="num">\u2026</span></div>
          )}
        </div>
      </div>
      <div className="ld-stats-foot">
        <span className="ld-label" style={{ color: "var(--green)" }}>
          <span className="dot" />
          Open for requests
        </span>
        <Link to="/statistik" className="r" style={{ textDecoration: "underline" }}>{t("Lihat statistik lengkap")}</Link>
      </div>
      {error && !stats && (
        <p className="ld-stats-note">{t("Statistik lagi tidak bisa dimuat. Coba refresh halaman.")}</p>
      )}
      {!error && (
        <p className="ld-stats-note">
          {t("Data asli 24 jam terakhir dari jaringan TipRouter (agregat anonim — tanpa nama pengguna, isi chat, atau data key). Diperbarui tiap menit.")}
        </p>
      )}
    </div>
  );
}

const PRICES = [
  {
    name: "Trial · 1 hari",
    amount: "Rp3.000",
    idr: 3000,
    per: "Rp3.000 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 1 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Basic · 3 hari",
    amount: "Rp8.000",
    idr: 8000,
    per: "Rp2.667 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 3 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Plus · 7 hari",
    amount: "Rp15.000",
    idr: 15000,
    per: "Rp2.143 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 7 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Essential · 14 hari",
    amount: "Rp24.000",
    idr: 24000,
    per: "Rp1.714 per hari · sekali bayar",
    features: ["Semua model, satu key", "Unlimited 14 hari", "QRIS otomatis"],
    pop: false,
  },
  {
    name: "Pro · 30 hari",
    amount: "Rp40.000",
    idr: 40000,
    per: "Rp1.333 per hari · sekali bayar",
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
  {
    q: "Apakah kompatibel dengan 9Router?",
    a: "Tidak. TipRouter dan 9Router adalah dua produk yang berbeda dan tidak saling kompatibel. Key TipRouter hanya berfungsi di endpoint TipRouter (tiprouter.my.id/v1), tidak bisa dipakai di 9Router, begitu juga sebaliknya.",
  },
];

export default function Landing() {
  const { t } = useLang();
  const rootRef = useRef<HTMLDivElement>(null);
  // Popup channel Telegram: tampil setiap buka web.
  const [showTg, setShowTg] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowTg(true), 1200);
    return () => clearTimeout(timer);
  }, []);
  const dismissTg = () => setShowTg(false);
  const [refCode] = useState<string | null>(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("ref");
      if (q && /^[A-Za-z0-9]{4,16}$/.test(q)) return q.toUpperCase();
      return localStorage.getItem("tr_ref");
    } catch { return null; }
  });

  // Kode promo aktif + sisa kuota (poll 60 dtk).
  const promos = useActivePromos();

  // Kurs USD->IDR buat tampilan konversi harga (display only).
  const [fx, setFx] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    usdIdr().then((r) => { if (alive) setFx(r); });
    return () => { alive = false; };
  }, []);

  // Model IDs come live from the 'tiprouter new' template; fallback if the API is unreachable.
  const [modelIds, setModelIds] = useState<string[]>(FALLBACK_MODELS);
  useEffect(() => {
    let alive = true;
    fetch("/api/template-models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d.models) && d.models.length > 0) {
          setModelIds(d.models.filter((x: unknown) => typeof x === "string"));
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Scroll to the section named by location.hash on mount (e.g. arriving from /#harga).
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (!el) return;
    const t = window.setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
    return () => window.clearTimeout(t);
  }, []);

  // Reveal-on-scroll, like the original IntersectionObserver pass.
  // Re-run when modelIds loads: cards added after the async
  // /api/template-models fetch were never observed and stayed invisible.
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
  }, [modelIds]);

  return (
    <PublicLayout wide>
      {refCode && (
        <div className="ld-refbar">
          <span className="tag">{t("Referral")}</span>
          <span>{t("Kamu diundang teman")} <b>{refCode}</b> — {t("daftar dan beli paket, kalian berdua dapat bonus hari.")}</span>
        </div>
      )}
      <style>{CSS}</style>
      <div ref={rootRef}>
        <div className="ld-hero">
          <div className="ld-hero-grid">
            <div>
              <p className="ld-eyebrow">
                TipRouter / <b>Community API</b>
              </p>
              <h1 className="ld-h1">
                {t("Satu key, semua model,")} <em>{t("tanpa batas token.")}</em>
              </h1>
              <p className="ld-sub">
                {t("Bayar sekali untuk masa aktif 1 sampai 30 hari, lalu pakai semua model AI sepuasnya. Tanpa hitung token, tanpa kartu kredit.")}
              </p>
              <div className="ld-hero-cta">
                <Link className="btn primary" to="/beli">
                  {t("Beli Sekarang")}
                </Link>
                <a className="btn" href="#model">
                  {t("Lihat Model")}
                </a>
              </div>
              <p className="ld-hero-note">{t("Satu key untuk semua model. Coba gratis dulu lewat gacha bansos.")}</p>
              <div className="ld-hero-stats">
                <div>
                  <p className="n">{modelIds.length}</p>
                  <p className="l">{t("model AI aktif")}</p>
                </div>
                <div>
                  <p className="n">150</p>
                  <p className="l">{t("request per menit")}</p>
                </div>
                <div>
                  <p className="n">4</p>
                  <p className="l">{t("request barengan per key")}</p>
                </div>
                <div>
                  <p className="n">{t("1 mnt")}</p>
                  <p className="l">{t("key langsung aktif")}</p>
                </div>
                <div>
                  <p className="n">QRIS</p>
                  <p className="l">{t("dan e-wallet")}</p>
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
            <p className="s">{t("selama masa aktif key kamu")}</p>
          </div>
          <div className="fact">
            <p className="k">Models</p>
            <p className="v">{t("{n} model", { n: modelIds.length })}</p>
            <p className="s">{t("semua terbuka di setiap paket")}</p>
          </div>
          <div className="fact">
            <p className="k">Fair Use</p>
            <p className="v">{t("150 req/mnt")}</p>
            <p className="s">{t("per key, biar pool enak dipakai semua")}</p>
          </div>
        </div>

        <BansosDeepseek />

        <section className="ld-section" id="model">
          <div className="ld-sec-head">
            <div>
              <p className="ld-label">Available Models</p>
              <h2 className="ld-sec">
                {t("{n} model,", { n: modelIds.length })} <em>{t("satu key.")}</em>
              </h2>
              <p className="ld-lead">
                {t("Tidak ada tier model. Semua key membuka semua model di bawah ini, dari yang paling ringan sampai yang paling pintar.")}
              </p>
            </div>
          </div>
          <div className="ld-model-grid">
            {modelIds.map((id) => {
              const meta = MODEL_META[id] ?? { fam: id.split("-")[0].toUpperCase(), note: "" };
              return (
                <article className="card ld-model-card reveal" key={id}>
                  <div className="top">
                    <span className="fam">{meta.fam}</span>
                    <span className="ld-mchip">
                      <i />
                      Available
                    </span>
                  </div>
                  <h3>{id}</h3>
                  {meta.note ? <p>{t(meta.note)}</p> : null}
                </article>
              );
            })}
            <article className="card ld-model-card cta-tile reveal">
              <div className="top">
                <span className="fam">Request</span>
              </div>
              <h3>{t("Model lain menyusul.")}</h3>
              <p>
                {t("Request model favorit kamu lewat")}{" "}
                <a href="https://t.me/hermestele" target="_blank" rel="noopener">
                  Telegram
                </a>
                {t(", kami usahakan masuk daftar.")}
              </p>
            </article>
          </div>
        </section>

        <section className="ld-section" id="cara-pakai">
          <p className="ld-label">{t("Cara Pakai")}</p>
          <h2 className="ld-sec">
            {t("Mulai dalam")} <em>{t("tiga langkah.")}</em>
          </h2>
          <div className="ld-steps">
            <div className="card ld-step reveal">
              <p className="verb">
                <span>01</span>{t("Beli")}
              </p>
              <p>{t("Buka halaman Beli, pilih paket, lalu bayar pakai QRIS. Key muncul otomatis begitu pembayaran masuk.")}</p>
            </div>
            <div className="card ld-step reveal">
              <p className="verb">
                <span>02</span>{t("Pasang")}
              </p>
              <p>
                {t("Arahkan base URL aplikasi kamu ke")} <code>https://tiprouter.my.id/v1</code>{t(", lalu tempel key-nya.")}
              </p>
            </div>
            <div className="card ld-step reveal">
              <p className="verb">
                <span>03</span>{t("Pakai")}
              </p>
              <p>
                {t("Panggil model apa pun, misalnya")} <code>deepseek-v-4.1-flash</code>{t(". Format request sama persis dengan OpenAI.")}
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
                {t("Key pribadi kamu muncul otomatis setelah pembayaran — format")} <b>tip_…</b>{t(", aktif ±1 menit.")}
              </p>
            </div>
            <div className="ld-config-row">
              <span className="k">Format</span>
              <p className="plain">{t("Kompatibel OpenAI. Aplikasi yang sudah jalan tinggal ganti base URL dan key.")}</p>
            </div>
            <pre className="ld-sample">
              <span className="c"># Format OpenAI. Ganti base URL dan key saja.</span>
              {"\n"}
              {"curl https://tiprouter.my.id/v1/chat/completions \\\n  -H "}
              <span className="s">"Authorization: Bearer KEY_KAMU"</span>
              {" \\\n  -d "}
              <span className="s">
                {'\'{"model": "deepseek-v-4.1-flash",\n       "messages": [{"role": "user",\n       "content": "Halo!"}]}\''}
              </span>
            </pre>
          </div>
        </section>

        <section className="ld-section" id="harga">
          <p className="ld-label">Pricing</p>
          <h2 className="ld-sec">
            {t("Pilih masa")} <em>{t("aktifmu.")}</em>
          </h2>
          <p className="ld-lead">
            {t("Semua paket membuka semua model yang sama. Bedanya cuma masa aktif, makin lama makin murah per hari. Bayar sekali; tidak ada yang auto-perpanjang.")}
          </p>
          {promos && promos.length > 0 && (
            <div className="ld-promo-strip">
              {promos.map((p) => (
                <div className="ld-promo" key={p.code}>
                  <span className="ld-promo-ic">
                    <Ticket size={20} />
                  </span>
                  <div className="ld-promo-tx">
                    <p className="ld-promo-code">
                      {p.code}
                      <span>{t("Diskon {d} semua paket", { d: promoDiscountLabel(p) })}</span>
                    </p>
                    <p className="ld-promo-left">
                      {p.remaining != null
                        ? t("Sisa {n} dari {m} pemakaian", { n: p.remaining, m: p.max_uses ?? 0 })
                        : t("Kuota tanpa batas")}
                    </p>
                  </div>
                  <Link className="btn sm" to="/beli">
                    {t("Pakai kode")}
                  </Link>
                </div>
              ))}
            </div>
          )}
          <div className="ld-price-grid">
            {PRICES.map((p) => (
              <div className={"card ld-price reveal" + (p.pop ? " pop" : "")} key={p.name}>
                {p.pop && <span className="ld-pop-tag">{t("Paling hemat")}</span>}
                <p className="plan-name">{t(p.name)}</p>
                <p className="amount">{t(p.amount)}</p>
                {toUsd(p.idr, fx) && <p className="usd">{toUsd(p.idr, fx)}</p>}
                <p className="per">{t(p.per)}</p>
                <ul>
                  {p.features.map((f) => (
                    <li key={f}>{t(f)}</li>
                  ))}
                </ul>
                <Link className="btn" to="/beli">
                  {t("Beli Sekarang")}
                </Link>
              </div>
            ))}
            <div className="card ld-price reveal">
              <p className="plan-name">{t("Butuh lebih lama?")}</p>
              <p className="amount">Custom</p>
              <p className="per">{t("paket di luar daftar, tanya dulu")}</p>
              <ul>
                <li>{t("Masa aktif fleksibel")}</li>
                <li>{t("Buat tim atau jualan lagi")}</li>
              </ul>
              <a className="btn" href="https://t.me/hermestele" target="_blank" rel="noopener">
                {t("Chat Admin")}
              </a>
            </div>
          </div>
          <p className="ld-price-note">
            {t("Bayar otomatis via QRIS (GoPay dan e-wallet). Key dikirim otomatis begitu pembayaran masuk, tanpa nunggu admin. Tidak ada tagihan lanjutan.")}
          </p>

          <div className="card ld-compare reveal">
            <div className="row head">
              <span>{t("Perbandingan")}</span>
              <span>TipRouter</span>
              <span>{t("API resmi per token")}</span>
            </div>
            <div className="row">
              <span className="k">{t("Skema biaya")}</span>
              <span className="us">{t("Flat per masa aktif")}</span>
              <span className="them">{t("Per token, fluktuatif")}</span>
            </div>
            <div className="row">
              <span className="k">{t("Jumlah model")}</span>
              <span className="us">{t("{n} model, satu key", { n: modelIds.length })}</span>
              <span className="them">{t("Satu key per provider")}</span>
            </div>
            <div className="row">
              <span className="k">{t("Cara bayar")}</span>
              <span className="us">{t("QRIS, transfer, e-wallet")}</span>
              <span className="them">{t("Kartu kredit internasional")}</span>
            </div>
            <div className="row">
              <span className="k">Support</span>
              <span className="us">{t("Bahasa Indonesia, via Telegram")}</span>
              <span className="them">{t("Bahasa Inggris, via tiket")}</span>
            </div>
          </div>
        </section>

        <section className="ld-section" id="faq">
          <p className="ld-label">FAQ</p>
          <h2 className="ld-sec">
            {t("Sering")} <em>{t("ditanyakan.")}</em>
          </h2>
          <div className="ld-faq">
            {FAQS.map((f) => (
              <details className="card reveal" key={f.q}>
                <summary>{t(f.q)}</summary>
                <p>{t(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="ld-final reveal">
          <h2>
            {t("Berhenti kena limit")} <em>{t("hari ini.")}</em>
          </h2>
          <p>{t("Satu key, {n} model, aktif dalam semenit. Masa aktif mulai dari 1 hari, tanpa kartu kredit.", { n: modelIds.length })}</p>
          <Link className="btn" to="/beli">
            {t("Beli Sekarang")}
          </Link>
        </div>
      </div>
      {showTg && (
        <div className="tgmodal-ov" onClick={dismissTg}>
          <div className="tgmodal" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={dismissTg} aria-label={t("Tutup")}><X size={20} /></button>
            <div className="tic"><Send size={30} /></div>
            <h3>{t("Join channel Telegram kami")}</h3>
            <p>{t("Dapatkan info promo, update model terbaru, dan pengumuman penting langsung di Telegram.")}</p>
            <a className="btn primary" href="https://t.me/tiprouter" target="_blank" rel="noopener" onClick={dismissTg}>
              <Send size={16} /> {t("Join @tiprouter")}
            </a>
            <button className="later" onClick={dismissTg}>{t("Nanti saja")}</button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
