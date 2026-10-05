import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, daysLeft, fmtDate, fmtNum, type KeyItem } from "../lib/api";

type KeysData = { keys: KeyItem[]; reason?: string };

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

function StatusChip({ status }: { status: KeyItem["status"] }) {
  if (status === "active") return <span className="chip ok">Aktif</span>;
  if (status === "expired") return <span className="chip warn">Habis</span>;
  return <span className="chip warn">Nonaktif</span>;
}

function expiryText(k: KeyItem) {
  const left = daysLeft(k.expiresAt);
  if (!k.expiresAt) return "Tanpa masa habis";
  return left === 0 ? "Habis sejak " + fmtDate(k.expiresAt) : "Sampai " + fmtDate(k.expiresAt) + " (" + left + " hari lagi)";
}

function pctLeft(k: KeyItem) {
  if (!k.expiresAt || !k.createdAt) return null;
  const total = Date.parse(k.expiresAt) - Date.parse(k.createdAt);
  const leftMs = Date.parse(k.expiresAt) - Date.now();
  if (total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((leftMs / total) * 100)));
}

function pickPrimaryKey(keys: KeyItem[]) {
  for (const k of keys) if (k.status === "active") return k;
  return keys[0] || null;
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

export default function Dashboard() {
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];
  const primary = data && !reason ? pickPrimaryKey(keys) : null;
  const left = primary?.expiresAt ? (daysLeft(primary.expiresAt) ?? 0) : null;
  const pct = primary ? pctLeft(primary) : null;

  let statStatus = "-";
  let statStatusSub = "";
  let statDays = "-";
  let statDaysSub = "";
  let statTokens = "-";
  let statModels = "-";
  let progText = "Mengambil data key.";
  let progWidth = 0;
  let summary: ReactNode = <p>Mengambil data key.</p>;

  if (data && reason) {
    statStatus = reason === "telegram_not_connected" ? "Belum terhubung" : "-";
    progText = "Belum ada key yang kebaca buat akun ini. Beli API key lewat web, atau hubungkan Telegram kalau key kamu dari bot.";
    summary = <ReasonMsg reason={reason} />;
  } else if (data && !primary) {
    statStatus = "Belum ada key";
    progText = "Belum ada key, jadi belum ada masa aktif yang jalan.";
    summary = <p>Belum ada key yang ketemu buat akun ini.</p>;
  } else if (primary) {
    statStatus = primary.status === "active" ? "Aktif" : primary.status === "expired" ? "Habis" : "Nonaktif";
    statStatusSub = primary.label || "";
    statDays = primary.expiresAt ? (left === 0 ? "Habis" : `${left} hari`) : "∞";
    statDaysSub = primary.expiresAt ? "sampai " + fmtDate(primary.expiresAt) : "tanpa masa habis";
    statTokens = fmtNum(primary.tokensConsumed);
    statModels = primary.modelCount ? String(primary.modelCount) : "-";
    progText = primary.expiresAt
      ? left === 0
        ? "Masa aktif key ini udah habis sejak " + fmtDate(primary.expiresAt) + ". Perpanjang biar bisa dipakai lagi."
        : "Berlaku sampai " +
          fmtDate(primary.expiresAt) +
          " — sisa " +
          left +
          " hari" +
          (pct === null ? "" : " (" + pct + "%)") +
          "."
      : "Key ini nggak punya masa habis. Santai, nggak perlu mikirin perpanjangan.";
    progWidth = pct === null ? 100 : pct;
    summary = keys.map((k) => (
      <div className="row" key={k.id}>
        <div>
          <p className="who">{k.label}</p>
          <p className="meta">
            {expiryText(k)} · {k.modelCount || 0} model · {fmtNum(k.tokensConsumed)} token
          </p>
        </div>
        <div className="right">
          <StatusChip status={k.status} />
        </div>
      </div>
    ));
  }

  return (
    <>
      <PageHead title="Dashboard" sub="Ringkasan key dan masa aktif kamu." />
      <div className="stats">
        <div className="stat">
          <p className="lab">Status key</p>
          <p className="val">{statStatus}</p>
          <p className="sub2">{statStatusSub}</p>
        </div>
        <div className="stat">
          <p className="lab">Sisa masa aktif</p>
          <p className="val">{statDays}</p>
          <p className="sub2">{statDaysSub}</p>
        </div>
        <div className="stat">
          <p className="lab">Token terpakai</p>
          <p className="val">{statTokens}</p>
          <p className="sub2">semua waktu</p>
        </div>
        <div className="stat">
          <p className="lab">Model tersedia</p>
          <p className="val">{statModels}</p>
          <p className="sub2">siap dipanggil</p>
        </div>
      </div>
      <div className="card">
        <h2>Masa aktif</h2>
        <p>{progText}</p>
        <div className="bar">
          <i style={{ width: progWidth + "%" }} />
        </div>
        <div className="btns">
          <Link className="btn primary" to="/beli">
            {primary ? "Perpanjang Paket" : "Beli API Key"}
          </Link>
        </div>
      </div>
      <div className="card">
        <h2>Key kamu</h2>
        <div>{summary}</div>
      </div>
    </>
  );
}
