import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Edit3,
  Check,
  X,
  Camera,
  Star,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  TrendingUp,
  Target,
  Award,
  Settings,
  ChevronRight,
  BarChart2,
  Calendar,
  Shield,
  Medal,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { Screen, UserProfile } from "./types";
import { MODULES } from "./data";

interface ProfilePageProps {
  user: UserProfile;
  navigate: (screen: Screen) => void;
  totalExp: number;
  completedModules: string[];
  streak: number;
  onUpdateUser: (updates: Partial<Pick<UserProfile, "name">>) => void;
}

const LEVEL_NAMES: Record<number, string> = {
  1: "Pemula Finansial",
  2: "Pelajar Cerdas",
  3: "Analis Muda",
  4: "Investor Terampil",
  5: "Ahli Portofolio",
  6: "Master Pasar Modal",
};

const AVATAR_COLORS = [
  "oklch(0.72 0.19 145)",
  "oklch(0.60 0.20 265)",
  "oklch(0.80 0.17 75)",
  "oklch(0.65 0.18 310)",
  "oklch(0.70 0.20 40)",
  "oklch(0.55 0.22 25)",
];

const BADGES = [
  {
    id: "first_login",
    emoji: "🌟",
    label: "Langkah Pertama",
    desc: "Login pertama kali",
    unlocked: true,
  },
  {
    id: "placement",
    emoji: "🎯",
    label: "Placement Pro",
    desc: "Selesaikan placement test",
    unlocked: true,
  },
  {
    id: "streak_7",
    emoji: "🔥",
    label: "Streak 7 Hari",
    desc: "Login 7 hari berturut",
    unlocked: true,
  },
  {
    id: "first_module",
    emoji: "📚",
    label: "Pembaca Tekun",
    desc: "Selesaikan modul pertama",
    unlocked: false,
  },
  {
    id: "quiz_perfect",
    emoji: "💯",
    label: "Nilai Sempurna",
    desc: "Quiz dengan skor 100%",
    unlocked: false,
  },
  {
    id: "level_2",
    emoji: "🏅",
    label: "Naik Level",
    desc: "Capai Level 2",
    unlocked: false,
  },
  {
    id: "ai_user",
    emoji: "🤖",
    label: "AI Explorer",
    desc: "Gunakan AI Assistant 10x",
    unlocked: false,
  },
  {
    id: "challenger",
    emoji: "⚔️",
    label: "Challenger",
    desc: "Mulai challenge pertama",
    unlocked: false,
  },
  {
    id: "investor",
    emoji: "💼",
    label: "Investor Muda",
    desc: "Selesaikan simulasi portofolio",
    unlocked: false,
  },
  {
    id: "streak_30",
    emoji: "🌈",
    label: "Streak Legend",
    desc: "Login 30 hari berturut",
    unlocked: false,
  },
  {
    id: "all_modules",
    emoji: "🎓",
    label: "Sarjana Keuangan",
    desc: "Selesaikan semua modul",
    unlocked: false,
  },
  {
    id: "master",
    emoji: "👑",
    label: "Master CAKRA",
    desc: "Capai Level 6",
    unlocked: false,
  },
];

function buildSkillData(completedModules: string[]) {
  const categories = [
    { label: "Keuangan Dasar", moduleIds: ["m1", "m2", "m3"] },
    { label: "Pasar Modal", moduleIds: ["m4", "m5", "m6"] },
    { label: "Analisis Saham", moduleIds: ["m7", "m8"] },
    { label: "Manaj. Risiko", moduleIds: ["m9"] },
    { label: "Strategi Lanjut", moduleIds: ["m10", "m11", "m12"] },
  ];
  return categories.map((cat) => ({
    subject: cat.label,
    value: Math.round(
      (cat.moduleIds.filter((id) => completedModules.includes(id)).length /
        cat.moduleIds.length) *
        100,
    ),
    fullMark: 100,
  }));
}

