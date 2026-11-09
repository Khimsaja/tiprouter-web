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
};
