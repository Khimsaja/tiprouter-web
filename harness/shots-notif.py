#!/usr/bin/env python3
"""Screenshot notification UI: header bell (closed/open), /notifikasi page, desktop + mobile."""
import json, os, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

BASE = "http://tiprouter.test"
DIST = "/home/hatch/workspace/tiprouter-web/dist"
OUT = "/home/hatch/workspace/tiprouter-web/shots"
CHROME = "/opt/meta-chromium/chrome"
NOW = int(time.time() * 1000)

def iso(ms):
    import datetime
    return datetime.datetime.utcfromtimestamp(ms / 1000).strftime("%Y-%m-%dT%H:%M:%S.000Z")

NOTIFS = [
    {"id": "n1", "sender": "Admin TipRouter", "title": "Maintenance malam ini",
     "body": "Server akan maintenance jam 02:00-03:00 WIB. Key tetap bisa dipakai seperti biasa.",
     "link": None, "kind": "info", "createdAt": iso(NOW - 5 * 60000), "read": 0},
    {"id": "n2", "sender": "TipRouter", "title": "Bonus referral +1 hari",
     "body": "Temanmu membeli Plus — key-mu diperpanjang +1 hari.",
     "link": "/referral", "kind": "success", "createdAt": iso(NOW - 40 * 60000), "read": 0},
    {"id": "n3", "sender": "TipRouter", "title": "Key Plus mau habis",
     "body": "Key kamu berakhir 9 Okt 2026, 14:30 WIB. Perpanjang sebelum mati biar nggak putus.",
     "link": "/beli", "kind": "warning", "createdAt": iso(NOW - 3 * 3600000), "read": 1},
    {"id": "n4", "sender": "Admin TipRouter", "title": "Promo 10.10: semua paket diskon",
     "body": "Tanggal 10 Oktober semua paket diskon 20%. Jangan sampai kelewatan!",
     "link": "/beli", "kind": "promo", "createdAt": iso(NOW - 26 * 3600000), "read": 1},
]

def handler(route):
    req = route.request
    if not req.url.startswith(BASE):
        return route.continue_()
    path = urlparse(req.url).path
    def j(data, status=200):
        route.fulfill(status=status, content_type="application/json", body=json.dumps(data))
    if path == "/api/config":
        return j({"google": True, "github": True, "telegramBot": "tiprouter_bot", "apikey": True})
    if path == "/api/me":
        return j({"user": {"name": "Bro Tester", "email": "bro@test.id", "avatar": None},
                  "providers": ["google"], "telegram": None})
    if path == "/api/notifications":
        return j({"items": NOTIFS, "unread": 2})
    if path == "/api/notifications/read":
        return j({"ok": True})
    if path == "/api/keys":
        return j({"keys": []})
    if path == "/api/referral/me":
        return j({"code": "BRO123", "link": "https://tiprouter.my.id/?ref=BRO123", "invites": 0,
                  "successfulPurchases": 0, "bonusDaysEarned": 0, "milestones": [], "history": [], "referredBy": None})
    if path == "/api/referral/leaderboard":
        return j({"board": []})
    fp = os.path.join(DIST, path.lstrip("/"))
    if "." in os.path.basename(path) and os.path.isfile(fp):
        return route.fulfill(path=fp)
    return route.fulfill(path=os.path.join(DIST, "index.html"))

def run():
    os.makedirs(OUT, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
        # desktop
        pg = b.new_page(viewport={"width": 1440, "height": 900})
        pg.route("**/*", handler)
        pg.goto(BASE + "/dashboard", wait_until="networkidle")
        pg.wait_for_timeout(1200)
        pg.screenshot(path=f"{OUT}/notif-desk-header.png")
        pg.click(".notif-btn")
        pg.wait_for_timeout(1600)  # biar timer mark-read ke-trigger, badge ikut berubah
        pg.screenshot(path=f"{OUT}/notif-desk-open.png")
        pg.goto(BASE + "/notifikasi", wait_until="networkidle")
        pg.wait_for_timeout(1200)
        pg.screenshot(path=f"{OUT}/notif-desk-page.png", full_page=True)
        pg.close()
        # mobile
        m = b.new_page(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        m.route("**/*", handler)
        m.goto(BASE + "/dashboard", wait_until="networkidle")
        m.wait_for_timeout(1200)
        m.screenshot(path=f"{OUT}/notif-mob-header.png")
        m.click(".notif-btn")
        m.wait_for_timeout(1600)
        m.screenshot(path=f"{OUT}/notif-mob-open.png")
        m.goto(BASE + "/notifikasi", wait_until="networkidle")
        m.wait_for_timeout(1200)
        m.screenshot(path=f"{OUT}/notif-mob-page.png", full_page=True)
        m.close()
        b.close()
    print("shots done")

if __name__ == "__main__":
    run()
