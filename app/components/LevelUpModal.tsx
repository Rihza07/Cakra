import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Star, Trophy, Unlock } from "lucide-react";
import canvasConfetti from "canvas-confetti";

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

const LEVEL_NAMES: Record<number, string> = {
  1: "Pemula Finansial",
  2: "Pelajar Cerdas",
  3: "Analis Muda",
  4: "Investor Terampil",
  5: "Ahli Portofolio",
  6: "Master Pasar Modal",
};

export function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const end = Date.now() + 2500;
    const colors = ["#22c55e", "#f59e0b", "#3b82f6", "#ec4899"];
    const frame = () => {
      canvasConfetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      canvasConfetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const unlockedContent =
    level === 2
      ? "Modul Level 2: Pasar Modal & Reksa Dana"
      : level === 3
        ? "Modul Level 3: Analisis Saham Mendalam"
        : level === 4
          ? "Modul Level 4: Strategi Investasi Expert"
          : "Konten eksklusif baru telah terbuka!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 15 }}
        className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-48 h-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.19 145 / 0.15), transparent)",
            }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, oklch(0.80 0.17 75 / 0.15), transparent)",
            }}
          />
        </div>

        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-7xl mb-4"
        >
          🎉
        </motion.div>

        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
          style={{
            background: "oklch(0.72 0.19 145 / 0.15)",
            border: "1px solid oklch(0.72 0.19 145 / 0.3)",
          }}
        >
          <Trophy size={14} style={{ color: "var(--exp-color)" }} />
          <span
            style={{
              color: "var(--exp-color)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            LEVEL UP!
          </span>
        </div>

        <h2
          className="text-foreground mb-1"
          style={{ fontSize: "2rem", fontWeight: 800 }}
        >
          Level {level}
        </h2>
        <p
          style={{
            color: "oklch(0.72 0.19 145)",
            fontWeight: 600,
            marginBottom: "1rem",
          }}
        >
          {LEVEL_NAMES[level] ?? "Legenda Investasi"}
        </p>

        <div
          className="rounded-xl p-4 mb-6"
          style={{
            background: "oklch(0.80 0.17 75 / 0.1)",
            border: "1px solid oklch(0.80 0.17 75 / 0.25)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Unlock size={16} style={{ color: "var(--exp-color)" }} />
            <span
              style={{
                color: "var(--exp-color)",
                fontWeight: 700,
                fontSize: "0.8rem",
              }}
            >
              KONTEN BARU TERBUKA
            </span>
          </div>
          <p className="text-foreground" style={{ fontSize: "0.85rem" }}>
            {unlockedContent}
          </p>
        </div>

        <div className="flex items-center justify-center gap-1 mb-6">
          {[...Array(Math.min(level, 6))].map((_, i) => (
            <Star
              key={i}
              size={16}
              fill="currentColor"
              style={{ color: "var(--exp-color)" }}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          style={{ background: "oklch(0.72 0.19 145)", fontWeight: 700 }}
        >
          Lanjutkan Belajar
        </button>
      </motion.div>
    </div>
  );
}
