import { useEffect, useRef, useState } from "react";
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

// Daftar model di halaman ini BUKAN hardcoded lagi: diambil dari
// /api/template-models (template 'tiprouter new' di router, sama seperti
// yang dipakai Playground dan halaman Model). Kalau fetch gagal, pakai
// daftar fallback di bawah supaya halaman tetap berguna — tapi daftar itu
// bisa basi, jadi jangan ditambah-tambahi manual.
const FALLBACK_MODELS = [
  "mimo-v2.5",
  "glm-5-3-flash",
  "hy4-preview",
  "mimo-v2.6.flash",
  "muse-spark-1.3",
  "gemini-3.8-flash",
  "gpt-6-luna",
  "deepseek-v4.1-flash",
  "deepseek-v-4.1-flash",
  "qwen-3.8-27b",
  "step-5-preview",
  "claude-haiku-5.5",
  "solar-mini4",
];

// Nama tampil buat model yang sudah dikenal; model baru yang masuk template
// otomatis dapat nama turunan dari id-nya (mis. nemotron-3.5-super ->
// "Nemotron 3.5 Super"). Nama cuma label — yang dipanggil tetap id-nya.
const NAME_OVERRIDES: Record<string, string> = {
  "mimo-v2.5": "MiMo V2.5",
  "glm-5-3-flash": "GLM 5.3 Flash",
  "hy4-preview": "HY4 Preview",
  "hy3": "HY3",
  "mimo-v2.6.flash": "MiMo V2.6 Flash",
  "muse-spark-1.3": "Muse Spark 1.3",
  "gemini-3.8-flash": "Gemini 3.8 Flash",
  "gpt-6-luna": "GPT-6 Luna",
  "deepseek-v4.1-flash": "DeepSeek V4.1 Flash (fast)",
  "deepseek-v-4.1-flash": "DeepSeek V4.1 Flash",
  "deepseek-v4.1-flash-1017": "DeepSeek V4.1 Flash 1017",
  "deepseek-v-4.1-flash-1017": "DeepSeek V4.1 Flash 1017",
  "deepseek-v4-flash-0731": "DeepSeek V4 Flash 0731",
  "qwen-3.8-27b": "Qwen 3.8 27B",
  "step-5-preview": "Step 5 Preview",
  "claude-haiku-5.5": "Claude Haiku 5.5",
  "solar-mini4": "Solar Mini 4",
};

function displayName(id: string): string {
  const hit = NAME_OVERRIDES[id];
  if (hit) return hit;
  return id
    .split(/[-.]/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function buildOpencodeJson(models: string[]): string {
  const entries = models.map((m) => `        "${m}": { "name": "${displayName(m)}" }`).join(",\n");
  const fallback = models.includes("muse-spark-1.3") ? "muse-spark-1.3" : models[0];
  return `{
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
${entries}
      }
    }
  },
  "model": "tiprouter/${fallback}"
}`;
}

function buildOmpYml(models: string[]): string {
  const entries = models.map((m) => `      - id: ${m}\n        name: ${displayName(m)}`).join("\n");
  return `providers:
  tiprouter:
    baseUrl: https://tiprouter.my.id/v1
    api: openai-completions
    apiKey: TIPROUTER_API_KEY # nama env var, atau isi key langsung
    models:
${entries}`;
}

export default function Panduan() {
  const { t } = useLang();
  const [copyLabel, setCopyLabel] = useState("Salin");
  const timer = useRef<number | undefined>(undefined);
  // Model ngikutin template router saat ini; fallback tampil dulu sambil
  // fetch jalan, lalu keganti daftar live begitu respons datang.
  const [models, setModels] = useState<string[]>(FALLBACK_MODELS);

  useEffect(() => {
    let alive = true;
    fetch("/api/template-models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d.models) && d.models.length > 0) {
          const ms = d.models.filter((x: unknown) => typeof x === "string");
          if (ms.length > 0) setModels(ms);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const opencodeJson = buildOpencodeJson(models);
  const ompYml = buildOmpYml(models);

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
        <div className="codebox">{opencodeJson}</div>
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
        <div className="codebox">{ompYml}</div>
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
