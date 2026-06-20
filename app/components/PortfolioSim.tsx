import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  PieChart,
  TrendingUp,
  TrendingDown,
  Play,
  Save,
  RefreshCw,
  Trophy,
} from "lucide-react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type { Screen } from "./types";

interface PortfolioSimProps {
  navigate: (screen: Screen) => void;
  addExp: (amount: number, reason?: string) => void;
}

const ASSETS = [
  {
    id: "saham_blue",
    name: "Saham Blue Chip",
    expectedReturn: 0.15,
    risk: 0.2,
    color: "oklch(0.72 0.19 145)",
  },
  {
    id: "saham_growth",
    name: "Saham Growth",
    expectedReturn: 0.25,
    risk: 0.35,
    color: "oklch(0.60 0.20 265)",
  },
  {
    id: "reksa_saham",
    name: "Reksa Dana Saham",
    expectedReturn: 0.12,
    risk: 0.18,
    color: "oklch(0.80 0.17 75)",
  },
  {
    id: "obligasi",
    name: "Obligasi / ORI",
    expectedReturn: 0.065,
    risk: 0.05,
    color: "oklch(0.65 0.18 310)",
  },
  {
    id: "pasar_uang",
    name: "Reksa Dana Pasar Uang",
    expectedReturn: 0.055,
    risk: 0.01,
    color: "oklch(0.70 0.20 40)",
  },
];

const INITIAL_CAPITAL = 10_000_000;

function simulatePortfolio(
  allocations: Record<string, number>,
  months: number,
) {
  const data = [{ month: 0, value: INITIAL_CAPITAL }];
  let currentValue = INITIAL_CAPITAL;

  for (let m = 1; m <= months; m++) {
    let monthlyReturn = 0;
    for (const asset of ASSETS) {
      const alloc = (allocations[asset.id] ?? 0) / 100;
      const monthlyRate = asset.expectedReturn / 12;
      const noise = ((Math.random() - 0.5) * asset.risk) / 12;
      monthlyReturn += alloc * (monthlyRate + noise);
    }
    currentValue = currentValue * (1 + monthlyReturn);
    if (m % 3 === 0) data.push({ month: m, value: Math.round(currentValue) });
  }

  return data;
}

