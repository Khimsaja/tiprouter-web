// Local test harness: serve dist/ + stub /api/* so every SPA state can be screenshotted.
// Not part of the app. Run: bun harness/server.ts  (port 4173)
import { join } from "node:path";

const DIST = join(import.meta.dir, "..", "dist");
const PORT = 4173;

const MODELS = [
  "muse-spark-1.3", "fledge-alpha", "ling-3.1-flash", "longcat-2.5-preview",
  "mimo-v2.6-flashh", "space-bunny", "deepseek-v4-flash", "qwen3.8-flash",
  "mimo-v2.5", "gpt-6-astra", "glm-5.3-flash", "claude-sonnet-5",
];

const now = Date.now();
const iso = (ms: number) => new Date(ms).toISOString();

const sampleKey = {
  id: "key-test-1",
  label: "bro@test.id",
  prefix: "tip_8f3ka9",
  createdAt: iso(now - 1 * 86400000),
  expiresAt: iso(now + 6 * 86400000),
  requestsPerMinute: 150,
  maxConcurrentRequests: 4,
  modelAccessMode: "whitelist",
  models: MODELS,
  modelCount: MODELS.length,
  tokensConsumed: 1234567,
  status: "active",
};

const fakeQrSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240"><rect width="240" height="240" fill="#fff"/><g fill="#000">${Array.from({ length: 100 }, (_, i) => {
  const x = (i % 10) * 24, y = Math.floor(i / 10) * 24;
  return (i * 37) % 3 === 0 ? `<rect x="${x}" y="${y}" width="24" height="24"/>` : "";
}).join("")}</g></svg>`;

function stub(req: Request, path: string): Response | null {
  const cookie = req.headers.get("cookie") || "";
  const asUser = cookie.includes("stub_as=user");
  const paid = cookie.includes("stub_paid=1");
  const gachaClaimed = cookie.includes("stub_gacha=claimed");
  const keysEmpty = cookie.includes("stub_keys=empty");
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

  if (path === "/api/config") return json({ google: true, github: true, telegramBot: "tiprouter_bot", apikey: true });
  if (path === "/api/me") {
    if (!asUser) return json({ error: "unauthorized" }, 401);
    return json({
      user: { name: "Bro Tester", email: "bro@test.id", avatar: null },
      providers: ["google"],
      telegram: null,
    });
  }
  if (path === "/api/keys") {
    if (!asUser) return json({ error: "unauthorized" }, 401);
    return json({ keys: keysEmpty ? [] : [sampleKey] });
  }
  if (path === "/api/gacha" && req.method === "GET") {
    if (!asUser) return json({ error: "unauthorized" }, 401);
    if (gachaClaimed)
      return json({ claimed: true, durationHours: 24, key: "tip_gachaJACKPOT24jamContohKey123456", expiresAt: iso(now + 23 * 3600000), remainingSec: 23 * 3600 + 1234, expired: false });
    return json({ claimed: false, ipUsed: false });
  }
  if (path === "/api/gacha/spin" && req.method === "POST") {
    return json({ claimed: true, durationHours: 24, key: "tip_gachaJACKPOT24jamContohKey123456", expiresAt: iso(now + 24 * 3600000), remainingSec: 24 * 3600, expired: false });
  }
  if (path === "/api/orders" && req.method === "POST") {
    return json({ id: "ordtest1234567890abcdef1234", amount: 3280, qrisId: "qrtest1", expiresAt: iso(now + 10 * 60000), packageName: "Trial", days: 1 });
  }
  const orderMatch = path.match(/^\/api\/orders\/([\w-]+)(\/cancel)?$/);
  if (orderMatch) {
    if (orderMatch[2]) return json({ status: "cancelled" });
    if (paid)
      return json({ status: "minted", amount: 3280, packageKey: "trial", qrisId: "qrtest1", expiresAt: iso(now + 9 * 60000), key: "tip_beliContohKeyHasilBayarQRIS123456", keyExpires: iso(now + 86400000) });
    return json({ status: "pending", amount: 3280, packageKey: "trial", qrisId: "qrtest1", expiresAt: iso(now + 9 * 60000 + 30000) });
  }
  if (path.startsWith("/qr/")) return new Response(fakeQrSvg, { headers: { "content-type": "image/svg+xml" } });
  if (path === "/auth/logout") return json({ ok: true });
  return null;
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;
    const stubbed = stub(req, path);
    if (stubbed) return stubbed;
    // static files from dist, SPA fallback
    const filePath = join(DIST, path === "/" ? "index.html" : path.slice(1));
    const file = Bun.file(filePath);
    if (path.includes(".") && (await file.exists())) return new Response(file);
    return new Response(Bun.file(join(DIST, "index.html")), { headers: { "content-type": "text/html" } });
  },
});
console.log("harness on http://127.0.0.1:" + server.port);
