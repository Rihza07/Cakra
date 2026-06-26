import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Edit3,
  Check,
  X,
  Camera,
  Trophy,
  Zap,
  BookOpen,
  TrendingUp,
  Settings,
  ChevronRight,
  BarChart2,
  Shield,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import type { Screen, UserProfile } from "./types";
import { MODULES, CATEGORY_GROUPS } from "./data";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProfilePageProps {
  user: UserProfile;
  navigate: (screen: Screen) => void;
  totalExp: number;
  weeklyXp: number;
  completedModules: string[];
  longestStreak: number;
  loginDates: string[]; // ISO date strings "YYYY-MM-DD" for each day the user logged in
  onUpdateUser: (updates: Partial<Pick<UserProfile, "name" | "bio">>) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── GitHub-style contribution calendar ───────────────────────────────────────

function formatLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Build a calendar for the current year, starting on the Sunday before Jan 1.
// Each cell carries { dateStr, count } where count is 0 or 1 (logged-in that day).
function buildContributionCalendar(loginDates: string[]) {
  const loginSet = new Set(loginDates.filter((value) => typeof value === "string"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const year = today.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  startOfYear.setHours(0, 0, 0, 0);

  const firstSunday = new Date(startOfYear);
  firstSunday.setDate(startOfYear.getDate() - startOfYear.getDay());

  const endDate = new Date(today);
  const totalDays = Math.floor((endDate.getTime() - firstSunday.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weekCount = Math.max(1, Math.ceil(totalDays / 7));
  const totalCells = weekCount * 7;

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const d = new Date(firstSunday);
    d.setDate(firstSunday.getDate() + i);
    const dateStr = formatLocalDateString(d);
    const count = loginSet.has(dateStr) ? 1 : 0;
    return { dateStr, count };
  });

  return { cells, weekCount };
}

// Map login count to a visual intensity level 0–3 for colour ramp.
function cellColor(count: number, baseColor: string): string {
  if (count === 0) return "var(--muted)";
  // Single intensity for logins (either logged in or not),
  // but we can still provide a ramp for future daily-activity counts.
  if (count >= 3) return baseColor;
  if (count === 2) return `color-mix(in oklch, ${baseColor} 70%, transparent)`;
  return `color-mix(in oklch, ${baseColor} 40%, transparent)`;
}

// Week-day labels (Sun … Sat) matching a standard contribution graph.
const WEEKDAY_LABELS = ["Min", "", "Sel", "", "Kam", "", "Sab"];

// Month labels: derive from the calendar cells grouped into weeks.
function buildMonthLabels(
  cells: { dateStr: string }[],
  weekCount: number,
): { label: string; col: number }[] {
  const labels: { label: string; col: number }[] = [];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
    "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
  ];
  let lastMonth = -1;
  for (let w = 0; w < weekCount; w++) {
    const cellIdx = w * 7;
    if (cellIdx >= cells.length) break;
    const m = new Date(`${cells[cellIdx].dateStr}T00:00:00`).getMonth();
    if (m !== lastMonth) {
      labels.push({ label: months[m], col: w });
      lastMonth = m;
    }
  }
  return labels;
}

// ─── Skill radar helper ────────────────────────────────────────────────────────

function buildSkillData(completedModules: string[]) {
  return CATEGORY_GROUPS.map((cat) => ({
    subject: cat.label,
    value:
      cat.moduleIds.length === 0
        ? 0
        : Math.round(
            (cat.moduleIds.filter((id) => completedModules.includes(id)).length /
              cat.moduleIds.length) *
              100,
          ),
    fullMark: 100,
  }));
}

// ─── Weekly EXP helper (based on real login + module data) ───────────────────

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePage({
  user,
  navigate,
  totalExp,
  weeklyXp,
  completedModules,
  longestStreak,
  loginDates = [],
  onUpdateUser,
}: ProfilePageProps) {
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [bioInput, setBioInput] = useState(user.bio ?? "");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "stats">("overview");

  // ── Derived values ──────────────────────────────────────────────────────────

  const levelName = LEVEL_NAMES[user.level] ?? "Legenda";
  const expPercent = user.maxExp > 0 ? (user.exp / user.maxExp) * 100 : 0;
  const completedCount = completedModules.length;

  const { cells: calendarCells, weekCount: WEEK_COUNT } = useMemo(
    () => buildContributionCalendar(loginDates),
    [loginDates],
  );
  const monthLabels = useMemo(
    () => buildMonthLabels(calendarCells, WEEK_COUNT),
    [calendarCells, WEEK_COUNT],
  );

  const skillData = useMemo(
    () => buildSkillData(completedModules),
    [completedModules],
  );
  const totalLoginDays = loginDates.length;
  const totalWeeklyExp = weeklyXp;
  const placementDisplay = user.placementLevel
    ? user.placementLevel.charAt(0).toUpperCase() + user.placementLevel.slice(1)
    : levelName;

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const saveName = () => {
    if (nameInput.trim()) {
      onUpdateUser({ name: nameInput.trim() });
      setEditingName(false);
    }
  };

  const saveBio = () => {
    onUpdateUser({ bio: bioInput.trim() });
    setEditingBio(false);
  };

  // ── Avatar initial ────────────────────────────────────────────────────────────

  const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : "?";

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="pb-24 lg:pb-8">
      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pb-6"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.14 0.04 255) 0%, oklch(0.12 0.03 255) 100%)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Decorative ambient glows */}
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
          {/* Avatar + name row */}
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
                    fontSize: user.name ? "2.5rem" : "1.5rem",
                    color: "oklch(0.10 0.025 255)",
                    lineHeight: 1,
                  }}
                >
                  {avatarLetter}
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

              {/* Colour picker popover */}
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
              {/* Level pill */}
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

              {/* Editable name */}
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") {
                        setEditingName(false);
                        setNameInput(user.name);
                      }
                    }}
                    placeholder="Nama kamu"
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
                  {user.name ? (
                    <h1
                      className="text-foreground"
                      style={{ fontWeight: 800, fontSize: "1.2rem" }}
                    >
                      {user.name}
                    </h1>
                  ) : (
                    <span
                      className="text-muted-foreground"
                      style={{ fontWeight: 600, fontSize: "1rem" }}
                    >
                      Tambah nama…
                    </span>
                  )}
                  <button
                    onClick={() => setEditingName(true)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:opacity-80"
                    style={{ background: "var(--muted)" }}
                  >
                    <Edit3 size={13} className="text-muted-foreground" />
                  </button>
                </div>
              )}

              {user.email ? (
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.78rem" }}
                >
                  {user.email}
                </p>
              ) : (
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.78rem", fontStyle: "italic" }}
                >
                  Belum ada email
                </p>
              )}
            </div>
          </div>

          {/* Editable bio */}
          {editingBio ? (
            <div className="mb-4">
              <textarea
                autoFocus
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                placeholder="Tulis sedikit tentang dirimu…"
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
                    setBioInput(user.bio ?? "");
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
              {user.bio ? (
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "0.875rem", lineHeight: 1.6 }}
                >
                  {user.bio}
                </p>
              ) : (
                <p
                  className="text-muted-foreground"
                  style={{
                    fontSize: "0.875rem",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  Tambah bio…
                </p>
              )}
              <Edit3
                size={13}
                className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0"
              />
            </button>
          )}

          {/* EXP progress bar */}
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

      {/* ── Quick stat pills ──────────────────────────────────────────────── */}
      <div className="px-5 py-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Level", value: user.level, color: avatarColor },
            { label: "Modul", value: completedCount, color: avatarColor },
            {
              label: "Streak",
              value: `${longestStreak}🔥`,
              color: avatarColor,
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
                style={{
                  fontWeight: 900,
                  fontSize: "1rem",
                  color: item.color,
                }}
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

      {/* ── Tab bar ───────────────────────────────────────────────────────── */}
      <div className="px-5 mb-5">
        <div
          className="flex rounded-xl p-1 gap-1"
          style={{ background: "var(--muted)" }}
        >
          {(["overview", "stats"] as const).map((tab) => (
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
                {tab === "overview" ? "Ringkasan" : "Statistik"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 space-y-5"
          >
            {/* GitHub-style contribution calendar */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} style={{ color: "var(--streak-color)" }} />
                  <span
                    className="text-foreground"
                    style={{ fontWeight: 700, fontSize: "0.9rem" }}
                  >
                    Riwayat Login
                  </span>
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    color: "var(--streak-color)",
                    fontSize: "0.82rem",
                  }}
                >
                  {totalLoginDays} hari aktif
                </span>
              </div>

              {/* Calendar grid — mirrors GitHub's layout */}
              <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
                <div style={{ display: "inline-block", minWidth: "max-content" }}>
                  {/* Month label row */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `20px repeat(${WEEK_COUNT}, 11px)`,
                      gap: "2px",
                      marginBottom: "2px",
                    }}
                  >
                    <div />
                    {Array.from({ length: WEEK_COUNT }, (_, w) => {
                      const monthLabel = monthLabels.find((ml) => ml.col === w);
                      return (
                        <div
                          key={w}
                          style={{
                            fontSize: "0.6rem",
                            color: "var(--muted-foreground)",
                            lineHeight: 1,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {monthLabel ? monthLabel.label : ""}
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekday labels + cell grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: `20px repeat(${WEEK_COUNT}, 11px)`,
                      gridTemplateRows: "repeat(7, 11px)",
                      gap: "2px",
                    }}
                  >
                    {/* Weekday label column — 7 rows */}
                    {WEEKDAY_LABELS.map((lbl, row) => (
                      <div
                        key={row}
                        style={{
                          gridColumn: 1,
                          gridRow: row + 1,
                          fontSize: "0.58rem",
                          color: "var(--muted-foreground)",
                          display: "flex",
                          alignItems: "center",
                          lineHeight: 1,
                        }}
                      >
                        {lbl}
                      </div>
                    ))}

                    {/* 364 cells: column = week, row = weekday */}
                    {calendarCells.map((cell, i) => {
                      const week = Math.floor(i / 7); // column index (0-based)
                      const dow = i % 7; // row index (0 = Sun)
                      return (
                        <div
                          key={cell.dateStr}
                          title={`${cell.dateStr}${cell.count > 0 ? " ✓ login" : ""}`}
                          style={{
                            gridColumn: week + 2, // +2 because col 1 is the label
                            gridRow: dow + 1,
                            width: "11px",
                            height: "11px",
                            borderRadius: "2px",
                            background: cellColor(cell.count, avatarColor),
                            transition: "background 0.15s",
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div
                    className="flex items-center gap-1.5 mt-3"
                    style={{ justifyContent: "flex-end" }}
                  >
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Kurang
                    </span>
                    {[0, 1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        style={{
                          width: "10px",
                          height: "10px",
                          borderRadius: "2px",
                          background: cellColor(lvl, avatarColor),
                        }}
                      />
                    ))}
                    <span
                      className="text-muted-foreground"
                      style={{ fontSize: "0.6rem" }}
                    >
                      Lebih
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Skill radar */}
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

            {/* Recently completed modules */}
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
                <Settings
                  size={18}
                  style={{ color: "oklch(0.55 0.22 25)" }}
                />
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

        {/* ── STATS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 space-y-5"
          >
            {/* Full statistics */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Shield
                  size={16}
                  style={{ color: "oklch(0.60 0.20 265)" }}
                />
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
                    label: "EXP Minggu Ini",
                    value: `${totalWeeklyExp} EXP`,
                    color: "oklch(0.80 0.17 75)",
                  },
                  {
                    label: "Modul Diselesaikan",
                    value: `${completedCount} / ${MODULES.length} modul`,
                    color: "oklch(0.60 0.20 265)",
                  },
                  {
                    label: "Streak Login Terlama",
                    value: `${longestStreak} hari`,
                    color: "var(--streak-color)",
                  },
                  {
                    label: "Placement Level",
                    value: placementDisplay,
                    color: "oklch(0.65 0.18 310)",
                  },
                  {
                    label: "Bergabung Sejak",
                    value: user.joinDate || "—",
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

            {/* Category progress */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: "var(--card)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <BookOpen
                  size={16}
                  style={{ color: "oklch(0.72 0.19 145)" }}
                />
                <span
                  className="text-foreground"
                  style={{ fontWeight: 700, fontSize: "0.9rem" }}
                >
                  Progress per Kategori
                </span>
              </div>
              <div className="space-y-3">
                {CATEGORY_GROUPS.map((cat) => {
                  const done = cat.moduleIds.filter((id) =>
                    completedModules.includes(id),
                  ).length;
                  const pct =
                    cat.moduleIds.length > 0
                      ? Math.round((done / cat.moduleIds.length) * 100)
                      : 0;
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
                          {done}/{cat.moduleIds.length} ({pct}%)
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
