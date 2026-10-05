import { Fragment, useEffect, useState, type ReactNode } from "react";
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

export default function Keys() {
  const data = useKeys();
  const reason = data?.reason;
  const keys = data?.keys ?? [];

  let body: ReactNode;
  if (!data) {
    body = <p>Mengambil data key.</p>;
  } else if (reason) {
    body = <ReasonMsg reason={reason} />;
  } else if (keys.length === 0) {
    body = (
      <>
        <p>
          Belum ada key yang cocok buat akun ini. Kalau key kamu dari bot, hubungkan Telegram di menu Profil. Belum
          punya key? Beli lewat web, key langsung keluar.
        </p>
        <div className="btns">
          <Link className="btn primary" to="/beli">
            Beli API Key
          </Link>
        </div>
      </>
    );
  } else {
    body = (
      <>
        {keys.map((k, i) => (
          <Fragment key={k.id}>
            {i > 0 ? <div style={{ borderTop: "1px solid var(--border)", margin: "12px 0" }} /> : null}
            <div style={{ padding: "6px 0 2px" }}>
              <div className="kv">
                <span className="k">Label</span>
                <span className="v">{k.label}</span>
              </div>
              <div className="kv">
                <span className="k">Prefix</span>
                <span className="v mono">{k.prefix ? k.prefix + "........" : "-"}</span>
              </div>
              <div className="kv">
                <span className="k">Status</span>
                <span className="v">
                  <StatusChip status={k.status} />
                </span>
              </div>
              <div className="kv">
                <span className="k">Dibuat</span>
                <span className="v">{k.createdAt ? fmtDate(k.createdAt) : "-"}</span>
              </div>
              <div className="kv">
                <span className="k">Masa berlaku</span>
                <span className="v">{expiryText(k)}</span>
              </div>
              <div className="kv">
                <span className="k">Token terpakai</span>
                <span className="v">{fmtNum(k.tokensConsumed)}</span>
              </div>
              <div className="kv">
                <span className="k">Limit request</span>
                <span className="v">{k.requestsPerMinute ? k.requestsPerMinute + "/menit" : "150/menit (fair use)"}</span>
              </div>
              <div className="kv">
                <span className="k">Request barengan</span>
                <span className="v">{k.maxConcurrentRequests ? "maks " + k.maxConcurrentRequests : "-"}</span>
              </div>
              <div className="kv">
                <span className="k">Model tersedia</span>
                <span className="v">{(k.modelCount || 0) + " model"}</span>
              </div>
            </div>
          </Fragment>
        ))}
        <div className="btns">
          <Link className="btn primary" to="/beli">
            Beli API Key Lagi
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHead title="API Keys" sub="Detail key kamu: status, masa berlaku, dan limit." />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>API key kamu</h2>
        <div>{body}</div>
      </div>
    </>
  );
}
