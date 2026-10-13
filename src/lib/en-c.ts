export const EN_C: Record<string, string> = {
  // Beli — order errors
  "Emailnya belum bener.": "That email doesn't look right.",
  "Pilih paket dulu.": "Pick a plan first.",
  "Pembayaran lagi belum aktif, coba sebentar lagi.": "Payments aren't active yet, please try again shortly.",
  "QRIS gagal dibuat, coba lagi.": "Couldn't create the QRIS, please try again.",
  "Lagi ramai, coba lagi sebentar.": "It's busy right now, please try again in a moment.",
  "Terlalu banyak percobaan, tunggu beberapa menit.": "Too many attempts, please wait a few minutes.",
  "Gagal bikin order, coba lagi.": "Couldn't create the order, please try again.",
  "Jaringan bermasalah, coba lagi.": "Network problem, please try again.",
  // Beli — payment status / flow
  "Menunggu pembayaran…": "Waiting for payment…",
  "Pembayaran diterima, key lagi dibuat…": "Payment received, creating your key…",
  "Pembayaran masuk setelah batas 10 menit. Hubungi admin ya, sebut nominal persisnya biar dibantu.":
    "Your payment arrived after the 10-minute window. Please contact admin and mention the exact amount so we can help.",
  "Order dibatalkan.": "Order cancelled.",
  "Waktu habis. Buat QRIS baru ya.": "Time's up. Please create a new QRIS.",
  "Batalkan pembayaran ini? QRIS-nya langsung nggak berlaku.": "Cancel this payment? The QRIS will stop working right away.",
  "Order dibatalkan. Pilih paket lagi kalau mau lanjut.": "Order cancelled. Pick a plan again if you want to continue.",
  // Beli — email note
  "Kamu lagi login, key nempel ke akun {email}. Nggak usah isi manual.":
    "You're logged in, so the key will be attached to your account {email}. No need to fill it in manually.",
  "Buat label key + bukti order. Kalau kamu lagi login, otomatis keisi dari akun Google/GitHub kamu.":
    "Used as your key label and order receipt. If you're logged in, it's filled in automatically from your Google/GitHub account.",
  // Beli — page copy
  "Beli paket": "Buy a plan",
  "Pilih paket, bayar pakai QRIS (e-wallet / m-banking apa aja), API key langsung keluar di layar begitu pembayaran terdeteksi. Tanpa daftar, tanpa nunggu admin.":
    "Pick a plan, pay with QRIS (any e-wallet / mobile banking), and your API key appears on screen as soon as the payment is detected. No sign-up, no waiting for admin.",
  "1. Pilih paket": "1. Pick a plan",
  "Atur sendiri": "Configure it yourself",
  "RPM, concurrent & hari bebas": "Free RPM, concurrency & days",
  "Paket custom": "Custom plan",
  "Masa aktif (hari)": "Duration (days)",
  "Max concurrent": "Max concurrent",
  "Harga dihitung admin sesuai spek. Klik tombol di bawah, pesananmu terkirim otomatis ke admin via Telegram.": "The admin will price it based on your specs. Tap the button below — your order is sent to the admin automatically via Telegram.",
  "Chat admin & pesan custom": "Chat admin & order custom",
  "{days} hari": "{days} days",
  "Chat dulu": "Chat first",
  "Di luar daftar? Tanya admin": "Not on the list? Ask admin",
  "2. Email kamu": "2. Your email",
  "Harga akhir ditambah kode unik Rp1–500 biar pembayaranmu gampang dicocokin. Bayar persis nominal yang tampil ya.":
    "A unique IDR 1–500 code is added to the final price so your payment is easy to match. Please pay the exact amount shown.",
  "Bikin QRIS…": "Creating QRIS…",
  "Buat QRIS Pembayaran": "Create Payment QRIS",
  "3. Scan & bayar": "3. Scan & pay",
  "Pakai e-wallet / m-banking apa aja. Jangan ubah nominalnya.": "Use any e-wallet / mobile banking. Don't change the amount.",
  "QRIS pembayaran": "Payment QRIS",
  "Sisa waktu": "Time left",
  "Batalkan pembayaran": "Cancel payment",
  "Pembayaran diterima": "Payment received",
  "Ini API key kamu. Simpan baik-baik, jangan dishare ke siapa pun.":
    "Here is your API key. Keep it safe and don't share it with anyone.",
  Tersalin: "Copied",
  "Salin Key": "Copy Key",
  "Masuk pakai key ini": "Log in with this key",
  "Masa aktif key sampai {date}.": "This key is active until {date}.",
  "format OpenAI. Panduan lengkap ada di halaman Panduan setelah masuk.":
    "OpenAI format. The full guide is on the Guide page after you log in.",
  // Package blurbs (from PACKAGES in api.ts, rendered via t(p.blurb))
  "Buat nyobain dulu": "For a first try",
  "Paket santai": "Casual plan",
  "Seminggu penuh": "A full week",
  "Dua minggu": "Two weeks",
  "Paling hemat per hari": "Cheapest per day",
  // Bansos — spin errors
  "IP ini udah pernah dipakai gacha. Satu IP cuma 1x.": "This IP has already been used for the gacha. One IP only gets 1 spin.",
  "Key gagal dibuat, coba lagi sebentar.": "Couldn't create the key, please try again shortly.",
  "Gacha lagi belum aktif, coba sebentar lagi.": "The gacha isn't active yet, please try again shortly.",
  "Sesi habis, login lagi ya.": "Your session expired, please log in again.",
  "Gagal muter gacha, coba lagi.": "Couldn't spin the gacha, please try again.",
  // Bansos — hero
  "Gacha Bansos — 1x putaran gratis per akun": "Bansos Gacha — 1 free spin per account",
  "Putar sekali, dapet": "Spin once and get a",
  "API key pribadi gratis": "free personal API key",
  "unlimited token, semua model buyer, durasinya acak": "unlimited tokens, all buyer models, with a random duration of",
  "1 sampai 24 jam": "1 to 24 hours",
  ". Nggak ada key bersama lagi; key hasil gacha nempel ke akun kamu sendiri.":
    ". There's no shared key anymore; your gacha key is tied to your own account.",
  // Bansos — machine
  "Mesin Gacha": "Gacha Machine",
  "Enam tingkat hadiah, peluangnya terbuka apa adanya:": "Six prize tiers, with the odds shown openly:",
  "jam · jackpot": "hours · jackpot",
  jam: "hours",
  "peluang {p}": "{p} chance",
  "Ngecek sesi kamu…": "Checking your session…",
  "Masuk buat Muter Gacha": "Log In to Spin the Gacha",
  "Login pakai Google, GitHub, atau API key yang udah kamu punya. Gratis, tanpa bayar, tanpa daftar ribet.":
    "Log in with Google, GitHub, or an API key you already have. Free, no payment, no complicated sign-up.",
  "Lagi muter…": "Spinning…",
  "Ngecek jatah…": "Checking your spin…",
  "Putar Gacha": "Spin the Gacha",
  "IP ini udah pernah dipakai gacha. Satu IP cuma boleh 1x, biar nggak diternak bot.":
    "This IP has already been used for the gacha. One IP only gets 1 spin, so bots can't farm it.",
  "Sekali seumur akun. Hasilnya ditentukan server, bukan keberuntungan browser.":
    "Once per account, forever. The result is decided by the server, not your browser's luck.",
  // Bansos — result card
  "JACKPOT! Key gacha kamu ({hours} jam)": "JACKPOT! Your gacha key ({hours} hours)",
  "Key gacha kamu ({hours} jam)": "Your gacha key ({hours} hours)",
  Habis: "Expired",
  Aktif: "Active",
  "Lihat di API Keys": "View in API Keys",
  "Sisa masa aktif": "Time remaining",
  "Berlaku sampai {date}.": "Valid until {date}.",
  "format OpenAI. Key berhenti sendiri pas sisa waktunya habis.":
    "OpenAI format. The key stops on its own when its time runs out.",
  // Bansos — how to play
  "Cara Main": "How to Play",
  "Masuk dulu": "Log in first",
  "— pakai Google, GitHub, atau API key TipRouter yang udah kamu punya.":
    "— use Google, GitHub, or a TipRouter API key you already have.",
  "Putar gacha": "Spin the gacha",
  "— satu kali putaran, server yang nentuin dapet berapa jam (1–24 jam).":
    "— one spin, and the server decides how many hours you get (1–24 hours).",
  "Colok key-nya": "Plug in your key",
  "— base URL": "— base URL",
  ", isi key hasil gacha, pilih model apa aja.": ", enter your gacha key, and pick any model.",
  // Bansos — rules
  "Aturan Main": "The Rules",
  "Tiap akun cuma bisa gacha": "Each account can only spin the gacha",
  "— tercatat per akun": "— recorded per account",
  dan: "and",
  "per IP di server, nggak bisa diakalin refresh.": "per IP on the server, so refreshing won't trick it.",
  "Key gacha itu": "A gacha key is a",
  "key pribadi": "personal key",
  ": unlimited token, semua model paket berbayar, mati sendiri pas durasinya habis.":
    ": unlimited tokens, all paid-plan models, and it stops on its own when the duration ends.",
  "Batas pemakaian key gacha:": "Gacha key usage limits:",
  "koneksi bersamaan": "concurrent connection",
  " — demi kenyamanan seluruh pengguna.": " — to keep the service smooth for everyone.",
  "Hasil putaran final — durasi yang keluar nggak bisa ditukar atau diulang.":
    "Spin results are final — the duration you get can't be exchanged or re-rolled.",
  "Habis masa gacha dan mau lanjut tanpa putus?": "Gacha time over and want to keep going without a break?",
  "Paket TipRouter": "TipRouter plans",
  "mulai Rp3.000, key langsung aktif.": "from IDR 3,000, with your key active instantly.",
  // Bansos — footer
  "Gacha Bansos adalah program gratis dari": "Bansos Gacha is a free program from",
  "— satu putaran, satu key.": "— one spin, one key.",
  "Peluang tiap tingkat tampil apa adanya; hasil ditentukan server secara acak.":
    "Every tier's odds are shown openly; results are decided randomly by the server.",
};
