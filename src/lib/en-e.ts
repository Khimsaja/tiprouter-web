// EN dict bagian E — pelengkap audit i18n 2026-10-23: semua key yang masih
// jatuh ke fallback Indonesia saat mode EN aktif.
export const EN_E: Record<string, string> = {
  // main.tsx — halaman 404
  "Halaman nggak ketemu.": "Page not found.",
  "Alamat ini nggak ada di TipRouter. Balik ke": "This address doesn't exist on TipRouter. Back to",
  "beranda": "home",
  "aja.": ".",

  // DashLayout — menu dashboard
  "Buka menu dashboard": "Open dashboard menu",
  "Menu dashboard": "Dashboard menu",
  "Tutup menu": "Close menu",

  // Beli — promo & checkout
  "Cek…": "Checking…",
  "Gagal cek kode promo, coba lagi.": "Failed to check the promo code, try again.",
  "Hemat {disc}": "Save {disc}",
  "Kode promo (opsional)": "Promo code (optional)",
  "Kode {code} dipakai: hemat {disc}.": "Code {code} applied: you save {disc}.",
  "Pilih paket dulu sebelum pakai kode promo.": "Pick a package first before using a promo code.",
  "Request per menit": "Requests per minute",
  "Format kode promo nggak valid.": "Invalid promo code format.",
  "Kode promo nggak ketemu. Cek lagi tulisannya.": "Promo code not found. Check the spelling and try again.",
  "Kode promo ini udah dinonaktifkan.": "This promo code has been deactivated.",
  "Kode promo ini udah kedaluwarsa.": "This promo code has expired.",
  "Kuota kode promo ini udah habis.": "This promo code's quota has run out.",
  "Kode promo ini udah pernah dipakai di akun / jaringan ini.": "This promo code has already been redeemed on this account / network.",
  "cth: HEMAT10": "e.g.: HEMAT10",

  // Bansos — error gacha
  "Gacha cuma buat akun dengan email @gmail.com. Hubungkan akun Google kamu di menu Profil.":
    "The gacha is only for accounts with a @gmail.com email. Connect your Google account in the Profile menu.",

  // BansosDeepseek — key bersama
  "Base URL": "Base URL",
  "DeepSeek": "DeepSeek",
  "Diperbarui tiap 30 detik. Setelah kuota season ini habis, key otomatis berhenti.":
    "Updated every 30 seconds. Once this season's quota runs out, the key stops automatically.",
  "Satu API key bersama untuk semua orang — khusus model deepseek-v-4.1-flash, tanpa batas RPM, budget season ini 2 miliar token (progress kumulatif semua season, tidak direset). Login dulu untuk lihat & salin key-nya. Siapa cepat, dia dapat.":
    "One shared API key for everyone — exclusively for the deepseek-v-4.1-flash model, no RPM limit, this season's budget is 2 billion tokens (cumulative progress across all seasons, never reset). Log in first to view & copy the key. First come, first served.",
  "{budget} token, gratis.": "{budget} tokens, free.",

  // Usage — tabel & export gambar
  "Tanggal": "Date",
  "Waktu": "Time",
  "Key": "Key",
  "Request": "Requests",
  "Token Masuk": "Input Tokens",
  "Token Keluar": "Output Tokens",
  "Total Token": "Total Tokens",
  "Unduh PNG": "Download PNG",
  "Pratinjau Gambar": "Image Preview",
  "Pratinjau export gambar": "Export image preview",
  "File harus gambar.": "The file must be an image.",
  "Gagal membaca file.": "Failed to read the file.",
  "Gagal memuat gambar. Coba file lain.": "Failed to load the image. Try another file.",
  "Gagal mengunduh CSV.": "Failed to download the CSV.",
  "Gagal mengunduh JSON.": "Failed to download the JSON.",

  // Keys
  "Label": "Label",
  "Prefix": "Prefix",

  // Playground
  "API Key": "API Key",
  "Max tokens": "Max tokens",
  "Temperature": "Temperature",
  "Playground": "Playground",
  "Key dari akun gagal diambil otomatis. Tempel manual di kolom API key di atas.":
    "Couldn't fetch a key from your account automatically. Paste it manually in the API key field above.",
  "Isi API key dulu sebelum ngobrol.": "Enter your API key first before chatting.",

  // Referral
  "Paket": "Plan",
  "Referral": "Referral",
  "3 hari": "3 days",
  "14 hari": "14 days",
  "Cobain TipRouter — API key AI unlimited semua model. Daftar pakai link ini, kita berdua dapat bonus hari tiap pembelian paket:":
    "Try TipRouter — unlimited AI API keys for all models. Sign up with this link and we both get bonus days on every package purchase:",

  // Landing / Statistik / Proxy — label bersama
  "Requests": "Requests",
  "Proxy": "Proxy",
  "# Format OpenAI. Ganti base URL dan key saja.": "# OpenAI format. Just swap the base URL and key.",

  // Bansos — aturan main & placeholder email
  "request/menit": "requests/min",
  "nama@email.com": "name@email.com",

  // Spin500 — roda undian 1–500
  "Roda Undian": "Draw Wheel",
  "Undian": "Draw",
  "Angka keluar": "Drawn number",
  "Angka Tebakan Peserta": "Participant Guesses",
  " angka tebakan peserta": " participant guesses",
  "KENA! Ada yang nebak angka ini": "HIT! Someone guessed this number",
  "Tebakan yang cocok dengan angka undian menyala hijau.": "Guesses that match the drawn number light up green.",
  "Klik PUTAR untuk mengundi": "Click SPIN to draw",
  "Mengundi...": "Drawing...",
  "UNDI SAMPAI 10 KENA": "DRAW UNTIL 10 HITS",
  "Pool undian 1–500 · ": "Draw pool 1–500 · ",
  "Kembali ke Spin Wheel utama": "Back to the main Spin Wheel",
  "Reset": "Reset",


  // Glass redesign (redesign/glass-clean-tech) — new strings
  "Paling Hemat": "Best Value",
  "Online": "Online",
  "Diperbarui otomatis": "Auto-updated",
  "{count} model online • 150 RPM Fair-Use": "{count} models online • 150 RPM Fair-Use",
  "Satu endpoint OpenAI-compatible di tiprouter.my.id/v1 — colok ke coding assistant dan chat UI favoritmu, ganti model cukup dari parameter model.": "One OpenAI-compatible endpoint at tiprouter.my.id/v1 — plug into your favorite coding assistants and chat UIs, switch models with just the model parameter.",
  "Mulai Sekarang — QRIS Instan": "Start Now — Instant QRIS",
  "Coba Bansos Gacha": "Try Bansos Gacha",
  "Coba gratis dulu — Bansos Gacha": "Try it free first — Bansos Gacha",
  "Putar sekali, dapat key trial pribadi 1–24 jam. Gratis, 1x per akun/IP — tanpa kartu kredit.": "Spin once, get a personal 1–24 hour trial key. Free, once per account/IP — no credit card.",
  "Klaim Key Gratis": "Claim a Free Key",
  "Katalog live — model online sekarang": "Live catalog — models online now",
  "Klik model buat lihat contoh kode.": "Click a model to see a code sample.",
  "Lihat semua model": "See all models",
  "Nyambung ke tools favoritmu": "Plugs into your favorite tools",
  "Endpoint OpenAI-compatible — tinggal ganti base URL di Cline, Roo Code, LibreChat, SillyTavern, atau OpenAI SDK.": "OpenAI-compatible endpoint — just swap the base URL in Cline, Roo Code, LibreChat, SillyTavern, or the OpenAI SDK.",
  "Aktivasi Otomatis < 5 Detik": "Automatic Activation < 5 Seconds",
  "Bayar QRIS, pembayaran terdeteksi server-side, key langsung aktif.": "Pay with QRIS, payment is detected server-side, and your key activates instantly.",
  "Paket aktif": "Active plan",
  "Limit rate": "Rate limit",
  "Limit per key (fair use).": "Per-key limit (fair use).",
  "Control center": "Control center",
  "Sambungkan aplikasi kamu ke TipRouter dalam satu klik.": "Connect your app to TipRouter in one click.",
  "Salin konfigurasi": "Copy configuration",
  "Tampilkan key dulu untuk menyalin konfigurasi.": "Show the key first to copy a configuration.",
  "Token per key": "Tokens per key",
  "Model online": "Online models",
  "Request per hari": "Requests per day",
  "maks {n} barengan": "max {n} concurrent",
  "Status API": "API Status",
  "Butuh masa aktif lebih?": "Need more active days?",
  "Perpanjang key kamu dalam hitungan detik via QRIS.": "Extend your key in seconds via QRIS.",
  "Upgrade / Perpanjang": "Upgrade / Extend",

  // Landing v3 — toggle tema, data model & paket, langkah, rekomendasi, FAQ, seksi (audit i18n 2026-11-25).

  // Toggle tema (chrome.tsx + Landing nav)
  "Mode terang": "Light mode",
  "Mode gelap": "Dark mode",

  // MISSING EN yang sudah dipakai t() tapi belum ada di dict
  "Bansos Gacha": "Bansos Gacha",
  "Hijau ≥90% berhasil · kuning 50–90% · merah <50% dalam 1 jam terakhir. Request yang kena rate-limit atau dibatalkan sendiri oleh client tidak dihitung sebagai gagal.": "Green ≥90% success · yellow 50–90% · red <50% over the last hour. Requests that hit rate limits or were cancelled by the client don't count as failures.",

  // Landing — model picker
  "Workhorse harian — cepat & murah buat coding": "Daily workhorse — fast & cheap for coding",
  "Flash dari keluarga GLM — respons gesit": "Flash from the GLM family — snappy responses",
  "Haiku 5.5 dari Claude — ringan & cepat buat coding": "Claude's Haiku 5.5 — light & fast for coding",
  "Model event Qoder — reasoning + konteks besar": "Qoder event model — reasoning + large context",

  // Landing — kartu harga
  "Masa aktif 1 hari": "Active for 1 day",
  "Masa aktif 3 hari": "Active for 3 days",
  "Masa aktif 7 hari": "Active for 7 days",
  "Masa aktif 14 hari": "Active for 14 days",
  "Masa aktif 30 hari": "Active for 30 days",
  "Akses 33+ model": "Access to 33+ models",
  "Cocok buat tes dulu": "Great for trying it out first",
  "QRIS, aktif otomatis": "QRIS, auto-activated",
  "Bonus referral +1 hari*": "Referral bonus +1 day*",
  "Bonus referral +3 hari*": "Referral bonus +3 days*",
  "Bonus referral +4 hari*": "Referral bonus +4 days*",
  "Per hari cuma ±Rp1.667": "Only ±Rp1,667 per day",
  "Hubungi": "Contact us",
  "Durasi & kebutuhan khusus": "Custom duration & needs",
  "Durasi di luar paket reguler": "Durations beyond regular plans",
  "Buat tim / pemakaian berat": "For teams / heavy usage",
  "Pilih Trial": "Choose Trial",
  "Pilih Basic": "Choose Basic",
  "Pilih Plus": "Choose Plus",
  "Pilih Essential": "Choose Essential",
  "Pilih Pro": "Choose Pro",
  "Minta Custom": "Request Custom",

  // Landing — langkah
  "Masuk & pilih paket": "Log in & pick a plan",
  "Login pakai akun Google atau GitHub, lalu pilih paket di halaman": "Log in with Google or GitHub, then pick a plan on the page",
  "dari Trial 1 hari sampai Pro 30 hari.": "from the 1-day Trial to the 30-day Pro.",
  "Bayar pakai QRIS": "Pay with QRIS",
  "Scan QRIS (ada kode unik Rp1–500 buat pencocokan otomatis). Pembayaran terdeteksi server-side — key langsung di-mint walau kamu nutup halamannya.": "Scan the QRIS code (each payment carries a unique Rp1–500 code for automatic matching). Payment is detected server-side — your key is minted instantly even if you close the page.",
  "Panggil API-nya": "Call the API",
  "Arahkan SDK OpenAI kamu ke": "Point your OpenAI SDK to",
  ", pakai key kamu, dan ganti-ganti model cukup dari parameter": ", use your key, and switch models with just the parameter",

  // Landing — rekomendasi (Kenapa Dirombak Begini)
  "Harga naik ke atas": "Price goes up top",
  "Pembeli Indonesia mutusin dari harga dulu. Paket + tombol beli sekarang kelihatan dari hero (\"mulai Rp3.000\"), bukan disembunyiin di bawah fold.": "Indonesian buyers decide from the price first. Plans + the buy button are visible in the hero (\"from Rp3,000\"), not hidden below the fold.",
  "Bukti dulu, klaim belakangan": "Proof first, claims later",
  "Hero langsung nunjukin bentuk dashboard + key + request yang jalan. Pengunjung ngerti produknya dalam 5 detik tanpa baca paragraf panjang.": "The hero shows the dashboard, key, and live requests right away. Visitors get the product in 5 seconds without reading long paragraphs.",
  "Satu material, semua halaman": "One material, every page",
  "Satu sistem kaca (blur, border, shadow yang sama) buat landing, dashboard, dan checkout — brand terasa utuh di semua halaman, bukan tempelan per halaman.": "One glass system (same blur, border, and shadow) for the landing, dashboard, and checkout — the brand feels whole on every page, not pasted on per page.",
  "Kontras dijaga, gerak dikurangi": "Contrast kept, motion reduced",
  "Glass gampang jadi nggak kebaca. Di sini teks utama selalu di atas kaca yang cukup pekat, animasi cuma di latar, dan prefers-reduced-motion dihormati.": "Glass easily becomes unreadable. Here the main text always sits on glass opaque enough, animations stay in the background, and prefers-reduced-motion is respected.",

  // Landing — FAQ
  "Gimana cara pakainya di kode saya?": "How do I use it in my code?",
  "Cukup ganti base URL SDK OpenAI kamu ke": "Just point your OpenAI SDK's base URL to",
  "dan isi API key dari dashboard. Ganti model tinggal ubah parameter": "and fill in the API key from your dashboard. To switch models, just change the parameter",
  "nggak perlu key atau akun baru per provider.": "no new key or account per provider needed.",
  "Pembayarannya gimana?": "How does payment work?",
  "Pakai QRIS di halaman": "Pay with QRIS on the page",
  "Tiap transaksi punya kode unik Rp1–500 buat pencocokan — bayar persis nominal yang tampil. Sistem ngecek pembayaran di sisi server, jadi key tetap terbit walau kamu meninggalkan halaman checkout.": "Every transaction has a unique Rp1–500 code for matching — pay exactly the amount shown. The system verifies payment server-side, so your key is still issued even if you leave the checkout page.",
  "Kalau satu provider lagi down gimana?": "What if one provider goes down?",
  "Model populer di TipRouter dilayani banyak provider di balik satu nama model. Router nyoba provider berikutnya secara otomatis (strategi fallback), jadi request kamu nggak langsung gagal cuma karena satu provider bermasalah.": "Popular models on TipRouter are served by many providers behind a single model name. The router automatically tries the next provider (fallback strategy), so your request doesn't fail just because one provider has issues.",
  "Bisa coba gratis dulu?": "Can I try it for free first?",
  "Bisa lewat dua jalan: paket Trial Rp3.000 buat 1 hari, atau halaman": "Two ways: the Trial plan (Rp3,000 for 1 day), or the page",
  "buat kesempatan key gratis (1 klaim per IP, key gacha tidak bisa diperpanjang).": "for a chance at a free key (1 claim per IP, gacha keys can't be extended).",

  // Landing — seksi, heading, dan lain-lain
  "Sorotan": "Highlights",
  "Program referral": "Referral program",
  "Navigasi utama": "Main navigation",
  "Tautan kaki": "Footer links",
  "Katalog Model": "Model Catalog",
  "Cara Kerja": "How It Works",
  "Buat Developer": "For Developers",
  "Kenapa Dirombak Begini": "Why the Redesign",
  "Rekomendasi UX di balik konsep ini": "The UX thinking behind this concept",
  "Bukan cuma ganti kulit — ini perubahan alur yang kami terapkan barengan sama visual glass-nya:": "More than a new skin — this is a flow change we shipped together with the glass visuals:",
  "Sering ditanyakan": "Frequently asked questions",
  "Siap nyobain gateway-nya?": "Ready to try the gateway?",
  "Mulai dari Trial Rp3.000 — bayar QRIS, key aktif otomatis, langsung bisa manggil 33+ model dari satu endpoint.": "Start with the Rp3,000 Trial — pay with QRIS, your key activates automatically, and you can call 33+ models from one endpoint right away.",
  "Beli Key Sekarang": "Buy a Key Now",
  "Baca Panduan": "Read the Guide",
  "Gateway API multi-model dengan pembayaran QRIS. Satu key, 33+ model, routing fallback otomatis.": "Multi-model API gateway with QRIS payments. One key, 33+ models, automatic fallback routing.",
  "Syarat": "Terms",
  "Satu endpoint, semua model.": "One endpoint, every model.",
  "Pilih bahasa contoh kode": "Choose the code sample language",
  "Ganti base URL dan API key. Format request tetap sama.": "Swap the base URL and API key. The request format stays the same.",
  "Satu key buat semua model di bawah — klik nama modelnya buat lihat contoh kode.": "One key for every model below — click a model name to see its code sample.",
  "{count} model, satu endpoint": "{count} models, one endpoint",
  "{count} model di template utama.": "{count} models in the main template.",
  "Dari daftar sampai manggil model: 3 langkah": "From sign-up to calling a model: 3 steps",
  "Nggak ada nunggu aktivasi manual. Alurnya otomatis dari pembayaran sampai key siap pakai.": "No waiting for manual activation. The flow is automatic, from payment to a ready-to-use key.",
  "Kompatibel OpenAI. Ganti base URL, selesai.": "OpenAI-compatible. Swap the base URL, done.",
  "Pilih model di kiri — contoh kodenya ngikutin. Kode yang udah jalan di OpenAI SDK tinggal pindah endpoint.": "Pick a model on the left — the code sample follows. Code that already runs on the OpenAI SDK just needs the endpoint swapped.",
  "Pilih model untuk contoh kode": "Pick a model for the code sample",
  "Contoh kode curl": "cURL code sample",
  "Harga flat per durasi. Bukan per token.": "Flat pricing per duration. Not per token.",
  "Bayar sekali buat masa aktifnya — semua model di template utama kebuka. Ini harga produksi TipRouter saat ini, ditampilkan apa adanya.": "Pay once for the active period — every model in the main template is unlocked. This is TipRouter's current production pricing, shown as-is.",
  "*Bonus referral dua arah: kamu dan temanmu sama-sama dapat tambahan hari tiap pembelian (Trial tidak termasuk). Ada juga key gratis lewat halaman": "*Two-way referral bonus: you and your friend both get extra days with every purchase (Trial excluded). There's also a free key via the page",
  "Ajak teman, dua-duanya nambah hari": "Invite friends, both of you gain days",
  "kamu. Tiap teman yang beli, kalian berdua dapat bonus masa aktif — plus milestone kalau makin banyak yang ikut.": "with your friends. Every friend who buys earns bonus active days for both of you — plus milestones as more join.",
  "5 referral": "5 referrals",
  "15 referral": "15 referrals",
  "30 referral": "30 referrals",
  "+3 hari": "+3 days",
  "+7 hari": "+7 days",
  "+30 hari": "+30 days",
  "Salin URL": "Copy URL",
  "Salin kode": "Copy code",
  "URL tersalin": "URL copied",
  "Contoh kode tersalin": "Code sample copied",
  "Gagal menyalin — salin manual ya": "Copy failed — please copy it manually",
  "Tersalin ke clipboard": "Copied to clipboard",
};
