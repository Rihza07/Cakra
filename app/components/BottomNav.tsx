import { Home, BookOpen, Bot, Target, Swords, UserCircle } from 'lucide-react';
import type { Screen } from './types';

interface BottomNavProps {
  current: Screen;
  navigate: (screen: Screen) => void;
}

const NAV_ITEMS = [
  { screen: 'home' as Screen, icon: Home, label: 'Beranda' },
  { screen: 'modules' as Screen, icon: BookOpen, label: 'Materi' },
  { screen: 'ai-assistant' as Screen, icon: Bot, label: 'AI' },
  { screen: 'missions' as Screen, icon: Target, label: 'Misi' },
  { screen: 'challenge' as Screen, icon: Swords, label: 'Challenge' },
  { screen: 'profile' as Screen, icon: UserCircle, label: 'Profil' },
];

function isActive(current: Screen, screen: Screen) {
  if (screen === 'modules') return current === 'modules' || current === 'module-detail';
  if (screen === 'challenge') return current === 'challenge' || current === 'challenge-15day' || current === 'portfolio-sim';
  if (screen === 'profile') return current === 'profile' || current === 'settings';
  return current === screen;
}

export function BottomNav({ current, navigate }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ background: 'oklch(0.12 0.025 255 / 0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ screen, icon: Icon, label }) => {
          const active = isActive(current, screen);
          return (
            <button key={screen} onClick={() => navigate(screen)}
              className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all"
              style={{ flex: 1 }}>
              <div className="w-10 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: active ? 'oklch(0.72 0.19 145 / 0.15)' : 'transparent' }}>
                <Icon size={20} style={{ color: active ? 'oklch(0.72 0.19 145)' : 'var(--muted-foreground)', strokeWidth: active ? 2.5 : 1.5 }} />
              </div>
              <span style={{
                fontSize: '0.6rem', fontWeight: active ? 700 : 500,
                color: active ? 'oklch(0.72 0.19 145)' : 'var(--muted-foreground)',
                letterSpacing: '0.02em',
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface SidebarNavProps {
  current: Screen;
  navigate: (screen: Screen) => void;
  user: { name: string; level: number; exp: number; maxExp: number; streak: number };
}

export function SidebarNav({ current, navigate, user }: SidebarNavProps) {
  return (
    <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 sticky top-0 h-screen"
      style={{ background: 'oklch(0.12 0.025 255)', borderRight: '1px solid var(--border)' }}>
      {/* Logo */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'oklch(0.72 0.19 145)' }}>
            <span style={{ color: 'oklch(0.12 0.02 145)', fontWeight: 900, fontSize: '1rem' }}>C</span>
          </div>
          <span className="text-foreground" style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em' }}>CAKRA</span>
        </div>
      </div>

      {/* User card */}
      <button onClick={() => navigate('profile')}
        className="mx-4 mb-6 p-4 rounded-xl text-left transition-all hover:opacity-80"
        style={{ background: isActive(current, 'profile') ? 'oklch(0.72 0.19 145 / 0.1)' : 'var(--card)', border: `1px solid ${isActive(current, 'profile') ? 'oklch(0.72 0.19 145 / 0.3)' : 'var(--border)'}` }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'oklch(0.72 0.19 145 / 0.2)' }}>
            <span style={{ fontWeight: 800, color: 'oklch(0.72 0.19 145)' }}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-foreground truncate" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'oklch(0.72 0.19 145)', fontWeight: 600 }}>Level {user.level}</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-muted-foreground" style={{ fontSize: '0.7rem' }}>{user.exp} / {user.maxExp} EXP</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--streak-color)', fontWeight: 700 }}>🔥 {user.streak} hari</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(user.exp / user.maxExp) * 100}%`, background: 'oklch(0.72 0.19 145)' }} />
        </div>
      </button>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ screen, icon: Icon, label }) => {
          const active = isActive(current, screen);
          return (
            <button key={screen} onClick={() => navigate(screen)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
              style={{ background: active ? 'oklch(0.72 0.19 145 / 0.12)' : 'transparent', border: active ? '1px solid oklch(0.72 0.19 145 / 0.25)' : '1px solid transparent' }}>
              <Icon size={18} style={{ color: active ? 'oklch(0.72 0.19 145)' : 'var(--muted-foreground)', strokeWidth: active ? 2.5 : 1.5, flexShrink: 0 }} />
              <span style={{ fontWeight: active ? 700 : 500, fontSize: '0.9rem', color: active ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 text-center">
        <p className="text-muted-foreground" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>CAKRA v1.0 Beta</p>
      </div>
    </aside>
  );
}
