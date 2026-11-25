import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/*
 * Landing TipRouter v4 — Glass Lab dicabut, katalog model jadi chip kompak
 * (siap jualan). Basis tetap file export preview v3; token kaca (.ld) tidak
 * berubah — blur 2px / transparansi 30% / saturasi 100% kini tetap, tidak
 * bisa diubah-ubah lagi.
 */
const CSS = `
.ld{
  --blur:2px;--glass-alpha:.30;--sat:100%;--radius:22px;
  --font:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --bg:#dcebfb;--bg-2:#e6f3f7;--bg-3:#e9e6fd;--ink:#0a2547;--ink-2:#3d5c7d;--ink-3:#6e8cae;
  --glass:rgba(255,255,255,var(--glass-alpha));
  --glass-strong:rgba(255,255,255,.8);
  --glass-soft:rgba(255,255,255,.4);
  --stroke:rgba(255,255,255,.8);
  --stroke-2:rgba(10,37,71,.1);
  --shadow:0 24px 60px -24px rgba(13,64,120,.3),0 4px 16px -6px rgba(13,64,120,.13);
  --accent:#0b74ce;--accent-ink:#ffffff;--accent-soft:rgba(11,116,206,.12);
  --amber:#b97a0e;--amber-soft:rgba(217,148,26,.16);
  --code-bg:rgba(7,29,54,.95);--code-ink:#dcecff;
  --blob-a:#4f9ff0;--blob-b:#22b3a5;--blob-c:#3b82e0;--blob-d:#b7a8f5;--blob-e:#8f7bf2;
  --nav-bg:rgba(255,255,255,.55);--chip:rgba(255,255,255,.5);--input:rgba(255,255,255,.6);
  color-scheme:light;
  font-family:var(--font);color:var(--ink);background:var(--bg);padding-top:14px;
  -webkit-font-smoothing:antialiased;line-height:1.55;
}
html[data-theme="dark"] .ld{
  --bg:#04101f;--bg-2:#062a33;--bg-3:#0d1338;--ink:#edf5ff;--ink-2:#a9c3de;--ink-3:#6f8cae;
  --glass:rgba(13,32,56,calc(var(--glass-alpha)*.72));
  --glass-strong:rgba(16,40,68,.85);
  --glass-soft:rgba(14,34,58,.42);
  --stroke:rgba(255,255,255,.14);
  --stroke-2:rgba(255,255,255,.08);
  --shadow:0 24px 60px -24px rgba(0,0,0,.65),0 4px 16px -6px rgba(0,0,0,.4);
  --accent:#56b0f7;--accent-ink:#04182e;--accent-soft:rgba(86,176,247,.15);
  --amber:#f5bc52;--amber-soft:rgba(245,188,82,.14);
  --code-bg:rgba(3,12,24,.94);--code-ink:#dcecff;
  --blob-a:#1468c4;--blob-b:#0d8a7a;--blob-c:#1a6fc0;--blob-d:#2a1a6b;--blob-e:#4a2a8a;
  --nav-bg:rgba(8,24,44,.55);--chip:rgba(255,255,255,.07);--input:rgba(255,255,255,.06);
  color-scheme:dark;
}
/* Matikan aurora body::before situs saat landing tampil — preview punya
   living background-nya sendiri. */
body:has(.ld)::before{display:none}
.ld ::selection{background:var(--accent);color:var(--accent-ink)}
.ld a{color:inherit}
.ld button{font-family:var(--font);cursor:pointer}
.ld button,.ld summary,.ld input{min-height:2.25rem}
.ld :focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}

/* ===== Living background ===== */
.ld .wallpaper{position:fixed;inset:0;z-index:-3;background:linear-gradient(155deg,var(--bg) 0%,var(--bg-2) 42%,var(--bg-3) 72%,var(--bg) 100%)}
.ld .blob{position:fixed;border-radius:50%;filter:blur(70px);z-index:-2;opacity:.75;pointer-events:none}
.ld .blob-a{width:56vw;height:56vw;min-width:340px;min-height:340px;background:var(--blob-a);top:-16vw;right:-10vw}
.ld .blob-b{width:38vw;height:38vw;min-width:260px;min-height:260px;background:var(--blob-b);top:34vh;left:-14vw;opacity:.55}
.ld .blob-c{width:44vw;height:44vw;min-width:300px;min-height:300px;background:var(--blob-c);bottom:-18vw;right:6vw;opacity:.55}
.ld .blob-d{width:26vw;height:26vw;min-width:200px;min-height:200px;background:var(--blob-d);top:120vh;left:22vw;opacity:.45}
.ld .blob-e{width:32vw;height:32vw;min-width:240px;min-height:240px;background:var(--blob-e);top:6vh;left:36vw;opacity:.4}
@keyframes drift1{from{transform:translate(0,0) scale(1)}to{transform:translate(-4vw,5vh) scale(1.08)}}
@keyframes drift2{from{transform:translate(0,0)}to{transform:translate(5vw,-4vh)}}
@keyframes hover1{0%,100%{margin-top:0}50%{margin-top:-8px}}
@keyframes scrollx{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: no-preference){
  .ld .blob-a{animation:drift1 26s ease-in-out infinite alternate}
  .ld .blob-b{animation:drift2 32s ease-in-out infinite alternate}
  .ld .blob-c{animation:drift1 38s ease-in-out infinite alternate-reverse}
  .ld .blob-e{animation:drift2 30s ease-in-out infinite alternate-reverse}
  .ld .card-float-a{animation:hover1 7s ease-in-out infinite}
  .ld .marquee{animation:scrollx 36s linear infinite}
}
.ld .grid-overlay{position:fixed;inset:0;z-index:-1;pointer-events:none;opacity:.5;
  background-image:linear-gradient(var(--stroke-2) 1px,transparent 1px),linear-gradient(90deg,var(--stroke-2) 1px,transparent 1px);
  background-size:56px 56px;
  -webkit-mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%);
          mask-image:radial-gradient(ellipse 90% 60% at 50% 0%,#000 30%,transparent 75%);}

/* ===== Glass primitives ===== */
.ld .glass{
  background:var(--glass);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(var(--sat));
          backdrop-filter:blur(var(--blur)) saturate(var(--sat));
  border:1px solid var(--stroke);
  box-shadow:var(--shadow), inset 0 1px 0 rgba(255,255,255,.35);
  border-radius:var(--radius);
}
.ld .glass-soft{
  background:var(--glass-soft);
  -webkit-backdrop-filter:blur(calc(var(--blur)*.7)) saturate(var(--sat));
          backdrop-filter:blur(calc(var(--blur)*.7)) saturate(var(--sat));
  border:1px solid var(--stroke-2);
  border-radius:var(--radius);
}
.ld .wrap{max-width:1180px;margin:0 auto;padding:0 20px}

/* ===== Nav ===== */
.ld .nav-shell{position:sticky;top:12px;z-index:50;padding:0 16px;margin-top:0}
.ld .nav{
  max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:14px;
  padding:10px 12px 10px 18px;border-radius:999px;
  background:var(--nav-bg);
  -webkit-backdrop-filter:blur(var(--blur)) saturate(var(--sat));
          backdrop-filter:blur(var(--blur)) saturate(var(--sat));
  border:1px solid var(--stroke);
  box-shadow:var(--shadow), inset 0 1px 0 rgba(255,255,255,.3);
}
.ld .brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;font-size:17px;letter-spacing:-.02em;white-space:nowrap}
.ld .brand-mark{width:34px;height:34px;border-radius:11px;flex:none;display:grid;place-items:center;background:var(--accent);color:var(--accent-ink);box-shadow:inset 0 1px 0 rgba(255,255,255,.4)}
.ld .brand em{font-style:normal;color:var(--accent)}
.ld .nav-links{display:flex;gap:2px;margin-left:8px}
.ld .nav-links a{text-decoration:none;font-size:14px;font-weight:600;color:var(--ink-2);padding:9px 13px;border-radius:999px;min-height:36px;display:inline-flex;align-items:center}
.ld .nav-links a:hover{color:var(--ink);background:var(--chip)}
.ld .nav-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.ld .icon-btn{width:40px;height:40px;border-radius:50%;border:1px solid var(--stroke-2);background:var(--chip);color:var(--ink);display:grid;place-items:center;flex:none}
.ld .btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border:none;
  font-weight:700;font-size:14.5px;padding:11px 20px;border-radius:999px;min-height:44px;transition:transform .15s ease;
  white-space:nowrap;
}
.ld .btn:active{transform:scale(.97)}
.ld .btn-primary{background:var(--accent);color:var(--accent-ink);box-shadow:0 12px 28px -10px var(--accent), inset 0 1px 0 rgba(255,255,255,.35)}
.ld .btn-ghost{background:var(--chip);color:var(--ink);border:1px solid var(--stroke)}
.ld .btn-sm{padding:9px 16px;min-height:40px;font-size:13.5px}
.ld .burger{display:none}

/* ===== Hero ===== */
.ld .hero{padding:64px 0 30px}
.ld .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center}
.ld .hero-grid>*{min-width:0}
.ld .pill{
  display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;letter-spacing:.04em;
  padding:7px 14px;border-radius:999px;background:var(--chip);border:1px solid var(--stroke);color:var(--ink-2);
}
.ld h1{font-size:clamp(38px,5.4vw,62px);line-height:1.04;letter-spacing:-.035em;font-weight:800;margin:20px 0 18px}
.ld h1 .grad{color:var(--accent)}
.ld .hero-sub{font-size:clamp(16px,2vw,18.5px);color:var(--ink-2);max-width:34em;margin:0 0 28px}
.ld .hero-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.ld .hero-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px;margin-top:32px;max-width:460px}
.ld .hero-meta .m b{display:block;font-size:21px;letter-spacing:-.02em}
.ld .hero-meta .m span{display:block;font-size:12.5px;color:var(--ink-3);font-weight:600;margin-top:2px}

/* hero visual stack */
.ld .stack{position:relative;min-height:420px}
.ld .card-main{position:relative;z-index:3;padding:22px}
.ld .card-head{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.ld .traffic{display:flex;gap:6px}
.ld .traffic i{width:11px;height:11px;border-radius:50%;display:block}
.ld .traffic i:nth-child(1){background:#f0756a}.ld .traffic i:nth-child(2){background:#f2b04e}.ld .traffic i:nth-child(3){background:#3ecf8e}
.ld .card-head .t{font-family:var(--mono);font-size:12.5px;color:var(--ink-3)}
.ld .key-row{display:flex;align-items:center;gap:10px;background:var(--input);border:1px solid var(--stroke-2);border-radius:14px;padding:10px 10px 10px 16px}
.ld .key-row code{font-family:var(--mono);font-size:13.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ld .copy-btn{flex:none;border:1px solid var(--stroke-2);background:var(--glass-strong);color:var(--ink);font-size:12.5px;font-weight:700;border-radius:10px;padding:8px 13px;min-height:36px}
.ld .req-list{display:grid;gap:10px;margin-top:16px}
.ld .req{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;background:var(--glass-soft);border:1px solid var(--stroke-2)}
.ld .req .mdl{font-weight:700;font-size:14px}
.ld .req .sub{font-size:12px;color:var(--ink-3);font-family:var(--mono)}
.ld .req .st{margin-left:auto;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:999px;background:var(--accent-soft);color:var(--accent);white-space:nowrap}
.ld .req .st.warn{background:var(--amber-soft);color:var(--amber)}
.ld .card-float{position:absolute;z-index:4;padding:16px 18px;width:250px}
.ld .card-float-a{right:-8px;top:-26px;transform:rotate(2deg)}
.ld .card-float .lab{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.ld .card-float .big{font-size:26px;font-weight:800;letter-spacing:-.02em;margin:2px 0}
.ld .card-float .note{font-size:12.5px;color:var(--ink-2)}

/* ===== Quickstart (hero terminal) — kartu gelap di kedua tema ===== */
.ld .qs{
  position:relative;z-index:3;
  background:var(--code-bg);color:var(--code-ink);
  border:1px solid var(--stroke-2);border-radius:var(--radius);
  box-shadow:var(--shadow);overflow:hidden;text-align:left;
}
.ld .qs-bar{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.ld .qs-bar .t{font-family:var(--mono);font-size:12.5px;color:#93b8d8}
.ld .qs-badge{margin-left:auto;font-size:11px;font-weight:800;letter-spacing:.04em;padding:4px 10px;border-radius:999px;background:rgba(124,199,245,.14);color:#8ec9f8;border:1px solid rgba(124,199,245,.25);white-space:nowrap}
.ld .qs-body{padding:18px 18px 16px}
.ld .qs-body h3{margin:0 0 14px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#f2f8ff}
.ld .qs-base{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:9px 9px 9px 13px;margin-bottom:12px}
.ld .qs-base .lbl{font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#7d9bb8;flex:none}
.ld .qs-base code{font-family:var(--mono);font-size:12.5px;color:#dcecff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ld .qs .copy-btn{flex:none;background:rgba(255,255,255,.1);color:#eafff8;border-color:rgba(255,255,255,.15)}
.ld .qs-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.ld .qs-tab{font-family:var(--mono);font-size:12.5px;font-weight:700;color:#93b8d8;background:transparent;border:1px solid transparent;border-radius:10px;padding:7px 12px;min-height:34px}
.ld .qs-tab:hover{color:#eafff8}
.ld .qs-tab[aria-selected="true"]{background:rgba(255,255,255,.1);color:#eafff8;border-color:rgba(255,255,255,.12)}
.ld .qs pre{
  background:rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.07);border-radius:14px;
  padding:15px 16px;margin:0 0 12px;font-family:var(--mono);font-size:12.5px;line-height:1.7;
  overflow-x:auto;white-space:pre;color:var(--code-ink);
}
.ld .qs-note{margin:0;font-size:12.5px;color:#93b8d8}
@media (max-width:680px){
  .ld .qs-base code{flex:1 1 100%;order:3}
  .ld .qs-base .copy-btn{margin-left:auto}
  .ld .qs pre{font-size:11.5px;padding:13px 14px}
}

/* ===== Marquee ===== */
.ld .marquee-shell{margin:44px 0 6px;padding:14px 0;overflow:hidden;
  -webkit-mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);}
.ld .marquee{display:flex;gap:10px;width:max-content}
.ld .m-chip{font-family:var(--mono);font-size:13px;font-weight:500;padding:9px 16px;border-radius:999px;background:var(--chip);border:1px solid var(--stroke-2);white-space:nowrap;color:var(--ink-2)}

/* ===== Sections ===== */
.ld section{padding:58px 0 8px;scroll-margin-top:90px}
.ld .sec-head{max-width:640px;margin-bottom:28px}
.ld .sec-head h2{font-size:clamp(27px,3.6vw,38px);letter-spacing:-.03em;line-height:1.12;margin:0 0 10px;font-weight:800}
.ld .sec-head p{color:var(--ink-2);margin:0;font-size:16px}
.ld .kicker{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:12px;display:block}

/* Models — daftar kompak (chip kecil, siap jualan) */
.ld .model-chips{display:flex;flex-wrap:wrap;gap:8px}
.ld .model-chip{font-family:var(--mono);font-size:12.5px;font-weight:600;color:var(--ink-2);background:var(--chip);border:1px solid var(--stroke-2);border-radius:999px;padding:6px 12px;min-height:32px;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease}
.ld .model-chip:hover{color:var(--ink);border-color:var(--accent)}
.ld .model-chip[aria-pressed="true"]{background:var(--accent);color:var(--accent-ink);border-color:transparent}
.ld .model-count{font-size:13px;color:var(--ink-3);font-weight:600;margin-top:14px}

/* Steps */
.ld .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ld .step{padding:24px}
.ld .step .num{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);font-weight:800;font-size:17px;margin-bottom:14px}
.ld .step h3{margin:0 0 8px;font-size:17px;letter-spacing:-.01em}
.ld .step p{margin:0;font-size:14px;color:var(--ink-2)}
.ld .step code{font-family:var(--mono);font-size:12.5px;background:var(--input);padding:2px 7px;border-radius:6px;border:1px solid var(--stroke-2)}

/* Code */
.ld .code-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:20px;align-items:start}
.ld .model-pick{display:grid;gap:10px}
.ld .pick-btn{text-align:left;padding:15px 18px;border-radius:16px;border:1px solid var(--stroke-2);background:var(--chip);color:var(--ink);width:100%}
.ld .pick-btn b{display:block;font-family:var(--mono);font-size:14px;font-weight:700}
.ld .pick-btn span{font-size:12.5px;color:var(--ink-2)}
.ld .pick-btn[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft)}
.ld .code-card{border-radius:var(--radius);overflow:hidden;border:1px solid var(--stroke-2);box-shadow:var(--shadow)}
.ld .code-bar{display:flex;align-items:center;gap:10px;background:var(--code-bg);padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.ld .code-bar .t{font-family:var(--mono);font-size:12px;color:#93b8d8}
.ld .code-bar .copy-btn{margin-left:auto;background:rgba(255,255,255,.1);color:#eafff8;border-color:rgba(255,255,255,.15)}
.ld pre{margin:0;background:var(--code-bg);color:var(--code-ink);padding:20px;overflow-x:auto;font-family:var(--mono);font-size:13px;line-height:1.7}
.ld pre .k{color:#7cc7f5}.ld pre .s{color:#f5cf8a}.ld pre .c{color:#5f7f9e}

/* Pricing */
.ld .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ld .price-card{padding:26px;display:flex;flex-direction:column;position:relative}
.ld .price-card.hot{border-color:var(--accent);box-shadow:var(--shadow),0 0 0 1px var(--accent), inset 0 1px 0 rgba(255,255,255,.35)}
.ld .hot-badge{position:absolute;top:-13px;left:24px;background:var(--accent);color:var(--accent-ink);font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:5px 12px;border-radius:999px}
.ld .price-card .plan{font-size:13px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3)}
.ld .price-card .amount{font-size:36px;font-weight:800;letter-spacing:-.03em;margin:8px 0 2px}
.ld .price-card .amount small{font-size:14px;font-weight:600;color:var(--ink-3);letter-spacing:0}
.ld .price-card .dur{font-size:13.5px;color:var(--ink-2);margin-bottom:16px}
.ld .price-card ul{list-style:none;margin:0 0 22px;padding:0;display:grid;gap:9px;font-size:14px;color:var(--ink-2)}
.ld .price-card li{display:flex;gap:9px;align-items:flex-start}
.ld .price-card li svg{flex:none;margin-top:3px;color:var(--accent)}
.ld .price-card .btn{margin-top:auto;width:100%}
.ld .price-note{text-align:center;color:var(--ink-3);font-size:13.5px;margin-top:18px}

/* Referral */
.ld .referral{padding:30px;display:grid;grid-template-columns:1.2fr .8fr;gap:26px;align-items:center}
.ld .referral h3{margin:0 0 8px;font-size:24px;letter-spacing:-.02em}
.ld .referral p{margin:0;color:var(--ink-2);font-size:15px}
.ld .ref-table{display:grid;gap:8px}
.ld .ref-row{display:flex;justify-content:space-between;gap:14px;padding:11px 16px;border-radius:12px;background:var(--glass-soft);border:1px solid var(--stroke-2);font-size:14px}
.ld .ref-row b{color:var(--accent)}

/* FAQ */
.ld .faq{display:grid;gap:10px;max-width:820px}
.ld details.faq-item{padding:4px 22px}
.ld details.faq-item summary{cursor:pointer;font-weight:700;font-size:15.5px;padding:15px 0;list-style:none;display:flex;justify-content:space-between;gap:14px;align-items:center;min-height:48px}
.ld details.faq-item summary::-webkit-details-marker{display:none}
.ld details.faq-item summary .chev{flex:none;color:var(--ink-3);transition:transform .2s}
.ld details.faq-item[open ] summary .chev{transform:rotate(180deg)}
.ld details.faq-item p{margin:0 0 18px;color:var(--ink-2);font-size:14.5px;max-width:60em}
.ld details.faq-item code{font-family:var(--mono);font-size:12.5px;background:var(--input);padding:2px 7px;border-radius:6px;border:1px solid var(--stroke-2)}

/* Reco */
.ld .reco{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.ld .reco-item{padding:22px}
.ld .reco-item h3{margin:0 0 7px;font-size:16px;display:flex;gap:10px;align-items:center}
.ld .reco-item h3 .n{font-family:var(--mono);font-size:12px;color:var(--accent);background:var(--accent-soft);padding:3px 9px;border-radius:999px;flex:none}
.ld .reco-item p{margin:0;font-size:14px;color:var(--ink-2)}

/* CTA + footer */
.ld .cta{padding:38px;text-align:center;margin-top:58px}
.ld .cta h2{font-size:clamp(26px,3.4vw,36px);letter-spacing:-.03em;margin:0 0 10px}
.ld .cta p{color:var(--ink-2);margin:0 auto 24px;max-width:36em}
.ld footer{margin-top:56px;border-top:1px solid var(--stroke-2);padding:30px 0 44px}
.ld .foot{display:flex;gap:26px;flex-wrap:wrap;align-items:flex-start;justify-content:space-between;padding:0;font-size:inherit;color:inherit}
.ld .foot nav{display:flex;gap:6px 20px;flex-wrap:wrap}
.ld .foot nav a{text-decoration:none;font-size:14px;font-weight:600;color:var(--ink-2);padding:8px 2px;min-height:36px;display:inline-flex;align-items:center}
.ld .foot nav a:hover{color:var(--ink)}
.ld .foot .fine{font-size:12.5px;color:var(--ink-3);max-width:340px;margin:0}

.ld .toast{
  position:fixed;left:50%;bottom:24px;transform:translate(-50%,80px);z-index:80;
  background:var(--glass-strong);color:var(--ink);border:1px solid var(--stroke);
  -webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);
  padding:12px 20px;border-radius:999px;font-size:14px;font-weight:700;box-shadow:var(--shadow);
  transition:transform .3s ease;pointer-events:none;
}
.ld .toast.show{transform:translate(-50%,0)}

/* ===== Responsive ===== */
@media (max-width:960px){
  .ld .hero-grid,.ld .code-grid,.ld .referral{grid-template-columns:1fr}
  .ld .steps,.ld .price-grid{grid-template-columns:repeat(2,1fr)}
  .ld .stack{min-height:0;margin-top:8px}
  .ld .card-float-a{top:-18px;right:0}
  .ld .card-main{margin:0 0 8px}
}
@media (max-width:680px){
  .ld .nav-links{display:none}
  .ld .nav-links.open{display:flex;position:absolute;top:calc(100% + 10px);left:12px;right:12px;flex-direction:column;padding:10px;border-radius:20px;background:var(--glass-strong);border:1px solid var(--stroke);box-shadow:var(--shadow);
    -webkit-backdrop-filter:blur(var(--blur)) saturate(var(--sat));backdrop-filter:blur(var(--blur)) saturate(var(--sat))}
  .ld .nav-links.open a{padding:12px 14px}
  .ld .nav{position:relative}
  .ld .burger{display:grid}
  .ld .nav .btn-login{display:none}
  .ld .steps,.ld .price-grid,.ld .reco{grid-template-columns:1fr}
  .ld .hero{padding-top:40px}
  .ld .card-float{position:relative;width:100%;transform:none;margin-bottom:12px}
  .ld .card-float-a{top:auto;bottom:auto;left:auto;right:auto}
  .ld .stack{display:flex;flex-direction:column}
  .ld .card-main{order:2;margin:0}
  .ld .card-float-a{order:1}
  .ld section{padding-top:44px}
  .ld .cta{padding:28px 20px}
  .ld .referral{padding:24px}
}
@media (prefers-reduced-motion: reduce){
  .ld *{animation:none !important;transition:none !important}
}
@media (max-width:680px){
  .ld .nav-shell{padding:0 10px}
  .ld .nav{gap:8px;padding:8px 10px 8px 12px}
  .ld .brand{font-size:16px;gap:8px}
  .ld .brand-mark{width:30px;height:30px;border-radius:9px}
  .ld .btn-sm{padding:9px 14px}
}
`;

