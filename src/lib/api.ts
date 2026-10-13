export type Me = {
  user: { name: string | null; email: string | null; avatar: string | null };
  providers: string[];
  telegram: { id: string; username: string | null; firstName: string | null; photoUrl: string | null } | null;
};

export type KeyItem = {
  id: string;
  label: string;
  prefix: string | null;
  hint: string | null;
  createdAt: string;
  expiresAt: string | null;
  requestsPerMinute: number | null;
  maxConcurrentRequests: number | null;
  modelAccessMode: string | null;
  models: string[];
  modelCount: number;
  tokensConsumed: number | null;
  status: "active" | "expired" | "revoked";
  revealable?: boolean;
  source?: { kind: "beli" | "gacha"; label: string; detail: string | null };
};

export type Config = { google: boolean; github: boolean; telegramBot: string | null; apikey: boolean; turnstileSiteKey?: string | null; crypto?: { solana: boolean; base: boolean } };

export type CryptoInfo = { chain: string; address: string; usdcAmount: number; rate?: number; reference?: string; solanaPayUrl?: string };
export type OrderCreated = { id: string; orderCode?: string; amount: number; qrisId: string; expiresAt: string; packageName: string; days: number; payMethod?: string; promoCode?: string | null; discountIdr?: number; finalPrice?: number; crypto?: CryptoInfo; address?: string; usdcAmount?: number; rate?: number; reference?: string; solanaPayUrl?: string; chain?: string };
export type PromoCheck = { valid: boolean; code?: string; kind?: string; value?: number; discount_idr?: number; final_price?: number; error?: string };
export type ActivePromo = {
  code: string; kind: string; value: number;
  max_uses: number | null; used_count: number; remaining: number | null;
  expires_at: string | null; note: string | null;
};
export function promoDiscountLabel(p: Pick<ActivePromo, "kind" | "value">): string {
  return p.kind === "percent" ? `${p.value}%` : `Rp${p.value.toLocaleString("id-ID")}`;
}
export type HistoryOrder = {
  id: string; created_at: string; package_key: string; base_amount: number;
  amount: number; discount_idr: number; promo_code: string | null; status: string;
  tx_id: string | null; order_code: string | null; paid_at: string | null;
  extend_key_id: string | null; pay_method: string | null;
};
export type HistoryGacha = { duration_hours: number; created_at: string; expires_at: string };
export type HistoryData = { orders: HistoryOrder[]; gacha: HistoryGacha[] };
export type ReferralInfo = {
  code: string; link: string; invites: number;
  successfulPurchases: number; bonusDaysEarned: number;
  milestones: Array<{ milestone: number; bonusDays: number; awardedAt: string }>;
  history: Array<{ at: string; packageKey: string; bonusDays: number; invitee: string }>;
  referredBy: string | null;
};
export type ReferralBoard = { board: Array<{ rank: number; name: string; referrals: number }> };

export type ProxyItem = {
  protocol: string;
  ip: string;
  port: number;
  country?: string;
  country_code?: string;
  city?: string;
  anonymity?: string;
  ssl?: boolean;
  uptime_percent?: number;
  asn?: string;
  isp?: string;
  latency_ms?: number;
};

export type NotifKind = "info" | "success" | "warning" | "promo";
export type NotifItem = {
  id: string;
  sender: string;
  title: string;
  body: string;
  link: string | null;
  kind: NotifKind;
  createdAt: string;
  read: number;
};

export type ProxyStats = {
  total: number;
  by_protocol: Record<string, number>;
  countries: string[];
  country_count: number;
  by_country: Record<string, number>;
};

export type ProxyResult = {
  total: number;
  page: number;
  limit: number;
  updatedAt: number;
  stats: ProxyStats | null;
  items: ProxyItem[];
};

export type OrderStatus = {  status: "pending" | "paid" | "minted" | "expired" | "cancelled" | "paid_late";
  amount: number; packageKey: string; qrisId?: string; expiresAt: string; key?: string; keyExpires?: string; extended?: boolean;
  payMethod: string; crypto?: CryptoInfo; orderCode?: string;
};

export type GachaState =
  | { claimed: false; ipUsed: boolean }
  | { claimed: true; durationHours: number; key: string; expiresAt: string; remainingSec: number; expired: boolean };

export const PACKAGES = [
  { key: "trial", name: "Trial", days: 1, price: 3000, blurb: "Buat nyobain dulu" },
  { key: "basic", name: "Basic", days: 3, price: 8000, blurb: "Paket santai" },
  { key: "plus", name: "Plus", days: 7, price: 15000, blurb: "Seminggu penuh" },
  { key: "essential", name: "Essential", days: 14, price: 24000, blurb: "Dua minggu" },
  { key: "pro", name: "Pro", days: 30, price: 40000, blurb: "Paling hemat per hari" },
] as const;

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let err = "http_" + res.status;
    try { const d = (await res.json()) as { error?: string }; if (d?.error) err = d.error; } catch { /* keep */ }
    throw Object.assign(new Error(err), { status: res.status, code: err });
  }
  return (await res.json()) as T;
}

