#!/usr/bin/env python3
"""Screenshot every SPA route (desktop + mobile).

No HTTP server: Playwright route interception fulfills every request from
dist/ + stubbed API JSON, so the browser never opens a real socket (the
sandbox blocks loopback navigation in Chromium).
"""
import json
import os
import sys
import time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = "http://tiprouter.test"
DIST = "/home/hatch/workspace/tiprouter-web/dist"
OUT = "/home/hatch/workspace/tiprouter-web/shots"
CHROME = "/opt/meta-chromium/chrome"

MODELS = [
    "muse-spark-1.3", "fledge-alpha", "ling-3.1-flash", "longcat-2.5-preview",
    "mimo-v2.6-flashh", "space-bunny", "deepseek-v4-flash", "qwen3.8-flash",
    "mimo-v2.5", "gpt-6-astra", "glm-5.3-flash", "claude-sonnet-5",
]
NOW = int(time.time() * 1000)


def iso(ms):
    import datetime
    return datetime.datetime.utcfromtimestamp(ms / 1000).strftime("%Y-%m-%dT%H:%M:%S.000Z")


SAMPLE_KEY = {
    "id": "key-test-1", "label": "bro@test.id", "prefix": "tip_8f3ka9",
    "createdAt": iso(NOW - 86400000), "expiresAt": iso(NOW + 6 * 86400000),
    "requestsPerMinute": 150, "maxConcurrentRequests": 4,
    "modelAccessMode": "whitelist", "models": MODELS, "modelCount": len(MODELS),
    "tokensConsumed": 1234567, "status": "active",
    "source": {"kind": "beli", "label": "Pembelian", "detail": "Plus"},
}

SAMPLE_KEY_GACHA = dict(SAMPLE_KEY, id="key-test-2", label="bro@test.id", prefix="tip_7g2hb1",
                        tokensConsumed=54321,
                        source={"kind": "gacha", "label": "Gacha Bansos", "detail": "6 jam"})

FAKE_QR = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">'
    '<rect width="240" height="240" fill="#fff"/><g fill="#000">'
    + "".join(
        f'<rect x="{(i % 10) * 24}" y="{(i // 10) * 24}" width="24" height="24"/>'
        for i in range(100) if (i * 37) % 3 == 0
    )
    + "</g></svg>"
)