// Fallback kalau /api/template-models tidak bisa dimuat — daftar live
// template 'tiprouter new' (33 model, 2026-11-24).
const FALLBACK_MODELS = [
  "mimo-v2.5", "glm-5-3-flash", "hy4-preview", "mimo-v2.6.flash",
  "gemini-3.8-flash", "qwen-3.8-27b", "solar-mini4", "glm-5.3",
  "nemotron-3.5-super", "hy3", "beam", "atria-dawn",
  "deepseek-v4.1-flash-1017", "gpt-6-luna", "deepseek-v-4.1-flash-1017",
  "deepseek-v4-flash-0731", "mercury-3", "step-3.7-flash", "step-5-preview",
  "minimax-m3.1-flash", "laguna-s-2.1", "qwen3.8-flash",
  "dots-3-note-preview", "qwen3.8-flash-uncen", "solar-pro4",
  "qwen3.7-plus", "qwen3.7-plus-uncen", "plamo-3.1-prime",
  "deepseek-v4.1-flash-1017-uncen", "hy4-flash", "sensenova-6.8-flash",
  "longcat-2.5", "hungerg",
];

const MARQUEE_NAMES = [
  "deepseek-v4.1-flash", "glm-5.3-flash", "qwen3.8-flash", "gpt-6-luna",
  "claude-haiku-5.5", "gemini-3.8-flash", "hungerg", "plamo-3.1-prime",
  "step-3.5-flash", "sensenova-6.8-flash-lite",
];

