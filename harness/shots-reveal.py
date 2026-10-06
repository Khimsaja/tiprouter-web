#!/usr/bin/env python3
import json, os, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = "http://tiprouter.test"
DIST = "/home/hatch/workspace/tiprouter-web/dist"
OUT = "/home/hatch/workspace/tiprouter-web/shots"
CHROME = "/opt/meta-chromium/chrome"
NOW = int(time.time() * 1000)

import datetime
def iso(ms):
    return datetime.datetime.utcfromtimestamp(ms / 1000).strftime("%Y-%m-%dT%H:%M:%S.000Z")

MODELS = ["muse-spark-1.3", "fledge-alpha", "ling-3.1-flash"] * 5
KEYS = [
    {"id": "key-new", "label": "bro@test.id", "prefix": "tip_", "createdAt": iso(NOW - 3600000),
     "expiresAt": iso(NOW + 29 * 86400000), "requestsPerMinute": 150, "maxConcurrentRequests": 4,
     "modelAccessMode": "whitelist", "models": MODELS, "modelCount": 15,
     "tokensConsumed": 45210, "status": "active", "revealable": True},
    {"id": "key-old", "label": "@brotester", "prefix": "rk_", "createdAt": iso(NOW - 20 * 86400000),
     "expiresAt": iso(NOW + 10 * 86400000), "requestsPerMinute": 150, "maxConcurrentRequests": 4,
     "modelAccessMode": "whitelist", "models": MODELS, "modelCount": 15,
     "tokensConsumed": 987654, "status": "active", "revealable": False},
]

def handler(route):
    req = route.request
    path = urlparse(req.url).path
    def j(data, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(data))
    if path == "/api/config":
        return j({"google": True, "github": True, "telegramBot": "tiprouter_bot", "apikey": True})
    if path == "/api/me":
        return j({"user": {"name": "Bro Tester", "email": "bro@test.id", "avatar": None},
                  "providers": ["google"], "telegram": None})
    if path == "/api/keys":
        return j({"keys": KEYS})
    if path == "/api/keys/key-new/secret":
        return j({"secret": "tip_ContohKeyBaruHasilBeliWeb1234567890abcdef"})
    if path == "/auth/logout":
        return j({"ok": True})
    fp = os.path.join(DIST, path.lstrip("/"))
    if "." in os.path.basename(path) and os.path.isfile(fp):
        return route.fulfill(path=fp)
    return route.fulfill(path=os.path.join(DIST, "index.html"))

os.makedirs(OUT, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    for name, vp in [("reveal-desk", (1440, 900)), ("reveal-mob", (390, 844))]:
        ctx = b.new_context(viewport={"width": vp[0], "height": vp[1]})
        pg = ctx.new_page()
        pg.route("**/*", handler)
        pg.goto(BASE + "/dashboard/keys")
        pg.wait_for_timeout(500)
        pg.evaluate("localStorage.setItem('tiprouter-theme','dark'); location.reload();")
        pg.wait_for_timeout(1500)
        pg.screenshot(path=f"{OUT}/{name}-masked.png")
        pg.click('button[aria-label="Lihat key"]')
        pg.wait_for_timeout(900)
        pg.screenshot(path=f"{OUT}/{name}-shown.png")
        ctx.close()
    b.close()
print("OK")
