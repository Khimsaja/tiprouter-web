import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, type KeyItem } from "../lib/api";
import { useLang } from "../lib/i18n";

type KeysData = { keys: KeyItem[]; reason?: string };

const PAGE_STYLE = `
.models{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:12px}
.model-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 14px;border-radius:12px;background:var(--glass-t2);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid var(--border);box-shadow:var(--glass-shadow-t2)}
.model-row .mid{font-family:var(--font-mono);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.model-row:hover{border-color:rgba(56,189,248,.5)}
@media (max-width: 640px){.models{grid-template-columns:1fr}}
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
        <Link to="/buy">{t("Beli API key")}</Link>{" "}
        {t("lewat web langsung keluar, atau hubungkan Telegram di menu Profil kalau key kamu dari bot.")}
      </p>
    );
  return <p>{t("Data key belum bisa diambil sekarang. Coba muat ulang halamannya sebentar lagi.")}</p>;
}

export default function Models() {
  const { t } = useLang();
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];
  const primary = data && !reason ? pickPrimaryKey(keys) : null;

  let body: ReactNode;
  if (!data) {
    body = <p>{t("Mengambil daftar model.")}</p>;
  } else if (reason) {
    body = <ReasonMsg reason={reason} />;
  } else if (!primary) {
    body = <p>{t("Belum ada key, jadi belum ada daftar model.")}</p>;
  } else if (primary.models && primary.models.length > 0) {
    body = (
      <>
        <div className="models">
          {primary.models.map((m) => (
            <div className="model-row" key={m}>
              <span className="mid">{m}</span>
              <span className="badge-ok"><span className="pulse-dot" />{t("Online")}</span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          {t("Total {n} model dari key utama kamu", { n: primary.models.length })}
          {keys.length > 1 ? t(" (kamu punya {n} key)", { n: keys.length }) : ""}.
        </p>
      </>
    );
  } else if (primary.modelAccessMode && primary.modelAccessMode !== "whitelist") {
    body = <p>{t("Key kamu bisa manggil semua model yang tersedia di TipRouter.")}</p>;
  } else {
    body = <p>{t("Daftar model buat key ini belum kebaca. Coba muat ulang halamannya.")}</p>;
  }

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <PageHead title={t("Model")} sub={t("Model yang bisa kamu panggil pakai key kamu.")} />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t("Model yang bisa kamu pakai")}</h2>
        <p>{t("Daftar ini ngikutin paket/template key kamu. Panggil persis pakai nama di bawah.")}</p>
        <div>{body}</div>
      </div>
    </>
  );
}
