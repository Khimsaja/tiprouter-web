import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { PageHead } from "../components/DashLayout";
import { api, type KeyItem } from "../lib/api";
import { useLang } from "../lib/i18n";

type KeysData = { keys: KeyItem[]; reason?: string };

const PAGE_STYLE = `
.models{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.models .mchip{font-family:var(--mono);font-size:12.5px;padding:5px 10px;border-radius:8px;background:var(--panel);border:1px solid var(--border);color:var(--txt)}
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
            <span className="mchip" key={m}>
              {m}
            </span>
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
