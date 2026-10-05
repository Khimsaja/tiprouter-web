#!/usr/bin/env python3
"""Live verification screenshots of https://tiprouter.my.id via the egress proxy."""
import os
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright

CHROME = "/opt/meta-chromium/chrome"
OUT = "/home/hatch/workspace/tiprouter-web/shots-live"
os.makedirs(OUT, exist_ok=True)

u = urlparse(os.environ["HTTPS_PROXY"])
proxy = {"server": f"{u.scheme}://{u.hostname}:{u.port}", "username": u.username, "password": u.password}

SHOTS = [
    ("live-desk-landing", "/", (1440, 900)),
    ("live-desk-login", "/login", (1440, 900)),
    ("live-desk-beli", "/beli", (1440, 900)),
    ("live-desk-dashboard-anon", "/dashboard", (1440, 900)),  # expect SPA guard -> /login
    ("live-mob-landing", "/", (390, 844)),
    ("live-mob-bansos", "/bansos", (390, 844)),
]

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--disable-gpu"], proxy=proxy)
    for name, path, (w, h) in SHOTS:
        ctx = browser.new_context(viewport={"width": w, "height": h}, ignore_https_errors=True)
        page = ctx.new_page()
        errs = []
        page.on("pageerror", lambda e, errs=errs: errs.append(str(e)))
        try:
            page.goto("https://tiprouter.my.id" + path, wait_until="networkidle", timeout=45000)
            page.wait_for_timeout(1200)
            url = page.url
            page.screenshot(path=f"{OUT}/{name}.png", full_page=(name != "live-desk-dashboard-anon"))
            print(f"{name}: ok url={url}" + (f" errors={errs[:2]}" if errs else ""))
        except Exception as e:
            print(f"{name}: FAIL {str(e)[:160]}")
        ctx.close()
    browser.close()
