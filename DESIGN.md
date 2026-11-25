# TipRouter — DESIGN.md (Glass direction, preview design implemented locally — NOT live)

Status: **v4 — Glass Lab dicabut, katalog model jadi chip kompak (siap
jualan), implemented locally, not deployed.** The landing in the working
tree of `~/workspace/tiprouter-web` (uncommitted, no deploy) now
reproduces the `tiprouter-glass-preview` artifact **from its exported
HTML file** (`~/workspace/your_files/tiprouter-glass-preview/
tiprouter-glass-preview.html`, 1039 lines), which the user chose as the
final landing on 2026-11-24 ~20:26 WIB ("landing pake ini bro jangan
pakai yang lama"). v1/v2 were translated from a section list and the
user rejected both ("cuman ubah warna bukan ui dan ux", "grid ui ux
nya preview lebih bagus"); v3 was rebuilt grid-for-grid from the file
itself. **v4 (2026-11-25 ~00:02 WIB):** user asked "itu kan masih
preview — gimana kalo bikin siap jualan" + "panel setting buat apa
an? kenapa ada gituan" → Glass Lab removed entirely, model catalog
simplified to small chips. Prod at tiprouter.my.id still runs the flat
TokenMix design.

## Direction: "Sky Glass" (user-approved 2026-11-24)

Light blue clean base + white, teal as the third colour. Dark/light mode
both exist; light is the default for new visitors (stored theme
preference `tiprouter-theme` is respected).

Tokens — verbatim from the preview file (`:root` / `:root[data-theme="dark"]`),
scoped under `.ld` in `src/pages/Landing.tsx` so other pages don't change:

- **Light:** bg `#e3f0fc`, bg-2 `#f2f8ff`, ink `#0a2547`, ink-2 `#3d5c7d`,
  ink-3 `#6e8cae`, accent `#0b74ce` (accent-ink `#ffffff`),
  accent-soft `rgba(11,116,206,.12)`, amber `#b97a0e`,
  code-bg `rgba(7,29,54,.95)`, blobs `#6db9f2` / `#3ec6b8` / `#4a97e3` /
  `#a9dcf7`, nav-bg `rgba(255,255,255,.55)`, chip `rgba(255,255,255,.5)`.
- **Dark:** bg `#050f1e`, bg-2 `#081a30`, ink `#edf5ff`, ink-2 `#a9c3de`,
  ink-3 `#6f8cae`, accent `#56b0f7` (accent-ink `#04182e`),
  accent-soft `rgba(86,176,247,.15)`, amber `#f5bc52`,
  code-bg `rgba(3,12,24,.94)`, blobs `#0d5da8` / `#0b7a6e` / `#155a94` /
  `#0a3a5f`, nav-bg `rgba(8,24,44,.55)`, chip `rgba(255,255,255,.07)`.
- **Glass recipe (preview defaults — NOT the old 2px/20%/100%):**
  blur **18px**, transparansi **55%** (`--glass-alpha:.55`), saturasi
  **150%**. `--radius:22px`. Glass: `background:var(--glass)` +
  `backdrop-filter:blur(var(--blur)) saturate(var(--sat))` + border
  `var(--stroke)` + shadow + `inset 0 1px 0 rgba(255,255,255,.35)`.
  Glass-soft: `var(--glass-soft)` + `blur(calc(var(--blur)*.7))`.
- **Fonts:** Plus Jakarta Sans (UI) + JetBrains Mono (model IDs, keys,
  code). Loaded via Google Fonts `<link>` in `index.html`; applied
  ONLY inside the `.ld` scope so other pages keep the system stack.
- **Layout:** wrap `max-width:1180px`, padding `0 20px`; section
  `padding:58px 0 8px`; sec-head `max-width:640px`; kicker `12px/800/
  .14em/uppercase/accent`; h2 `clamp(27px,3.6vw,38px)` ls `-.03em`;
  h1 `clamp(38px,5.4vw,62px)` lh `1.04` ls `-.035em`; buttons pill
  `999px`.
- **Living background:** `.wallpaper` (160deg gradient bg→bg-2) + 4
  `.blob` (blur 70px, drift 26/32/38s, opacity .45–.75) +
  `.grid-overlay` (56px grid, radial mask fading upward). Fixed,
  `prefers-reduced-motion` respected. The site's `body::before`
  aurora is hidden while the landing is mounted
  (`body:has(.ld)::before{display:none}`).

## Landing sections (top to bottom, per preview file)

1. **Nav pill** (sticky top 12px, max-width 1180px, radius 999px,
   glass): brand mark (accent square, terminal `>_` SVG) + links
   Model / Cara Kerja / Harga / FAQ (only these 4) + theme icon-btn
   + "Masuk" ghost + "Beli Key" primary sm. Burger ≤680px (dropdown).
   The landing renders its own nav + footer — it does NOT use
   `PublicLayout`/chrome (`SiteHeader`/`SiteFooter`); other pages
   are untouched.
2. **Hero**: pill "GATEWAY API — 1 KEY, SEMUA MODEL"; H1 "Satu API
   key. / Semua model AI. / Tanpa ribet." (last line accent); sub;
   CTAs "Lihat Paket — mulai Rp3.000" + "Coba Lihat Kodenya";
   hero-meta as 4 big numbers (33+ / 1 / QRIS / 24/7) + small
   labels — NOT pills. Right: `.stack` with floating card
   "Routing / Fallback otomatis" (rotate 2deg) overlapping the main
   card: traffic dots, "dashboard — api key kamu", key-row
   `tip_••••••••••••••••••••4f2a` + Salin, req-list (deepseek-v4.1-flash
   200 OK, glm-5.3-flash 200 OK, hungerg "Dialihkan"). Desktop: main
   card `margin-top:118px`. Below: marquee of 10 model names ×2
   (scrollx 36s, edge mask).
3. **Glass Lab — DICABUT di v4 (2026-11-25, perintah user).** The
   section was a preview toy ("panel setting buat apa an? kenapa ada
   gituan") — sliders for blur/transparency/saturation + accent
   swatches have no place on a sales page. Removed: the whole
   `<section id="glass-lab">`, the `blur`/`alpha`/`sat`/`accent`
   state + both effects, `ACCENTS`/`SWATCHES`, and all Glass Lab
   CSS (`.lab` grid, `.lab-controls`, `.ctl`, `.swatches`,
   `.swatch`, `.lab-stage`, `.demo`, `.orb*`). The glass LOOK is
   unchanged: `--blur:18px`, `--glass-alpha:.55`, `--sat:150%`
   remain as fixed defaults in `.ld` — the panels just can't be
   re-tuned anymore. (The hero floating card's small "Routing"
   label still uses class `lab` with its own `.card-float .lab`
   rule — that one stays.)
4. **Katalog Model (v4: chip kompak)**: NO search, NO family
   filter chips, NO 3-col cards with descs/tags. One flex wrap of
   small pills (`.model-chip`): mono 12.5px model name only,
   `padding:6px 12px`, gap 8px. Data still LIVE from `GET
   /api/template-models` (33 models; fallback list hardcoded).
   Click a chip = select it for the playground (scrolls to #kode);
   the selected chip gets an accent fill (`aria-pressed`). Count
   line below: "{N} model di template utama." The preview's 12
   model descs + tags (`MODEL_DESCS`/`MODEL_TAGS`/`NEUTRAL_DESC`)
   and the search/filter machinery (`modelQuery`/`familyFilter`/
   `filteredModels`/`familyOf`/`FILTERS`/`SEARCH_SVG`) are all
   deleted — a sales page shows the names, the playground shows
   the code.
5. **Cara Kerja**: `.steps` grid 3 cols, numbered glass cards,
   copy verbatim from the file (Masuk & pilih paket / Bayar pakai
   QRIS / Panggil API-nya).
6. **Playground kode**: grid `.9fr 1.1fr`. Left: 3 pick-btns
   (deepseek-v4.1-flash-1017, glm-5.3-flash-1017, hungerg) + descs.
   Right: dark code card (traffic dots, "terminal — curl", "Salin
   kode") + curl with syntax highlight (`.k`/`.s`/`.c`). Follows
   the selected model (from pick-btns or catalog clicks).
7. **Harga**: grid 3 cols, 6 cards (Trial/Basic/Plus/Essential/Pro
   hot/Custom) with copy verbatim from the file. Pro: hot-badge
   "Paling Laris" (top -13px), accent border + ring. NO per-day
   prices, NO "Paling hemat" badge. Price-note below (referral
   footnote + Gacha link).
8. **Referral**: glass panel, grid `1.2fr .8fr` — left: kicker + h3
   "Ajak teman, dua-duanya nambah hari" + mono link
   `tiprouter.my.id/?ref=KODE`; right: 3 milestone rows (5 +3,
   15 +7, 30 +30 hari). NOT a per-package bonus table.
9. **Rekomendasi**: grid 2 cols, 4 items with mono chips 01–04 +
   copy verbatim from the file — EXCEPT item 03, whose body
   mentioned the Glass Lab ("Glass Lab di atas ngebuktiin sistemnya
   bisa diatur"); rewritten in v4 without it ("brand terasa utuh di
   semua halaman, bukan tempelan per halaman").
10. **FAQ**: max-width 820px, `details`/`summary` glass + rotating
    chevron, 4 questions verbatim from the file (the "Desain glass
    ini udah live belum?" question is REMOVED — its answer would be
    wrong on the live site). Glass CTA INSIDE the FAQ section:
    "Siap nyobain gateway-nya?" + Beli Key Sekarang / Baca Panduan.
    NO separate dark final CTA.
11. **Footer**: brand + fine print left; nav right (Beli, Gacha,
    Syarat, Panduan, Riwayat, Notifikasi). No Statistik link.
12. **Toast**: fixed bottom-center "Tersalin ke clipboard" (2200ms),
    used by both copy buttons.

## What was deliberately removed (user orders / not in the preview)

- **Glass Lab (v4, 2026-11-25):** the whole settings panel —
  blur/transparency/saturation sliders + accent swatches — removed
  on user order ("panel setting buat apa an? kenapa ada gituan").
  It was a preview toy, not a sales feature. Glass tokens stay
  fixed at the preview defaults (18px / 55% / 150%).
- **Model catalog cards (v4, 2026-11-25):** the 33 big cards with
  descs/tags + search + family filters replaced by small name-only
  chips — a sales page lists the models, it doesn't catalogue them.

- **Live stats on the landing:** no `StatsCard`, no "Current
  Availability", no request/token/success-rate numbers anywhere.
  The `/statistics` and `/status` pages still exist and still fetch
  live data; they are not linked from the landing.
- **Preview-only ribbon** ("PREVIEW REDESIGN — belum live") — was
  only in the preview file, not reproduced.
- **Telegram strip, mobile bottom CTA bar, Bansos section on the
  landing, comparison table** — none of these are in the preview;
  all were removed (v2 had the strip + mobile bar; v1 had the
  table + bansos block). `/gacha` still works via nav/footer links
  and the price-note.
- **Promo strip + referral bar** — v2 inventions, not in the
  preview; removed in v3. (Promo codes still work on `/buy`.)
- **Old hero** (badges-as-pills, DashMock rows API KEY/BASE
  URL/MODEL/STATUS) — replaced by the preview's hero-meta +
  traffic/req-list mock.

## Adaptations vs the preview file (file wins unless listed here)

1. **Glass Lab lead** — MOOT in v4: the whole Glass Lab section
   was removed (see above), so its lead sentence is gone too.
   (v3 note, kept for history: file: "Ini alasan konsep ini
   dibuat sebagai preview: geser-geser dulu sampai nemu rasa glass
   yang pas, baru diputuskan buat live. ..." → live: "Geser-geser
   dulu sampai nemu rasa glass yang pas. Semua panel di halaman ini
   ngikutin pengaturan di bawah.")
2. **Pricing lead** — file ends "...ditampilkan apa adanya di konsep
   baru." → live ends "...ditampilkan apa adanya." (same reason).
3. **Rekomendasi lead** — file: "...perubahan alur yang diusulkan
   barengan sama visual glass-nya:" → live: "...perubahan alur yang
   kami terapkan barengan sama visual glass-nya:" (same reason).
4. **FAQ** — the 5th question "Desain glass ini udah live belum?"
   is removed (its answer "Belum... preview" would be wrong live).
5. **Model count line** — v4: "{N} model di template utama."
   (v3: "Menampilkan X dari 33 model di template utama."; file:
   "Menampilkan X dari 12 model contoh — katalog lengkap (33+) ada
   di dashboard setelah login.")
6. **Model descs/tags for `glm-5-3-flash`** — the file's entries are
   keyed `glm-5.3-flash` (dots); the live template id is
   `glm-5-3-flash` (dashes). Same model — desc + "Vision ✓" tag
   aliased to the live id.
7. **Catalog chip click → playground** — v4: chips (not cards)
   are clickable; clicking selects the model for the playground
   and scrolls to #kode. Selected chip gets an accent fill
   (`.model-chip[aria-pressed="true"]`). (v3: same behaviour on
   cards with an accent outline `.model-card.sel`.)
8. **Links** — preview's absolute `https://tiprouter.my.id/...`
   URLs are SPA `Link`s to the same routes (`/buy`, `/login`,
   `/gacha`, `/terms`, `/dashboard/guide`, `/dashboard/history`,
   `/notifications`); in-page anchors (`#model`, `#harga`, ...) are
   plain `<a>`. Legacy hashes `#pricing` → `#harga`,
   `#cara-pakai` → `#cara-kerja` on mount.
9. **Theme** — preview toggles `data-theme` directly; the landing
   uses the site's mechanism (localStorage `tiprouter-theme`,
   default light, same as `ThemeToggle` in chrome.tsx).
10. **Glass vars fixed in `.ld`** — v4: `--blur`/`--glass-alpha`/
    `--sat` are fixed defaults in the `.ld` token block (18px /
    55% / 150%); nothing sets them at runtime anymore. (v3:
    sliders/swatches set vars on the landing wrapper and the accent
    override `<style>` was scoped to `.ld`, so other pages were
    unaffected. The preview sets them on `:root` globally.)
11. **Copy is Indonesian-only** — the landing hardcodes the file's
    Indonesian copy (no `t()` calls). English visitors see
    Indonesian (same fallback as before); i18n harvest is a
    separate task, not this one.
12. **No session-aware nav** — the preview nav always shows
    "Masuk" (no Dashboard link for logged-in users), reproduced
    as-is.
13. **`overflow-x:hidden` not applied to `.ld`** — the preview sets
    it on `body`; on a div wrapper it would break the sticky nav.
    The fixed blobs don't expand the page's scroll area, so nothing
    is lost.
14. **`scroll-margin-top:90px` on sections** — not in the file;
    added so anchor jumps don't hide section heads under the
    sticky pill nav.

## Changes implemented locally (2026-11-25, v4 — siap jualan)

Files: `src/pages/Landing.tsx` only (1013 → 796 lines, −217).
`index.html`, `src/components/chrome.tsx`, `src/index.css` NOT touched.
NOT committed, NOT deployed to prod.

- **Glass Lab dicabut total** (perintah user 2026-11-25 00:02 WIB):
  section JSX, state `blur`/`alpha`/`sat`/`accent` + 2 effect,
  `ACCENTS`/`SWATCHES`, seluruh CSS Glass Lab. Tampilan kaca
  TIDAK berubah — token tetap 18px/55%/150% sebagai default tetap.
- **Katalog jadi chip kompak**: search + filter chip keluarga +
  33 kartu besar berdeskripsi diganti satu wrap `.model-chips`
  berisi pill mono kecil (nama model saja, 12.5px, `6px 12px`).
  Dihapus: `MODEL_DESCS`/`MODEL_TAGS`/`NEUTRAL_DESC`,
  `modelQuery`/`familyFilter`/`filteredModels`/`familyOf`/
  `FILTERS`/`SEARCH_SVG`, CSS `.model-tools`/`.search`/`.f-chip`/
  `.model-grid`/`.model-card`/`.tag`/`.model-empty`, dan
  `useMemo` dari import. Dipertahankan: fetch
  `/api/template-models` + `FALLBACK_MODELS` + `modelIds` +
  `selectedModel` + `selectModel` (klik chip → playground +
  scroll #kode) + `PICK_MODELS`. Copy section: "Satu key buat
  semua model di bawah — klik nama modelnya buat lihat contoh
  kode." + "{N} model di template utama."
- **Rekomendasi item 03** ditulis ulang tanpa menyebut Glass Lab.
- Yang TIDAK berubah: hero + mock req-list + kartu melayang,
  marquee, Cara Kerja, playground #kode, Harga, Referral, FAQ,
  Rekomendasi (selain kalimat 03), CTA kaca, footer, nav pill,
  font, living background, tema terang/gelap, `showToast` (tombol
  salin). Label kecil "Routing" di kartu melayang hero masih
  pakai class `lab` (aturan `.card-float .lab` dipertahankan).

## Verification (v4, 2026-11-25 ~00:10 WIB)

- `bun run build` passes (tsc + vite; pre-existing 500 kB
  chunk-size warning only). New bundle: `index-CfT6LBHY.js`
  (551,480 bytes — turun ~9,4 KB dari v3 560,869 B),
  `index-D-gaz_jR.css` (26,700 bytes).
- Grep verification: no remaining references to `glass-lab`,
  `ACCENTS`/`SWATCHES`/`FILTERS`/`familyOf`/`MODEL_DESCS`/
  `MODEL_TAGS`/`NEUTRAL_DESC`/`modelQuery`/`familyFilter`/
  `filteredModels`/`useMemo`/`SEARCH_SVG`/`model-grid`/
  `model-card`/`model-tools`/`f-chip`/`lab-controls`/
  `lab-stage`/`swatch`/`.orb`/`model-empty` (only the
  intentional header comment + fixed `--blur`/`--glass-alpha`/
  `--sat`/`--accent` tokens remain).
- NOT yet served on the Linode test host / re-screenshotted —
  the running test dist (`/root/glass-light`, `:8901`) is still
  the v3 build; redeploy dist + restart + screenshot on user
  order (tunnel pinggy gratis mati ~60 mnt, URL baru tiap
  restart).

## Changes implemented locally (2026-11-24, v3)

Files: `src/pages/Landing.tsx` (full rewrite from the preview file),
`index.html` (Google Fonts links for Plus Jakarta Sans + JetBrains
Mono — used only inside `.ld`). `src/components/chrome.tsx` and
`src/index.css` NOT touched in v3 (the landing no longer uses
`PublicLayout`; its glass tokens live in the component's `<style>`).

## Verification (v3 rebuild, 2026-11-24 ~21:20 WIB)

- `bun run build` passes (tsc + vite, ~18s; pre-existing 550 kB
  chunk-size warning only). New bundle: `index-0ME8xEB7.js`
  (560,869 bytes), `index-Dohd2DcE.css` (27,872 bytes).
- Served on the Linode test host from `/root/glass-light` (:8901,
  light) and `/root/glass-dark` (:8902, dark default via sed on the
  theme init line). Both 200; `/api/template-models` proxy returns
  the live 33-model list.
- Screenshots (Chrome headless on Linode): `~/workspace/glass-shots/`
  — `desk-light-v3.png`, `desk-dark-v3.png` (1440×7500),
  `mob-light-v3.png` (390×11000), `mob-dark-v3.png` (390×11000),
  `mob-dark-tall-v3.png` (390×16000, full page incl. footer).
  Checked by eye: living background (blobs + grid), nav pill
  (4 links, theme btn, Masuk, Beli Key), hero (H1 + meta numbers +
  floating Routing card overlapping the req-list mock), marquee,
  Glass Lab (18px/55%/150%, 4 swatches, orbs + demo card), catalog
  (search + 5 filter chips, 33 cards in 3 cols with descs + tags
  Populer/Vision ✓/Event, count line), Cara Kerja (3 steps),
  playground (3 pick-btns + dark curl with highlight), pricing
  (6 cards, Pro "Paling Laris", no per-day prices, price-note),
  referral panel (milestones), Rekomendasi (01–04), FAQ (4 items +
  glass CTA), footer (6 links, no Statistik). No ribbon, no
  Telegram strip, no mobile CTA bar, no bansos block, no live
  stats; no mobile overflow (code block scrolls horizontally, as
  in the file). Dark mode verified on desktop + full mobile page.
- Public test URL: the old pinggy tunnel DIED ~21:20 WIB ("Connection
  to a.pinggy.io closed by remote host" — free tier, 60-min expiry).
  Restarted from Linode; the URL CHANGED. New URLs (both serve the
  same tunnel; verified from Linode — NOT from the sandbox, whose
  egress truncates big files):
  `https://ygmue-172-104-51-248.run.pinggy-free.link/` and
  `https://wskeq-172-104-51-248.free.pinggy.net/`
  — landing 200, JS 560,869 B byte-identical to dist,
  `/api/template-models` returns the live 33-model list. NOTE: free
  tunnels expire after ~60 minutes — the link will die again and
  need a restart (new URL each time). Old URL
  `https://cydzs-2400-8901--2000-3aff-fe90-8d7.run.pinggy-free.link/`
  is DEAD.

### Earlier passes (kept for history)

- **v1 (2026-11-24 ~20:43):** first translation from the section
  list; bundle `index-DWMclHYx.js` (555,626 B). User verdict:
  "cuman ubah warna bukan ui dan ux".
- **v2 (2026-11-24 ~20:54):** removed the old skeleton (3 steps +
  API config, compare table, bansos block); bundle
  `index-CqYlPhBL.js` (542,932 B). User verdict: "gak ada yang
  berubah grid ui ux nya preview lebih bagus ... kenapa lo masih
  make yang lama sih" — the grid/layout still came from the old
  landing because neither pass had the preview's actual file.
- **v3 (2026-11-24 ~21:20):** rebuilt from the exported preview
  HTML file (see above).

## Anti-slop audit of the landing (2026-11-24)

What is good (kept from the preview):

- Flat, honest design: no fake gradient, no invented stats — the
  landing shows NO traffic numbers at all (user order); the model
  list is live, prices are real.
- No emoji anywhere; inline SVG icons from the preview file only.
- Pricing is 6 real cards (Trial→Pro + Custom), not the default
  3-column template; Pro is highlighted with a real reason
  ("Paling Laris", cheapest per day ±Rp1.667).
- The curl block is a REAL working example — keep it, it is evidence,
  not costume. The dashboard mock shows an obviously masked example
  key (`tip_••••••••••••••••••••4f2a`), so it cannot be mistaken for
  real data.

What is deliberately NOT done (slop traps):

- No blue-purple gradient, no glow on every card, no glass on every
  surface, no sparkle/magic icons, no "Trusted by" logo bar (no
  verifiable logos), no fake terminal, no invented numbers.
- No live-stats section: the preview artifact had its live stats
  removed on user order, and the real landing follows it.

## Copy

Keep the preview file's Indonesian copy verbatim (headline "Satu API
key. Semua model AI. Tanpa ribet.", prices Trial Rp3.000 → Pro
Rp50.000, FAQ). Only the three lead-sentence adaptations listed
above (they would be factually wrong on the live site otherwise).
No new hype lines.

Known gap: the landing is Indonesian-only (see adaptation 11).
Run the i18n harvest before shipping EN.

## Rollout (NOT done yet — needs user order)

1. Deploy the working tree to a test host first; verify live.
   (Done for this pass: Linode test server + public tunnel URLs above.)
2. Prod deploy only on explicit user order (build → deploy to
   `/var/www/tiprouter-spa` with the usual chown www-data + curl check).
