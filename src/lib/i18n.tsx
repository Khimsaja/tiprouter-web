import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { EN } from "./dict-en";

export type Lang = "id" | "en";

const STORAGE_KEY = "tiprouter-lang";

function initialLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "id";
  } catch {
    return "id";
  }
}

let currentLang: Lang = initialLang();

export const getLang = (): Lang => currentLang;
export const localeTag = (): string => (currentLang === "en" ? "en-US" : "id-ID");

export function tr(id: string, vars?: Record<string, string | number>): string {
  let s = currentLang === "en" ? (EN[id] ?? id) : id;
  if (vars) {
    for (const k of Object.keys(vars)) s = s.split("{" + k + "}").join(String(vars[k]));
  }
  return s;
}

type LangCtxT = { lang: Lang; setLang: (l: Lang) => void; t: typeof tr };
const LangCtx = createContext<LangCtxT>({ lang: currentLang, setLang: () => {}, t: tr });

const TITLES: Record<string, { id: string; en: string; dId?: string; dEn?: string }> = {
  "/": { id: "TipRouter — API Key AI Unlimited", en: "TipRouter — Unlimited AI API Keys" },
  "/bansos": {
    id: "Gacha Bansos — TipRouter",
    en: "Bansos Gacha — TipRouter",
    dId: "Gacha Bansos TipRouter: satu putaran gratis per akun, dapet API key pribadi 1–24 jam. Login dan putar.",
    dEn: "TipRouter Bansos Gacha: one free spin per account, get a personal API key for 1–24 hours. Log in and spin.",
  },
  "/spinwheel": {
    id: "Spin Wheel Angka Acak — TipRouter",
    en: "Random Number Spin Wheel — TipRouter",
    dId: "Putar roda dan dapatkan angka acak dari rentang pilihanmu, 1 sampai 10.000. Buat undian, giveaway, atau milih nomor.",
    dEn: "Spin the wheel and get a random number from your chosen range, 1 to 10,000. For draws, giveaways, or picking numbers.",
  },
  "/login": { id: "Masuk — TipRouter", en: "Log In — TipRouter" },
  "/beli": {
    id: "Beli API Key AI — TipRouter",
    en: "Buy AI API Keys — TipRouter",
    dId: "Beli API key AI unlimited: pilih paket, bayar QRIS, key langsung keluar. Trial mulai Rp3.000.",
    dEn: "Buy unlimited AI API keys: pick a plan, pay with QRIS, your key appears instantly. Trial from IDR 3,000.",
  },
  "/dashboard": { id: "Dashboard — TipRouter", en: "Dashboard — TipRouter" },
  "/dashboard/keys": { id: "API Keys — TipRouter", en: "API Keys — TipRouter" },
  "/dashboard/usage": { id: "Usage — TipRouter", en: "Usage — TipRouter" },
  "/dashboard/models": { id: "Model — TipRouter", en: "Models — TipRouter" },
  "/dashboard/panduan": { id: "Panduan — TipRouter", en: "Guide — TipRouter" },
  "/dashboard/riwayat": { id: "Riwayat — TipRouter", en: "History — TipRouter" },
  "/profile": { id: "Profil — TipRouter", en: "Profile — TipRouter" },
  "/referral": {
    id: "Referral — TipRouter",
    en: "Referral — TipRouter",
    dId: "Undang teman ke TipRouter: tiap pembelian paket lewat link kamu, kamu dan temanmu sama-sama dapat bonus hari.",
    dEn: "Invite friends to TipRouter: every package purchase through your link earns bonus days for both you and your friend.",
  },
  "/syarat": {
    id: "Syarat & Ketentuan — TipRouter",
    en: "Terms & Conditions — TipRouter",
    dId: "Syarat & Ketentuan TipRouter: layanan API key unlimited, ketersediaan model, fair use, pembayaran, dan refund.",
    dEn: "TipRouter Terms & Conditions: unlimited API key service, model availability, fair use, payments, and refunds.",
  },
  "/proxy": {
    id: "Proxy Gratis — TipRouter",
    en: "Free Proxy — TipRouter",
    dId: "Daftar proxy gratis HTTP, HTTPS, SOCKS4, SOCKS5 dari seluruh dunia. Filter per negara dan protokol, pilih, salin, atau download. Tanpa login.",
    dEn: "Free HTTP, HTTPS, SOCKS4, and SOCKS5 proxy list from around the world. Filter by country and protocol, select, copy, or download. No login needed.",
  },
  "/status": {
    id: "Status Model — TipRouter",
    en: "Model Status — TipRouter",
    dId: "Lihat status kesehatan tiap model AI TipRouter: tingkat keberhasilan 1 jam terakhir, diperbarui tiap menit.",
    dEn: "Check each TipRouter AI model's health: 1-hour success rate, updated every minute.",
  },
  "/statistik": {
    id: "Statistik Jaringan — TipRouter",
    en: "Network Statistics — TipRouter",
    dId: "Statistik live jaringan TipRouter 24 jam terakhir: total request, input/output token, dan model terlaris.",
    dEn: "Live TipRouter network statistics for the last 24 hours: total requests, input/output tokens, and top models.",
  },
  "/playground": {
    id: "Playground — TipRouter",
    en: "Playground — TipRouter",
    dId: "Coba API key TipRouter langsung di browser. Pilih model, atur parameter, dan ngobrol dengan AI tanpa install apa pun.",
    dEn: "Try your TipRouter API key right in the browser. Pick a model, tweak parameters, and chat with AI — no install needed.",
  },
  "/dashboard/playground": {
    id: "Playground — TipRouter",
    en: "Playground — TipRouter",
    dId: "Coba API key TipRouter langsung di browser. Pilih model, atur parameter, dan ngobrol dengan AI tanpa install apa pun.",
    dEn: "Try your TipRouter API key right in the browser. Pick a model, tweak parameters, and chat with AI — no install needed.",
  },
};

export function applyTitle(pathname: string) {
  const hit = TITLES[pathname];
  const lang = currentLang;
  document.title = hit ? (lang === "en" ? hit.en : hit.id) : lang === "en" ? "TipRouter — Unlimited AI API Keys" : "TipRouter — API Key AI Unlimited";
  const desc = hit ? (lang === "en" ? hit.dEn : hit.dId) : undefined;
  if (desc) document.querySelector('meta[name="description"]')?.setAttribute("content", desc);
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(currentLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    applyTitle(window.location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = (l: Lang) => {
    currentLang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
    applyTitle(window.location.pathname);
    setLangState(l);
  };

  return <LangCtx.Provider value={{ lang, setLang, t: tr }}>{children}</LangCtx.Provider>;
}

export const useLang = () => useContext(LangCtx);

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-toggle" role="group" aria-label="Bahasa / Language">
      <button type="button" className={lang === "id" ? "on" : ""} onClick={() => setLang("id")} aria-pressed={lang === "id"}>
        ID
      </button>
      <button type="button" className={lang === "en" ? "on" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>
        EN
      </button>
    </div>
  );
}
