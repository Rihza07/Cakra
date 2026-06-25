export type Screen =
  | 'auth'
  | 'placement'
  | 'home'
  | 'modules'
  | 'module-detail'
  | 'ai-assistant'
  | 'missions'
  | 'challenge'
  | 'challenge-15day'
  | 'portfolio-sim'
  | 'settings'
  | 'profile';

export interface UserProfile {
  name: string;
  email: string;
  level: number;
  exp: number;
  maxExp: number;
  streak: number;
  placementLevel: 'pemula' | 'menengah' | 'mahir';
  joinDate: string;        // "YYYY-MM-DD", empty string for new users
  bio?: string;            // optional editable bio line
  loginDates: string[];    // "YYYY-MM-DD" entry per unique login day
  completedModules: string[];
  completedModuleDates: Record<string, string>;
  dailyXpHistory: Record<string, number>;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  level: number;
  minLevel: number;
  duration: string;
  category: 'keuangan' | 'saham';
  videoId?: string;
  thumbnail: string;
  expReward: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly';
  expReward: number;
  target: number;
  progress: number;
  completed: boolean;
  icon: string;
}

export interface AppContextType {
  user: UserProfile;
  screen: Screen;
  selectedModuleId: string | null;
  navigate: (screen: Screen, moduleId?: string) => void;
  addExp: (amount: number, reason?: string) => void;
  showLevelUp: boolean;
  setShowLevelUp: (v: boolean) => void;
  completedModules: string[];
  setCompletedModules: React.Dispatch<React.SetStateAction<string[]>>;
  completedMissions: string[];
  setCompletedMissions: React.Dispatch<React.SetStateAction<string[]>>;
  challengeDay: number;
  setChallengeDay: React.Dispatch<React.SetStateAction<number>>;
  prevLevel: number;
  longestStreak: number;                                                         // computed from user.loginDates
  onUpdateUser: (updates: Partial<Pick<UserProfile, 'name' | 'bio'>>) => void;  // for profile edits
}
