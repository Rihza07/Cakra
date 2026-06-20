import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  BarChart2,
  Trophy,
  ChevronRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { Screen } from "./types";

interface Challenge15DayProps {
  navigate: (screen: Screen) => void;
  challengeDay: number;
  setChallengeDay: React.Dispatch<React.SetStateAction<number>>;
  addExp: (amount: number, reason?: string) => void;
}

interface StockHolding {
  symbol: string;
  shares: number;
  avgPrice: number;
}

const STOCKS = [
  { symbol: "BBCA", name: "Bank Central Asia", key: "bbca" as const },
  { symbol: "TLKM", name: "Telkom Indonesia", key: "tlkm" as const },
  { symbol: "ASII", name: "Astra International", key: "asii" as const },
  { symbol: "GOTO", name: "GoTo Group", key: "goto" as const },
];

export function Challenge15Day({
  navigate,
  challengeDay,
  setChallengeDay,
  addExp,
}: Challenge15DayProps) {
  const [started, setStarted] = useState(challengeDay > 0);
  const [currentDay, setCurrentDay] = useState(
    challengeDay === 0 ? 1 : Math.min(challengeDay, 15),
  );
  const [cash, setCash] = useState(10_000_000);
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [action, setAction] = useState<"buy" | "sell">("buy");
  const [completed, setCompleted] = useState(challengeDay >= 15);
  const [expClaimed, setExpClaimed] = useState(false);

  const getPrice = (key: (typeof STOCKS)[0]["key"]) => {
    const stock = stocks.find(
      (s) => s.symbol.replace(".JK", "").toLowerCase() === key,
    );

    return stock?.regularMarketPrice ?? 0;
  };
  const getPrevPrice = (key: (typeof STOCKS)[0]["key"]) => getPrice(key);

  const portfolioValue = holdings.reduce((sum, h) => {
    const st = STOCKS.find((s) => s.symbol === h.symbol);
    if (!st) return sum;
    return sum + h.shares * getPrice(st.key);
  }, 0);

  const totalValue = cash + portfolioValue;
  const pnl = totalValue - 10_000_000;
  const pnlPct = (pnl / 10_000_000) * 100;

  const handleTrade = () => {
    const price = getPrice(selectedStock.key);
    const total = price * qty * 100;
    if (action === "buy") {
      if (total > cash) {
        setLog((l) => [
          `Hari ${currentDay}: Saldo tidak cukup untuk beli ${qty} lot ${selectedStock.symbol}`,
          ...l,
        ]);
        return;
      }
      setCash((c) => c - total);
      setHoldings((prev) => {
        const existing = prev.find((h) => h.symbol === selectedStock.symbol);
        if (existing) {
          return prev.map((h) =>
            h.symbol === selectedStock.symbol
              ? {
                  ...h,
                  shares: h.shares + qty * 100,
                  avgPrice:
                    (h.avgPrice * h.shares + price * qty * 100) /
                    (h.shares + qty * 100),
                }
              : h,
          );
        }
        return [
          ...prev,
          { symbol: selectedStock.symbol, shares: qty * 100, avgPrice: price },
        ];
      });
      setLog((l) => [
        `Hari ${currentDay}: BUY ${qty} lot ${selectedStock.symbol} @ Rp${price.toLocaleString("id")}`,
        ...l,
      ]);
    } else {
      const hold = holdings.find((h) => h.symbol === selectedStock.symbol);
      if (!hold || hold.shares < qty * 100) {
        setLog((l) => [
          `Hari ${currentDay}: Saham ${selectedStock.symbol} tidak cukup untuk dijual`,
          ...l,
        ]);
        return;
      }
      setCash((c) => c + total);
      setHoldings((prev) =>
        prev
          .map((h) =>
            h.symbol === selectedStock.symbol
              ? { ...h, shares: h.shares - qty * 100 }
              : h,
          )
          .filter((h) => h.shares > 0),
      );
      setLog((l) => [
        `Hari ${currentDay}: SELL ${qty} lot ${selectedStock.symbol} @ Rp${price.toLocaleString("id")}`,
        ...l,
      ]);
    }
  };

  const advanceDay = () => {
    if (currentDay < 15) {
      const next = currentDay + 1;
      setCurrentDay(next);
      setChallengeDay(next);
      if (next === 15) setCompleted(true);
    }
  };

  const [chartData, setChartData] = useState([]);

  const [selectedStock, setSelectedStock] = useState(STOCKS[0]);

  const loadHistory = async () => {
    const res = await fetch(
      `/api/stocks/history?symbol=${selectedStock.symbol}.JK`,
    );
    const data = await res.json();

    setChartData(
      data.map((item: any) => ({
        time: new Date(item.created_at).toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        price: Number(item.price),
      })),
    );
  };

  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [selectedStock]);

  useEffect(() => {
    console.log("STOCKS:", stocks);
  }, [stocks]);

  const fetchStocks = async () => {
    try {
      const res = await fetch("/api/stocks");

      const data = await res.json();

      console.log("DATA HISTORY:", data);

      setStocks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const claimReward = () => {
    if (expClaimed) return;
    setExpClaimed(true);
    addExp(500, "Challenge Investasi 15 Hari Selesai!");
    setChallengeDay(15);
  };

  if (!started) {
    return (
      <div
        className="min-h-screen p-5 pb-24 lg:pb-8"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={() => navigate("challenge")}
          className="flex items-center gap-2 mb-6"
          style={{ color: "var(--muted-foreground)", fontWeight: 600 }}
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-5">📈</div>
          <h1
            className="text-foreground mb-3"
            style={{ fontWeight: 800, fontSize: "1.75rem" }}
          >
            Challenge Investasi 15 Hari
          </h1>
          <p className="text-muted-foreground mb-8" style={{ lineHeight: 1.7 }}>
            Simulasikan investasi saham selama 15 hari dengan modal awal{" "}
            <strong className="text-foreground">Rp10.000.000</strong>. Beli dan
            jual saham setiap hari, kelola portofoliomu, dan lihat hasilnya di
            hari ke-15!
          </p>
          <div
            className="rounded-xl p-4 mb-6 text-left space-y-2"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            {[
              "Modal awal: Rp10.000.000 virtual",
              "Saham tersedia: BBCA, TLKM, ASII, GOTO",
              "Perdagangan: 1 lot = 100 lembar saham",
              "Reward: +500 EXP setelah selesai",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: "oklch(0.72 0.19 145)" }}
                />
                <span
                  style={{ fontSize: "0.875rem", color: "var(--foreground)" }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setStarted(true);
              setChallengeDay(1);
            }}
            className="w-full py-4 rounded-xl text-primary-foreground flex items-center justify-center gap-2"
            style={{ background: "oklch(0.72 0.19 145)", fontWeight: 700 }}
          >
            Mulai Challenge <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (completed && currentDay === 15) {
    return (
      <div
        className="min-h-screen p-5 pb-24 lg:pb-8"
        style={{ background: "var(--background)" }}
      >
        <button
          onClick={() => navigate("challenge")}
          className="flex items-center gap-2 mb-6"
          style={{ color: "var(--muted-foreground)", fontWeight: 600 }}
        >
          <ArrowLeft size={18} /> Kembali
        </button>
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h1
            className="text-foreground mb-2"
            style={{ fontWeight: 800, fontSize: "1.75rem" }}
          >
            Challenge Selesai!
          </h1>
          <p className="text-muted-foreground mb-6">
            Hasil investasi 15 hari simulasimu
          </p>
          <div
            className="rounded-2xl p-5 mb-5"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                {
                  label: "Modal Awal",
                  value: "Rp10.000.000",
                  color: "var(--foreground)",
                },
                {
                  label: "Nilai Akhir",
                  value: `Rp${totalValue.toLocaleString("id")}`,
                  color: "oklch(0.72 0.19 145)",
                },
                {
                  label: "P&L",
                  value: `${pnl >= 0 ? "+" : ""}Rp${Math.abs(pnl).toLocaleString("id")}`,
                  color:
                    pnl >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)",
                },
                {
                  label: "Return",
                  value: `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`,
                  color:
                    pnlPct >= 0
                      ? "oklch(0.72 0.19 145)"
                      : "oklch(0.55 0.22 25)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3"
                  style={{ background: "var(--muted)" }}
                >
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.72rem", marginBottom: "4px" }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      color: item.color,
                    }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
            <p
              className="text-muted-foreground"
              style={{ fontSize: "0.82rem", lineHeight: 1.6 }}
            >
              {pnlPct >= 10
                ? "🎉 Luar biasa! Return di atas 10% — kamu punya bakat investasi!"
                : pnlPct >= 0
                  ? "👍 Bagus! Portofoliomu positif. Terus asah strategi investasimu!"
                  : "📚 Belum positif, tapi ini pengalaman berharga! Pelajari strateginya dan coba lagi."}
            </p>
          </div>
          {!expClaimed ? (
            <button
              onClick={claimReward}
              className="w-full py-3.5 rounded-xl text-primary-foreground"
              style={{ background: "oklch(0.72 0.19 145)", fontWeight: 700 }}
            >
              🏅 Klaim +500 EXP!
            </button>
          ) : (
            <div
              className="py-3.5 rounded-xl text-center"
              style={{
                background: "oklch(0.72 0.19 145 / 0.1)",
                border: "1px solid oklch(0.72 0.19 145 / 0.3)",
                color: "oklch(0.72 0.19 145)",
                fontWeight: 700,
              }}
            >
              ✅ +500 EXP diklaim!
            </div>
          )}
        </div>
      </div>
    );
  }

  const stockColor = (key: (typeof STOCKS)[0]["key"]) => {
    const diff = getPrice(key) - getPrevPrice(key);
    return diff >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)";
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div
        className="sticky top-0 z-20 px-4 pt-4 pb-3 flex items-center gap-3"
        style={{
          background: "oklch(0.10 0.025 255 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <button
          onClick={() => navigate("challenge")}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "var(--muted)" }}
        >
          <ArrowLeft size={18} className="text-foreground" />
        </button>
        <div className="flex-1">
          <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
            Challenge Investasi
          </p>
          <p
            className="text-foreground"
            style={{ fontWeight: 700, fontSize: "0.9rem" }}
          >
            Hari {currentDay} dari 15
          </p>
        </div>
        <div className="text-right">
          <p
            style={{
              fontWeight: 800,
              color: pnl >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)",
              fontSize: "0.85rem",
            }}
          >
            {pnlPct >= 0 ? "+" : ""}
            {pnlPct.toFixed(2)}%
          </p>
          <p className="text-muted-foreground" style={{ fontSize: "0.7rem" }}>
            Total Return
          </p>
        </div>
      </div>

      {/* Day progress */}
      <div className="px-5 pt-4 pb-0">
        <div
          className="h-1.5 rounded-full overflow-hidden"
          style={{ background: "var(--muted)" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${(currentDay / 15) * 100}%`,
              background: "oklch(0.72 0.19 145)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {[1, 5, 10, 15].map((d) => (
            <span
              key={d}
              style={{
                fontSize: "0.65rem",
                color:
                  d <= currentDay
                    ? "oklch(0.72 0.19 145)"
                    : "var(--muted-foreground)",
              }}
            >
              D{d}
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Portfolio summary */}
        <div
          className="rounded-2xl p-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Saldo Kas",
                value: `Rp${Math.round(cash / 1000)}K`,
                color: "oklch(0.80 0.17 75)",
              },
              {
                label: "Nilai Saham",
                value: `Rp${Math.round(portfolioValue / 1000)}K`,
                color: "oklch(0.60 0.20 265)",
              },
              {
                label: "Total Nilai",
                value: `Rp${Math.round(totalValue / 1000)}K`,
                color:
                  pnl >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)",
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: item.color,
                  }}
                >
                  {item.value}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.65rem" }}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stock prices */}
        <div>
          <p
            className="text-muted-foreground mb-2"
            style={{ fontSize: "0.8rem", fontWeight: 600 }}
          >
            Harga Saham Hari {currentDay}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {STOCKS.map((st) => {
              const price = getPrice(st.key);
              const prev = getPrevPrice(st.key);
              const diff = price - prev;
              const diffPct = (diff / prev) * 100;
              const isUp = diff >= 0;
              return (
                <button
                  key={st.symbol}
                  onClick={() => setSelectedStock(st)}
                  className="rounded-xl p-3 text-left transition-all"
                  style={{
                    background:
                      selectedStock.symbol === st.symbol
                        ? "oklch(0.72 0.19 145 / 0.1)"
                        : "var(--muted)",
                    border: `1px solid ${selectedStock.symbol === st.symbol ? "oklch(0.72 0.19 145 / 0.35)" : "transparent"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "0.82rem",
                        color: "var(--foreground)",
                      }}
                    >
                      {st.symbol}
                    </span>
                    <div
                      className="flex items-center gap-0.5"
                      style={{
                        color: isUp
                          ? "oklch(0.72 0.19 145)"
                          : "oklch(0.55 0.22 25)",
                      }}
                    >
                      {isUp ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>
                        {diffPct >= 0 ? "+" : ""}
                        {diffPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      color: stockColor(st.key),
                    }}
                  >
                    Rp{price.toLocaleString("id")}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {st.name}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mini chart */}
        <div
          className="rounded-xl p-3"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-muted-foreground mb-2"
            style={{ fontSize: "0.78rem", fontWeight: 600 }}
          >
            {selectedStock.symbol} — {currentDay} hari
          </p>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <XAxis dataKey="time" />
                <Line type="monotone" dataKey="price" stroke="#22c55e" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[60px] flex items-center justify-center">
              Loading chart...
            </div>
          )}
        </div>

        {/* Trade panel */}
        <div
          className="rounded-xl p-4"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-foreground mb-3"
            style={{ fontWeight: 700, fontSize: "0.9rem" }}
          >
            Transaksi Hari {currentDay}
          </p>
          <div className="flex gap-2 mb-3">
            {(["buy", "sell"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                className="flex-1 py-2 rounded-lg"
                style={{
                  background:
                    action === a
                      ? a === "buy"
                        ? "oklch(0.72 0.19 145)"
                        : "oklch(0.55 0.22 25)"
                      : "var(--muted)",
                  color:
                    action === a
                      ? a === "buy"
                        ? "oklch(0.12 0.02 145)"
                        : "white"
                      : "var(--muted-foreground)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                }}
              >
                {a === "buy" ? "BUY" : "SELL"}
              </button>
            ))}
          </div>

          <div className="flex gap-2 mb-3 flex-wrap">
            {STOCKS.map((st) => (
              <button
                key={st.symbol}
                onClick={() => setSelectedStock(st)}
                className="px-2.5 py-1 rounded-lg"
                style={{
                  background:
                    selectedStock.symbol === st.symbol
                      ? "oklch(0.60 0.20 265 / 0.2)"
                      : "var(--muted)",
                  color:
                    selectedStock.symbol === st.symbol
                      ? "oklch(0.60 0.20 265)"
                      : "var(--muted-foreground)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  border:
                    selectedStock.symbol === st.symbol
                      ? "1px solid oklch(0.60 0.20 265 / 0.4)"
                      : "1px solid transparent",
                }}
              >
                {st.symbol}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-3">
            <label
              className="text-muted-foreground"
              style={{ fontSize: "0.82rem", flexShrink: 0 }}
            >
              Jumlah Lot:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--muted)",
                  color: "var(--foreground)",
                  fontWeight: 700,
                }}
              >
                -
              </button>
              <span
                style={{
                  fontWeight: 800,
                  color: "var(--foreground)",
                  minWidth: "24px",
                  textAlign: "center",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: "var(--muted)",
                  color: "var(--foreground)",
                  fontWeight: 700,
                }}
              >
                +
              </button>
            </div>
            <span
              className="text-muted-foreground ml-auto"
              style={{ fontSize: "0.78rem" }}
            >
              ≈ Rp
              {(getPrice(selectedStock.key) * qty * 100).toLocaleString("id")}
            </span>
          </div>

          <button
            onClick={handleTrade}
            className="w-full py-3 rounded-xl transition-all hover:opacity-90"
            style={{
              background:
                action === "buy"
                  ? "oklch(0.72 0.19 145)"
                  : "oklch(0.55 0.22 25)",
              color: action === "buy" ? "oklch(0.12 0.02 145)" : "white",
              fontWeight: 700,
            }}
          >
            {action === "buy"
              ? `BUY ${qty} lot ${selectedStock.symbol}`
              : `SELL ${qty} lot ${selectedStock.symbol}`}
          </button>
        </div>

        {/* Holdings */}
        {holdings.length > 0 && (
          <div
            className="rounded-xl p-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <p
              className="text-foreground mb-3"
              style={{ fontWeight: 700, fontSize: "0.875rem" }}
            >
              Portofolio Sahamku
            </p>
            <div className="space-y-2">
              {holdings.map((h) => {
                const st = STOCKS.find((s) => s.symbol === h.symbol)!;
                const currPrice = getPrice(st.key);
                const val = h.shares * currPrice;
                const pnlH = (currPrice - h.avgPrice) * h.shares;
                return (
                  <div
                    key={h.symbol}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <div>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "var(--foreground)",
                        }}
                      >
                        {h.symbol}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: "0.72rem" }}
                      >
                        {h.shares / 100} lot @ Rp
                        {h.avgPrice.toLocaleString("id")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "var(--foreground)",
                        }}
                      >
                        Rp{Math.round(val / 1000)}K
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color:
                            pnlH >= 0
                              ? "oklch(0.72 0.19 145)"
                              : "oklch(0.55 0.22 25)",
                        }}
                      >
                        {pnlH >= 0 ? "+" : ""}Rp{Math.round(pnlH / 1000)}K
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Log */}
        {log.length > 0 && (
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--muted)" }}
          >
            <p
              className="text-muted-foreground mb-2"
              style={{ fontSize: "0.75rem", fontWeight: 600 }}
            >
              Log Transaksi
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {log.map((entry, i) => (
                <p
                  key={i}
                  style={{ fontSize: "0.72rem", color: "var(--foreground)" }}
                >
                  {entry}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
