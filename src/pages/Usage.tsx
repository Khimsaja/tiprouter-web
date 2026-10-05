import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, fmtNum, type KeyItem } from "../lib/api";

type KeysData = { keys: KeyItem[]; reason?: string };

const PAGE_STYLE = `
.ubar-row{padding:12px 0;border-bottom:1px solid var(--border)}
.ubar-row:last-child{border-bottom:0}
.ubar-top{display:flex;justify-content:space-between;gap:12px;font-size:14px}
.ubar-top .n{font-weight:600}
.ubar-top .t{font-weight:600;font-family:var(--mono);font-size:13px}
`;

function useKeys(): KeysData | null {
  const [data, setData] = useState<KeysData | null>(null);
  useEffect(() => {
    let alive = true;
    api
      .keys()
      .then((d) => {
        if (alive) setData({ keys: d.keys || [], reason: d.reason });
      })
      .catch(() => {
        if (alive) setData({ keys: [], reason: "http_error" });
      });
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

function ReasonMsg({ reason }: { reason?: string }) {
  if (reason === "telegram_not_connected")
    return (
      <p>
        Belum ada key yang ketemu buat akun ini. <Link to="/beli">Beli API key</Link> lewat web langsung keluar, atau
        hubungkan Telegram di menu Profil kalau key kamu dari bot.
      </p>
    );
  return <p>Data key belum bisa diambil sekarang. Coba muat ulang halamannya sebentar lagi.</p>;
}

export default function Usage() {
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];
  const ready = data !== null && !reason;

  const total = keys.reduce((a, k) => a + (Number(k.tokensConsumed) || 0), 0);
  const active = keys.filter((k) => k.status === "active").length;
  const top = keys.slice().sort((a, b) => (Number(b.tokensConsumed) || 0) - (Number(a.tokensConsumed) || 0))[0];

  let box: ReactNode;
  if (!data) {
    box = <p>Mengambil data pemakaian.</p>;
  } else if (reason) {
    box = <ReasonMsg reason={reason} />;
  } else if (keys.length === 0) {
    box = <p>Belum ada key, jadi belum ada pemakaian.</p>;
  } else {
    box = keys.map((k) => {
      const t = Number(k.tokensConsumed) || 0;
      const pct = total > 0 ? Math.round((t / total) * 100) : 0;
      return (
        <div className="ubar-row" key={k.id}>
          <div className="ubar-top">
            <span className="n">{k.label}</span>
            <span className="t">
              {fmtNum(t)} token ({pct}%)
            </span>
          </div>
          <div className="bar">
            <i style={{ width: pct + "%" }} />
          </div>
        </div>
      );
    });
  }

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <PageHead title="Usage" sub="Pemakaian token dari semua key kamu (semua waktu)." />
      <div className="stats">
        <div className="stat">
          <p className="lab">Total token</p>
          <p className="val">{ready ? fmtNum(total) : "-"}</p>
          <p className="sub2">semua key</p>
        </div>
        <div className="stat">
          <p className="lab">Key aktif</p>
          <p className="val">{ready ? String(active) : "-"}</p>
          <p className="sub2">{ready ? "dari " + keys.length + " key" : ""}</p>
        </div>
        <div className="stat">
          <p className="lab">Total key</p>
          <p className="val">{ready ? String(keys.length) : "-"}</p>
          <p className="sub2">yang ketemu di akun ini</p>
        </div>
        <div className="stat">
          <p className="lab">Key terberat</p>
          <p className="val">{ready && top ? fmtNum(top.tokensConsumed) : "-"}</p>
          <p className="sub2">{ready && top ? top.label || "" : ""}</p>
        </div>
      </div>
      <div className="card">
        <h2>Pemakaian per key</h2>
        <div>{box}</div>
        <p className="muted" style={{ marginTop: 12 }}>
          Angka token dihitung dari semua request yang pernah jalan pakai key itu.
        </p>
      </div>
    </>
  );
}
