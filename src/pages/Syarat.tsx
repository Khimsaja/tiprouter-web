import { PublicLayout } from "../components/chrome";
import { useLang } from "../lib/i18n";

const SECTIONS: { title: string; points: string[]; cta?: { href: string; label: string }; after?: string[] }[] = [
  {
    title: "1. Layanan yang kami sediakan",
    points: [
      "TipRouter menyediakan API key dengan skema unlimited selama masa aktif — tanpa batas jumlah token. Kamu membayar masa aktifnya, bukan per token.",
      "Endpoint kami kompatibel dengan format OpenAI, jadi aplikasi yang mendukung OpenAI API bisa langsung disambungkan.",
    ],
  },
  {
    title: "2. Ketersediaan model — mohon pengertiannya",
    points: [
      "Yang kami jamin adalah akses unlimited ke layanan TipRouter, bukan jaminan bahwa setiap model selalu aktif dan lancar setiap saat.",
      "Model-model dijalankan oleh provider upstream (pihak ketiga). Sewaktu-waktu model bisa lambat, maintenance, dibatasi, berubah nama, atau dihentikan oleh provider-nya — itu di luar kendali kami.",
      "Kalau ada model yang bermasalah, kami usahakan bereskan atau alihkan secepatnya. Tapi keterlambatan atau gangguan dari sisi upstream bukan tanggung jawab TipRouter dan tidak otomatis menjadi dasar pengembalian dana.",
    ],
  },
  {
    title: "3. Perubahan daftar model",
    points: [
      "Daftar model bisa berubah mengikuti ketersediaan upstream: model bisa ditambah, diganti, atau ditarik.",
      "Perubahan daftar model tidak mengubah masa aktif key kamu dan tidak mengurangi hak unlimited selama key aktif.",
    ],
  },
  {
    title: "4. Fair use",
    points: [
      "Batas wajar pemakaian: 150 request per menit dan maksimum 4 request berjalan barengan per key.",
      "Pemakaian yang mengganggu pengguna lain (spam request, pola abnormal) bisa kami batasi sementara demi kenyamanan bersama.",
    ],
  },
  {
    title: "5. Larangan",
    points: [
      "Key bersifat pribadi untuk kamu dan tim kecilmu. Dilarang membagikan key ke publik, menjual ulang tanpa izin tertulis, atau memakai key untuk aktivitas melanggar hukum.",
      "Dilarang mengakali sistem — misalnya farming gacha dengan banyak akun/IP, mencoba membobol, atau mengganggu layanan.",
      "Pelanggaran bisa berakibat key dibatasi atau dicabut tanpa kewajiban pengembalian dana.",
    ],
  },
  {
    title: "6. Pembayaran dan aktivasi",
    points: [
      "Pembayaran lewat QRIS di halaman Beli. Key terbit otomatis begitu pembayaran terdeteksi sistem.",
      "Masa aktif dihitung sejak key terbit. Perhatikan nominal yang tampil (ada kode unik Rp1–500) dan bayar persis nominalnya supaya pembayaranmu cepat cocok.",
      "Kesalahan transfer di luar sistem kami (salah nominal, salah tujuan) bukan tanggung jawab TipRouter.",
    ],
  },
  {
    title: "7. Perpanjangan",
    points: [
      "Perpanjangan memakai key yang sama — konfigurasi di aplikasi kamu tidak perlu diubah. Masa aktif ditambahkan mengikuti sisa waktu yang ada.",
    ],
  },
  {
    title: "8. Pengembalian dana",
    points: [
      "Produk ini digital dan langsung aktif, jadi pembelian yang key-nya sudah terbit dan bisa dipakai tidak dapat dikembalikan.",
      "Kalau key kamu sama sekali tidak bisa dipakai karena kesalahan sistem kami dan tidak bisa kami perbaiki, hubungi admin: kami ganti key baru atau kembalikan dana secara proporsional.",
    ],
  },
  {
    title: "9. Dukungan",
    points: [
      "Butuh bantuan? Chat admin langsung di Telegram:",
    ],
    cta: { href: "https://t.me/hermestele", label: "t.me/hermestele" },
    after: [
      "Kami balas secepatnya pada jam operasional, dengan usaha terbaik (best effort).",
    ],
  },
  {
    title: "10. Perubahan ketentuan",
    points: [
      "Syarat & ketentuan ini bisa diperbarui. Versi yang berlaku adalah versi terbaru di halaman ini, dan pembelian setelah pembaruan dianggap menyetujui versi terbaru.",
    ],
  },
];

export default function Syarat() {
  const { t } = useLang();
  return (
    <PublicLayout>
      <h1 className="page">
        {t("Syarat &")} <em>{t("Ketentuan.")}</em>
      </h1>
      <p className="sub">
        {t("Dengan membeli dan/atau menggunakan API key TipRouter, kamu dianggap sudah membaca dan menyetujui semua poin di bawah ini. Beli = setuju.")}
      </p>
      {SECTIONS.map((s) => (
        <div className="card" key={s.title} style={{ marginTop: 14 }}>
          <h2>{t(s.title)}</h2>
          {s.points.map((p) => (
            <p key={p} style={{ marginTop: 8 }}>
              {t(p)}
            </p>
          ))}
          {s.cta ? (
            <p style={{ marginTop: 8 }}>
              <a href={s.cta.href} target="_blank" rel="noreferrer">
                {s.cta.label}
              </a>
            </p>
          ) : null}
          {(s.after ?? []).map((p) => (
            <p key={p} style={{ marginTop: 8 }}>
              {t(p)}
            </p>
          ))}
        </div>
      ))}
      <div className="card" style={{ marginTop: 14 }}>
        <p style={{ margin: 0 }}>
          {t("Intinya: kami menyediakan akses unlimited yang jujur dan berusaha menjaga layanan tetap enak dipakai. Sisanya, mohon pengertian untuk hal-hal yang memang di luar kendali kami. Makasih sudah jadi pembeli yang pengertian.")}
        </p>
      </div>
    </PublicLayout>
  );
}
