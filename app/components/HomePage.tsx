import { motion } from 'motion/react';
import { BookOpen, Bot, Target, Swords, Flame, TrendingUp, Star, ChevronRight, Trophy, Zap, Lock } from 'lucide-react';
import type { Screen, UserProfile, Module } from './types';
import { MODULES } from './data';

interface HomePageProps {
  user: UserProfile;
  navigate: (screen: Screen, moduleId?: string) => void;
  completedModules: string[];
  streak: number;
}

const LEVEL_NAMES: Record<number, string> = {
  1: 'Pemula Finansial', 2: 'Pelajar Cerdas', 3: 'Analis Muda',
  4: 'Investor Terampil', 5: 'Ahli Portofolio', 6: 'Master Pasar Modal',
};

const QUICK_ACTIONS = [
  { screen: 'modules' as Screen, icon: BookOpen, label: 'Materi', color: 'oklch(0.72 0.19 145)', bg: 'oklch(0.72 0.19 145 / 0.12)' },
  { screen: 'ai-assistant' as Screen, icon: Bot, label: 'AI Chat', color: 'oklch(0.60 0.20 265)', bg: 'oklch(0.60 0.20 265 / 0.12)' },
  { screen: 'missions' as Screen, icon: Target, label: 'Misi', color: 'oklch(0.80 0.17 75)', bg: 'oklch(0.80 0.17 75 / 0.12)' },
  { screen: 'challenge' as Screen, icon: Swords, label: 'Challenge', color: 'oklch(0.65 0.18 310)', bg: 'oklch(0.65 0.18 310 / 0.12)' },
];