def make_handler(cfg):
    def j(route, data, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(data))

    def handler(route):
        req = route.request
        if not req.url.startswith(BASE):
            return route.continue_()
        path = urlparse(req.url).path
        method = req.method
        if path == "/api/bansos-key":
            return j(route, {"key": "tip_bansosContohKeyBuatScreenshot123456"})
        if path == "/api/proxies":
            sample = [
                {"protocol": "socks5", "ip": "103.152.4.18", "port": 1080, "country": "Indonesia", "country_code": "ID", "city": "Jakarta", "anonymity": "elite", "ssl": True, "uptime_percent": 98.2, "asn": "AS9340", "isp": "PT Example Net", "latency_ms": 84.5},
                {"protocol": "http", "ip": "45.77.20.9", "port": 8080, "country": "Singapore", "country_code": "SG", "city": "Singapore", "anonymity": "anonymous", "ssl": False, "uptime_percent": 91.0, "asn": "AS20473", "isp": "Vultr Holdings", "latency_ms": 132.1},
                {"protocol": "http", "ip": "178.62.201.44", "port": 3128, "country": "Netherlands", "country_code": "NL", "city": "Amsterdam", "anonymity": "elite", "ssl": True, "uptime_percent": 87.4, "asn": "AS14061", "isp": "DigitalOcean", "latency_ms": 210.9},
                {"protocol": "socks4", "ip": "196.251.70.3", "port": 4145, "country": "Germany", "country_code": "DE", "city": "Falkenstein", "anonymity": "transparent", "ssl": False, "uptime_percent": 76.3, "asn": "AS24940", "isp": "Hetzner Online", "latency_ms": 301.2},
                {"protocol": "socks5", "ip": "72.195.113.90", "port": 4145, "country": "United States", "country_code": "US", "city": "Ashburn", "anonymity": "elite", "ssl": True, "uptime_percent": 99.1, "asn": "AS7922", "isp": "Comcast Cable", "latency_ms": 240.0},
            ]
            return j(route, {"total": 6050, "page": 1, "limit": 50, "updatedAt": 1791185770275,
                             "stats": {"total": 3512, "by_protocol": {"http": 793, "https": 236, "socks4": 260, "socks5": 2459},
                                       "countries": ["DE", "ID", "NL", "SG", "US"], "country_count": 86,
                                       "by_country": {"ID": 214, "SG": 96, "NL": 74, "DE": 67, "US": 288}},
                             "items": sample})
        if path == "/api/config":
            return j(route, {"google": True, "github": True, "telegramBot": "tiprouter_bot", "apikey": True,
                             "turnstileSiteKey": "1x00000000000000000000AA" if cfg.get("turnstile") else None})
        if path == "/api/me":
            if not cfg.get("user"):
                return j(route, {"error": "unauthorized"}, 401)
            return j(route, {
                "user": {"name": "Bro Tester", "email": "bro@test.id", "avatar": None},
                "providers": ["google"], "telegram": None,
            })
        if path == "/api/keys":
            if not cfg.get("user"):
                return j(route, {"error": "unauthorized"}, 401)
            return j(route, {"keys": [] if cfg.get("keys_empty") else [SAMPLE_KEY, SAMPLE_KEY_GACHA]})
        if path == "/api/gacha" and method == "GET":
            if not cfg.get("user"):
                return j(route, {"error": "unauthorized"}, 401)
            if cfg.get("gacha_claimed"):
                return j(route, {"claimed": True, "durationHours": 24,
                                 "key": "tip_gachaJACKPOT24jamContohKey123456",
                                 "expiresAt": iso(NOW + 23 * 3600000),
                                 "remainingSec": 23 * 3600 + 1234, "expired": False})
            return j(route, {"claimed": False, "ipUsed": False})
        if path == "/api/gacha/spin" and method == "POST":
            return j(route, {"claimed": True, "durationHours": 24,
                             "key": "tip_gachaJACKPOT24jamContohKey123456",
                             "expiresAt": iso(NOW + 24 * 3600000),
                             "remainingSec": 24 * 3600, "expired": False})
        if path == "/api/orders" and method == "POST":
            return j(route, {"id": "ordtest1234567890abcdef1234", "amount": 3280,
                             "qrisId": "qrtest1", "expiresAt": iso(NOW + 10 * 60000),
                             "packageName": "Trial", "days": 1})
        if path.startswith("/api/orders/"):
            if path.endswith("/cancel"):
                return j(route, {"status": "cancelled"})
            if cfg.get("paid"):
                return j(route, {"status": "minted", "amount": 3280, "packageKey": "trial",
                                 "qrisId": "qrtest1", "expiresAt": iso(NOW + 9 * 60000),
                                 "key": "tip_beliContohKeyHasilBayarQRIS123456",
                                 "keyExpires": iso(NOW + 86400000)})
            return j(route, {"status": "pending", "amount": 3280, "packageKey": "trial",
                             "qrisId": "qrtest1", "expiresAt": iso(NOW + 9 * 60000 + 30000)})
        if path.startswith("/qr/"):
            return route.fulfill(status=200, content_type="image/svg+xml", body=FAKE_QR)
        if path == "/auth/logout":
            return j(route, {"ok": True})
        # static file or SPA fallback
        fp = os.path.join(DIST, path.lstrip("/"))
        if "." in os.path.basename(path) and os.path.isfile(fp):
            return route.fulfill(path=fp)
        return route.fulfill(path=os.path.join(DIST, "index.html"))

    return handler


