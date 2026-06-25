"use client";

import { useState, useEffect } from "react";
import { AuthPage } from "./components/AuthPage";
import { PlacementTest } from "./components/PlacementTest";
import { HomePage } from "./components/HomePage";
import { ModulesPage } from "./components/ModulesPage";
import { ModuleDetail } from "./components/ModuleDetail";
import { AIAssistant } from "./components/AIAssistant";
import { MissionsPage } from "./components/MissionsPage";
import { ChallengePage } from "./components/ChallengePage";
import { Challenge15Day } from "./components/Challenge15Day";
import { PortfolioSim } from "./components/PortfolioSim";
import { SettingsPage } from "./components/SettingsPage";
import { ProfilePage } from "./components/ProfilePage";
import { LevelUpModal } from "./components/LevelUpModal";
import { BottomNav, SidebarNav } from "./components/BottomNav";
import type { Screen, UserProfile } from "./components/types";

const EXP_PER_LEVEL = 500;

function calcLevel(totalExp: number) {
  return Math.floor(totalExp / EXP_PER_LEVEL) + 1;
}
function calcExp(totalExp: number) {
  return totalExp % EXP_PER_LEVEL;
}

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isLocalDateYesterday(previous: string, current: string) {
  const prev = new Date(`${previous}T00:00:00`);
  const curr = new Date(`${current}T00:00:00`);
  const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
  return diff === 1;
}

function normalizeLoginDates(dates: unknown): string[] {
  if (!Array.isArray(dates)) return [];
  return Array.from(new Set(dates.filter((d) => typeof d === "string"))).sort();
}

function normalizeCompletedModules(modules: unknown): string[] {
  if (!Array.isArray(modules)) return [];
  return Array.from(new Set(modules.filter((m) => typeof m === "string"))).sort();
}

function normalizeCompletedModuleDates(dates: unknown): Record<string, string> {
  if (dates == null || typeof dates !== "object" || Array.isArray(dates)) return {};
  return Object.entries(dates).reduce<Record<string, string>>((acc, [key, value]) => {
    if (typeof value === "string") acc[key] = value;
    return acc;
  }, {});
}

function normalizeDailyXpHistory(history: unknown): Record<string, number> {
  if (history == null || typeof history !== "object" || Array.isArray(history)) return {};
  return Object.entries(history).reduce<Record<string, number>>((acc, [date, value]) => {
    if (typeof value === "number" && !Number.isNaN(value)) {
      acc[date] = value;
    }
    return acc;
  }, {});
}

function computeCurrentStreak(loginDates: string[]) {
  const dates = normalizeLoginDates(loginDates);
  if (dates.length === 0) return 0;

  let chainLength = 1;
  for (let i = dates.length - 1; i > 0; i -= 1) {
    if (isLocalDateYesterday(dates[i - 1], dates[i])) {
      chainLength += 1;
    } else {
      break;
    }
  }

  return chainLength;
}

function computeLongestStreak(loginDates: string[]) {
  const dates = normalizeLoginDates(loginDates);
  if (dates.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < dates.length; i += 1) {
    if (isLocalDateYesterday(dates[i - 1], dates[i])) {
      current += 1;
    } else {
      longest = Math.max(longest, current);
      current = 1;
    }
  }

  return Math.max(longest, current);
}