const PICK_MODELS = [
  { id: "deepseek-v4.1-flash-1017", desc: "Workhorse harian — cepat & murah buat coding" },
  { id: "glm-5.3-flash-1017", desc: "Flash dari keluarga GLM — respons gesit" },
  { id: "hungerg", desc: "Model event Qoder — reasoning + konteks besar" },
];

const PRICE_CARDS = [
  { plan: "Trial", amount: "Rp3.000", dur: "Masa aktif 1 hari", bullets: ["Akses 33+ model", "Cocok buat tes dulu", "QRIS, aktif otomatis"], btn: "Pilih Trial", hot: false },
  { plan: "Basic", amount: "Rp10.000", dur: "Masa aktif 3 hari", bullets: ["Akses 33+ model", "Bonus referral +1 hari*", "QRIS, aktif otomatis"], btn: "Pilih Basic", hot: false },
  { plan: "Plus", amount: "Rp19.000", dur: "Masa aktif 7 hari", bullets: ["Akses 33+ model", "Bonus referral +1 hari*", "QRIS, aktif otomatis"], btn: "Pilih Plus", hot: false },
  { plan: "Essential", amount: "Rp30.000", dur: "Masa aktif 14 hari", bullets: ["Akses 33+ model", "Bonus referral +3 hari*", "QRIS, aktif otomatis"], btn: "Pilih Essential", hot: false },
  { plan: "Pro", amount: "Rp50.000", dur: "Masa aktif 30 hari", bullets: ["Akses 33+ model", "Bonus referral +4 hari*", "Per hari cuma ±Rp1.667", "QRIS, aktif otomatis"], btn: "Pilih Pro", hot: true },
  { plan: "Custom", amount: "Hubungi", dur: "Durasi & kebutuhan khusus", bullets: ["Durasi di luar paket reguler", "Buat tim / pemakaian berat"], btn: "Minta Custom", hot: false },
];

