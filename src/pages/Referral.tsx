import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Copy, Check, Share2, Gift, Trophy, History, Info, ChevronRight } from "lucide-react";
import { PageHead } from "../components/DashLayout";
import { api, fmtDate, type ReferralInfo, type ReferralBoard } from "../lib/api";
import { useLang } from "../lib/i18n";

const BONUS_TIERS = [
  { pkg: "Basic", days: "3 hari", price: "Rp6.000", bonus: 1 },
  { pkg: "Plus", days: "7 hari", price: "Rp10.000", bonus: 1 },
  { pkg: "Essential", days: "14 hari", price: "Rp18.000", bonus: 3 },
  { pkg: "Pro", days: "30 hari", price: "Rp30.000", bonus: 4 },
];
const MILESTONES = [
  { count: 5, bonus: 3 },
  { count: 15, bonus: 7 },
  { count: 30, bonus: 30 },
];

const CSS = `
.rf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px;align-items:start}
@media(max-width:900px){.rf-grid{grid-template-columns:1fr}}
.rf-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:20px}
.rf-card h2{font-size:12.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--faint);margin:0 0 16px;display:flex;align-items:center;gap:8px}
.rf-linkrow{display:flex;gap:8px}
.rf-linkrow input{flex:1;min-width:0;background:var(--bg);border:1px solid var(--line);border-radius:10px;color:var(--txt);padding:11px 13px;font-size:13.5px;font-family:ui-monospace,monospace}
.rf-btn{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--bg);color:var(--txt);border-radius:10px;padding:11px 15px;font-size:13.5px;font-weight:700;cursor:pointer;white-space:nowrap}
.rf-btn:hover{border-color:var(--faint)}
.rf-btn.primary{background:#fff;color:#000;border-color:#fff}
.rf-share{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap}
.rf-share a{text-decoration:none}
.rf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}
@media(max-width:560px){.rf-stats{grid-template-columns:1fr}}
.rf-stat{background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:14px}
.rf-stat .n{font-size:26px;font-weight:800}
.rf-stat .l{font-size:12px;color:var(--mut);margin-top:4px}
.rf-steps{display:flex;flex-direction:column;gap:12px}
.rf-step{display:flex;gap:12px;align-items:flex-start}
.rf-step .num{width:28px;height:28px;border-radius:50%;background:#fff;color:#000;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.rf-step p{margin:2px 0 0;font-size:13.5px;color:var(--mut);line-height:1.55}
.rf-step p b{color:var(--txt)}
.rf-table{width:100%;border-collapse:collapse;font-size:13.5px}
.rf-table th{text-align:left;color:var(--faint);font-size:11.5px;text-transform:uppercase;letter-spacing:.08em;padding:8px 6px;border-bottom:1px solid var(--line)}
.rf-table td{padding:10px 6px;border-bottom:1px solid var(--line)}
.rf-table tr:last-child td{border-bottom:none}
.rf-table .b{font-weight:800;color:var(--green)}
.rf-ms{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.rf-ms:last-child{border-bottom:none}
.rf-ms .bar{flex:1;height:8px;background:var(--bg);border:1px solid var(--line);border-radius:99px;overflow:hidden}
.rf-ms .bar i{display:block;height:100%;background:#fff;border-radius:99px}
.rf-ms.done .bar i{background:var(--green)}
.rf-hist{display:flex;flex-direction:column}
.rf-hrow{display:flex;justify-content:space-between;gap:10px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}
.rf-hrow:last-child{border-bottom:none}
.rf-hrow .m{color:var(--mut);font-size:12px}
.rf-board{display:flex;flex-direction:column}
.rf-brow{display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13.5px}
.rf-brow:last-child{border-bottom:none}
.rf-rank{width:26px;height:26px;border-radius:8px;background:var(--bg);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0}
.rf-brow.top .rf-rank{background:#fff;color:#000;border-color:#fff}
.rf-note{font-size:12.5px;color:var(--mut);line-height:1.6;margin-top:12px}
.rf-empty{color:var(--faint);font-size:13px;padding:12px 0}
`;

function shareLinks(link: string) {
  const text = encodeURIComponent("Cobain TipRouter — API key AI unlimited semua model. Daftar pakai link ini, kita berdua dapat bonus hari tiap pembelian paket:");
  const u = encodeURIComponent(link);
  return {
    wa: `https://wa.me/?text=${text}%20${u}`,
    tg: `https://t.me/share/url?url=${u}&text=${text}`,
    x: `https://x.com/intent/tweet?text=${text}&url=${u}`,
  };
}