function computeWeeklyXp(dailyXpHistory: Record<string, number>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}-${month}-${day}`;
    return dailyXpHistory[dateKey] ?? 0;
  }).reduce((sum, exp) => sum + exp, 0);
}

function persistUser(user: UserProfile) {
  const normalized: UserProfile = {
    ...user,
    loginDates: normalizeLoginDates(user.loginDates),
    completedModules: normalizeCompletedModules(user.completedModules),
    completedModuleDates: normalizeCompletedModuleDates(user.completedModuleDates),
    dailyXpHistory: normalizeDailyXpHistory(user.dailyXpHistory),
  };

  localStorage.setItem("cakra-user", JSON.stringify(normalized));
  return normalized;
}

function recordLogin(user: UserProfile) {
  const today = formatLocalDate();
  const loginDates = normalizeLoginDates(user.loginDates);
  if (loginDates.includes(today)) {
    const currentStreak = computeCurrentStreak(loginDates);
    return {
      ...user,
      loginDates,
      streak: currentStreak,
      longestStreak: computeLongestStreak(loginDates),
    };
  }

  const nextLoginDates = [...loginDates, today].sort();
  const nextStreak = computeCurrentStreak(nextLoginDates);
  return {
    ...user,
    loginDates: nextLoginDates,
    streak: nextStreak,
    longestStreak: Math.max(user.longestStreak ?? 0, computeLongestStreak(nextLoginDates)),
    joinDate: user.joinDate || today,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [totalExp, setTotalExp] = useState(0);
  const [completedMissions, setCompletedMissions] = useState<string[]>(["dm2"]);
  const [challengeDay, setChallengeDay] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = localStorage.getItem("cakra-user");

    if (!saved) {
      return;
    }

    const savedUser = JSON.parse(saved);
    const normalizedUser: UserProfile = {
      name: savedUser.name,
      email: savedUser.email,
      level: savedUser.level ?? 1,
      exp: savedUser.exp ?? 0,
      maxExp: savedUser.maxExp ?? EXP_PER_LEVEL,
      streak: savedUser.streak ?? 0,
      placementLevel: savedUser.placementLevel ?? "pemula",
      joinDate: savedUser.joinDate || formatLocalDate(),
      loginDates: normalizeLoginDates(savedUser.loginDates),
      completedModules: normalizeCompletedModules(savedUser.completedModules),
      completedModuleDates: normalizeCompletedModuleDates(savedUser.completedModuleDates),
      dailyXpHistory: normalizeDailyXpHistory(savedUser.dailyXpHistory),
      bio: savedUser.bio,
    };

    setUser(normalizedUser);
    setTotalExp((normalizedUser.level - 1) * EXP_PER_LEVEL + normalizedUser.exp);
    setScreen("home");
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (user) {
      persistUser(user);
    } else {
      localStorage.removeItem("cakra-user");
    }
  }, [user]);

  const currentLevel = calcLevel(totalExp);
  const currentExp = calcExp(totalExp);

  const addExp = (amount: number) => {
    setTotalExp((prev) => {
      const next = prev + amount;
      const oldLvl = calcLevel(prev);
      const newLvl = calcLevel(next);
      if (newLvl > oldLvl) {
        setNewLevel(newLvl);
        setShowLevelUp(true);
      }
      return next;
    });

    setUser((u) => {
      if (!u) return u;

      const today = formatLocalDate();
      const nextDailyXpHistory = {
        ...u.dailyXpHistory,
        [today]: (u.dailyXpHistory[today] ?? 0) + amount,
      };
      const totalXp = (u.level - 1) * EXP_PER_LEVEL + u.exp + amount;
      const nextLevel = calcLevel(totalXp);
      const nextExp = calcExp(totalXp);

      return persistUser({
        ...u,
        exp: nextExp,
        level: nextLevel,
        dailyXpHistory: nextDailyXpHistory,
      });
    });
  };

  const navigate = (newScreen: Screen, moduleId?: string) => {
    if (moduleId) setSelectedModuleId(moduleId);
    setScreen(newScreen);
    window.scrollTo(0, 0);
  };

  const handleAuth = (
    authUser: Partial<UserProfile> & { name: string; email: string },
  ) => {
    const baseUser: UserProfile = {
      name: authUser.name,
      email: authUser.email,
      level: authUser.level ?? 1,
      exp: authUser.exp ?? 0,
      maxExp: authUser.maxExp ?? EXP_PER_LEVEL,
      streak: authUser.streak ?? 0,
      placementLevel: authUser.placementLevel ?? "pemula",
      joinDate: authUser.joinDate || formatLocalDate(),
      loginDates: normalizeLoginDates(authUser.loginDates ?? []),
      completedModules: normalizeCompletedModules(authUser.completedModules ?? []),
      completedModuleDates: normalizeCompletedModuleDates(authUser.completedModuleDates ?? {}),
      dailyXpHistory: normalizeDailyXpHistory(authUser.dailyXpHistory ?? {}),
      bio: authUser.bio,
    };

    const updated = recordLogin(baseUser);
    setTotalExp((updated.level - 1) * EXP_PER_LEVEL + updated.exp);
    setUser(persistUser(updated));
    setScreen("home");
  };

  const handlePlacementComplete = (score: number) => {
    const startLevel = score <= 2 ? 1 : score <= 4 ? 2 : 3;
    setTotalExp((startLevel - 1) * EXP_PER_LEVEL);
    setUser((u) =>
      u
        ? persistUser({
            ...u,
            level: startLevel,
            exp: 0,
            placementLevel:
              score <= 2 ? "pemula" : score <= 4 ? "menengah" : "mahir",
          })
        : u,
    );
    setScreen("home");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cakra-user");
    setScreen("auth");
    setTotalExp(0);
    setCompletedMissions(["dm2"]);
    setChallengeDay(0);
  };

  const handleUpdateUser = (updates: Partial<Pick<UserProfile, "name" | "bio">>) => {
    setUser((u) => (u ? persistUser({ ...u, ...updates }) : u));
  };

  const fullUser = user
    ? {
        id: user.email,
        ...user,
        level: currentLevel,
        exp: currentExp,
        maxExp: EXP_PER_LEVEL,
      }
    : null;

  const completedModules = user?.completedModules ?? [];
  const longestStreak = user ? computeLongestStreak(user.loginDates) : 0;

  const userForNav = fullUser
    ? {
        name: fullUser.name,
        level: currentLevel,
        exp: currentExp,
        maxExp: EXP_PER_LEVEL,
        streak: fullUser.streak,
      }
    : null;

  const needsNav = user && screen !== "auth" && screen !== "placement";

  const handleModuleComplete = (moduleId: string, expReward: number) => {
    setUser((u) => {
      if (!u || u.completedModules.includes(moduleId)) return u;

      const today = formatLocalDate();
      const nextDailyXpHistory = {
        ...u.dailyXpHistory,
        [today]: (u.dailyXpHistory[today] ?? 0) + expReward,
      };
      const nextTotalExp = (u.level - 1) * EXP_PER_LEVEL + u.exp + expReward;
      const nextLevel = calcLevel(nextTotalExp);
      const nextExp = calcExp(nextTotalExp);

      return persistUser({
        ...u,
        completedModules: [...u.completedModules, moduleId],
        completedModuleDates: {
          ...u.completedModuleDates,
          [moduleId]: today,
        },
        dailyXpHistory: nextDailyXpHistory,
        level: nextLevel,
        exp: nextExp,
      });
    });

    setTotalExp((prev) => {
      const next = prev + expReward;
      const oldLvl = calcLevel(prev);
      const newLvl = calcLevel(next);
      if (newLvl > oldLvl) {
        setNewLevel(newLvl);
        setShowLevelUp(true);
      }
      return next;
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: "var(--background)",
        fontFamily: "var(--font-family)",
      }}
    >
      {screen === "auth" && <AuthPage onAuth={handleAuth} />}
      {screen === "placement" && (
        <PlacementTest onComplete={handlePlacementComplete} />
      )}

      {needsNav && fullUser && (
        <div className="flex min-h-screen">
          <SidebarNav
            current={screen}
            navigate={navigate}
            user={userForNav!}
            onLogout={handleLogout}
          />

          <main
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ maxHeight: "100vh" }}
          >
            {screen === "home" && (
              <HomePage
                user={fullUser}
                navigate={navigate}
                completedModules={completedModules}
                streak={fullUser.streak}
              />
            )}
            {screen === "modules" && (
              <ModulesPage
                userLevel={currentLevel}
                navigate={navigate}
                completedModules={completedModules}
              />
            )}
            {screen === "module-detail" && selectedModuleId && (
              <ModuleDetail
                moduleId={selectedModuleId}
                navigate={navigate}
                completedModules={completedModules}
                onCompleteModule={handleModuleComplete}
              />
            )}
            {screen === "ai-assistant" && <AIAssistant addExp={addExp} />}
            {screen === "missions" && (
              <MissionsPage
                completedMissions={completedMissions}
                setCompletedMissions={setCompletedMissions}
                addExp={addExp}
                completedModules={completedModules}
                streak={fullUser.streak}
              />
            )}
            {screen === "challenge" && (
              <ChallengePage navigate={navigate} challengeDay={challengeDay} />
            )}
            {screen === "challenge-15day" && (
              <Challenge15Day
                user={fullUser!} // <-- Ganti currentUser menjadi fullUser!
                navigate={navigate}
                challengeDay={challengeDay}
                setChallengeDay={setChallengeDay}
                addExp={addExp}
              />
            )}
            {screen === "portfolio-sim" && (
              <PortfolioSim navigate={navigate} addExp={addExp} />
            )}
            {screen === "settings" && (
              <SettingsPage user={fullUser} onLogout={handleLogout} />
            )}
            {screen === "profile" && (
              <ProfilePage
                user={fullUser}
                navigate={navigate}
                totalExp={totalExp}
                weeklyXp={computeWeeklyXp(fullUser.dailyXpHistory)}
                completedModules={completedModules}
                longestStreak={longestStreak}
                loginDates={fullUser.loginDates}
                onUpdateUser={handleUpdateUser}
              />
            )}
          </main>

          <BottomNav current={screen} navigate={navigate} />
        </div>
      )}

      {showLevelUp && (
        <LevelUpModal
          level={newLevel}
          onClose={() => {
            setShowLevelUp(false);
            navigate("home");
          }}
        />
      )}
    </div>
  );
}
