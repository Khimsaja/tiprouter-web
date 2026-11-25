import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { History, Receipt, Gift } from "lucide-react";
import { PageHead } from "../components/DashLayout";
import { api, rp, fmtDate, PACKAGES, type HistoryData } from "../lib/api";
import { useLang } from "../lib/i18n";

// Tab styles (scoped di halaman ini; .paytab cuma ada di halaman /buy).
const TABS_STYLE = `
.rw-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:4px}
.rw-tab{padding:9px 16px;border-radius:10px;border:1px solid rgba(125,211,252,.6);background:rgba(255,255,255,.6);color:var(--accent);font:inherit;font-size:14px;cursor:pointer;display:inline-flex;align-items:center;gap:7px}
.rw-tab:hover{border-color:var(--accent)}
.rw-tab.on{background:linear-gradient(90deg,#0ea5e9,#0284c7);color:#fff;border-color:transparent;font-weight:600;box-shadow:0 4px 14px rgba(14,165,233,.35)}
.rw-tab svg{flex:none}
`;

const pkgName = (key: string) => PACKAGES.find((p) => p.key === key)?.name ?? key;

function StatusChip({ status }: { status: string }) {
  const { t } = useLang();
  if (status === "minted") return <span className="chip ok">{t("Berhasil")}</span>;
  if (status === "paid" || status === "paid_late") return <span className="chip ok">{t("Dibayar")}</span>;
  if (status === "pending") return <span className="chip warn">{t("Menunggu")}</span>;
  if (status === "expired") return <span className="chip">{t("Kedaluwarsa")}</span>;
  if (status === "cancelled") return <span className="chip">{t("Dibatalkan")}</span>;
  return <span className="chip">{status}</span>;
}

function OrderList({ orders, empty }: { orders: HistoryData["orders"]; empty: ReactNode }) {
  const { t } = useLang();
  if (orders.length === 0) return <>{empty}</>;
  return (
    <div style={{ marginTop: 8 }}>
      {orders.map((o) => (
        <div key={o.id} className="row" style={{ padding: "14px 0" }}>
          <div>
            <p className="who">{pkgName(o.package_key)}</p>
            <p className="meta">
              {fmtDate(o.created_at)}
              {o.order_code ? ` · ${o.order_code}` : ""}
              {o.promo_code ? ` · ${o.promo_code}` : ""}
            </p>
          </div>
          <div className="right" style={{ textAlign: "right", flex: "none" }}>
            <p style={{ fontWeight: 800 }}>
              {o.discount_idr > 0 && (
                <span className="muted" style={{ textDecoration: "line-through", fontWeight: 400, marginRight: 8, fontSize: 13 }}>
                  {rp(o.base_amount)}
                </span>
              )}
              {rp(o.amount)}
            </p>
            <p style={{ marginTop: 4 }}>
              <StatusChip status={o.status} />
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Riwayat() {
  const { t } = useLang();
  const [tab, setTab] = useState<"beli" | "extend" | "gacha">("beli");
  const [data, setData] = useState<HistoryData | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .history()
      .then((d) => {
        if (alive) setData({ orders: d.orders ?? [], gacha: d.gacha ?? [] });
      })
      .catch(() => {
        if (alive) setErr(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const buys = (data?.orders ?? []).filter((o) => !o.extend_key_id);
  const exts = (data?.orders ?? []).filter((o) => !!o.extend_key_id);

  return (
    <>
      <PageHead title={t("Riwayat")} sub={t("Semua pembelian dan gacha kamu, di satu tempat.")} />
      <style>{TABS_STYLE}</style>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="rw-tabs">
          <button type="button" className={"rw-tab" + (tab === "beli" ? " on" : "")} onClick={() => setTab("beli")}>
            <Receipt size={14} />
            {t("Pembelian")}
          </button>
          <button type="button" className={"rw-tab" + (tab === "extend" ? " on" : "")} onClick={() => setTab("extend")}>
            <History size={14} />
            {t("Perpanjangan")}
          </button>
          <button type="button" className={"rw-tab" + (tab === "gacha" ? " on" : "")} onClick={() => setTab("gacha")}>
            <Gift size={14} />
            {t("Gacha Bansos")}
          </button>
        </div>

        {!data && !err && <p style={{ marginTop: 16 }}>{t("Mengambil riwayat.")}</p>}
        {err && <p style={{ marginTop: 16 }}>{t("Gagal mengambil riwayat. Coba muat ulang halaman.")}</p>}

        {data && (tab === "beli" || tab === "extend") && (
          <OrderList
            orders={tab === "beli" ? buys : exts}
            empty={
              tab === "beli" ? (
                <p className="muted" style={{ marginTop: 12 }}>
                  {t("Belum ada pembelian.")}{" "}
                  <Link to="/buy" style={{ textDecoration: "underline" }}>
                    {t("Beli API key")}
                  </Link>
                </p>
              ) : (
                <p className="muted" style={{ marginTop: 12 }}>
                  {t("Belum ada perpanjangan. Perpanjang key-mu dari halaman")}{" "}
                  <Link to="/buy" style={{ textDecoration: "underline" }}>
                    {t("Beli")}
                  </Link>
                  .
                </p>
              )
            }
          />
        )}

        {data && tab === "gacha" && (
          <div style={{ marginTop: 8 }}>
            {data.gacha.length === 0 && (
              <p className="muted" style={{ marginTop: 12 }}>
                {t("Belum pernah gacha.")}{" "}
                <Link to="/gacha" style={{ textDecoration: "underline" }}>
                  {t("Putar gacha")}
                </Link>
              </p>
            )}
            {data.gacha.map((g, i) => (
              <div key={i} className="row" style={{ padding: "14px 0" }}>
                <div>
                  <p className="who">{t("{n} jam", { n: g.duration_hours })}</p>
                  <p className="meta">
                    {t("Didapat")}: {fmtDate(g.created_at)} · {t("Berlaku sampai")}: {fmtDate(g.expires_at)}
                  </p>
                </div>
                <div className="right" style={{ flex: "none" }}>
                  <History size={16} className="muted" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
