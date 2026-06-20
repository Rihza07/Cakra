import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, BookOpen, Video, ChevronRight, Lock, CheckCircle, Filter } from 'lucide-react';
import type { Screen } from './types';
import { MODULES } from './data';
import { LockedModuleCard } from './HomePage';

interface ModulesPageProps {
  userLevel: number;
  navigate: (screen: Screen, moduleId?: string) => void;
  completedModules: string[];
}

const LEVEL_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: 'Level 1 — Dasar', color: 'oklch(0.80 0.17 75)' },
  2: { label: 'Level 2 — Menengah', color: 'oklch(0.72 0.19 145)' },
  3: { label: 'Level 3 — Mahir', color: 'oklch(0.60 0.20 265)' },
  4: { label: 'Level 4 — Expert', color: 'oklch(0.65 0.18 310)' },
};

export function ModulesPage({ userLevel, navigate, completedModules }: ModulesPageProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'semua' | 'keuangan' | 'saham'>('semua');

  const filtered = MODULES.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'semua' || m.category === filter;
    return matchSearch && matchFilter;
  });

  const levels = [1, 2, 3, 4];

  return (
    <div className="pb-24 lg:pb-8">
      <div className="p-5 pb-3">
        <h1 className="text-foreground mb-1" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Modul Materi</h1>
        <p className="text-muted-foreground mb-5" style={{ fontSize: '0.875rem' }}>Belajar bertahap sesuai levelmu</p>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Cari modul materi..."
            className="w-full pl-11 pr-4 py-3 rounded-xl text-foreground placeholder:text-muted-foreground outline-none"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', fontSize: '0.9rem' }}
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {(['semua', 'keuangan', 'saham'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-full transition-all"
              style={{
                background: filter === f ? 'oklch(0.72 0.19 145)' : 'var(--muted)',
                color: filter === f ? 'oklch(0.12 0.02 145)' : 'var(--muted-foreground)',
                fontWeight: filter === f ? 700 : 500, fontSize: '0.8rem',
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Progress summary */}
      <div className="px-5 mb-5">
        <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'oklch(0.72 0.19 145 / 0.15)', border: '2px solid oklch(0.72 0.19 145 / 0.4)' }}>
            <span style={{ fontWeight: 900, fontSize: '1.1rem', color: 'oklch(0.72 0.19 145)' }}>
              {completedModules.length}
            </span>
          </div>
          <div>
            <p className="text-foreground" style={{ fontWeight: 700 }}>{completedModules.length} dari {MODULES.length} modul selesai</p>
            <p className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>Kamu di Level {userLevel} — terus semangat!</p>
          </div>
          <div className="ml-auto">
            <div className="relative w-12 h-12">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none"
                  stroke="oklch(0.72 0.19 145)" strokeWidth="3"
                  strokeDasharray={`${(completedModules.length / MODULES.length) * 94.2} 94.2`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'oklch(0.72 0.19 145)' }}>
                {Math.round((completedModules.length / MODULES.length) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Module list by level */}
      {levels.map(lvl => {
        const mods = filtered.filter(m => m.level === lvl);
        if (mods.length === 0) return null;
        const info = LEVEL_LABELS[lvl];
        const isLocked = userLevel < lvl;

        return (
          <div key={lvl} className="px-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              {isLocked ? <Lock size={14} className="text-muted-foreground" /> : <CheckCircle size={14} style={{ color: info.color }} />}
              <h2 style={{ fontWeight: 700, fontSize: '0.9rem', color: isLocked ? 'var(--muted-foreground)' : info.color }}>
                {info.label}
              </h2>
              {isLocked && (
                <span className="ml-auto px-2 py-0.5 rounded-md text-muted-foreground"
                  style={{ background: 'var(--muted)', fontSize: '0.7rem', fontWeight: 600 }}>
                  Terkunci
                </span>
              )}
            </div>
            <div className="space-y-3">
              {mods.map((mod, i) => {
                if (isLocked) return <LockedModuleCard key={mod.id} mod={mod} />;
                const done = completedModules.includes(mod.id);
                const catColor = mod.category === 'saham' ? 'oklch(0.60 0.20 265)' : 'oklch(0.80 0.17 75)';

                return (
                  <motion.button key={mod.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => navigate('module-detail', mod.id)}
                    className="w-full text-left rounded-xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: 'var(--card)', border: `1px solid ${done ? 'oklch(0.72 0.19 145 / 0.3)' : 'var(--border)'}` }}>
                    <div className="relative h-28 overflow-hidden">
                      <img src={mod.thumbnail} alt={mod.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 100%)' }} />
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md text-white" style={{ background: catColor, fontSize: '0.65rem', fontWeight: 700 }}>
                          {mod.category === 'saham' ? 'SAHAM' : 'KEUANGAN'}
                        </span>
                        <span className="px-2 py-0.5 rounded-md flex items-center gap-1"
                          style={{ background: 'rgba(0,0,0,0.5)', fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>
                          <Video size={10} /> VIDEO
                        </span>
                      </div>
                      {done && (
                        <div className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center"
                          style={{ background: 'oklch(0.72 0.19 145)' }}>
                          <CheckCircle size={14} className="text-white" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                        <p className="text-white" style={{ fontWeight: 700, fontSize: '0.95rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)', flex: 1, marginRight: '8px', lineHeight: 1.3 }}>
                          {mod.title}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <BookOpen size={13} />
                        <span style={{ fontSize: '0.72rem' }}>{mod.duration}</span>
                      </div>
                      <div className="w-px h-4" style={{ background: 'var(--border)' }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--exp-color)', fontWeight: 600 }}>+{mod.expReward} EXP</span>
                      <div className="ml-auto flex items-center gap-1" style={{ color: done ? 'oklch(0.72 0.19 145)' : 'var(--muted-foreground)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{done ? 'Selesai' : 'Mulai'}</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