function buildWeeklyExpData(totalExp: number) {
  // Simulated weekly EXP history
  const base = Math.max(20, Math.floor(totalExp / 8));
  return [
    { day: "Sen", exp: Math.floor(base * 0.4) },
    { day: "Sel", exp: Math.floor(base * 0.7) },
    { day: "Rab", exp: Math.floor(base * 0.5) },
    { day: "Kam", exp: Math.floor(base * 0.9) },
    { day: "Jum", exp: Math.floor(base * 0.6) },
    { day: "Sab", exp: Math.floor(base * 1.1) },
    { day: "Min", exp: Math.floor(base * 0.3) },
  ];
}

function buildStreakCalendar(streak: number) {
  const days = 35;
  return Array.from({ length: days }, (_, i) => {
    const daysAgo = days - 1 - i;
    const active = daysAgo < streak;
    const intensity = active ? (daysAgo < 7 ? 3 : daysAgo < 14 ? 2 : 1) : 0;
    return { intensity };
  });
}

export function ProfilePage({
  user,
  navigate,
  totalExp,
  completedModules,
  streak,
  onUpdateUser,
}: ProfilePageProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [bio, setBio] = useState(
    "Sedang belajar literasi keuangan & investasi saham 📈",
  );
  const [bioInput, setBioInput] = useState(bio);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "stats">(
    "overview",
  );

  const skillData = buildSkillData(completedModules);
  const weeklyExp = buildWeeklyExpData(totalExp);
  const streakCal = buildStreakCalendar(streak);
  const completedCount = completedModules.length;
  const levelName = LEVEL_NAMES[user.level] ?? "Legenda";
  const expPercent = (user.exp / user.maxExp) * 100;
  const unlockedBadges = BADGES.filter((b) => b.unlocked).length;

  const intensityColor = (n: number) => {
    if (n === 0) return "var(--muted)";
    if (n === 1) return "oklch(0.72 0.19 145 / 0.3)";
    if (n === 2) return "oklch(0.72 0.19 145 / 0.6)";
    return "oklch(0.72 0.19 145)";
  };

  const saveName = () => {
    if (nameInput.trim()) {
      onUpdateUser({ name: nameInput.trim() });
      setEditingName(false);
    }
  };

  const saveBio = () => {
    setBio(bioInput.trim() || bio);
    setEditingBio(false);
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Hero header */}
      <div
        className="relative overflow-hidden pb-6"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.14 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${avatarColor}25, transparent)`,
          }}
        />
        <div
          className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, oklch(0.80 0.17 75 / 0.1), transparent)",
          }}
        />

        <div className="relative z-10 px-5 pt-6">
          {/* Avatar */}
          <div className="flex items-end gap-4 mb-4">
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowColorPicker((v) => !v)}
                className="w-24 h-24 rounded-3xl flex items-center justify-center cursor-pointer shadow-lg relative"
                style={{
                  background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}bb)`,
                  border: "3px solid oklch(0.20 0.03 255)",
                }}
              >
                <span
                  style={{
                    fontWeight: 900,
                    fontSize: "2.5rem",
                    color: "oklch(0.10 0.025 255)",
                    lineHeight: 1,
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{
                    background: "var(--card)",
                    border: "2px solid var(--border)",
                  }}
                >
                  <Camera
                    size={14}
                    style={{ color: "var(--muted-foreground)" }}
                  />
                </div>
              </motion.div>

              {/* Color picker */}
              <AnimatePresence>
                {showColorPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -8 }}
                    className="absolute top-full mt-3 left-0 p-3 rounded-2xl z-30 flex gap-2"
                    style={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 8px 32px oklch(0 0 0 / 0.4)",
                    }}
                  >
                    {AVATAR_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setAvatarColor(c);
                          setShowColorPicker(false);
                        }}
                        className="w-8 h-8 rounded-xl transition-all hover:scale-110"
                        style={{
                          background: c,
                          border:
                            avatarColor === c
                              ? "2.5px solid white"
                              : "2.5px solid transparent",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex-1 pb-1">
              {/* Level badge */}
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-2"
                style={{
                  background: `${avatarColor}20`,
                  border: `1px solid ${avatarColor}40`,
                }}
              >
                <Trophy size={11} style={{ color: avatarColor }} />
                <span
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: avatarColor,
                  }}
                >
                  Level {user.level} — {levelName}
                </span>
              </div>

              {/* Name */}
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="flex-1 px-2 py-1 rounded-lg text-foreground outline-none"
                    style={{
                      background: "var(--input-background)",
                      border: "1.5px solid oklch(0.72 0.19 145)",
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      maxWidth: "160px",
                    }}
                  />
                  <button
                    onClick={saveName}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.72 0.19 145)" }}
                  >
                    <Check
                      size={13}
                      style={{ color: "oklch(0.12 0.02 145)" }}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setEditingName(false);
                      setNameInput(user.name);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "var(--muted)" }}
                  >
                    <X size={13} className="text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1
                    className="text-foreground"
                    style={{ fontWeight: 800, fontSize: "1.2rem" }}
                  >
                    {user.name}
                  </h1>
                  <button
                    onClick={() => setEditingName(true)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: "var(--muted)" }}
                  >
                    <Edit3 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              )}
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.78rem" }}
              >
                {user.email}
              </p>
            </div>
          </div>

          {/* Bio */}
          {editingBio ? (
            <div className="mb-4">
              <textarea
                autoFocus
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setEditingBio(false);
                }}
                className="w-full px-3 py-2 rounded-xl text-foreground outline-none resize-none"
                style={{
                  background: "var(--input-background)",
                  border: "1.5px solid oklch(0.72 0.19 145)",
                  fontSize: "0.875rem",
                }}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={saveBio}
                  className="px-3 py-1.5 rounded-lg text-sm"
                  style={{
                    background: "oklch(0.72 0.19 145)",
                    color: "oklch(0.12 0.02 145)",
                    fontWeight: 700,
                  }}
                >
                  Simpan
                </button>
                <button
                  onClick={() => {
                    setEditingBio(false);
                    setBioInput(bio);
                  }}
                  className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground"
                  style={{ background: "var(--muted)" }}
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setEditingBio(true)}
              className="flex items-start gap-2 mb-4 group text-left w-full"
            >
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
              >
                {bio}
              </p>
              <Edit3
                size={13}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0"
              />
            </button>
          )}

          {/* EXP bar */}
          <div className="mb-1 flex items-center justify-between">
            <span
              className="text-muted-foreground"
              style={{ fontSize: "0.72rem" }}
            >
              EXP Progress
            </span>
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "var(--exp-color)",
              }}
            >
              {user.exp} / {user.maxExp}
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "oklch(0.10 0.025 255)" }}
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${expPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{
                background: `linear-gradient(90deg, ${avatarColor}, oklch(0.80 0.17 75))`,
              }}
            />
          </div>
          <p
            className="text-muted-foreground mt-1"
            style={{ fontSize: "0.68rem" }}
          >
            {user.maxExp - user.exp} EXP lagi untuk Level {user.level + 1}
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-4 gap-2">
          {[
            {
              label: "Level",
              value: user.level,
              icon: "🏆",
              color: avatarColor,
            },
            {
              label: "Modul",
              value: completedCount,
              icon: "📚",
              color: "oklch(0.60 0.20 265)",
            },
            {
              label: "Streak",
              value: `${streak}🔥`,
              icon: "🔥",
              color: "var(--streak-color)",
            },
            {
              label: "Badge",
              value: `${unlockedBadges}/${BADGES.length}`,
              icon: "🏅",
              color: "oklch(0.80 0.17 75)",
            },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -2 }}
              className="rounded-xl p-3 text-center"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                style={{ fontWeight: 900, fontSize: "1rem", color: item.color }}
              >
                {item.value}
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.62rem", marginTop: "2px" }}
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div className="px-5 mb-5">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "var(--muted)" }}
        >
          {(["overview", "badges", "stats"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg relative transition-all"
              style={{
                fontWeight: activeTab === tab ? 700 : 500,
                fontSize: "0.8rem",
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="profile-tab-bg"
                  className="absolute inset-0 rounded-lg"
                  style={{
                    background: "var(--card)",
                    boxShadow: "0 1px 6px oklch(0 0 0 / 0.3)",
                  }}
                />
              )}
              <span
                className="relative z-10"
                style={{
                  color:
                    activeTab === tab
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                }}
              >
                {tab === "overview"
                  ? "Ringkasan"
                  : tab === "badges"
                    ? "Lencana"
                    : "Statistik"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 space-y-5"
          >
            {/* Streak calendar */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar
                    size={16}
                    style={{ color: "var(--streak-color)" }}
                  />
                  <span
                    className="text-foreground"
                    style={{ fontWeight: 700, fontSize: "0.9rem" }}
                  >
                    Streak Login
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--streak-color)",
                    fontSize: "0.9rem",
                  }}
                >
                  🔥 {streak} hari
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "4px",
                }}
              >
                {streakCal.map((day, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.01 }}
                    className="aspect-square rounded-sm"
                    style={{ background: intensityColor(day.intensity) }}
                  />
                ))}
              </div>
              <div className="flex items-center justify-end gap-2 mt-2">
                <span
                  className="text-muted-foreground"
                  style={{ fontSize: "0.65rem" }}
                >
                  Kurang
                </span>
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-3 h-3 rounded-sm"
                    style={{ background: intensityColor(n) }}
                  />
                ))}
                <span
                  className="text-muted-foreground"
                  style={{ fontSize: "0.65rem" }}
                >
                  Lebih
                </span>
              </div>
            </div>

            {/* Skills radar */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <BarChart2
                  size={16}
                  style={{ color: "oklch(0.60 0.20 265)" }}
                />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Profil Kemampuan
                </span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart
                  data={skillData}
                  margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                >
                  <PolarGrid stroke="oklch(0.28 0.03 255 / 0.5)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "oklch(0.58 0.02 255)", fontSize: 11 }}
                  />
                  <Radar
                    name="Kemampuan"
                    dataKey="value"
                    stroke={avatarColor}
                    fill={avatarColor}
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              {skillData.every((d) => d.value === 0) && (
                <p
                  className="text-muted-foreground text-center"
                  style={{ fontSize: "0.78rem", marginTop: "-1rem" }}
                >
                  Selesaikan modul untuk mengisi grafik kemampuanmu!
                </p>
              )}
            </div>

            {/* Recent activity */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp
                  size={16}
                  style={{ color: "oklch(0.72 0.19 145)" }}
                />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Modul Terbaru
                </span>
              </div>
              {completedModules.length > 0 ? (
                <div className="space-y-2">
                  {MODULES.filter((m) => completedModules.includes(m.id))
                    .slice(-3)
                    .reverse()
                    .map((mod) => (
                      <div
                        key={mod.id}
                        className="flex items-center gap-3 py-2"
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={mod.thumbnail}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-foreground truncate"
                            style={{ fontWeight: 600, fontSize: "0.8rem" }}
                          >
                            {mod.title}
                          </p>
                        </div>
                        <span
                          style={{
                            color: "var(--exp-color)",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            flexShrink: 0,
                          }}
                        >
                          +{mod.expReward}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.82rem" }}
                >
                  Belum ada modul yang diselesaikan. Mulai belajar sekarang!
                </p>
              )}
            </div>

            {/* Settings shortcut */}
            <button
              onClick={() => navigate("settings")}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all hover:opacity-80"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.55 0.22 25 / 0.1)" }}
              >
                <Settings size={18} style={{ color: "oklch(0.55 0.22 25)" }} />
              </div>
              <div className="flex-1">
                <p
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Pengaturan Akun
                </p>
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.75rem" }}
                >
                  Privasi, notifikasi, bahasa, dan lainnya
                </p>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </motion.div>
        )}

        {/* BADGES TAB */}
        {activeTab === "badges" && (
          <motion.div
            key="badges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5"
          >
            <div className="flex items-center justify-between mb-4">
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.82rem" }}
              >
                <span style={{ fontWeight: 800, color: "var(--exp-color)" }}>
                  {unlockedBadges}
                </span>{" "}
                dari {BADGES.length} lencana terbuka
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {BADGES.map((badge, i) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={badge.unlocked ? { y: -3 } : {}}
                  className="rounded-2xl p-3 text-center relative overflow-hidden"
                  style={{
                    background: badge.unlocked ? "var(--card)" : "var(--muted)",
                    border: badge.unlocked
                      ? `1px solid ${avatarColor}40`
                      : "1px solid var(--border)",
                    opacity: badge.unlocked ? 1 : 0.55,
                  }}
                >
                  {badge.unlocked && (
                    <div
                      className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: avatarColor }}
                    >
                      <Check
                        size={9}
                        style={{ color: "oklch(0.10 0.025 255)" }}
                      />
                    </div>
                  )}
                  <div
                    className="text-3xl mb-1.5"
                    style={{ filter: badge.unlocked ? "none" : "grayscale(1)" }}
                  >
                    {badge.emoji}
                  </div>
                  <p
                    className="text-foreground"
                    style={{
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      lineHeight: 1.3,
                      marginBottom: "3px",
                    }}
                  >
                    {badge.label}
                  </p>
                  <p
                    className="text-muted-foreground"
                    style={{ fontSize: "0.62rem", lineHeight: 1.4 }}
                  >
                    {badge.desc}
                  </p>
                  {!badge.unlocked && (
                    <div className="mt-1.5">
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "0.6rem" }}
                      >
                        🔒 Terkunci
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 space-y-5"
          >
            {/* Weekly EXP chart */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Zap size={16} style={{ color: "var(--exp-color)" }} />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  EXP Minggu Ini
                </span>
                <span
                  className="ml-auto"
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--exp-color)",
                    fontWeight: 700,
                  }}
                >
                  Total: {weeklyExp.reduce((a, b) => a + b.exp, 0)} EXP
                </span>
              </div>
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={weeklyExp} barSize={24}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.28 0.03 255 / 0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "oklch(0.58 0.02 255)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "oklch(0.58 0.02 255)", fontSize: 10 }}
                    width={30}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(0.14 0.025 255)",
                      border: "1px solid oklch(0.28 0.03 255)",
                      borderRadius: "8px",
                      color: "var(--foreground)",
                      fontSize: "0.75rem",
                    }}
                    formatter={(value) => [`${value} EXP`, "EXP"]}
                  />
                  <Bar dataKey="exp" fill={avatarColor} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed stats */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield size={16} style={{ color: "oklch(0.60 0.20 265)" }} />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Statistik Lengkap
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Level Saat Ini",
                    value: `Level ${user.level} — ${levelName}`,
                    color: avatarColor,
                  },
                  {
                    label: "Total EXP Diperoleh",
                    value: `${totalExp} EXP`,
                    color: "var(--exp-color)",
                  },
                  {
                    label: "Modul Diselesaikan",
                    value: `${completedCount} / ${MODULES.length} modul`,
                    color: "oklch(0.60 0.20 265)",
                  },
                  {
                    label: "Streak Login Terlama",
                    value: `${streak} hari`,
                    color: "var(--streak-color)",
                  },
                  {
                    label: "Lencana Diraih",
                    value: `${unlockedBadges} lencana`,
                    color: "oklch(0.80 0.17 75)",
                  },
                  {
                    label: "Placement Level",
                    value:
                      user.placementLevel.charAt(0).toUpperCase() +
                      user.placementLevel.slice(1),
                    color: "oklch(0.65 0.18 310)",
                  },
                  {
                    label: "Bergabung Sejak",
                    value: user.joinDate,
                    color: "var(--muted-foreground)",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between py-2"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: "0.82rem" }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen size={16} style={{ color: "oklch(0.72 0.19 145)" }} />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Progress per Kategori
                </span>
              </div>
              <div className="space-y-3">
                {[
                  {
                    label: "Literasi Keuangan",
                    ids: ["m1", "m2", "m3", "m5", "m6"],
                    color: "oklch(0.80 0.17 75)",
                  },
                  {
                    label: "Pasar Modal & Saham",
                    ids: ["m4", "m7", "m8", "m9", "m10", "m11", "m12"],
                    color: "oklch(0.60 0.20 265)",
                  },
                ].map((cat) => {
                  const done = cat.ids.filter((id) =>
                    completedModules.includes(id),
                  ).length;
                  const pct = Math.round((done / cat.ids.length) * 100);
                  return (
                    <div key={cat.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className="text-foreground"
                          style={{ fontWeight: 600, fontSize: "0.82rem" }}
                        >
                          {cat.label}
                        </span>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: "0.78rem",
                            color: cat.color,
                          }}
                        >
                          {done}/{cat.ids.length} ({pct}%)
                        </span>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--muted)" }}
                      >
                        <motion.div
                          className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}