# (name, path, cfg, viewport, wait_ms)
U = {"user": True}
SHOTS = [
    ("desk-landing", "/", {}, (1440, 900), 2500),
    ("desk-bansos", "/bansos", {}, (1440, 900), 1500),
    ("desk-spinwheel", "/spinwheel", {}, (1440, 900), 1500),
    ("desk-login", "/login", {}, (1440, 900), 1500),
    ("desk-beli", "/beli", {}, (1440, 900), 1500),
    ("desk-beli-bayar", "/beli?order=ordtest1234567890abcdef1234", {}, (1440, 900), 2000),
    ("desk-beli-sukses", "/beli?order=ordtest1234567890abcdef1234", {"paid": True}, (1440, 900), 2000),
    ("desk-dashboard", "/dashboard", U, (1440, 900), 2000),
    ("desk-dashboard-nokey", "/dashboard", {"user": True, "keys_empty": True}, (1440, 900), 2000),
    ("desk-keys", "/dashboard/keys", U, (1440, 900), 2000),
    ("desk-usage", "/dashboard/usage", U, (1440, 900), 2000),
    ("desk-models", "/dashboard/models", U, (1440, 900), 2000),
    ("desk-panduan", "/dashboard/panduan", U, (1440, 900), 2000),
    ("desk-profile", "/profile", U, (1440, 900), 2000),
    ("desk-gacha", "/bansos", U, (1440, 900), 2000),
    ("desk-gacha-claimed", "/bansos", {"user": True, "gacha_claimed": True}, (1440, 900), 2000),
    ("mob-landing", "/", {}, (390, 844), 2500),
    ("mob-login", "/login", {}, (390, 844), 1500),
    ("mob-beli", "/beli", {}, (390, 844), 1500),
    ("mob-beli-bayar", "/beli?order=ordtest1234567890abcdef1234", {}, (390, 844), 2000),
    ("mob-dashboard", "/dashboard", U, (390, 844), 2000),
    ("mob-keys", "/dashboard/keys", U, (390, 844), 2000),
    ("mob-gacha", "/bansos", U, (390, 844), 2000),
    ("mob-profile", "/profile", U, (390, 844), 2000),
    ("mob-bansos", "/bansos", {}, (390, 844), 1500),
    ("mob-spinwheel", "/spinwheel", {}, (390, 844), 1500),
    ("desk-syarat", "/syarat", {}, (1440, 900), 1500),
    ("mob-syarat", "/syarat", {}, (390, 844), 1500),
    ("desk-logout-modal", "/dashboard", U, (1440, 900), 1500),
    ("mob-logout-modal", "/dashboard", U, (390, 844), 1500),
    ("desk-en-landing", "/", {"lang": "en"}, (1440, 900), 2500),
    ("desk-en-login", "/login", {"lang": "en"}, (1440, 900), 1500),
    ("desk-en-beli", "/beli", {"lang": "en"}, (1440, 900), 1500),
    ("desk-en-bansos", "/bansos", {"lang": "en"}, (1440, 900), 1500),
    ("desk-en-dashboard", "/dashboard", {"lang": "en", "user": True}, (1440, 900), 2000),
    ("desk-en-keys", "/dashboard/keys", {"lang": "en", "user": True}, (1440, 900), 2000),
    ("desk-en-profile", "/profile", {"lang": "en", "user": True}, (1440, 900), 2000),
    ("desk-en-syarat", "/syarat", {"lang": "en"}, (1440, 900), 1500),
    ("desk-en-spinwheel", "/spinwheel", {"lang": "en"}, (1440, 900), 1500),
    ("mob-en-landing", "/", {"lang": "en"}, (390, 844), 2500),
    ("mob-en-login", "/login", {"lang": "en"}, (390, 844), 1500),
    ("mob-en-beli", "/beli", {"lang": "en"}, (390, 844), 1500),
    ("mob-en-dashboard", "/dashboard", {"lang": "en", "user": True}, (390, 844), 2000),
    ("mob-en-keys", "/dashboard/keys", {"lang": "en", "user": True}, (390, 844), 2000),
    ("desk-login-turnstile", "/login", {"turnstile": True}, (1440, 900), 4000),
    ("mob-menu-open", "/", {"open_menu": True}, (390, 844), 1500),
    ("mob-menu-open-user", "/dashboard", {"open_menu": True, "user": True}, (390, 844), 2000),
    ("desk-proxy", "/proxy", {}, (1440, 900), 2500),
    ("mob-proxy", "/proxy", {}, (390, 844), 2500),
    ("desk-en-proxy", "/proxy", {"lang": "en"}, (1440, 900), 2500),
    ("mob-en-proxy", "/proxy", {"lang": "en"}, (390, 844), 2500),
]


def main():
    only = sys.argv[1:] or None
    with sync_playwright() as p:
        browser = p.chromium.launch(
            executable_path=CHROME,
            args=["--no-sandbox", "--disable-gpu", "--force-device-scale-factor=1"],
        )
        for name, path, cfg, (w, h), wait in SHOTS:
            if os.environ.get("SHOTS_ONLY") and os.environ["SHOTS_ONLY"] not in name:
                continue
            if only and name not in only:
                continue
            ctx = browser.new_context(viewport={"width": w, "height": h})
            if os.environ.get("LANG_EN"):
                ctx.add_init_script("try{localStorage.setItem('tiprouter-lang','en')}catch(e){}")
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e, errs=errors: errs.append(str(e)))
            page.route("**/*", make_handler(cfg))
            if cfg.get("lang"):
                ctx.add_init_script(f"try{{localStorage.setItem('tiprouter-lang','{cfg['lang']}')}}catch(e){{}}")
            try:
                page.goto(BASE + path, wait_until="networkidle", timeout=30000)
            except Exception as e:
                print(f"{name}: GOTO FAIL {str(e)[:160]}")
                ctx.close()
                continue
            page.wait_for_timeout(wait)
            if cfg.get("open_menu"):
                try:
                    page.locator(".burger").click()
                    page.wait_for_timeout(700)
                except Exception:
                    pass
            if "logout-modal" in name:
                try:
                    page.locator("button:has-text('Keluar'), button:has-text('Log Out')").first.click()
                    page.wait_for_timeout(700)
                except Exception:
                    pass
            page.evaluate("""async () => {
                const H = document.body.scrollHeight;
                for (let y = 0; y < H; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); }
                window.scrollTo(0, 0);
            }""")
            page.wait_for_timeout(1000)
            out = f"{OUT}/{name}{'-en' if os.environ.get('LANG_EN') else ''}.png"
            page.screenshot(path=out, full_page=True)
            print(f"{name}: ok" + (f" | pageerrors: {errors[:2]}" if errors else ""))
            ctx.close()
        browser.close()


if __name__ == "__main__":
    main()
