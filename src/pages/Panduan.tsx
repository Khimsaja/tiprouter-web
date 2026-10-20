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

const OPENCODE_JSON = `{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "tiprouter": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "TipRouter",
      "options": {
        "baseURL": "https://tiprouter.my.id/v1",
        "apiKey": "{env:TIPROUTER_API_KEY}"
      },
      "models": {
        "mimo-v2.5": { "name": "MiMo V2.5" },
        "glm-5-3-flash": { "name": "GLM 5.3 Flash" },
        "hy4-preview": { "name": "HY4 Preview" },
        "mimo-v2.6.flash": { "name": "MiMo V2.6 Flash" },
        "muse-spark-1.3": { "name": "Muse Spark 1.3" },
        "gemini-3.8-flash": { "name": "Gemini 3.8 Flash" },
        "gpt-6-luna": { "name": "GPT-6 Luna" },
        "deepseek-v4.1-flash": { "name": "DeepSeek V4.1 Flash (fast)" },
        "deepseek-v-4.1-flash": { "name": "DeepSeek V4.1 Flash" },
        "qwen-3.8-27b": { "name": "Qwen 3.8 27B" },
        "step-5-preview": { "name": "Step 5 Preview" },
        "claude-haiku-5.5": { "name": "Claude Haiku 5.5" },
        "solar-mini4": { "name": "Solar Mini 4" }
      }
    }
  },
  "model": "tiprouter/muse-spark-1.3"
}`;

const OMP_YML = `providers:
  tiprouter:
    baseUrl: https://tiprouter.my.id/v1
    api: openai-completions
    apiKey: TIPROUTER_API_KEY # nama env var, atau isi key langsung
    models:
      - id: mimo-v2.5
        name: MiMo V2.5
      - id: glm-5-3-flash
        name: GLM 5.3 Flash
      - id: hy4-preview
        name: HY4 Preview
      - id: mimo-v2.6.flash
        name: MiMo V2.6 Flash
      - id: muse-spark-1.3
        name: Muse Spark 1.3
      - id: gemini-3.8-flash
        name: Gemini 3.8 Flash
      - id: gpt-6-luna
        name: GPT-6 Luna
      - id: deepseek-v4.1-flash
        name: DeepSeek V4.1 Flash (fast)
      - id: deepseek-v-4.1-flash
        name: DeepSeek V4.1 Flash
      - id: qwen-3.8-27b
        name: Qwen 3.8 27B
      - id: step-5-preview
        name: Step 5 Preview
      - id: claude-haiku-5.5
        name: Claude Haiku 5.5
      - id: solar-mini4
        name: Solar Mini 4`;

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
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t("Pakai di OpenCode")}</h2>
        <p>
          {t(
            "Tambahkan TipRouter sebagai provider custom di opencode.json. Key diambil dari environment variable TIPROUTER_API_KEY."
          )}
        </p>
        <div className="codebox">{OPENCODE_JSON}</div>
        <ol style={{ marginTop: 14, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            {t("Simpan key-mu sebagai environment variable:")}{" "}
            <code className="mono">export TIPROUTER_API_KEY=tip_...</code>
          </li>
          <li>{t("Tempel konfigurasi di atas ke opencode.json (di folder project, atau global di ~/.config/opencode/).")}</li>
          <li>{t("Di OpenCode jalankan /models dan pilih tiprouter/<model> — misalnya tiprouter/muse-spark-1.3.")}</li>
        </ol>
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <h2>{t("Pakai di omp (oh-my-pi)")}</h2>
        <p>
          {t(
            "Tambahkan TipRouter sebagai custom provider OpenAI-compatible di ~/.omp/agent/models.yml. Key diambil dari environment variable TIPROUTER_API_KEY."
          )}
        </p>
        <div className="codebox">{OMP_YML}</div>
        <ol style={{ marginTop: 14, paddingLeft: 20, display: "grid", gap: 8 }}>
          <li>
            {t("Simpan key-mu sebagai environment variable:")}{" "}
            <code className="mono">export TIPROUTER_API_KEY=tip_...</code>
          </li>
          <li>{t("Tempel konfigurasi di atas ke ~/.omp/agent/models.yml, lalu jalankan omp models tiprouter buat verifikasi.")}</li>
          <li>{t("Jalankan omp setup dan pilih model tiprouter di langkah default-model, atau pakai /model di dalam sesi buat ganti model.")}</li>
        </ol>
      </div>
    </>
  );
}
