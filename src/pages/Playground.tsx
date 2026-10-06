import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FlaskConical, Send, Square, Trash2, KeyRound, ChevronDown, Copy, Check, Eye, EyeOff, Settings2, ArrowLeft } from "lucide-react";
import { PublicLayout } from "../components/chrome";
import { api, type KeyItem } from "../lib/api";
import { useSession } from "../lib/session";
import { useLang } from "../lib/i18n";

const PG_STYLE = `
.pg{max-width:960px;margin:0 auto}
.pg-head{display:flex;align-items:center;gap:10px;margin:18px 0 6px}
.pg-head h1{font-size:22px;margin:0}
.pg-head .ico{width:36px;height:36px;border-radius:12px;background:var(--panel);border:1px solid var(--border);display:flex;align-items:center;justify-content:center}
.pg-sub{color:var(--muted);font-size:13.5px;margin:0 0 16px}
.pg-back{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:var(--muted);text-decoration:none;margin:14px 0 0}
.pg-back:hover{color:var(--txt)}
.pg-grid{display:grid;grid-template-columns:1fr;gap:12px}
.pg-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:14px}
.pg-card h3{margin:0 0 10px;font-size:14px;display:flex;align-items:center;gap:8px}
.pg-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.pg-input,.pg-select,.pg-textarea{background:var(--bg);border:1px solid var(--border);border-radius:10px;color:var(--txt);padding:9px 12px;font-size:13.5px;width:100%;font-family:inherit}
.pg-select{cursor:pointer}
.pg-input:focus,.pg-select:focus,.pg-textarea:focus{outline:none;border-color:var(--accent,#fff)}
.pg-textarea{resize:vertical;min-height:64px}
.pg-label{font-size:12.5px;color:var(--muted);margin:0 0 6px;display:block}
.pg-field{margin-bottom:10px}
.pg-hint{font-size:12px;color:var(--muted);margin-top:6px}
.pg-keyrow{display:flex;gap:8px}
.pg-keyrow .pg-input{flex:1;font-family:var(--mono);font-size:12.5px}
.icon-btn{flex:none;width:38px;height:38px;border-radius:10px;border:1px solid var(--border);background:var(--bg);color:var(--txt);display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.icon-btn:hover{border-color:var(--txt)}
.icon-btn:disabled{opacity:.4;cursor:default}
.chat-log{display:flex;flex-direction:column;gap:10px;max-height:520px;overflow-y:auto;padding:4px 2px;margin-bottom:12px}
.msg{max-width:88%;padding:10px 14px;border-radius:14px;font-size:13.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
.msg.user{align-self:flex-end;background:var(--btn-bg,#fff);color:var(--btn-txt,#000);border-bottom-right-radius:4px}
.msg.assistant{align-self:flex-start;background:var(--bg);border:1px solid var(--border);border-bottom-left-radius:4px}
.msg .role{font-size:11px;opacity:.65;margin-bottom:4px;font-weight:600}
.msg .usage{font-size:11px;opacity:.55;margin-top:8px;font-family:var(--mono)}
.msg.streaming::after{content:"▍";animation:blink 1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.chat-empty{text-align:center;color:var(--muted);font-size:13px;padding:36px 12px;border:1px dashed var(--border);border-radius:14px}
.chat-box{display:flex;gap:8px;align-items:flex-end}
.chat-box .pg-textarea{flex:1;min-height:48px;max-height:160px}
.send-btn{flex:none;width:46px;height:46px;border-radius:12px;border:none;background:#fff;color:#000;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}
.send-btn:disabled{opacity:.4;cursor:default}
.send-btn.stop{background:#e5484d;color:#fff}
.pg-err{background:#2a1215;border:1px solid #5c1f24;color:#f1a9a9;border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:12px}
details.pg-adv{margin-top:4px}
details.pg-adv summary{cursor:pointer;font-size:13px;color:var(--muted);display:inline-flex;align-items:center;gap:6px;user-select:none}
.pg-slider-row{display:flex;align-items:center;gap:10px}
.pg-slider-row input[type=range]{flex:1;accent-color:#fff}
.pg-slider-val{font-family:var(--mono);font-size:12.5px;min-width:40px;text-align:right}
@media(max-width:640px){.msg{max-width:94%}.pg-keyrow{flex-wrap:wrap}}
`;

type ChatMsg = { role: "user" | "assistant"; text: string; usage?: { prompt: number; completion: number; total: number } | null; streaming?: boolean };

const LS_KEY = "tiprouter-pg-key";

async function* streamChat(apiKey: string, model: string, messages: { role: string; content: string }[], temperature: number, maxTokens: number): AsyncGenerator<{ delta?: string; usage?: { prompt: number; completion: number; total: number }; error?: string }> {
  const res = await fetch("/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + apiKey },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens > 0 ? maxTokens : undefined, stream: true }),
  });
  if (!res.ok) {
    let code = "http_" + res.status;
    try { const d = await res.json(); if (d?.error) code = String(d.error); } catch { /* keep */ }
    yield { error: code };
    return;
  }
  const reader = res.body?.getReader();
  if (!reader) { yield { error: "no_stream" }; return; }
  const dec = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() || "";
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") continue;
      try {
        const d = JSON.parse(payload);
        const delta = d?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield { delta };
        const u = d?.usage;
        if (u) yield { usage: { prompt: u.prompt_tokens ?? 0, completion: u.completion_tokens ?? 0, total: u.total_tokens ?? 0 } };
      } catch { /* skip malformed chunk */ }
    }
  }
}

