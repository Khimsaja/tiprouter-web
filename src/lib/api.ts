export type Me = {
  user: { name: string | null; email: string | null; avatar: string | null };
  providers: string[];
  telegram: { id: string; username: string | null; firstName: string | null; photoUrl: string | null } | null;
};

export type KeyItem = {
  id: string;
  label: string;
  prefix: string | null;
  createdAt: string;
  expiresAt: string | null;
  requestsPerMinute: number | null;
  maxConcurrentRequests: number | null;
  modelAccessMode: string | null;
  models: string[];
  modelCount: number;
  tokensConsumed: number | null;
  status: "active" | "expired" | "revoked";
};

export type Config = { google: boolean; github: boolean; telegramBot: string | null; apikey: boolean };

export type OrderCreated = { id: string; amount: number; qrisId: string; expiresAt: string; packageName: string; days: number };
export type OrderStatus = {
  status: "pending" | "paid" | "minted" | "expired" | "cancelled" | "paid_late";
  amount: number; packageKey: string; qrisId?: string; expiresAt: string; key?: string; keyExpires?: string;
};

export type GachaState =
  | { claimed: false; ipUsed: boolean }
  | { claimed: true; durationHours: number; key: string; expiresAt: string; remainingSec: number; expired: boolean };

export const PACKAGES = [
  { key: "trial", name: "Trial", days: 1, price: 3000, blurb: "Buat nyobain dulu" },
  { key: "basic", name: "Basic", days: 3, price: 6000, blurb: "Paket santai" },
  { key: "plus", name: "Plus", days: 7, price: 10000, blurb: "Seminggu penuh" },
  { key: "essential", name: "Essential", days: 14, price: 18000, blurb: "Dua minggu" },
  { key: "pro", name: "Pro", days: 30, price: 30000, blurb: "Paling hemat per hari" },
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
  keys: () => fetch("/api/keys").then((r) => j<{ keys: KeyItem[]; reason?: string }>(r)),
  logout: () => fetch("/auth/logout", { method: "POST" }),
  apikeyLogin: (key: string) =>
    fetch("/auth/apikey", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key }) }).then((r) => j<{ ok: true }>(r)),
  createOrder: (pkg: string, email: string) =>
    fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ package: pkg, email }) }).then((r) => j<OrderCreated>(r)),
  orderStatus: (id: string) => fetch("/api/orders/" + encodeURIComponent(id)).then((r) => j<OrderStatus>(r)),
  cancelOrder: (id: string) => fetch("/api/orders/" + encodeURIComponent(id) + "/cancel", { method: "POST" }).then((r) => j<{ status: string }>(r)),
  gacha: () => fetch("/api/gacha").then((r) => j<GachaState>(r)),
  gachaSpin: () => fetch("/api/gacha/spin", { method: "POST" }).then((r) => j<GachaState>(r)),
};

export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
export const fmtNum = (n: number | null | undefined) => (n === null || n === undefined ? "-" : Number(n).toLocaleString("id-ID"));
export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-";
export const daysLeft = (iso?: string | null) => {
  if (!iso) return null;
  return Math.max(0, Math.ceil((Date.parse(iso) - Date.now()) / 86400000));
};