const STEPS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Masuk & pilih paket",
    body: <>Login pakai akun Google atau GitHub, lalu pilih paket di halaman <code>/buy</code> — dari Trial 1 hari sampai Pro 30 hari.</>,
  },
  {
    title: "Bayar pakai QRIS",
    body: <>Scan QRIS (ada kode unik Rp1–500 buat pencocokan otomatis). Pembayaran terdeteksi server-side — key langsung di-mint walau kamu nutup halamannya.</>,
  },
  {
    title: "Panggil API-nya",
    body: <>Arahkan SDK OpenAI kamu ke <code>tiprouter.my.id/v1</code>, pakai key kamu, dan ganti-ganti model cukup dari parameter <code>model</code>.</>,
  },
];

const RECO = [
  { n: "01", title: "Harga naik ke atas", body: "Pembeli Indonesia mutusin dari harga dulu. Paket + tombol beli sekarang kelihatan dari hero (\"mulai Rp3.000\"), bukan disembunyiin di bawah fold." },
  { n: "02", title: "Bukti dulu, klaim belakangan", body: "Hero langsung nunjukin bentuk dashboard + key + request yang jalan. Pengunjung ngerti produknya dalam 5 detik tanpa baca paragraf panjang." },
  { n: "03", title: "Satu material, semua halaman", body: "Satu sistem kaca (blur, border, shadow yang sama) buat landing, dashboard, dan checkout — brand terasa utuh di semua halaman, bukan tempelan per halaman." },
  { n: "04", title: "Kontras dijaga, gerak dikurangi", body: "Glass gampang jadi nggak kebaca. Di sini teks utama selalu di atas kaca yang cukup pekat, animasi cuma di latar, dan prefers-reduced-motion dihormati." },
];

