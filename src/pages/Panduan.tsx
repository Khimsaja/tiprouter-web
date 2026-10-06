import { useRef, useState } from "react";
import { PageHead } from "../components/DashLayout";
import { useLang } from "../lib/i18n";

const PAGE_STYLE = `
.copyrow{display:flex;gap:10px;align-items:stretch;margin-top:12px}
.copyrow .url{flex:1;font-family:var(--mono);font-size:13px;padding:10px 12px;border-radius:10px;background:var(--bg);border:1px solid var(--border);display:flex;align-items:center;overflow-x:auto;white-space:nowrap}
.copyrow .btn{width:auto}
`;

const BASE_URL = "https://tiprouter.my.id/v1";

const CURL = `curl https://tiprouter.my.id/v1/chat/completions \\
  -H "Authorization: Bearer tip_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "muse-spark-1.3",
    "messages": [{"role": "user", "content": "Halo!"}]
  }'`;

export default function Panduan() {
  const { t } = useLang();
  const [copyLabel, setCopyLabel] = useState("Salin");
  const timer = useRef<number | undefined>(undefined);

  async function copyBase() {
    try {
      await navigator.clipboard.writeText(BASE_URL);
      setCopyLabel("Tersalin");
    } catch {
      setCopyLabel("Gagal menyalin");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopyLabel("Salin"), 1800);
  }

  return (
    <>
      <style>{PAGE_STYLE}</style>
      <PageHead title={t("Panduan")} sub={t("Cara nyambungin aplikasi kamu ke TipRouter.")} />
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t("Cara pakai")}</h2>
        <p>{t("Semua aplikasi yang cocok sama OpenAI bisa langsung nyambung. Tinggal ganti base URL dan isi API key kamu.")}</p>
        <div className="copyrow">
          <div className="url">{BASE_URL}</div>
          <button className="btn" type="button" onClick={copyBase}>
            {t(copyLabel)}
          </button>
        </div>
        <div className="codebox">{CURL}</div>
        <div style={{ marginTop: 14 }}>
          <div className="kv">
            <span className="k">Chat</span>
            <span className="v mono">POST /v1/chat/completions</span>
          </div>
          <div className="kv">
            <span className="k">{t("Daftar model")}</span>
            <span className="v mono">GET /v1/models</span>
          </div>
          <div className="kv">
            <span className="k">Fair use</span>
            <span className="v">{t("150 request/menit")}</span>
          </div>
        </div>
      </div>
    </>
  );
}
