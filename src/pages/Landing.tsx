import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Gift,
  Menu,
  MessageSquare,
  Plug,
  Send,
  Zap,
} from "lucide-react";
import { LanguageToggle, useLang } from "../lib/i18n";
import { ThemeToggle } from "../components/ThemeToggle";

/*
 * Landing TipRouter v5 — "Clean-Tech Enterprise" glass system.
 * Token kaca (.ld) mengikuti sistem global di src/index.css (canvas
 * #F8FAFC, aksen sky #0EA5E9 → #0284C7, tier T1 .75 / T2 .65 / T3 .85).
 * Wallpaper/blob/grid-overlay lokal DICABUT — canvas dot-grid + ambient
 * orb global dari index.css yang tampil. Hanya visual/CSS/layout yang
 * berubah; semua handler, state, fetch, dan logika pembayaran tetap.
 */
const CSS = `
.ld{
  --radius:16px;
  --font:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  --ink:#0F172A;--ink-2:#475569;--ink-3:#64748B;
  --glass:linear-gradient(135deg,rgba(255,255,255,.45),rgba(255,255,255,.07) 48%,rgba(255,255,255,.02)),rgba(255,255,255,.45);
  --glass-strong:linear-gradient(135deg,rgba(255,255,255,.55),rgba(255,255,255,.1) 48%,rgba(255,255,255,.03)),rgba(255,255,255,.7);
  --glass-soft:linear-gradient(135deg,rgba(255,255,255,.4),rgba(255,255,255,.06) 48%,rgba(255,255,255,.02)),rgba(255,255,255,.38);
  --stroke:rgba(255,255,255,.9);
  --stroke-2:rgba(15,23,42,.08);
  --edge:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(255,255,255,.2);
  --edge:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(255,255,255,.2);
  --edge:inset 0 1px 0 rgba(255,255,255,.7),inset 0 -1px 0 rgba(255,255,255,.2);
  --shadow:0 8px 32px rgba(14,165,233,.14);
  --shadow-lg:0 12px 40px -8px rgba(14,165,233,.26);
  --accent:#0284C7;--accent-2:#0EA5E9;--accent-ink:#ffffff;--accent-soft:rgba(14,165,233,.12);
  --green:#047857;
  --amber:#b45309;--amber-soft:rgba(217,119,6,.12);
  --code-bg:rgba(15,23,42,.9);--code-ink:#f1f5f9;
  --nav-bg:linear-gradient(135deg,rgba(255,255,255,.5),rgba(255,255,255,.08) 48%,rgba(255,255,255,.02)),rgba(255,255,255,.55);--chip:rgba(255,255,255,.45);--input:rgba(255,255,255,.5);
  color-scheme:light;
  font-family:var(--font);color:var(--ink);background:transparent;padding-top:14px;
  -webkit-font-smoothing:antialiased;line-height:1.55;
}
html[data-theme="dark"] .ld{
  --ink:#F1F5F9;--ink-2:#94A3B8;--ink-3:#7D8AA0;
  --glass:linear-gradient(135deg,rgba(255,255,255,.09),rgba(255,255,255,.03) 48%,rgba(255,255,255,.01)),rgba(15,23,42,.48);
  --glass-strong:linear-gradient(135deg,rgba(255,255,255,.12),rgba(255,255,255,.04) 48%,rgba(255,255,255,.01)),rgba(15,23,42,.68);
  --glass-soft:linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.02) 48%,rgba(255,255,255,.01)),rgba(15,23,42,.36);
  --stroke:rgba(148,163,184,.18);
  --stroke-2:rgba(148,163,184,.14);
  --edge:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.05);
  --edge:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.05);
  --edge:inset 0 1px 0 rgba(255,255,255,.14),inset 0 -1px 0 rgba(255,255,255,.05);
  --shadow:0 8px 32px rgba(2,6,23,.55);
  --shadow-lg:0 12px 40px -8px rgba(2,6,23,.65);
  --accent:#38BDF8;--accent-2:#0EA5E9;--accent-ink:#ffffff;--accent-soft:rgba(56,189,248,.14);
  --green:#34D399;
  --amber:#f5bc52;--amber-soft:rgba(245,188,82,.14);
  --nav-bg:linear-gradient(135deg,rgba(255,255,255,.1),rgba(255,255,255,.03) 48%,rgba(255,255,255,.01)),rgba(15,23,42,.6);--chip:rgba(15,23,42,.4);--input:rgba(15,23,42,.42);
  color-scheme:dark;
}
.ld ::selection{background:var(--accent);color:#fff}
.ld a{color:inherit}
.ld button{font-family:var(--font);cursor:pointer}
.ld button,.ld summary,.ld input{min-height:2.25rem}
.ld :focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:8px}

@keyframes scrollx{to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: no-preference){
  .ld .marquee{animation:scrollx 36s linear infinite}
}

/* ===== Glass primitives (tier global) ===== */
.ld .glass{
  background:var(--glass);
  -webkit-backdrop-filter:blur(24px) saturate(1.4);
          backdrop-filter:blur(24px) saturate(1.4);
  border:1px solid var(--stroke);
  box-shadow:var(--shadow), var(--edge);
  border-radius:var(--radius);
}
.ld .glass-soft{
  background:var(--glass-soft);
  -webkit-backdrop-filter:blur(16px) saturate(1.4);
          backdrop-filter:blur(16px) saturate(1.4);
  border:1px solid var(--stroke-2);
  border-radius:var(--radius);
}
.ld .wrap{max-width:1180px;margin:0 auto;padding:0 20px}

/* ===== Nav (sejajar chrome global: pill T1, top 16px) ===== */
.ld .nav-shell{position:sticky;top:16px;z-index:50;padding:0 16px;margin-top:0}
.ld .nav{
  max-width:1180px;margin:0 auto;display:flex;align-items:center;gap:12px;
  padding:8px 10px 8px 12px;border-radius:16px;
  background:var(--nav-bg);
  -webkit-backdrop-filter:blur(16px) saturate(1.4);
          backdrop-filter:blur(16px) saturate(1.4);
  border:1px solid var(--stroke);
  box-shadow:0 4px 24px rgba(14,165,233,.06), var(--edge);
}
.ld .brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;font-size:16px;letter-spacing:-.02em;white-space:nowrap;color:var(--ink)}
.ld .brand-logo{width:36px;height:36px;border-radius:12px;flex:none;object-fit:cover;display:block;box-shadow:0 0 0 1px rgba(255,255,255,.7),0 4px 12px rgba(14,165,233,.25)}
.ld .brand em{font-style:normal;color:var(--accent)}
.ld .nav-links{display:flex;gap:2px;margin-left:auto}
.ld .nav-lang{display:none}
.ld .nav-theme{display:none}
.ld .mnav-auth{display:none}
.ld .nav-links a{text-decoration:none;font-size:14px;font-weight:600;color:var(--ink-2);padding:7px 11px;border-radius:10px;min-height:36px;display:inline-flex;align-items:center;white-space:nowrap}
.ld .nav-links a:hover{color:var(--ink);background:var(--chip)}
.ld .nav-right{margin-left:auto;display:flex;align-items:center;gap:8px}
.ld .nav-links + .nav-right{margin-left:0}
.ld .icon-btn{width:36px;height:36px;border-radius:10px;border:1px solid var(--stroke-2);background:var(--chip);color:var(--ink);display:grid;place-items:center;flex:none}
.ld .btn{
  display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;border:none;
  font-weight:700;font-size:14.5px;padding:11px 20px;border-radius:999px;min-height:44px;transition:transform .15s ease, box-shadow .15s ease;
  white-space:nowrap;
}
.ld .btn:active{transform:scale(.97)}
.ld .btn-primary{background:linear-gradient(90deg,#0EA5E9,#0284C7);color:#fff;box-shadow:0 4px 14px rgba(14,165,233,.35), var(--edge)}
.ld .btn-primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(14,165,233,.45)}
.ld .btn-ghost{background:var(--chip);color:var(--accent);border:1px solid rgba(125,211,252,.6)}
.ld .btn-sm{padding:8px 14px;min-height:36px;font-size:13px}
.ld .burger{display:none}

/* ===== Hero ===== */
.ld .hero{padding-top:64px;padding-bottom:30px}
.ld .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;gap:44px;align-items:center}
.ld .hero-grid>*{min-width:0}
.ld .pill{
  display:inline-flex;align-items:center;gap:8px;font-size:12.5px;font-weight:700;letter-spacing:.04em;
  padding:7px 14px;border-radius:999px;background:var(--chip);border:1px solid var(--stroke);color:var(--ink-2);
}
.ld .pill .pulse-dot{width:8px;height:8px;border-radius:50%;background:#10b981;flex:none;animation:pulse-dot 2s ease-in-out infinite}
.ld h1{font-size:clamp(38px,5.4vw,62px);line-height:1.04;letter-spacing:-.035em;font-weight:800;margin:20px 0 18px}
.ld h1 .grad{background:linear-gradient(90deg,#0EA5E9,#0284C7);-webkit-background-clip:text;background-clip:text;color:transparent}
.ld .hero-sub{font-size:clamp(16px,2vw,18.5px);color:var(--ink-2);max-width:34em;margin:0 0 28px}
.ld .hero-sub code{font-family:var(--mono);font-size:.9em;background:var(--accent-soft);padding:2px 7px;border-radius:6px;border:1px solid var(--stroke-2);color:var(--ink)}
.ld .hero-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.ld .hero-meta{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 24px;margin-top:32px;max-width:460px}
.ld .hero-meta .m b{display:block;font-size:21px;letter-spacing:-.02em}
.ld .hero-meta .m span{display:block;font-size:12.5px;color:var(--ink-3);font-weight:600;margin-top:2px}

/* hero visual: kartu kaca + terminal gelap */
.ld .stack{position:relative}
.ld .hero-card{padding:20px}
.ld .base-row{display:flex;align-items:center;gap:10px;background:var(--input);border:1px solid var(--stroke-2);border-radius:14px;padding:10px 10px 10px 16px}
.ld .base-row .lbl{font-size:10.5px;font-weight:800;letter-spacing:.08em;color:var(--ink-3);flex:none}
.ld .base-row code{font-family:var(--mono);font-size:13.5px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ld .copy-btn{flex:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--stroke-2);background:var(--glass-strong);color:var(--ink);font-size:12.5px;font-weight:700;border-radius:10px;padding:8px 13px;min-height:36px}
.ld .traffic{display:flex;gap:6px}
.ld .traffic i{width:11px;height:11px;border-radius:50%;display:block}
.ld .traffic i:nth-child(1){background:#f0756a}.ld .traffic i:nth-child(2){background:#f2b04e}.ld .traffic i:nth-child(3){background:#3ecf8e}

/* ===== Quickstart (hero terminal) — kartu gelap di kedua tema ===== */
.ld .qs{
  position:relative;z-index:3;margin-top:14px;
  background:var(--code-bg);color:var(--code-ink);
  border:1px solid rgba(100,116,139,.45);border-radius:var(--radius);
  box-shadow:var(--shadow);overflow:hidden;text-align:left;
}
.ld .qs-bar{display:flex;align-items:center;gap:10px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.08)}
.ld .qs-bar .t{font-family:var(--mono);font-size:12.5px;color:#93b8d8}
.ld .qs-badge{margin-left:auto;font-size:11px;font-weight:800;letter-spacing:.04em;padding:4px 10px;border-radius:999px;background:rgba(124,199,245,.14);color:#8ec9f8;border:1px solid rgba(124,199,245,.25);white-space:nowrap}
.ld .qs-body{padding:18px 18px 16px}
.ld .qs-body h3{margin:0 0 14px;font-size:20px;font-weight:800;letter-spacing:-.02em;color:#f2f8ff}
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
  .ld .base-row code{flex:1 1 100%;order:3}
  .ld .base-row{flex-wrap:wrap}
  .ld .base-row .copy-btn{margin-left:auto}
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

/* ===== Bansos Gacha lead-magnet banner (Tier-3 + beam-border) ===== */
.ld .gacha-banner{padding:28px 30px;display:flex;gap:22px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.ld .gacha-copy{display:flex;gap:16px;align-items:flex-start;min-width:280px;flex:1}
.ld .gacha-icon{width:46px;height:46px;border-radius:14px;flex:none;display:grid;place-items:center;background:linear-gradient(135deg,#0EA5E9,#0284C7);color:#fff;box-shadow:0 4px 14px rgba(14,165,233,.35)}
.ld .gacha-banner h3{margin:0 0 6px;font-size:21px;font-weight:800;letter-spacing:-.02em}
.ld .gacha-banner p{margin:0;color:var(--ink-2);font-size:14.5px;max-width:52em}
.ld .gacha-banner .btn{flex:none}

/* ===== Bento grid ===== */
.ld .bento{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.ld .bento-card{padding:24px}
.ld .bento-large{grid-column:span 2}
.ld .bento-card h3{margin:0 0 8px;font-size:17px;letter-spacing:-.01em}
.ld .bento-sub{margin:0 0 16px;font-size:14px;color:var(--ink-2)}
.ld .bento-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ld .bento-head h3{margin-bottom:0}
.ld .bento-badges{display:flex;gap:8px;flex-wrap:wrap}
.ld .bento-head + .bento-sub{margin-top:10px}
.ld .bento-more{display:inline-flex;align-items:center;gap:6px;margin-top:16px;font-size:13.5px;font-weight:700;color:var(--accent);text-decoration:none}
.ld .bento-more:hover{text-decoration:underline}
.ld .eco-badges{display:flex;flex-wrap:wrap;gap:8px}
.ld .eco-badge{display:inline-flex;align-items:center;gap:8px;font-size:13.5px;font-weight:700;color:var(--ink);background:var(--chip);border:1px solid var(--stroke-2);border-radius:999px;padding:9px 14px}
.ld .eco-badge svg{color:var(--accent)}
.ld .bento-icon{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:var(--accent-soft);color:var(--accent);margin-bottom:14px}

/* Models — daftar kompak (chip kecil, siap jualan) */
.ld .model-chips{display:flex;flex-wrap:wrap;gap:8px}
.ld .model-chip{display:inline-flex;align-items:center;gap:7px;font-family:var(--mono);font-size:12.5px;font-weight:600;color:var(--ink-2);background:var(--chip);border:1px solid var(--stroke-2);border-radius:999px;padding:6px 12px;min-height:32px;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease}
.ld .model-chip:hover{color:var(--ink);border-color:var(--accent)}
.ld .model-chip[aria-pressed="true"]{background:linear-gradient(90deg,#0EA5E9,#0284C7);color:#fff;border-color:transparent}
.ld .model-chip .pulse-dot{width:7px;height:7px;border-radius:50%;background:#10b981;flex:none}
.ld .model-chip[aria-pressed="true"] .pulse-dot{background:#fff}
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
.ld .price-card.hot{
  background:var(--glass-strong);
  -webkit-backdrop-filter:blur(32px) saturate(1.4);backdrop-filter:blur(32px) saturate(1.4);
  border:1px solid rgba(125,211,252,.9);
  box-shadow:var(--shadow-lg), var(--edge);
}
.ld .hot-badge{position:absolute;top:-13px;left:24px;background:linear-gradient(90deg,#0EA5E9,#0284C7);color:#fff;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;padding:5px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(14,165,233,.35)}
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
  background:var(--glass-strong);color:var(--ink);border:1px solid rgba(125,211,252,.6);
  -webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);
  padding:12px 20px;border-radius:999px;font-size:14px;font-weight:700;box-shadow:var(--shadow-lg);
  transition:transform .3s ease;pointer-events:none;
}
.ld .toast.show{transform:translate(-50%,0)}

/* ===== Responsive ===== */
@media (max-width:960px){
  .ld .hero-grid,.ld .code-grid,.ld .referral{grid-template-columns:1fr}
  .ld .steps,.ld .price-grid{grid-template-columns:repeat(2,1fr)}
  .ld .bento{grid-template-columns:repeat(2,1fr)}
  .ld .bento-large{grid-column:span 2}
}
@media (max-width:680px){
  .ld .nav-links{display:none}
  .ld .nav-links.open{display:flex;position:absolute;top:calc(100% + 10px);left:12px;right:12px;flex-direction:column;padding:10px;border-radius:16px;background:var(--glass-strong);border:1px solid var(--stroke);box-shadow:var(--shadow-lg);
    -webkit-backdrop-filter:blur(32px) saturate(1.4);backdrop-filter:blur(32px) saturate(1.4)}
  .ld .nav-links.open a{padding:12px 14px}
  .ld .nav-links.open .nav-lang{display:flex;padding:8px 14px 10px}
  .ld .nav-links.open .nav-theme{display:flex;padding:8px 14px 10px}
  .ld .nav .btn-primary{display:none}
  .ld .nav-right .theme-toggle{display:none}
  .ld .nav-links.open .mnav-auth{display:flex;flex-direction:column;border-top:1px solid var(--stroke);margin-top:4px;padding-top:4px}
  .ld .nav{position:relative}
  .ld .burger{display:grid;margin-left:auto}
  .ld .nav-right{display:none}
  .ld .nav .btn-login{display:none}
  .ld .nav-right .lang-toggle{display:none}
  .ld .steps,.ld .price-grid,.ld .reco,.ld .bento{grid-template-columns:1fr}
  .ld .bento-large{grid-column:span 1}
  .ld .hero{padding-top:40px}
  .ld section{padding-top:44px}
  .ld .cta{padding:28px 20px}
  .ld .referral{padding:24px}
  .ld .gacha-banner{padding:24px 20px}
}
@media (prefers-reduced-motion: reduce){
  .ld *{animation:none !important;transition:none !important}
}
@media (max-width:680px){
  .ld .nav-shell{padding:0 10px}
  .ld .nav{gap:8px;padding:8px 10px 8px 12px}
  .ld .brand{font-size:16px;gap:8px}
  .ld .brand-logo{width:30px;height:30px;border-radius:9px}
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
  const { t } = useLang();
  // Data konten landing — di dalam komponen supaya t() aktif (bahasa ikut toggle).
  const PICK_MODELS = [
    { id: "deepseek-v4.1-flash-1017", desc: t("Workhorse harian — cepat & murah buat coding") },
    { id: "glm-5.3-flash-1017", desc: t("Flash dari keluarga GLM — respons gesit") },
    { id: "claude-haiku-5-5", desc: t("Haiku 5.5 dari Claude — ringan & cepat buat coding") },
  ];
  const PRICE_CARDS = [
    { plan: "Trial", amount: "Rp3.000", dur: t("Masa aktif 1 hari"), bullets: [t("Akses 33+ model"), t("Cocok buat tes dulu"), t("QRIS, aktif otomatis")], btn: t("Pilih Trial"), hot: false },
    { plan: "Basic", amount: "Rp10.000", dur: t("Masa aktif 3 hari"), bullets: [t("Akses 33+ model"), t("Bonus referral +1 hari*"), t("QRIS, aktif otomatis")], btn: t("Pilih Basic"), hot: false },
    { plan: "Plus", amount: "Rp19.000", dur: t("Masa aktif 7 hari"), bullets: [t("Akses 33+ model"), t("Bonus referral +1 hari*"), t("QRIS, aktif otomatis")], btn: t("Pilih Plus"), hot: false },
    { plan: "Essential", amount: "Rp30.000", dur: t("Masa aktif 14 hari"), bullets: [t("Akses 33+ model"), t("Bonus referral +3 hari*"), t("QRIS, aktif otomatis")], btn: t("Pilih Essential"), hot: false },
    { plan: "Pro", amount: "Rp50.000", dur: t("Masa aktif 30 hari"), bullets: [t("Akses 33+ model"), t("Bonus referral +4 hari*"), t("Per hari cuma ±Rp1.667"), t("QRIS, aktif otomatis")], btn: t("Pilih Pro"), hot: true },
    { plan: "Custom", amount: t("Hubungi"), dur: t("Durasi & kebutuhan khusus"), bullets: [t("Durasi di luar paket reguler"), t("Buat tim / pemakaian berat")], btn: t("Minta Custom"), hot: false },
  ];
  const STEPS: { title: string; body: React.ReactNode }[] = [
    {
      title: t("Masuk & pilih paket"),
      body: <>{t("Login pakai akun Google atau GitHub, lalu pilih paket di halaman")}{" "}<code>/buy</code>{" — "}{t("dari Trial 1 hari sampai Pro 30 hari.")}</>,
    },
    {
      title: t("Bayar pakai QRIS"),
      body: t("Scan QRIS (ada kode unik Rp1–500 buat pencocokan otomatis). Pembayaran terdeteksi server-side — key langsung di-mint walau kamu nutup halamannya."),
    },
    {
      title: t("Panggil API-nya"),
      body: <>{t("Arahkan SDK OpenAI kamu ke")}{" "}<code>tiprouter.my.id/v1</code>{t(", pakai key kamu, dan ganti-ganti model cukup dari parameter")}{" "}<code>model</code>.</>,
    },
  ];
  const RECO = [
    { n: "01", title: t("Harga naik ke atas"), body: t("Pembeli Indonesia mutusin dari harga dulu. Paket + tombol beli sekarang kelihatan dari hero (\"mulai Rp3.000\"), bukan disembunyiin di bawah fold.") },
    { n: "02", title: t("Bukti dulu, klaim belakangan"), body: t("Hero langsung nunjukin bentuk dashboard + key + request yang jalan. Pengunjung ngerti produknya dalam 5 detik tanpa baca paragraf panjang.") },
    { n: "03", title: t("Satu material, semua halaman"), body: t("Satu sistem kaca (blur, border, shadow yang sama) buat landing, dashboard, dan checkout — brand terasa utuh di semua halaman, bukan tempelan per halaman.") },
    { n: "04", title: t("Kontras dijaga, gerak dikurangi"), body: t("Glass gampang jadi nggak kebaca. Di sini teks utama selalu di atas kaca yang cukup pekat, animasi cuma di latar, dan prefers-reduced-motion dihormati.") },
  ];
  const FAQS = [
    {
      q: t("Gimana cara pakainya di kode saya?"),
      a: <>{t("Cukup ganti base URL SDK OpenAI kamu ke")}{" "}<code>https://tiprouter.my.id/v1</code>{" "}{t("dan isi API key dari dashboard. Ganti model tinggal ubah parameter")}{" "}<code>model</code>{" — "}{t("nggak perlu key atau akun baru per provider.")}</>,
    },
    {
      q: t("Pembayarannya gimana?"),
      a: <>{t("Pakai QRIS di halaman")}{" "}<code>/buy</code>{". "}{t("Tiap transaksi punya kode unik Rp1–500 buat pencocokan — bayar persis nominal yang tampil. Sistem ngecek pembayaran di sisi server, jadi key tetap terbit walau kamu meninggalkan halaman checkout.")}</>,
    },
    {
      q: t("Kalau satu provider lagi down gimana?"),
      a: t("Model populer di TipRouter dilayani banyak provider di balik satu nama model. Router nyoba provider berikutnya secara otomatis (strategi fallback), jadi request kamu nggak langsung gagal cuma karena satu provider bermasalah."),
    },
    {
      q: t("Bisa coba gratis dulu?"),
      a: <>{t("Bisa lewat dua jalan: paket Trial Rp3.000 buat 1 hari, atau halaman")}{" "}<code>/gacha</code>{" "}{t("buat kesempatan key gratis (1 klaim per IP, key gacha tidak bisa diperpanjang).")}</>,
    },
  ];
  const rootRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);

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
      showToast(t("Gagal menyalin — salin manual ya"));
    }
  };

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

      <div className="nav-shell">
        <header className="nav">
          <a className="brand" href="#top" aria-label="TipRouter">
            <img className="brand-logo" src="/logo-icon.png" alt="" />
            <span>Tip<em>Router</em></span>
          </a>
          <button className="icon-btn burger" type="button" aria-label={t("Buka menu")} aria-expanded={navOpen} onClick={() => setNavOpen(!navOpen)}>
            <Menu size={19} />
          </button>
          <nav className={"nav-links" + (navOpen ? " open" : "")} aria-label={t("Navigasi utama")}>
            <a href="#model" onClick={closeNav}>{t("Model")}</a>
            <a href="#harga" onClick={closeNav}>{t("Harga")}</a>
            <Link to="/gacha" onClick={closeNav}>{t("Bansos Gacha")}</Link>
            <Link to="/status" onClick={closeNav}>{t("Status")}</Link>
            <a href="#faq" onClick={closeNav}>FAQ</a>
            <div className="mnav-auth">
              <Link to="/login" onClick={closeNav}>{t("Masuk")}</Link>
              <Link to="/dashboard" onClick={closeNav}>{t("Dashboard")}</Link>
            </div>
            <div className="nav-lang"><LanguageToggle /></div>
            <div className="nav-theme"><ThemeToggle /></div>
          </nav>
          <div className="nav-right">
            <LanguageToggle />
            <ThemeToggle />
            <Link className="btn btn-ghost btn-sm btn-login" to="/login">{t("Masuk")}</Link>
            <Link className="btn btn-ghost btn-sm btn-login" to="/dashboard">{t("Dashboard")}</Link>
            <Link className="btn btn-primary btn-sm" to="/buy">{t("Beli Sekarang")}</Link>
          </div>
        </header>
      </div>

      <main id="top">
        <div className="wrap hero">
          <div className="hero-grid">
            <div>
              <span className="pill"><span className="pulse-dot" />{t("{count} model online • 150 RPM Fair-Use", { count: modelIds.length })}</span>
              <h1>One API key.<br />Every AI model.<br /><span className="grad">Zero hassle.</span></h1>
              <p className="hero-sub">{t("Satu endpoint OpenAI-compatible di tiprouter.my.id/v1 — colok ke coding assistant dan chat UI favoritmu, ganti model cukup dari parameter model.")}</p>
              <div className="hero-cta">
                <Link className="btn btn-primary" to="/buy">{t("Mulai Sekarang — QRIS Instan")}<ArrowRight size={16} /></Link>
                <Link className="btn btn-ghost" to="/gacha"><Gift size={16} />{t("Coba Bansos Gacha")}</Link>
              </div>
              <div className="hero-meta">
                <div className="m"><b>{modelIds.length}</b><span>models, one endpoint</span></div>
                <div className="m"><b>150 RPM</b><span>requests per minute</span></div>
                <div className="m"><b>4</b><span>max concurrent requests</span></div>
                <div className="m"><b>24/7</b><span>automatic fallback routing</span></div>
              </div>
            </div>

            <div className="stack" aria-label="Quickstart TipRouter">
              <div className="glass hero-card">
                <div className="base-row">
                  <span className="lbl">BASE URL</span>
                  <code>{QS_BASE_URL}</code>
                  <button className="copy-btn" type="button" onClick={() => copyText(QS_BASE_URL, t("URL tersalin"))}><Copy size={14} />{t("Salin URL")}</button>
                </div>
                <div className="qs">
                  <div className="qs-bar">
                    <span className="traffic" aria-hidden="true"><i /><i /><i /></span>
                    <span className="t">Quickstart</span>
                    <span className="qs-badge">OpenAI-compatible</span>
                  </div>
                  <div className="qs-body">
                    <h3>{t("Satu endpoint, semua model.")}</h3>
                    <div className="qs-tabs" role="tablist" aria-label={t("Pilih bahasa contoh kode")}>
                      {QS_TABS.map((tab) => (
                        <button key={tab.id} className="qs-tab" type="button" role="tab" aria-selected={quickTab === tab.id} onClick={() => setQuickTab(tab.id)}>
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <pre className="qs-code" aria-label="Contoh kode quickstart">
                      {quickTab === "node" ? QS_NODE : quickTab === "curl" ? QS_CURL : quickTab === "librechat" ? QS_LIBRE : QS_PYTHON}
                    </pre>
                    <p className="qs-note">{t("Ganti base URL dan API key. Format request tetap sama.")}</p>
                  </div>
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

        <section aria-label={t("Bansos Gacha")}>
          <div className="wrap">
            <div className="glass-t3 beam-border gacha-banner">
              <div className="gacha-copy">
                <span className="gacha-icon" aria-hidden="true"><Gift size={22} /></span>
                <div>
                  <h3>{t("Coba gratis dulu — Bansos Gacha")}</h3>
                  <p>{t("Putar sekali, dapat key trial pribadi 1–24 jam. Gratis, 1x per akun/IP — tanpa kartu kredit.")}</p>
                </div>
              </div>
              <Link className="btn btn-primary" to="/gacha">{t("Klaim Key Gratis")}<ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>

        <section id="bento" aria-label={t("Sorotan")}>
          <div className="wrap">
            <div className="bento">
              <div className="glass-t2 bento-card bento-large">
                <div className="bento-head">
                  <h3>{t("Katalog live — model online sekarang")}</h3>
                  <div className="bento-badges">
                    <span className="badge-ok"><span className="pulse-dot" />{t("Online")}</span>
                    <span className="badge-info">150 RPM</span>
                  </div>
                </div>
                <p className="bento-sub">{t("Klik model buat lihat contoh kode.")}</p>
                <div className="model-chips" role="group" aria-label="Pratinjau model">
                  {modelIds.slice(0, 8).map((id) => (
                    <button
                      key={id}
                      className="model-chip"
                      type="button"
                      aria-pressed={id === selectedModel}
                      onClick={() => selectModel(id)}
                    >
                      <span className="pulse-dot" />{id}
                    </button>
                  ))}
                </div>
                <a className="bento-more" href="#model">{t("Lihat semua model")}<ArrowRight size={14} /></a>
              </div>
              <div className="glass-t2 bento-card">
                <h3>{t("Nyambung ke tools favoritmu")}</h3>
                <p className="bento-sub">{t("Endpoint OpenAI-compatible — tinggal ganti base URL di Cline, Roo Code, LibreChat, SillyTavern, atau OpenAI SDK.")}</p>
                <div className="eco-badges">
                  <span className="eco-badge"><Code2 size={15} />Cline</span>
                  <span className="eco-badge"><Code2 size={15} />Roo Code</span>
                  <span className="eco-badge"><MessageSquare size={15} />LibreChat</span>
                  <span className="eco-badge"><Bot size={15} />SillyTavern</span>
                  <span className="eco-badge"><Plug size={15} />OpenAI SDK</span>
                </div>
              </div>
              <div className="glass-t2 bento-card">
                <span className="bento-icon" aria-hidden="true"><Zap size={20} /></span>
                <h3>{t("Aktivasi Otomatis < 5 Detik")}</h3>
                <p className="bento-sub">{t("Bayar QRIS, pembayaran terdeteksi server-side, key langsung aktif.")}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="model">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">{t("Katalog Model")}</span>
              <h2>{t("{count} model, satu endpoint", { count: modelIds.length })}</h2>
              <p>{t("Satu key buat semua model di bawah — klik nama modelnya buat lihat contoh kode.")}</p>
            </div>
            <div className="model-chips" role="group" aria-label={t("Daftar model")}>
              {modelIds.map((id) => (
                <button
                  key={id}
                  className="model-chip"
                  type="button"
                  aria-pressed={id === selectedModel}
                  onClick={() => selectModel(id)}
                >
                  <span className="pulse-dot" />{id}
                </button>
              ))}
            </div>
            <p className="model-count">{t("{count} model di template utama.", { count: modelIds.length })}</p>
          </div>
        </section>

        <section id="cara-kerja">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">{t("Cara Kerja")}</span>
              <h2>{t("Dari daftar sampai manggil model: 3 langkah")}</h2>
              <p>{t("Nggak ada nunggu aktivasi manual. Alurnya otomatis dari pembayaran sampai key siap pakai.")}</p>
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
              <span className="kicker">{t("Buat Developer")}</span>
              <h2>{t("Kompatibel OpenAI. Ganti base URL, selesai.")}</h2>
              <p>{t("Pilih model di kiri — contoh kodenya ngikutin. Kode yang udah jalan di OpenAI SDK tinggal pindah endpoint.")}</p>
            </div>
            <div className="code-grid">
              <div className="model-pick" role="group" aria-label={t("Pilih model untuk contoh kode")}>
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
                  <button className="copy-btn" type="button" onClick={() => copyText(curlPlain(selectedModel), t("Contoh kode tersalin"))}><Copy size={14} />{t("Salin kode")}</button>
                </div>
                <pre aria-label={t("Contoh kode curl")}>
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
              <span className="kicker">{t("Harga")}</span>
              <h2>{t("Harga flat per durasi. Bukan per token.")}</h2>
              <p>{t("Bayar sekali buat masa aktifnya — semua model di template utama kebuka. Ini harga produksi TipRouter saat ini, ditampilkan apa adanya.")}</p>
            </div>
            <div className="price-grid">
              {PRICE_CARDS.map((p) => (
                <div className={"glass price-card" + (p.hot ? " hot" : "")} key={p.plan}>
                  {p.hot && <span className="hot-badge">{t("Paling Hemat")}</span>}
                  <div className="plan">{p.plan}</div>
                  <div className="amount">{p.amount}</div>
                  <div className="dur">{p.dur}</div>
                  <ul>
                    {p.bullets.map((b) => (
                      <li key={b}><Check size={15} strokeWidth={3} />{b}</li>
                    ))}
                  </ul>
                  <Link className={"btn" + (p.hot ? " btn-primary" : " btn-ghost")} to="/buy">{p.btn}</Link>
                </div>
              ))}
            </div>
            <p className="price-note">{t("*Bonus referral dua arah: kamu dan temanmu sama-sama dapat tambahan hari tiap pembelian (Trial tidak termasuk). Ada juga key gratis lewat halaman")}{" "}<Link to="/gacha" style={{ fontWeight: 700 }}>Gacha</Link>.</p>
          </div>
        </section>

        <section aria-label={t("Program referral")}>
          <div className="wrap">
            <div className="glass referral">
              <div>
                <span className="kicker">{t("Referral")}</span>
                <h3>{t("Ajak teman, dua-duanya nambah hari")}</h3>
                <p>{t("Bagikan link")}{" "}<span style={{ fontFamily: "var(--mono)", fontSize: "13.5px" }}>tiprouter.my.id/?ref=KODE</span>{" "}{t("kamu. Tiap teman yang beli, kalian berdua dapat bonus masa aktif — plus milestone kalau makin banyak yang ikut.")}</p>
              </div>
              <div className="ref-table">
                <div className="ref-row"><span>{t("5 referral")}</span><b>{t("+3 hari")}</b></div>
                <div className="ref-row"><span>{t("15 referral")}</span><b>{t("+7 hari")}</b></div>
                <div className="ref-row"><span>{t("30 referral")}</span><b>{t("+30 hari")}</b></div>
              </div>
            </div>
          </div>
        </section>

        <section id="rekomendasi">
          <div className="wrap">
            <div className="sec-head">
              <span className="kicker">{t("Kenapa Dirombak Begini")}</span>
              <h2>{t("Rekomendasi UX di balik konsep ini")}</h2>
              <p>{t("Bukan cuma ganti kulit — ini perubahan alur yang kami terapkan barengan sama visual glass-nya:")}</p>
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
              <h2>{t("Sering ditanyakan")}</h2>
            </div>
            <div className="faq">
              {FAQS.map((f) => (
                <details className="glass faq-item" key={f.q}>
                  <summary>{f.q} <ChevronDown className="chev" size={18} /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <div className="glass cta">
              <h2>{t("Siap nyobain gateway-nya?")}</h2>
              <p>{t("Mulai dari Trial Rp3.000 — bayar QRIS, key aktif otomatis, langsung bisa manggil 33+ model dari satu endpoint.")}</p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link className="btn btn-primary" to="/buy">{t("Beli Key Sekarang")}</Link>
                <Link className="btn btn-ghost" to="/dashboard/guide">{t("Baca Panduan")}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap foot">
          <div>
            <a className="brand" href="#top" style={{ marginBottom: "10px" }}>
              <img className="brand-logo" src="/logo-icon.png" alt="" />
              <span>Tip<em>Router</em></span>
            </a>
            <p className="fine">{t("Gateway API multi-model dengan pembayaran QRIS. Satu key, 33+ model, routing fallback otomatis.")}</p>
          </div>
          <nav aria-label={t("Tautan kaki")}>
            <Link to="/buy">{t("Beli")}</Link>
            <Link to="/gacha">Gacha</Link>
            <Link to="/terms">{t("Syarat")}</Link>
            <Link to="/status" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span className="pulse-dot" aria-hidden="true" />
              {t("Status API")}
            </Link>
            <a href="https://t.me/hermestele" target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Send size={13} />
              {t("Hubungi Admin")}
            </a>
            <Link to="/dashboard/guide">{t("Panduan")}</Link>
            <Link to="/dashboard/history">{t("Riwayat")}</Link>
            <Link to="/notifications">{t("Notifikasi")}</Link>
          </nav>
        </div>
      </footer>

      <div className={"toast" + (toast ? " show" : "")} role="status" aria-live="polite">{toast ?? t("Tersalin ke clipboard")}</div>
    </div>
  );
}