export function PortfolioSim({ navigate, addExp }: PortfolioSimProps) {
  const [step, setStep] = useState<"setup" | "result">("setup");
  const [allocations, setAllocations] = useState<Record<string, number>>({
    saham_blue: 30,
    saham_growth: 20,
    reksa_saham: 20,
    obligasi: 20,
    pasar_uang: 10,
  });
  const [horizon, setHorizon] = useState(12);
  const [simData, setSimData] = useState<{ month: number; value: number }[]>(
    [],
  );
  const [expClaimed, setExpClaimed] = useState(false);

  const totalAlloc = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = 100 - totalAlloc;

  const runSim = () => {
    const data = simulatePortfolio(allocations, horizon);
    setSimData(data);
    setStep("result");
  };

  const finalValue =
    simData.length > 0 ? simData[simData.length - 1].value : INITIAL_CAPITAL;
  const totalReturn = finalValue - INITIAL_CAPITAL;
  const returnPct = (totalReturn / INITIAL_CAPITAL) * 100;

  const pieData = ASSETS.map((a) => ({
    name: a.name,
    value: allocations[a.id] ?? 0,
    color: a.color,
  })).filter((d) => d.value > 0);

  const portfolioRisk = ASSETS.reduce(
    (sum, a) => sum + ((allocations[a.id] ?? 0) / 100) * a.risk,
    0,
  );
  const riskLabel =
    portfolioRisk < 0.08
      ? "Konservatif"
      : portfolioRisk < 0.18
        ? "Moderat"
        : "Agresif";
  const riskColor =
    portfolioRisk < 0.08
      ? "oklch(0.72 0.19 145)"
      : portfolioRisk < 0.18
        ? "oklch(0.80 0.17 75)"
        : "oklch(0.55 0.22 25)";

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
        <div>
          <p className="text-muted-foreground" style={{ fontSize: "0.72rem" }}>
            Challenge
          </p>
          <p
            className="text-foreground"
            style={{ fontWeight: 700, fontSize: "0.9rem" }}
          >
            Simulasi Portofolio
          </p>
        </div>
        {step === "result" && (
          <button
            onClick={() => setStep("setup")}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: "var(--muted)",
              color: "var(--foreground)",
              fontWeight: 600,
              fontSize: "0.8rem",
            }}
          >
            <RefreshCw size={13} /> Atur Ulang
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {step === "setup" ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-5 space-y-5"
          >
            {/* Capital info */}
            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "oklch(0.72 0.19 145 / 0.08)",
                border: "1px solid oklch(0.72 0.19 145 / 0.25)",
              }}
            >
              <div className="text-3xl">💰</div>
              <div>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.78rem" }}
                >
                  Modal Simulasi
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    fontSize: "1.3rem",
                    color: "oklch(0.72 0.19 145)",
                  }}
                >
                  Rp10.000.000
                </p>
              </div>
            </div>

            {/* Horizon selector */}
            <div>
              <p
                className="text-foreground mb-3"
                style={{ fontWeight: 700, fontSize: "0.9rem" }}
              >
                Horizon Investasi
              </p>
              <div className="flex gap-2 flex-wrap">
                {[3, 6, 12, 24, 36].map((m) => (
                  <button
                    key={m}
                    onClick={() => setHorizon(m)}
                    className="px-4 py-2 rounded-xl transition-all"
                    style={{
                      background:
                        horizon === m ? "oklch(0.72 0.19 145)" : "var(--muted)",
                      color:
                        horizon === m
                          ? "oklch(0.12 0.02 145)"
                          : "var(--muted-foreground)",
                      fontWeight: 700,
                      fontSize: "0.82rem",
                    }}
                  >
                    {m} bln
                  </button>
                ))}
              </div>
            </div>

            {/* Allocation sliders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Alokasi Aset
                </p>
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color:
                      Math.abs(remaining) < 1
                        ? "oklch(0.72 0.19 145)"
                        : remaining < 0
                          ? "oklch(0.55 0.22 25)"
                          : "oklch(0.80 0.17 75)",
                  }}
                >
                  {remaining > 0
                    ? `Sisa ${remaining}%`
                    : remaining < 0
                      ? `Kelebihan ${Math.abs(remaining)}%`
                      : "Alokasi Sempurna ✓"}
                </span>
              </div>

              <div className="space-y-4">
                {ASSETS.map((asset) => (
                  <div key={asset.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: asset.color }}
                        />
                        <span
                          className="text-foreground"
                          style={{ fontSize: "0.875rem", fontWeight: 600 }}
                        >
                          {asset.name}
                        </span>
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          color: asset.color,
                          fontSize: "0.95rem",
                        }}
                      >
                        {allocations[asset.id] ?? 0}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={allocations[asset.id] ?? 0}
                      onChange={(e) =>
                        setAllocations((prev) => ({
                          ...prev,
                          [asset.id]: Number(e.target.value),
                        }))
                      }
                      className="w-full h-2 rounded-full appearance-none cursor-pointer"
                      style={{
                        accentColor: asset.color,
                        background: `linear-gradient(to right, ${asset.color} ${allocations[asset.id] ?? 0}%, var(--muted) ${allocations[asset.id] ?? 0}%)`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "0.68rem" }}
                      >
                        Return ~{(asset.expectedReturn * 100).toFixed(1)}%/thn
                      </span>
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "0.68rem" }}
                      >
                        Risiko{" "}
                        {asset.risk <= 0.05
                          ? "Rendah"
                          : asset.risk <= 0.2
                            ? "Menengah"
                            : "Tinggi"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk profile */}
            <div
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: `${riskColor}15`,
                border: `1px solid ${riskColor}30`,
              }}
            >
              <PieChart size={18} style={{ color: riskColor, flexShrink: 0 }} />
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    color: riskColor,
                    fontSize: "0.85rem",
                  }}
                >
                  Profil Risiko: {riskLabel}
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.75rem" }}
                >
                  Volatilitas portofolio ~{(portfolioRisk * 100).toFixed(0)}
                  %/tahun
                </p>
              </div>
            </div>

            <button
              onClick={runSim}
              disabled={Math.abs(remaining) > 5}
              className="w-full py-4 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{
                background:
                  Math.abs(remaining) <= 5
                    ? "oklch(0.72 0.19 145)"
                    : "var(--muted)",
                color:
                  Math.abs(remaining) <= 5
                    ? "oklch(0.12 0.02 145)"
                    : "var(--muted-foreground)",
                fontWeight: 700,
                opacity: Math.abs(remaining) > 5 ? 0.6 : 1,
              }}
            >
              <Play size={18} /> Jalankan Simulasi
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="p-5 space-y-5"
          >
            {/* Result header */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: `${totalReturn >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)"}/0.08`,
                border: `1px solid ${totalReturn >= 0 ? "oklch(0.72 0.19 145)" : "oklch(0.55 0.22 25)"}/0.3`,
              }}
            >
              <p
                className="text-muted-foreground mb-1"
                style={{ fontSize: "0.78rem" }}
              >
                Nilai Akhir Portofolio ({horizon} Bulan)
              </p>
              <p
                style={{
                  fontWeight: 900,
                  fontSize: "1.75rem",
                  color:
                    totalReturn >= 0
                      ? "oklch(0.72 0.19 145)"
                      : "oklch(0.55 0.22 25)",
                }}
              >
                Rp{finalValue.toLocaleString("id")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {totalReturn >= 0 ? (
                  <TrendingUp
                    size={16}
                    style={{ color: "oklch(0.72 0.19 145)" }}
                  />
                ) : (
                  <TrendingDown
                    size={16}
                    style={{ color: "oklch(0.55 0.22 25)" }}
                  />
                )}
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      totalReturn >= 0
                        ? "oklch(0.72 0.19 145)"
                        : "oklch(0.55 0.22 25)",
                    fontSize: "0.9rem",
                  }}
                >
                  {totalReturn >= 0 ? "+" : ""}Rp
                  {Math.abs(totalReturn).toLocaleString("id")} (
                  {returnPct >= 0 ? "+" : ""}
                  {returnPct.toFixed(2)}%)
                </span>
              </div>
            </div>

            {/* Growth chart */}
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
                Pertumbuhan Portofolio
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={simData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.03 255 / 0.3)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "oklch(0.58 0.02 255)" }}
                    tickFormatter={(v) => `${v}bln`}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "oklch(0.58 0.02 255)" }}
                    width={50}
                    tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.025 255)",
                      border: "1px solid oklch(0.28 0.03 255 / 0.6)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(v) => [
                      `Rp ${Number(v).toLocaleString("id")}`,
                      "Nilai",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="oklch(0.72 0.19 145)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart */}
            <div className="grid grid-cols-2 gap-4">
              <div
                className="rounded-xl p-3"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <p
                  className="text-foreground mb-2"
                  style={{ fontWeight: 700, fontSize: "0.8rem" }}
                >
                  Alokasi Aset
                </p>
                <ResponsiveContainer width="100%" height={120}>
                  <RechartsPie>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      innerRadius={25}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.14 0.025 255)",
                        border: "1px solid oklch(0.28 0.03 255)",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                        color: "var(--foreground)",
                      }}
                      formatter={(v) => [`${v}%`, ""]}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
              <div
                className="rounded-xl p-3 flex flex-col justify-center"
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="space-y-1.5">
                  {pieData.map((d) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: d.color }}
                      />
                      <span
                        style={{
                          fontSize: "0.68rem",
                          color: "var(--foreground)",
                          flex: 1,
                        }}
                      >
                        {d.name}
                      </span>
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: d.color,
                        }}
                      >
                        {d.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Profil Risiko", value: riskLabel, color: riskColor },
                {
                  label: "Horizon",
                  value: `${horizon} bulan`,
                  color: "oklch(0.60 0.20 265)",
                },
                {
                  label: "Return/Tahun (est.)",
                  value: `${((Math.pow(finalValue / INITIAL_CAPITAL, 12 / horizon) - 1) * 100).toFixed(1)}%`,
                  color: "oklch(0.72 0.19 145)",
                },
                {
                  label: "Modal Awal",
                  value: "Rp10 Juta",
                  color: "oklch(0.80 0.17 75)",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl p-3"
                  style={{ background: "var(--muted)" }}
                >
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.7rem" }}
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

            {/* Claim EXP */}
            {!expClaimed ? (
              <button
                onClick={() => {
                  setExpClaimed(true);
                  addExp(300, "Simulasi Portofolio Selesai");
                }}
                className="w-full py-3.5 rounded-xl flex items-center justify-center gap-2"
                style={{
                  background: "oklch(0.72 0.19 145)",
                  color: "oklch(0.12 0.02 145)",
                  fontWeight: 700,
                }}
              >
                <Trophy size={18} /> Klaim +300 EXP!
              </button>
            ) : (
              <div
                className="py-3 rounded-xl text-center"
                style={{
                  background: "oklch(0.72 0.19 145 / 0.1)",
                  border: "1px solid oklch(0.72 0.19 145 / 0.3)",
                  color: "oklch(0.72 0.19 145)",
                  fontWeight: 700,
                }}
              >
                ✅ +300 EXP berhasil diklaim! Simpan hasil simulasi ini untuk
                referensimu.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