export const api = {
  config: () => fetch("/api/config").then((r) => j<Config>(r)),
  me: () => fetch("/api/me").then((r) => j<Me>(r)),
  keys: () => fetch("/api/keys").then((r) => j<{ keys: KeyItem[]; unlinked?: KeyItem[]; reason?: string }>(r)),
  keySecret: (id: string) =>
    fetch("/api/keys/" + encodeURIComponent(id) + "/secret").then((r) => j<{ secret: string }>(r)),
  linkKey: (key: string, turnstileToken?: string | null) =>
    fetch("/api/keys/link", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, turnstileToken: turnstileToken ?? undefined }) }).then((r) => j<{ ok: true; keyId: string; label: string; claimed?: boolean }>(r)),
  unlinkKey: (id: string) =>
    fetch("/api/keys/" + encodeURIComponent(id) + "/unlink", { method: "POST" }).then((r) => j<{ ok: true }>(r)),
  relinkKey: (id: string) =>
    fetch("/api/keys/" + encodeURIComponent(id) + "/relink", { method: "POST" }).then((r) => j<{ ok: true }>(r)),
  disconnectProvider: (provider: string) =>
    fetch("/api/auth/disconnect", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ provider }) }).then((r) => j<{ ok: true }>(r)),
  logout: () => fetch("/auth/logout", { method: "POST" }),
  apikeyLogin: (key: string, turnstileToken?: string | null) =>
    fetch("/auth/apikey", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key, turnstileToken: turnstileToken ?? undefined }) }).then((r) => j<{ ok: true }>(r)),
  createOrder: (pkg: string, email: string, turnstileToken?: string | null, payMethod?: string, extendKeyId?: string, promo?: string | null) =>
    fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ package: pkg, email, turnstileToken: turnstileToken ?? undefined, payMethod, extendKeyId: extendKeyId ?? undefined, promo: promo ?? undefined }) }).then((r) => j<OrderCreated>(r)),
  promoValidate: (code: string, pkg: string) =>
    fetch("/api/promo/validate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, package: pkg }) }).then((r) => j<PromoCheck>(r)),
  promoActive: () => fetch("/api/promo/active").then((r) => j<{ promos: ActivePromo[] }>(r)),
  history: () => fetch("/api/history").then((r) => j<HistoryData>(r)),
  orderStatus: (id: string) => fetch("/api/orders/" + encodeURIComponent(id)).then((r) => j<OrderStatus>(r)),
  cancelOrder: (id: string) => fetch("/api/orders/" + encodeURIComponent(id) + "/cancel", { method: "POST" }).then((r) => j<{ status: string }>(r)),
  gacha: () => fetch("/api/gacha").then((r) => j<GachaState>(r)),
  referralMe: () => fetch("/api/referral/me").then((r) => j<ReferralInfo>(r)),
  referralBoard: () => fetch("/api/referral/leaderboard").then((r) => j<ReferralBoard>(r)),
  gachaSpin: (turnstileToken?: string | null) =>
    fetch("/api/gacha/spin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ turnstileToken: turnstileToken ?? undefined }) }).then((r) => j<GachaState>(r)),
  proxies: (params: { protocol?: string; country?: string; anonymity?: string; q?: string; page?: number; limit?: number; maxlat?: number; sort?: string }) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") qs.set(k, String(v));
    return fetch("/api/proxies?" + qs.toString()).then((r) => j<ProxyResult>(r));
  },
  notifications: (limit = 10) =>
    fetch("/api/notifications?limit=" + limit).then((r) => j<{ items: NotifItem[]; unread: number }>(r)),
  notifRead: (ids: string[]) =>
    fetch("/api/notifications/read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids }) }).then((r) => j<{ ok: true }>(r)),
  notifReadAll: () =>
    fetch("/api/notifications/read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ all: true }) }).then((r) => j<{ ok: true }>(r)),
  publicStats: () =>
    fetch("/api/stats/public").then((r) => j<PublicStats>(r)),
};

export interface PublicModelStat {
  model: string;
  hits: number;
  ok: number;
  tokens: number;
}

export interface PublicStats {
  window: "24h";
  requests: number;
  ok: number;
  success_rate: number;
  input_tokens: number;
  output_tokens: number;
  top_models: PublicModelStat[];
  generated_at: string;
}

import { getLang, localeTag } from "./i18n";

export const rp = (n: number) => (getLang() === "en" ? "IDR " + n.toLocaleString("en-US") : "Rp" + n.toLocaleString("id-ID"));

// --- Kurs USD->IDR buat konversi tampilan harga (display only, cache 1 jam) ---
let fxCache: { at: number; rate: number } | null = null;
export async function usdIdr(): Promise<number | null> {
  if (fxCache && Date.now() - fxCache.at < 3600_000) return fxCache.rate;
  try {
    const r = await fetch("/api/fx-rate");
    if (!r.ok) return fxCache?.rate ?? null;
    const d = (await r.json()) as { usd_idr?: number };
    if (typeof d.usd_idr === "number" && d.usd_idr > 0) {
      fxCache = { at: Date.now(), rate: d.usd_idr };
      return d.usd_idr;
    }
  } catch { /* abaikan, pakai cache/null */ }
  return fxCache?.rate ?? null;
}
// Format "≈ $2.47" dari harga rupiah; null kalau kurs belum ada.
export const toUsd = (idr: number, rate: number | null): string | null =>
  rate ? "≈ $" + (idr / rate).toFixed(2) : null;
export const fmtNum = (n: number | null | undefined) => (n === null || n === undefined ? "-" : Number(n).toLocaleString(localeTag()));
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(localeTag(), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
export const daysLeft = (iso?: string | null) => {
  if (!iso) return null;
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400000));
};