function maskKey(k: string) {
  if (k.length <= 10) return "••••••••";
  return k.slice(0, 6) + "••••••••" + k.slice(-4);
}

export default function Playground() {
  const { t } = useLang();
  const { me } = useSession();
  const [models, setModels] = useState<string[]>([]);
  const [model, setModel] = useState("");
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [keyId, setKeyId] = useState("");
  const [manualKey, setManualKey] = useState(() => { try { return localStorage.getItem(LS_KEY) || ""; } catch { return ""; } });
  const [showKey, setShowKey] = useState(false);
  const [resolvedKey, setResolvedKey] = useState("");
  const [resolving, setResolving] = useState(false);
  const [system, setSystem] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const stopRef = useRef(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/template-models")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && Array.isArray(d.models) && d.models.length > 0) {
          const ms = d.models.filter((x: unknown) => typeof x === "string");
          setModels(ms);
          setModel((m) => m || ms[0]);
        }
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!me) { setKeys([]); setKeyId(""); return; }
    let alive = true;
    api.keys().then((d) => {
      if (!alive) return;
      const ks = (d.keys || []).filter((k) => k.status === "active");
      setKeys(ks);
      if (ks.length > 0) setKeyId((id) => id || ks[0].id);
    }).catch(() => {});
    return () => { alive = false; };
  }, [me]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const resolveKey = useCallback(async (): Promise<string> => {
    if (keyId) {
      setResolving(true);
      try {
        const d = await api.keySecret(keyId);
        setResolvedKey(d.secret);
        return d.secret;
      } finally { setResolving(false); }
    }
    const k = manualKey.trim();
    if (k) {
      try { localStorage.setItem(LS_KEY, k); } catch { /* ignore */ }
      setResolvedKey(k);
      return k;
    }
    return "";
  }, [keyId, manualKey]);

  const activeKey = resolvedKey || manualKey.trim();

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || busy) return;
    setError("");
    const key = await resolveKey();
    if (!key) { setError(t("Isi API key dulu sebelum ngobrol.")); return; }
    if (!model) { setError(t("Pilih model dulu.")); return; }
    const history: { role: string; content: string }[] = [];
    if (system.trim()) history.push({ role: "system", content: system.trim() });
    for (const m of msgs) history.push({ role: m.role, content: m.text });
    history.push({ role: "user", content: text });
    setMsgs((p) => [...p, { role: "user", text }, { role: "assistant", text: "", streaming: true }]);
    setInput("");
    setBusy(true);
    stopRef.current = false;
    let acc = "";
    let usage: ChatMsg["usage"] = null;
    try {
      for await (const ev of streamChat(key, model, history, temperature, maxTokens)) {
        if (stopRef.current) break;
        if (ev.error) {
          const friendly: Record<string, string> = {
            http_401: t("API key salah atau sudah dicabut."),
            http_403: t("Key ini tidak punya akses ke model tersebut."),
            http_429: t("Kena rate limit. Tunggu sebentar lalu coba lagi."),
            invalid_api_key: t("API key salah atau sudah dicabut."),
            capacity_exhausted: t("Kena rate limit. Tunggu sebentar lalu coba lagi."),
          };
          setError(friendly[ev.error] || t("Gagal: {e}", { e: ev.error }));
          break;
        }
        if (ev.delta) {
          acc += ev.delta;
          const snap = acc;
          setMsgs((p) => { const n = [...p]; n[n.length - 1] = { ...n[n.length - 1], text: snap }; return n; });
        }
        if (ev.usage) usage = ev.usage;
      }
    } catch {
      setError(t("Koneksi ke gateway gagal. Coba lagi."));
    } finally {
      const finalText = acc;
      const finalUsage = usage;
      setMsgs((p) => { const n = [...p]; n[n.length - 1] = { role: "assistant", text: finalText, usage: finalUsage }; return n; });
      setBusy(false);
    }
  }, [input, busy, msgs, model, system, temperature, maxTokens, resolveKey, t]);

  const copyLast = async () => {
    const last = [...msgs].reverse().find((m) => m.role === "assistant" && m.text);
    if (!last) return;
    try { await navigator.clipboard.writeText(last.text); } catch { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <PublicLayout>
      <style>{PG_STYLE}</style>
      <div className="pg">
        <Link to={me ? "/dashboard" : "/"} className="pg-back"><ArrowLeft size={14} />{me ? t("Dashboard") : t("Beranda")}</Link>
        <div className="pg-head">
          <span className="ico"><FlaskConical size={18} /></span>
          <h1>{t("Playground")}</h1>
        </div>
        <p className="pg-sub">{t("Cobain API key kamu langsung di browser. Pilih model, atur parameter, ngobrol — tanpa install apa pun.")}</p>

        <div className="pg-grid">
          <div className="pg-card">
            <h3><KeyRound size={15} /> {t("API Key")}</h3>
            {me && keys.length > 0 ? (
              <div className="pg-field">
                <label className="pg-label">{t("Pakai key dari akunmu")}</label>
                <select className="pg-select" value={keyId} onChange={(e) => { setKeyId(e.target.value); setResolvedKey(""); }}>
                  {keys.map((k) => <option key={k.id} value={k.id}>{k.label} ({maskKey(k.prefix || "")})</option>)}
                  <option value="">{t("— atau tempel manual di bawah —")}</option>
                </select>
              </div>
            ) : null}
            <div className="pg-field" style={{ marginBottom: 0 }}>
              <label className="pg-label">{me ? t("Key manual") : t("Tempel API key kamu")}</label>
              <div className="pg-keyrow">
                <input
                  className="pg-input"
                  type={showKey ? "text" : "password"}
                  value={manualKey}
                  placeholder="tip_..."
                  onChange={(e) => { setManualKey(e.target.value); if (keyId) setKeyId(""); }}
                  autoComplete="off"
                  spellCheck={false}
                />
                <button className="icon-btn" onClick={() => setShowKey((s) => !s)} aria-label={t("Tampilkan / sembunyikan key")}>
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <p className="pg-hint">{t("Key cuma dipakai di browser kamu untuk nelpon /v1. Nggak dikirim ke mana-mana selain gateway TipRouter.")}</p>
            </div>
          </div>

          <div className="pg-card">
            <h3><Settings2 size={15} /> {t("Model & Parameter")}</h3>
            <div className="pg-field">
              <label className="pg-label">{t("Model")}</label>
              <select className="pg-select" value={model} onChange={(e) => setModel(e.target.value)}>
                {models.length === 0 ? <option value="">{t("Memuat model...")}</option> : null}
                {models.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <details className="pg-adv">
              <summary><ChevronDown size={14} /> {t("Pengaturan lanjutan")}</summary>
              <div style={{ marginTop: 10 }}>
                <div className="pg-field">
                  <label className="pg-label">{t("System prompt (opsional)")}</label>
                  <textarea className="pg-textarea" value={system} onChange={(e) => setSystem(e.target.value)} placeholder={t("Contoh: Kamu asisten yang ramah...")} />
                </div>
                <div className="pg-field">
                  <label className="pg-label">{t("Temperature")}</label>
                  <div className="pg-slider-row">
                    <input type="range" min={0} max={2} step={0.1} value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} />
                    <span className="pg-slider-val">{temperature.toFixed(1)}</span>
                  </div>
                </div>
                <div className="pg-field" style={{ marginBottom: 0 }}>
                  <label className="pg-label">{t("Max tokens")}</label>
                  <div className="pg-slider-row">
                    <input type="range" min={128} max={8192} step={128} value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))} />
                    <span className="pg-slider-val">{maxTokens}</span>
                  </div>
                </div>
              </div>
            </details>
          </div>

          <div className="pg-card">
            <h3>
              <FlaskConical size={15} /> {t("Obrolan")}
              <span style={{ marginLeft: "auto", display: "inline-flex", gap: 6 }}>
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={copyLast} aria-label={t("Salin jawaban terakhir")} disabled={!msgs.some((m) => m.role === "assistant" && m.text)}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setMsgs([])} aria-label={t("Hapus obrolan")} disabled={msgs.length === 0 || busy}>
                  <Trash2 size={14} />
                </button>
              </span>
            </h3>
            {error ? <div className="pg-err">{error}</div> : null}
            <div className="chat-log" ref={logRef}>
              {msgs.length === 0 ? (
                <div className="chat-empty">
                  {t("Belum ada pesan. Tulis sesuatu di bawah buat mulai.")}<br />
                  {!me ? <span>{t("Belum punya key?")} <Link to="/beli" style={{ textDecoration: "underline" }}>{t("Beli di sini")}</Link></span> : null}
                </div>
              ) : (
                msgs.map((m, i) => (
                  <div key={i} className={"msg " + m.role + (m.streaming ? " streaming" : "")}>
                    <div className="role">{m.role === "user" ? t("Kamu") : model || "AI"}</div>
                    {m.text || (m.streaming ? "" : t("(kosong)"))}
                    {m.usage ? <div className="usage">↑ {m.usage.prompt} ↓ {m.usage.completion} = {m.usage.total} tokens</div> : null}
                  </div>
                ))
              )}
            </div>
            <div className="chat-box">
              <textarea
                className="pg-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("Tulis pesan... (Enter buat kirim, Shift+Enter baris baru)")}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (busy) { stopRef.current = true; } else void send(); } }}
                disabled={resolving}
              />
              {busy ? (
                <button className="send-btn stop" onClick={() => { stopRef.current = true; }} aria-label={t("Berhenti")}><Square size={17} /></button>
              ) : (
                <button className="send-btn" onClick={() => void send()} aria-label={t("Kirim")} disabled={!input.trim() || resolving}><Send size={17} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