const FAQS = [
  {
    q: "Gimana cara pakainya di kode saya?",
    a: <>Cukup ganti base URL SDK OpenAI kamu ke <code>https://tiprouter.my.id/v1</code> dan isi API key dari dashboard. Ganti model tinggal ubah parameter <code>model</code> — nggak perlu key atau akun baru per provider.</>,
  },
  {
    q: "Pembayarannya gimana?",
    a: <>Pakai QRIS di halaman <code>/buy</code>. Tiap transaksi punya kode unik Rp1–500 buat pencocokan — bayar persis nominal yang tampil. Sistem ngecek pembayaran di sisi server, jadi key tetap terbit walau kamu meninggalkan halaman checkout.</>,
  },
  {
    q: "Kalau satu provider lagi down gimana?",
    a: <>Model populer di TipRouter dilayani banyak provider di balik satu nama model. Router nyoba provider berikutnya secara otomatis (strategi fallback), jadi request kamu nggak langsung gagal cuma karena satu provider bermasalah.</>,
  },
  {
    q: "Bisa coba gratis dulu?",
    a: <>Bisa lewat dua jalan: paket Trial Rp3.000 buat 1 hari, atau halaman <code>/gacha</code> buat kesempatan key gratis (1 klaim per IP, key gacha tidak bisa diperpanjang).</>,
  },
];

