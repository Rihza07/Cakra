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

export default function App() {
  const [screen, setScreen] = useState<Screen>("auth");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [totalExp, setTotalExp] = useState(0);
  const [streak] = useState(7);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [completedMissions, setCompletedMissions] = useState<string[]>(["dm2"]);
  const [challengeDay, setChallengeDay] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("cakra-user");

    if (saved) {
      const user = JSON.parse(saved);

      setUser(user);

      setScreen("home");
    }
  }, []);

  const currentLevel = calcLevel(totalExp);
  const currentExp = calcExp(totalExp);

  const addExp = (amount: number, _reason?: string) => {
    setTotalExp((prev) => {
      const next = prev + amount;
      const oldLvl = calcLevel(prev);
      const newLvl = calcLevel(next);
      if (newLvl > oldLvl) {
        setNewLevel(newLvl);
        setShowLevelUp(true);
      }
      setUser((u) =>
        u ? { ...u, level: calcLevel(next), exp: calcExp(next) } : u,
      );
      return next;
    });
  };

  const navigate = (newScreen: Screen, moduleId?: string) => {
    if (moduleId) setSelectedModuleId(moduleId);
    setScreen(newScreen);
    window.scrollTo(0, 0);
  };

  const handleAuth = (name: string, email: string) => {
    const userData: UserProfile = {
      name,
      email,
      level: 1,
      exp: 0,
      maxExp: EXP_PER_LEVEL,
      streak: 7,
      placementLevel: "pemula",
      joinDate: "Jun 2024",
    };

    localStorage.setItem("cakra-user", JSON.stringify(userData));

    setUser(userData);

    setScreen("placement");
  };

  const handlePlacementComplete = (score: number) => {
    const startLevel = score <= 2 ? 1 : score <= 4 ? 2 : 3;
    setTotalExp((startLevel - 1) * EXP_PER_LEVEL);
    setUser((u) =>
      u
        ? {
            ...u,
            level: startLevel,
            exp: 0,
            placementLevel:
              score <= 2 ? "pemula" : score <= 4 ? "menengah" : "mahir",
          }
        : u,
    );
    setScreen("home");
  };

  const handleLogout = () => {
    setUser(null);
    setScreen("auth");
    setTotalExp(0);
    setCompletedModules([]);
    setCompletedMissions(["dm2"]);
    setChallengeDay(0);
  };

  const handleUpdateUser = (updates: Partial<Pick<UserProfile, "name">>) => {
    setUser((u) => (u ? { ...u, ...updates } : u));
  };

  const fullUser: UserProfile | null = user
    ? {
        ...user,
        level: currentLevel,
        exp: currentExp,
        maxExp: EXP_PER_LEVEL,
        streak,
      }
    : null;

  const userForNav = fullUser
    ? {
        name: fullUser.name,
        level: currentLevel,
        exp: currentExp,
        maxExp: EXP_PER_LEVEL,
        streak,
      }
    : null;

  const needsNav = user && screen !== "auth" && screen !== "placement";

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
          <SidebarNav current={screen} navigate={navigate} user={userForNav!} />

          <main
            className="flex-1 min-w-0 overflow-y-auto"
            style={{ maxHeight: "100vh" }}
          >
            {screen === "home" && (
              <HomePage
                user={fullUser}
                navigate={navigate}
                completedModules={completedModules}
                streak={streak}
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
                addExp={addExp}
                completedModules={completedModules}
                setCompletedModules={setCompletedModules}
              />
            )}
            {screen === "ai-assistant" && <AIAssistant addExp={addExp} />}
            {screen === "missions" && (
              <MissionsPage
                completedMissions={completedMissions}
                setCompletedMissions={setCompletedMissions}
                addExp={addExp}
                completedModules={completedModules}
                streak={streak}
              />
            )}
            {screen === "challenge" && (
              <ChallengePage navigate={navigate} challengeDay={challengeDay} />
            )}
            {screen === "challenge-15day" && (
              <Challenge15Day
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
                completedModules={completedModules}
                streak={streak}
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