export function HomePage({ user, navigate, completedModules }: HomePageProps) {
  const expPercent = (user.exp / user.maxExp) * 100;
  const availableModules = MODULES.filter(m => m.minLevel <= user.level);
  const nextModules = availableModules.filter(m => !completedModules.includes(m.id)).slice(0, 3);
  const recentCompleted = MODULES.filter(m => completedModules.includes(m.id)).slice(-2);
  const totalCompleted = completedModules.length;

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Selamat Pagi' : h < 17 ? 'Selamat Siang' : 'Selamat Malam';
  };

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="p-5 pb-0">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-muted-foreground mb-1" style={{ fontSize: '0.85rem' }}>{greeting()},</p>
            <h1 className="text-foreground" style={{ fontWeight: 800, fontSize: '1.5rem' }}>{user.name} 👋</h1>
          </div>
          <button onClick={() => navigate('profile')}
            className="w-11 h-11 rounded-full flex items-center justify-center relative"
            style={{ background: 'oklch(0.72 0.19 145 / 0.15)', border: '1.5px solid oklch(0.72 0.19 145 / 0.3)' }}>
            <span style={{ fontWeight: 800, color: 'oklch(0.72 0.19 145)', fontSize: '1.1rem' }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </button>
        </div>

        {/* Level + EXP card */}
        <div className="rounded-2xl p-5 mb-5 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, oklch(0.18 0.04 255) 0%, oklch(0.16 0.05 255) 100%)', border: '1px solid oklch(0.28 0.04 255 / 0.6)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, oklch(0.72 0.19 145), transparent)', transform: 'translate(30%, -30%)' }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: 'oklch(0.72 0.19 145 / 0.2)', border: '1.5px solid oklch(0.72 0.19 145 / 0.4)' }}>
                  <Trophy size={22} style={{ color: 'oklch(0.72 0.19 145)' }} />
                </div>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.2rem', color: 'oklch(0.72 0.19 145)' }}>Level {user.level}</p>
                  <p className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>{LEVEL_NAMES[user.level] ?? 'Legenda'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'oklch(0.80 0.17 75 / 0.15)', border: '1px solid oklch(0.80 0.17 75 / 0.3)' }}>
                <Flame size={14} style={{ color: 'var(--streak-color)' }} />
                <span style={{ fontWeight: 700, color: 'var(--streak-color)', fontSize: '0.85rem' }}>{user.streak} hari</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>EXP Progress</span>
              <span style={{ fontWeight: 700, color: 'var(--exp-color)', fontSize: '0.82rem' }}>{user.exp} / {user.maxExp}</span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.14 0.025 255)' }}>
              <motion.div className="h-full rounded-full"
                initial={{ width: 0 }} animate={{ width: `${expPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, oklch(0.72 0.19 145), oklch(0.80 0.17 75))' }} />
            </div>
            <p className="text-muted-foreground mt-2" style={{ fontSize: '0.75rem' }}>
              {user.maxExp - user.exp} EXP lagi untuk naik ke Level {user.level + 1}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Modul Selesai', value: totalCompleted, icon: BookOpen, color: 'oklch(0.72 0.19 145)' },
            { label: 'Total EXP', value: `${user.exp + (user.level - 1) * 500}`, icon: Zap, color: 'oklch(0.80 0.17 75)' },
            { label: 'Streak', value: `${user.streak}🔥`, icon: Flame, color: 'var(--streak-color)' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ fontWeight: 800, fontSize: '1.1rem', color: item.color }}>{item.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.7rem', marginTop: '2px' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick access */}
      <div className="px-5 mb-6">
        <h2 className="text-foreground mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Akses Cepat</h2>
        <div className="grid grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ screen, icon: Icon, label, color, bg }) => (
            <button key={screen} onClick={() => navigate(screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
              style={{ background: bg, border: `1px solid ${color}33` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: `${color}22` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--foreground)' }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Streak info */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl p-4 flex items-center gap-4"
          style={{ background: 'linear-gradient(90deg, oklch(0.70 0.20 40 / 0.15), oklch(0.80 0.17 75 / 0.1))', border: '1px solid oklch(0.70 0.20 40 / 0.3)' }}>
          <div className="text-4xl">🔥</div>
          <div className="flex-1">
            <p className="text-foreground" style={{ fontWeight: 700 }}>Streak Harian: {user.streak} Hari!</p>
            <p className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>
              {user.streak > 0 ? 'Pertahankan konsistensimu dan raih lebih banyak EXP!' : 'Login setiap hari untuk membangun streak dan dapatkan EXP bonus!'}
            </p>
          </div>
          <div className="px-3 py-1.5 rounded-lg" style={{ background: 'oklch(0.70 0.20 40 / 0.25)' }}>
            <span style={{ color: 'var(--streak-color)', fontWeight: 700, fontSize: '0.8rem' }}>+20 EXP/hari</span>
          </div>
        </div>
      </div>

      {/* Continue learning */}
      {nextModules.length > 0 && (
        <div className="px-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground" style={{ fontWeight: 700, fontSize: '1rem' }}>Lanjutkan Belajar</h2>
            <button onClick={() => navigate('modules')} className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <span style={{ fontSize: '0.82rem' }}>Lihat semua</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-3">
            {nextModules.map((mod, i) => (
              <ModuleCard key={mod.id} mod={mod} delay={i * 0.05} onClick={() => navigate('module-detail', mod.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Completed modules */}
      {recentCompleted.length > 0 && (
        <div className="px-5">
          <h2 className="text-foreground mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Baru Diselesaikan</h2>
          <div className="space-y-2">
            {recentCompleted.map(mod => (
              <div key={mod.id} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'oklch(0.72 0.19 145 / 0.15)' }}>
                  <Star size={16} fill="currentColor" style={{ color: 'oklch(0.72 0.19 145)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mod.title}</p>
                  <p style={{ color: 'oklch(0.72 0.19 145)', fontSize: '0.75rem', fontWeight: 600 }}>+{mod.expReward} EXP</p>
                </div>
                <TrendingUp size={16} style={{ color: 'oklch(0.72 0.19 145)', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleCard({ mod, delay, onClick }: { mod: Module; delay: number; onClick: () => void }) {
  const catColor = mod.category === 'saham' ? 'oklch(0.60 0.20 265)' : 'oklch(0.80 0.17 75)';

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay }} onClick={onClick}
      className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:scale-[1.01] active:scale-[0.99]"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
        <img src={mod.thumbnail} alt={mod.title} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-md" style={{ background: `${catColor}18`, color: catColor, fontSize: '0.65rem', fontWeight: 700 }}>
            {mod.category === 'saham' ? 'SAHAM' : 'KEUANGAN'}
          </span>
        </div>
        <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.4 }}>{mod.title}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>⏱ {mod.duration}</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--exp-color)', fontWeight: 600 }}>+{mod.expReward} EXP</span>
        </div>
      </div>
      <ChevronRight size={18} className="text-muted-foreground flex-shrink-0" />
    </motion.button>
  );
}

export function LockedModuleCard({ mod }: { mod: Module }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl opacity-50"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 relative">
        <img src={mod.thumbnail} alt="" className="w-full h-full object-cover" style={{ filter: 'grayscale(1)' }} />
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <Lock size={18} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-md" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '0.65rem', fontWeight: 700 }}>
            LEVEL {mod.minLevel}
          </span>
        </div>
        <p className="text-foreground truncate" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{mod.title}</p>
        <p className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>Naik level untuk membuka</p>
      </div>
      <Lock size={18} className="text-muted-foreground flex-shrink-0" />
    </div>
  );
}
