import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, daysLeft, fmtDate, fmtNum, type KeyItem } from "../lib/api";
import { tr, useLang } from "../lib/i18n";

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
  const { t } = useLang();
  if (status === "active") return <span className="chip ok">{t("Aktif")}</span>;
  if (status === "expired") return <span className="chip warn">{t("Habis")}</span>;
  return <span className="chip warn">{t("Nonaktif")}</span>;
}

function expiryText(k: KeyItem) {
  const left = daysLeft(k.expiresAt);
  if (!k.expiresAt) return tr("Tanpa masa habis");
  return left === 0
    ? tr("Habis sejak {date}", { date: fmtDate(k.expiresAt) })
    : tr("Sampai {date} ({days} hari lagi)", { date: fmtDate(k.expiresAt), days: left ?? 0 });
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
  const { t } = useLang();
  if (reason === "telegram_not_connected")
    return (
      <p>
        {t("Belum ada key yang ketemu buat akun ini.")}{" "}
        <Link to="/beli">{t("Beli API key")}</Link>{" "}
        {t("lewat web langsung keluar, atau hubungkan Telegram di menu Profil kalau key kamu dari bot.")}
      </p>
    );
  return <p>{t("Data key belum bisa diambil sekarang. Coba muat ulang halamannya sebentar lagi.")}</p>;
}

export default function Dashboard() {
  const { t } = useLang();
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
  let progText = t("Mengambil data key.");
  let progWidth = 0;
  let summary: ReactNode = <p>{t("Mengambil data key.")}</p>;

  if (data && reason) {
    statStatus = reason === "telegram_not_connected" ? t("Belum terhubung") : "-";
    progText = t("Belum ada key yang kebaca buat akun ini. Beli API key lewat web, atau hubungkan Telegram kalau key kamu dari bot.");
    summary = <ReasonMsg reason={reason} />;
  } else if (data && !primary) {
    statStatus = t("Belum ada key");
    progText = t("Belum ada key, jadi belum ada masa aktif yang jalan.");
    summary = <p>{t("Belum ada key yang ketemu buat akun ini.")}</p>;
  } else if (primary) {
    statStatus = primary.status === "active" ? t("Aktif") : primary.status === "expired" ? t("Habis") : t("Nonaktif");
    statStatusSub = primary.label || "";
    statDays = primary.expiresAt ? (left === 0 ? t("Habis") : t("{days} hari", { days: left ?? 0 })) : "∞";
    statDaysSub = primary.expiresAt ? t("sampai {date}", { date: fmtDate(primary.expiresAt) }) : t("tanpa masa habis");
    statTokens = fmtNum(primary.tokensConsumed);
    statModels = primary.modelCount ? String(primary.modelCount) : "-";
    progText = primary.expiresAt
      ? left === 0
        ? t("Masa aktif key ini udah habis sejak {date}. Perpanjang biar bisa dipakai lagi.", { date: fmtDate(primary.expiresAt) })
        : pct === null
          ? t("Berlaku sampai {date} — sisa {days} hari.", { date: fmtDate(primary.expiresAt), days: left ?? 0 })
          : t("Berlaku sampai {date} — sisa {days} hari ({pct}%).", { date: fmtDate(primary.expiresAt), days: left ?? 0, pct })
      : t("Key ini nggak punya masa habis. Santai, nggak perlu mikirin perpanjangan.");
    progWidth = pct === null ? 100 : pct;
    summary = keys.map((k) => (
      <div className="row" key={k.id}>
        <div>
          <p className="who">{k.label}</p>
          <p className="meta">
            {expiryText(k)} · {t("{n} model", { n: k.modelCount || 0 })} · {t("{n} token", { n: fmtNum(k.tokensConsumed) })}
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
      <PageHead title="Dashboard" sub={t("Ringkasan key dan masa aktif kamu.")} />
      <div className="stats">
        <div className="stat">
          <p className="lab">{t("Status key")}</p>
          <p className="val">{statStatus}</p>
          <p className="sub2">{statStatusSub}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Sisa masa aktif")}</p>
          <p className="val">{statDays}</p>
          <p className="sub2">{statDaysSub}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Token terpakai")}</p>
          <p className="val">{statTokens}</p>
          <p className="sub2">{t("semua waktu")}</p>
        </div>
        <div className="stat">
          <p className="lab">{t("Model tersedia")}</p>
          <p className="val">{statModels}</p>
          <p className="sub2">{t("siap dipanggil")}</p>
        </div>
      </div>
      <div className="card">
        <h2>{t("Masa aktif")}</h2>
        <p>{progText}</p>
        <div className="bar">
          <i style={{ width: progWidth + "%" }} />
        </div>
        <div className="btns">
          <Link className="btn primary" to="/beli">
            {primary ? t("Perpanjang Paket") : t("Beli API key")}
          </Link>
        </div>
      </div>
      <div className="card">
        <h2>{t("Key kamu")}</h2>
        <div>{summary}</div>
      </div>
    </>
  );
}
