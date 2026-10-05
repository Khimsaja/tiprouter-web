#!/usr/bin/env python3
"""Extra state checks: light theme, open burger menu, gacha spin result."""
import sys
sys.path.insert(0, "/home/hatch/workspace/tiprouter-web/harness")
from shots import make_handler, BASE, OUT
from playwright.sync_api import sync_playwright

CHROME = "/opt/meta-chromium/chrome"

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--disable-gpu"])

    # 1) light theme landing (desktop + mobile)
    for name, (w, h) in [("desk-landing-light", (1440, 900)), ("mob-landing-light", (390, 844))]:
        ctx = browser.new_context(viewport={"width": w, "height": h})
        ctx.add_init_script("try{localStorage.setItem('tiprouter-theme','light')}catch(e){}")
        page = ctx.new_page()
        page.route("**/*", make_handler({}))
        page.goto(BASE + "/", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.screenshot(path=f"{OUT}/{name}.png")
        print(name, "ok")
        ctx.close()

    # 2) mobile burger menu open
    ctx = browser.new_context(viewport={"width": 390, "height": 844})
    page = ctx.new_page()
    page.route("**/*", make_handler({}))
    page.goto(BASE + "/", wait_until="networkidle")
    page.wait_for_timeout(800)
    page.click(".burger")
    page.wait_for_timeout(500)
    page.screenshot(path=f"{OUT}/mob-menu-open.png")
    print("mob-menu-open ok")
    ctx.close()

    # 3) gacha spin -> result card
    ctx = browser.new_context(viewport={"width": 1440, "height": 900})
    page = ctx.new_page()
    page.route("**/*", make_handler({"user": True}))
    page.goto(BASE + "/gacha", wait_until="networkidle")
    page.wait_for_timeout(1200)
    page.click("text=Putar Gacha")
    page.wait_for_timeout(5500)  # spin animation ~ decelerating highlight
    page.screenshot(path=f"{OUT}/desk-gacha-spin.png")
    print("desk-gacha-spin ok")
    ctx.close()

    browser.close()