const CHECK_SVG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
);
const CHEV_SVG = (
  <svg className="chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
);
const BRAND_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 17l6-5-6-5" /><path d="M12 19h8" /></svg>
);
const BURGER_SVG = (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
const SUN_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
const MOON_SVG = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
const DEFAULT_MODEL = "deepseek-v4.1-flash-1017";

function curlPlain(model: string): string {
  return (
    "curl https://tiprouter.my.id/v1/chat/completions \\\n" +
    '  -H "Authorization: Bearer tip_KAMU" \\\n' +
    '  -H "Content-Type: application/json" \\\n' +
    "  -d '{\n" +
    `    "model": "${model}",\n` +
    '    "messages": [{"role": "user", "content": "Halo!"}]\n' +
    "  }'"
  );
}

/* ===== Quickstart (hero terminal) — contoh kode per tab ===== */
const QS_TABS = [
  { id: "python", label: "Python" },
  { id: "node", label: "Node.js" },
  { id: "curl", label: "cURL" },
  { id: "librechat", label: "LibreChat" },
] as const;
const QS_BASE_URL = "https://tiprouter.my.id/v1";

const QS_PYTHON = (
  <>
    <span className="k">from</span>{` openai `}<span className="k">import</span>{` OpenAI\n\nclient = OpenAI(\n    base_url=`}<span className="s">"https://tiprouter.my.id/v1"</span>{`,\n    api_key=`}<span className="s">"tip_key_kamu"</span>{`,\n)\n\nresp = client.chat.completions.create(\n    model=`}<span className="s">"deepseek-v4.1-flash"</span>{`,\n    messages=[{`}<span className="s">"role"</span>{`: `}<span className="s">"user"</span>{`, `}<span className="s">"content"</span>{`: `}<span className="s">"Halo"</span>{`}],\n)\n`}<span className="k">print</span>{`(resp.choices[0].message.content)`}
  </>
);
const QS_NODE = (
  <>
    <span className="k">import</span>{` OpenAI `}<span className="k">from</span>{` `}<span className="s">"openai"</span>{`;\n\n`}<span className="k">const</span>{` client = `}<span className="k">new</span>{` OpenAI({\n  baseURL: `}<span className="s">"https://tiprouter.my.id/v1"</span>{`,\n  apiKey: `}<span className="s">"tip_key_kamu"</span>{`,\n});\n\n`}<span className="k">const</span>{` resp = `}<span className="k">await</span>{` client.chat.completions.create({\n  model: `}<span className="s">"deepseek-v4.1-flash"</span>{`,\n  messages: [{ role: `}<span className="s">"user"</span>{`, content: `}<span className="s">"Halo"</span>{` }],\n});\nconsole.log(resp.choices[0].message.content);`}
  </>
);
const QS_CURL = (
  <>
    {`curl https://tiprouter.my.id/v1/chat/completions \\\n  -H `}<span className="s">"Authorization: Bearer tip_key_kamu"</span>{` \\\n  -H `}<span className="s">"Content-Type: application/json"</span>{` \\\n  -d `}<span className="s">{`'{\n    "model": "deepseek-v4.1-flash",\n    "messages": [{"role": "user", "content": "Halo"}]\n  }'`}</span>
  </>
);
const QS_LIBRE = (
  <>
    {`endpoints:\n  custom:\n    - name: `}<span className="s">"TipRouter"</span>{`\n      apiKey: `}<span className="s">"tip_key_kamu"</span>{`\n      baseURL: `}<span className="s">"https://tiprouter.my.id/v1"</span>{`\n      models:\n        default: [`}<span className="s">"deepseek-v4.1-flash"</span>{`]\n        fetch: `}<span className="k">false</span>
  </>
);

export default function Landing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);
  const [theme, setTheme] = useState<string>(() => document.documentElement.getAttribute("data-theme") || "light");

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  };
  useEffect(() => () => { if (toastTimer.current) window.clearTimeout(toastTimer.current); }, []);

  const copyText = async (text: string, msg: string) => {
    const done = () => showToast(msg);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        done();
        return;
      }
    } catch { /* fallback di bawah */ }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      done();
      document.body.removeChild(ta);
    } catch {
      showToast("Gagal menyalin — salin manual ya");
    }
  };

  // Tema: mekanisme yang sama dengan situs (localStorage tiprouter-theme).
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("tiprouter-theme", theme); } catch { /* ignore */ }
  }, [theme]);

  // Model IDs live dari template 'tiprouter new'; fallback bila API gagal.
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
    return () => { alive = false; };
  }, []);

  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [quickTab, setQuickTab] = useState<string>("python");
  useEffect(() => {
    if (!modelIds.includes(selectedModel)) {
      setSelectedModel(modelIds.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : modelIds[0] ?? DEFAULT_MODEL);
    }
  }, [modelIds, selectedModel]);

  const selectModel = (id: string) => {
    setSelectedModel(id);
    document.querySelector("#kode")?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll ke section dari location.hash saat mount (mis. datang dari /#harga).
  // Anchor lama tetap mendarat di section yang benar.
  const LEGACY_HASH: Record<string, string> = { "#pricing": "#harga", "#cara-pakai": "#cara-kerja" };
  useEffect(() => {
    if (!window.location.hash) return;
    const hash = LEGACY_HASH[window.location.hash] ?? window.location.hash;
    const el = document.querySelector(hash);
    if (!el) return;
    const t = window.setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 80);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="ld" ref={rootRef}>
      <style>{CSS}</style>

      <div className="wallpaper" aria-hidden="true" />
      <div className="blob blob-a" aria-hidden="true" />
      <div className="blob blob-b" aria-hidden="true" />
      <div className="blob blob-c" aria-hidden="true" />
      <div className="blob blob-d" aria-hidden="true" />
      <div className="blob blob-e" aria-hidden="true" />
      <div className="grid-overlay" aria-hidden="true" />

      <div className="nav-shell">
        <header className="nav">
          <a className="brand" href="#top" aria-label="TipRouter">
            <span className="brand-mark" aria-hidden="true">{BRAND_SVG}</span>
            <span>Tip<em>Router</em></span>
          </a>
          <button className="icon-btn burger" type="button" aria-label="Buka menu" aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
            {BURGER_SVG}
          </button>
          <nav className={"nav-links" + (navOpen ? " open" : "")} aria-label="Navigasi utama">
            <a href="#model" onClick={closeNav}>Model</a>
            <a href="#cara-kerja" onClick={closeNav}>Cara Kerja</a>
            <a href="#harga" onClick={closeNav}>Harga</a>
            <a href="#faq" onClick={closeNav}>FAQ</a>
          </nav>
          <div className="nav-right">
            <button className="icon-btn" type="button" aria-label="Ganti mode terang / gelap" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? MOON_SVG : SUN_SVG}
            </button>
            <Link className="btn btn-ghost btn-sm btn-login" to="/login">Masuk</Link>
            <a className="btn btn-primary btn-sm" href="#harga">Beli Key</a>
          </div>
        </header>
      </div>

      <main id="top">
        <div className="wrap hero">
          <div className="hero-grid">
            <div>
              <span className="pill">API GATEWAY — ONE KEY, EVERY MODEL</span>
              <h1>One API key.<br />Every AI model.<br /><span className="grad">Zero hassle.</span></h1>
              <p className="hero-sub">Route requests to 33+ models — DeepSeek, GLM, Qwen, GPT, Claude, and more — through a single OpenAI-compatible endpoint. Pay with QRIS and your key activates instantly.</p>
              <div className="hero-cta">
                <a className="btn btn-primary" href="#harga">View Plans — from Rp3,000</a>
                <a className="btn btn-ghost" href="#kode">See the Code</a>
              </div>
              <div className="hero-meta">
                <div className="m"><b>33+</b><span>models, one endpoint</span></div>
                <div className="m"><b>150 RPM</b><span>requests per minute</span></div>
                <div className="m"><b>4</b><span>max concurrent requests</span></div>
                <div className="m"><b>24/7</b><span>automatic fallback routing</span></div>
              </div>
            </div>

            <div className="stack" aria-label="Quickstart TipRouter">
              <div className="qs">
                <div className="qs-bar">
                  <span className="traffic" aria-hidden="true"><i /><i /><i /></span>
                  <span className="t">Quickstart</span>
                  <span className="qs-badge">OpenAI-compatible</span>
                </div>
                <div className="qs-body">
                  <h3>Satu endpoint, semua model.</h3>
                  <div className="qs-base">
                    <span className="lbl">BASE URL</span>
                    <code>{QS_BASE_URL}</code>
                    <button className="copy-btn" type="button" onClick={() => copyText(QS_BASE_URL, "URL tersalin")}>Salin URL</button>
                  </div>
                  <div className="qs-tabs" role="tablist" aria-label="Pilih bahasa contoh kode">
                    {QS_TABS.map((t) => (
                      <button key={t.id} className="qs-tab" type="button" role="tab" aria-selected={quickTab === t.id} onClick={() => setQuickTab(t.id)}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <pre className="qs-code" aria-label="Contoh kode quickstart">
                    {quickTab === "node" ? QS_NODE : quickTab === "curl" ? QS_CURL : quickTab === "librechat" ? QS_LIBRE : QS_PYTHON}
                  </pre>
                  <p className="qs-note">Ganti base URL dan API key. Format request tetap sama.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="marquee-shell" aria-hidden="true">
            <div className="marquee">
              {[...MARQUEE_NAMES, ...MARQUEE_NAMES].map((n, i) => (
                <span className="m-chip" key={i}>{n}</span>
              ))}
            </div>
          </div>
        </div>

        <section id="model">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Katalog Model</span>
              <h2>33+ model, satu endpoint</h2>
              <p>Satu key buat semua model di bawah — klik nama modelnya buat lihat contoh kode.</p>
            </div>
            <div className="model-chips" role="group" aria-label="Daftar model">
              {modelIds.map((id) => (
                <button
                  key={id}
                  className="model-chip"
                  type="button"
                  aria-pressed={id === selectedModel}
                  onClick={() => selectModel(id)}
                >
                  {id}
                </button>
              ))}
            </div>
            <p className="model-count">{modelIds.length} model di template utama.</p>
          </div>
        </section>

        <section id="cara-kerja">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Cara Kerja</span>
              <h2>Dari daftar sampai manggil model: 3 langkah</h2>
              <p>Nggak ada nunggu aktivasi manual. Alurnya otomatis dari pembayaran sampai key siap pakai.</p>
            </div>
            <div className="steps">
              {STEPS.map((s, i) => (
                <div className="glass step" key={i}>
                  <div className="num">{i + 1}</div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="kode">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Buat Developer</span>
              <h2>Kompatibel OpenAI. Ganti base URL, selesai.</h2>
              <p>Pilih model di kiri — contoh kodenya ngikutin. Kode yang udah jalan di OpenAI SDK tinggal pindah endpoint.</p>
            </div>
            <div className="code-grid">
              <div className="model-pick" role="group" aria-label="Pilih model untuk contoh kode">
                {PICK_MODELS.map((p) => (
                  <button key={p.id} className="pick-btn" type="button" data-model={p.id} aria-pressed={selectedModel === p.id} onClick={() => setSelectedModel(p.id)}>
                    <b>{p.id}</b>
                    <span>{p.desc}</span>
                  </button>
                ))}
              </div>
              <div className="code-card">
                <div className="code-bar">
                  <span className="traffic" aria-hidden="true"><i /><i /><i /></span>
                  <span className="t">terminal — curl</span>
                  <button className="copy-btn" type="button" onClick={() => copyText(curlPlain(selectedModel), "Contoh kode tersalin")}>Salin kode</button>
                </div>
                <pre aria-label="Contoh kode curl">
                  <span className="c"># Ganti model-nya aja — key &amp; endpoint tetap sama</span>
                  {"\ncurl https://tiprouter.my.id/v1/chat/completions \\\n  -H "}
                  <span className="s">"Authorization: Bearer tip_KAMU"</span>
                  {" \\\n  -H "}
                  <span className="s">"Content-Type: application/json"</span>
                  {" \\\n  -d "}
                  <span className="s">{"'{\n    \"model\": \""}{selectedModel}{"\",\n    \"messages\": [{\"role\": \"user\", \"content\": \"Halo!\"}]\n  }'"}</span>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section id="harga">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Harga</span>
              <h2>Harga flat per durasi. Bukan per token.</h2>
              <p>Bayar sekali buat masa aktifnya — semua model di template utama kebuka. Ini harga produksi TipRouter saat ini, ditampilkan apa adanya.</p>
            </div>
            <div className="price-grid">
              {PRICE_CARDS.map((p) => (
                <div className={"glass price-card" + (p.hot ? " hot" : "")} key={p.plan}>
                  {p.hot && <span className="hot-badge">Paling Laris</span>}
                  <div className="plan">{p.plan}</div>
                  <div className="amount">{p.amount}</div>
                  <div className="dur">{p.dur}</div>
                  <ul>
                    {p.bullets.map((b) => (
                      <li key={b}>{CHECK_SVG}{b}</li>
                    ))}
                  </ul>
                  <Link className={"btn" + (p.hot ? " btn-primary" : " btn-ghost")} to="/buy">{p.btn}</Link>
                </div>
              ))}
            </div>
            <p className="price-note">*Bonus referral dua arah: kamu dan temanmu sama-sama dapat tambahan hari tiap pembelian (Trial tidak termasuk). Ada juga key gratis lewat halaman <Link to="/gacha" style={{ fontWeight: 700 }}>Gacha</Link>.</p>
          </div>
        </section>

        <section aria-label="Program referral">
          <div className="wrap">
            <div className="glass referral">
              <div>
                <span className="kicker">Referral</span>
                <h3>Ajak teman, dua-duanya nambah hari</h3>
                <p>Bagikan link <span style={{ fontFamily: "var(--mono)", fontSize: "13.5px" }}>tiprouter.my.id/?ref=KODE</span> kamu. Tiap teman yang beli, kalian berdua dapat bonus masa aktif — plus milestone kalau makin banyak yang ikut.</p>
              </div>
              <div className="ref-table">
                <div className="ref-row"><span>5 referral</span><b>+3 hari</b></div>
                <div className="ref-row"><span>15 referral</span><b>+7 hari</b></div>
                <div className="ref-row"><span>30 referral</span><b>+30 hari</b></div>
              </div>
            </div>
          </div>
        </section>

        <section id="rekomendasi">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">Kenapa Dirombak Begini</span>
              <h2>Rekomendasi UX di balik konsep ini</h2>
              <p>Bukan cuma ganti kulit — ini perubahan alur yang kami terapkan barengan sama visual glass-nya:</p>
            </div>
            <div className="reco">
              {RECO.map((r) => (
                <div className="glass reco-item" key={r.n}>
                  <h3><span className="n">{r.n}</span>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">FAQ</span>
              <h2>Sering ditanyakan</h2>
            </div>
            <div className="faq">
              {FAQS.map((f) => (
                <details className="glass faq-item" key={f.q}>
                  <summary>{f.q} {CHEV_SVG}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <div className="glass cta">
              <h2>Siap nyobain gateway-nya?</h2>
              <p>Mulai dari Trial Rp3.000 — bayar QRIS, key aktif otomatis, langsung bisa manggil 33+ model dari satu endpoint.</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="btn btn-primary" to="/buy">Beli Key Sekarang</Link>
                <Link className="btn btn-ghost" to="/dashboard/guide">Baca Panduan</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div>
            <a className="brand" href="#top" style={{ marginBottom: "10px" }}>
              <span className="brand-mark" aria-hidden="true">{BRAND_SVG}</span>
              <span>Tip<em>Router</em></span>
            </a>
            <p className="fine">Gateway API multi-model dengan pembayaran QRIS. Satu key, 33+ model, routing fallback otomatis.</p>
          </div>
          <nav aria-label="Tautan kaki">
            <Link to="/buy">Beli</Link>
            <Link to="/gacha">Gacha</Link>
            <Link to="/terms">Syarat</Link>
            <Link to="/dashboard/guide">Panduan</Link>
            <Link to="/dashboard/history">Riwayat</Link>
            <Link to="/notifications">Notifikasi</Link>
          </nav>
        </div>
      </footer>

      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">{toast ?? "Tersalin ke clipboard"}</div>
    </div>
  );
}