export default function Referral() {
  const { t } = useLang();
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [board, setBoard] = useState<ReferralBoard | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let alive = true;
    api.referralMe().then((d) => { if (alive) setInfo(d); }).catch(() => {});
    api.referralBoard().then((d) => { if (alive) setBoard(d); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  function copyLink() {
    const link = info?.link || "";
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(link).then(done).catch(done);
    else done();
  }

  const sh = info ? shareLinks(info.link) : null;
  const nextMs = MILESTONES.find((m) => (info?.successfulPurchases ?? 0) < m.count);

  return (
    <div>
      <style>{CSS}</style>
      <PageHead
        title={t("Referral")}
        sub={t("Undang teman daftar pakai link kamu. Tiap mereka beli paket, kamu dan temanmu sama-sama dapat bonus hari.")}
      />

      <div className="rf-grid">
        <div>
          <div className="rf-card">
            <h2><Share2 size={15} /> {t("Link undangan kamu")}</h2>
            <div className="rf-linkrow">
              <input readOnly value={info?.link || t("Memuat…")} onFocus={(e) => e.target.select()} />
              <button className="rf-btn primary" onClick={copyLink}>
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? t("Tersalin") : t("Salin")}
              </button>
            </div>
            {sh && (
              <div className="rf-share">
                <a className="rf-btn" href={sh.wa} target="_blank" rel="noreferrer">{t("Bagikan via WhatsApp")}</a>
                <a className="rf-btn" href={sh.tg} target="_blank" rel="noreferrer">{t("Bagikan via Telegram")}</a>
                <a className="rf-btn" href={sh.x} target="_blank" rel="noreferrer">{t("Bagikan via X")}</a>
              </div>
            )}
            <div className="rf-stats">
              <div className="rf-stat"><div className="n">{info?.invites ?? "–"}</div><div className="l">{t("Teman bergabung")}</div></div>
              <div className="rf-stat"><div className="n">{info?.successfulPurchases ?? "–"}</div><div className="l">{t("Pembelian berhasil")}</div></div>
              <div className="rf-stat"><div className="n">+{info?.bonusDaysEarned ?? "–"}</div><div className="l">{t("Hari bonus didapat")}</div></div>
            </div>
            {info?.referredBy && (
              <p className="rf-note">{t("Kamu bergabung lewat kode")} <b>{info.referredBy}</b> — {t("pembelian pertamamu juga memberi bonus ke pengundangmu.")}</p>
            )}
          </div>

          <div className="rf-card" style={{ marginTop: 14 }}>
            <h2><Gift size={15} /> {t("Bonus per paket")}</h2>
            <table className="rf-table">
              <thead><tr><th>{t("Paket")}</th><th>{t("Harga")}</th><th>{t("Bonus kamu")}</th><th>{t("Bonus teman")}</th></tr></thead>
              <tbody>
                {BONUS_TIERS.map((r) => (
                  <tr key={r.pkg}>
                    <td><b>{r.pkg}</b> <span style={{ color: "var(--mut)" }}>{r.days}</span></td>
                    <td>{r.price}</td>
                    <td className="b">+{r.bonus} {t("hari")}</td>
                    <td className="b">+{r.bonus} {t("hari")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="rf-note">{t("Paket Trial tidak memberi bonus untuk mencegah penyalahgunaan. Bonus teman otomatis memperpanjang key yang baru dibeli; bonus kamu otomatis memperpanjang key aktifmu (atau dibuatkan key bonus baru kalau kamu belum punya).")}</p>
          </div>

          <div className="rf-card" style={{ marginTop: 14 }}>
            <h2><Trophy size={15} /> {t("Milestone pengundang")}</h2>
            {MILESTONES.map((m) => {
              const got = (info?.successfulPurchases ?? 0) >= m.count;
              const pct = Math.min(100, Math.round(((info?.successfulPurchases ?? 0) / m.count) * 100));
              return (
                <div key={m.count} className={"rf-ms" + (got ? " done" : "")}>
                  <b style={{ minWidth: 88 }}>{m.count} {t("teman")}</b>
                  <div className="bar"><i style={{ width: pct + "%" }} /></div>
                  <span className="b" style={{ color: got ? "var(--green)" : "var(--mut)", fontWeight: 800 }}>+{m.bonus} {t("hari")}</span>
                  {got && <Check size={15} color="var(--green)" />}
                </div>
              );
            })}
            {nextMs && (
              <p className="rf-note">{t("Kurang")} <b>{nextMs.count - (info?.successfulPurchases ?? 0)}</b> {t("pembelian lagi untuk bonus milestone")} +{nextMs.bonus} {t("hari")}.</p>
            )}
          </div>
        </div>

        <div>
          <div className="rf-card">
            <h2><Info size={15} /> {t("Cara kerja")}</h2>
            <div className="rf-steps">
              <div className="rf-step"><span className="num">1</span><p><b>{t("Bagikan link")}</b> — {t("kirim link undangan ke teman via WhatsApp, Telegram, atau X.")}</p></div>
              <div className="rf-step"><span className="num">2</span><p><b>{t("Teman daftar & beli")}</b> — {t("mereka daftar lewat link kamu lalu beli paket apa pun kecuali Trial.")}</p></div>
              <div className="rf-step"><span className="num">3</span><p><b>{t("Dua-duanya dapat bonus")}</b> — {t("key teman langsung diperpanjang sesuai tabel bonus, dan kamu dapat bonus yang sama otomatis.")}</p></div>
            </div>
            <Link to="/beli" className="rf-btn" style={{ marginTop: 14, textDecoration: "none" }}>
              {t("Lihat paket")} <ChevronRight size={15} />
            </Link>
          </div>

          <div className="rf-card" style={{ marginTop: 14 }}>
            <h2><History size={15} /> {t("Riwayat bonus")}</h2>
            <div className="rf-hist">
              {!info ? <p className="rf-empty">{t("Memuat…")}</p>
              : info.history.length === 0 ? <p className="rf-empty">{t("Belum ada bonus. Bagikan link kamu mulai sekarang.")}</p>
              : info.history.map((h, i) => (
                <div key={i} className="rf-hrow">
                  <div><b>+{h.bonusDays} {t("hari")}</b> <span style={{ color: "var(--mut)" }}>· {h.invitee} · {h.packageKey}</span><div className="m">{fmtDate(h.at)}</div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rf-card" style={{ marginTop: 14 }}>
            <h2><Users size={15} /> {t("Papan peringkat")}</h2>
            <div className="rf-board">
              {!board ? <p className="rf-empty">{t("Memuat…")}</p>
              : board.board.length === 0 ? <p className="rf-empty">{t("Belum ada data. Jadilah yang pertama.")}</p>
              : board.board.map((b) => (
                <div key={b.rank} className={"rf-brow" + (b.rank <= 3 ? " top" : "")}>
                  <span className="rf-rank">{b.rank}</span>
                  <span style={{ flex: 1 }}>{b.name}</span>
                  <b>{b.referrals}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
