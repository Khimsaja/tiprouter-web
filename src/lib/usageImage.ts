/**
 * Renders a shareable PNG card (1080x1080) summarizing a user's token usage.
 * Pure canvas — no extra dependencies. Original TipRouter template:
 * metric name + number per card, watermark 'tiprouter.my.id' bottom-right, no emoji.
 * Background can be customized with a user-uploaded photo (dark scrim keeps text readable).
 */

export interface CandleData {
  label: string; // e.g. "12/10"
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface UsageImageData {
  period: string;
  userName: string;
  keyLabel: string;
  totalTokens: number;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  topModel: string;
  successRate: number; // 0-100
  truncated: boolean;
  lang: "id" | "en";
  backgroundImage?: HTMLImageElement | null;
  candles?: CandleData[];
}

const W = 1080;
const H = 1440;

const STR: Record<"id" | "en", Record<string, string>> = {
  id: {
    title: "Ringkasan Penggunaan Token",
    total: "Total Token",
    requests: "Request",
    input: "Token Masuk",
    output: "Token Keluar",
    topModel: "Model Teratas",
    success: "Tingkat Sukses",
    partial: "dihitung dari 500 baris pertama",
    chart: "Pergerakan Token Harian",
  },
  en: {
    title: "Token Usage Summary",
    total: "Total Tokens",
    requests: "Requests",
    input: "Input Tokens",
    output: "Output Tokens",
    topModel: "Top Model",
    success: "Success Rate",
    partial: "computed from first 500 rows",
    chart: "Daily Token Movement",
  },
};

const fmt = (n: number) => Math.round(n).toLocaleString("id-ID");
const font = (w: number, s: number) =>
  `${w} ${s}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
  const scale = Math.max(W / img.width, H / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
}

export interface CandleRow {
  ts: string;
  input_tokens: number;
  output_tokens: number;
}

/** Group usage rows by day, compute OHLC candles from hourly buckets. */
export function computeCandles(rows: CandleRow[]): CandleData[] {
  // Group by day (YYYY-MM-DD)
  const byDay = new Map<string, Map<number, number>>(); // day -> hour -> tokens
  for (const r of rows) {
    const dt = new Date(r.ts);
    if (isNaN(dt.getTime())) continue;
    const day = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
    const hour = dt.getHours();
    const tokens = (r.input_tokens || 0) + (r.output_tokens || 0);
    if (!byDay.has(day)) byDay.set(day, new Map());
    const hours = byDay.get(day)!;
    hours.set(hour, (hours.get(hour) || 0) + tokens);
  }

  const candles: CandleData[] = [];
  const sortedDays = [...byDay.keys()].sort();
  // Limit to last 30 days for readability
  const days = sortedDays.slice(-30);

  for (const day of days) {
    const hours = byDay.get(day)!;
    const sortedHours = [...hours.entries()].sort((a, b) => a[0] - b[0]);
    if (sortedHours.length === 0) continue;

    const values = sortedHours.map(([, v]) => v);
    const open = values[0];
    const close = values[values.length - 1];
    const high = Math.max(...values);
    const low = Math.min(...values);

    const [, m, dd] = day.split("-");
    candles.push({
      label: `${dd}/${m}`,
      open,
      high,
      low,
      close,
    });
  }

  return candles;
}

function drawCandles(ctx: CanvasRenderingContext2D, candles: CandleData[], x: number, y: number, w: number, h: number) {
  if (candles.length === 0) return;

  // Chart background
  ctx.fillStyle = "rgba(10,13,20,0.72)";
  roundRect(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = "rgba(150,165,190,0.22)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const padL = 70, padR = 20, padT = 20, padB = 36;
  const cw = w - padL - padR;
  const ch = h - padT - padB;

  // Find min/max across all candles
  let min = Infinity, max = -Infinity;
  for (const c of candles) {
    min = Math.min(min, c.low);
    max = Math.max(max, c.high);
  }
  if (max === min) { max = min + 1; }
  // Add 10% padding
  const range = max - min;
  min -= range * 0.1;
  max += range * 0.1;

  const yFor = (v: number) => y + padT + ch - ((v - min) / (max - min)) * ch;

  // Grid lines (3 horizontal)
  ctx.strokeStyle = "rgba(150,165,190,0.12)";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#6B7488";
  ctx.font = font(500, 18);
  ctx.textAlign = "left";
  for (let i = 0; i <= 3; i++) {
    const v = min + (range * 1.2 * i) / 3;
    const yy = yFor(v);
    ctx.beginPath();
    ctx.moveTo(x + padL, yy);
    ctx.lineTo(x + w - padR, yy);
    ctx.stroke();
    const label = v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : `${Math.round(v)}`;
    ctx.fillText(label, x + 12, yy + 6);
  }

  // Draw candles
  const n = candles.length;
  const slotW = cw / n;
  const bodyW = Math.max(8, Math.min(40, slotW * 0.6));

  const upColor = "#26a69a";
  const downColor = "#ef5350";

  candles.forEach((c, i) => {
    const cx = x + padL + slotW * i + slotW / 2;
    const isUp = c.close >= c.open;
    const color = isUp ? upColor : downColor;

    // Wick (high-low line)
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, yFor(c.high));
    ctx.lineTo(cx, yFor(c.low));
    ctx.stroke();

    // Body (open-close rect)
    const yOpen = yFor(c.open);
    const yClose = yFor(c.close);
    const top = Math.min(yOpen, yClose);
    const height = Math.max(2, Math.abs(yClose - yOpen));
    ctx.fillStyle = color;
    ctx.fillRect(cx - bodyW / 2, top, bodyW, height);

    // Date label (show max 10 labels to avoid crowding)
    if (n <= 10 || i % Math.ceil(n / 10) === 0) {
      ctx.fillStyle = "#6B7488";
      ctx.font = font(500, 16);
      ctx.textAlign = "center";
      ctx.fillText(c.label, cx, y + h - 12);
      ctx.textAlign = "left";
    }
  });
  ctx.textAlign = "left";
}

export function drawUsageCard(d: UsageImageData): HTMLCanvasElement {
  const s = STR[d.lang];
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d")!;

  if (d.backgroundImage) {
    drawCover(ctx, d.backgroundImage);
    // Dark scrim for readability
    const scrim = ctx.createLinearGradient(0, 0, 0, H);
    scrim.addColorStop(0, "rgba(4,5,9,0.78)");
    scrim.addColorStop(0.55, "rgba(4,5,9,0.62)");
    scrim.addColorStop(1, "rgba(4,5,9,0.82)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H);
  } else {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0C0E14");
    bg.addColorStop(1, "#07080C");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(200, 120, 20, 200, 120, 520);
    glow.addColorStop(0, "rgba(110,168,254,0.14)");
    glow.addColorStop(1, "rgba(110,168,254,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
  }

  const pad = 72;
  const cardFill = d.backgroundImage ? "rgba(10,13,20,0.72)" : "#12161F";

  // Brand
  ctx.fillStyle = "#8B93A7";
  ctx.font = font(700, 24);
  ctx.fillText("T I P R O U T E R", pad, 108);

  // Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(800, 54);
  ctx.fillText(s.title, pad, 176);

  // User display name (OAuth), accent-colored identity line
  ctx.fillStyle = "#9DBCFF";
  ctx.font = font(600, 27);
  const un = d.userName.length > 32 ? d.userName.slice(0, 31) + "\u2026" : d.userName;
  ctx.fillText(un, pad, 222);

  // Period + key, right aligned (stacked, above title line)
  ctx.textAlign = "right";
  ctx.fillStyle = "#8B93A7";
  ctx.font = font(500, 23);
  ctx.fillText(d.period, W - pad, 100);
  ctx.fillStyle = "#C7CDDB";
  ctx.font = font(600, 26);
  const keyText = d.keyLabel.length > 24 ? d.keyLabel.slice(0, 23) + "…" : d.keyLabel;
  ctx.fillText(keyText, W - pad, 142);
  ctx.textAlign = "left";

  // Stat cards: 2x2 grid
  const cards = [
    { label: s.total, value: fmt(d.totalTokens) },
    { label: s.requests, value: fmt(d.requests) },
    { label: s.input, value: fmt(d.inputTokens) },
    { label: s.output, value: fmt(d.outputTokens) },
  ];
  const gap = 28;
  const cw = (W - pad * 2 - gap) / 2;
  const ch = 230;
  const top = 272;
  cards.forEach((c, i) => {
    const x = pad + (i % 2) * (cw + gap);
    const y = top + Math.floor(i / 2) * (ch + gap);
    roundRect(ctx, x, y, cw, ch, 20);
    ctx.fillStyle = cardFill;
    ctx.fill();
    ctx.strokeStyle = "rgba(150,165,190,0.22)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#9AA3B8";
    ctx.font = font(700, 22);
    ctx.fillText(c.label.toUpperCase(), x + 32, y + 54);
    let size = 58;
    ctx.font = font(800, size);
    while (ctx.measureText(c.value).width > cw - 64 && size > 28) {
      size -= 2;
      ctx.font = font(800, size);
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(c.value, x + 32, y + 148);
  });

  // Candlestick chart (if data available)
  if (d.candles && d.candles.length > 0) {
    ctx.fillStyle = "#9AA3B8";
    ctx.font = font(700, 22);
    ctx.fillText(s.chart.toUpperCase(), pad, 800);
    drawCandles(ctx, d.candles, pad, 830, W - pad * 2, 350);
  }

  // Bottom row: top model + success rate
  const by = 1220;
  ctx.fillStyle = "#9AA3B8";
  ctx.font = font(700, 22);
  ctx.fillText(s.topModel.toUpperCase(), pad, by);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(700, 40);
  const tm = d.topModel.length > 26 ? d.topModel.slice(0, 25) + "…" : d.topModel;
  ctx.fillText(tm, pad, by + 58);

  ctx.fillStyle = "#9AA3B8";
  ctx.font = font(700, 22);
  ctx.fillText(s.success.toUpperCase(), pad + 560, by);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = font(700, 40);
  ctx.fillText(`${Math.round(d.successRate)}%`, pad + 560, by + 58);

  if (d.truncated) {
    ctx.fillStyle = "#6B7488";
    ctx.font = font(400, 20);
    ctx.fillText("* " + s.partial, pad, by + 108);
  }

  // Watermark bottom-right
  ctx.textAlign = "right";
  ctx.fillStyle = "#6B7488";
  ctx.font = font(600, 22);
  ctx.fillText("tiprouter.my.id", W - pad, H - 48);
  ctx.textAlign = "left";

  return cv;
}

export function downloadUsageImage(d: UsageImageData) {
  const cv = drawUsageCard(d);
  const a = document.createElement("a");
  a.download = `tiprouter-usage-${Date.now()}.png`;
  a.href = cv.toDataURL("image/png");
  document.body.appendChild(a);
  a.click();
  a.remove();
}
