import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Flame, Target, Trophy, Zap } from 'lucide-react';
import type { Mission } from './types';
import { MISSIONS } from './data';

interface MissionsPageProps {
  completedMissions: string[];
  setCompletedMissions: React.Dispatch<React.SetStateAction<string[]>>;
  addExp: (amount: number, reason?: string) => void;
  completedModules: string[];
  streak: number;
}

export function MissionsPage({ completedMissions, setCompletedMissions, addExp, completedModules, streak }: MissionsPageProps) {
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const missions = MISSIONS.map(m => {
    let progress = m.progress;
    const done = completedMissions.includes(m.id);

    if (m.id === 'dm1') progress = Math.min(completedModules.length, m.target);
    if (m.id === 'dm2') progress = 1;
    if (m.id === 'wm1') progress = Math.min(completedModules.length, m.target);
    if (m.id === 'wm2') progress = Math.min(streak, m.target);

    return { ...m, progress, completed: done || progress >= m.target };
  });

  const filtered = missions.filter(m => m.type === tab);
  const totalExp = filtered.reduce((acc, m) => acc + (m.completed ? m.expReward : 0), 0);
  const maxExp = filtered.reduce((acc, m) => acc + m.expReward, 0);
  const completedCount = filtered.filter(m => m.completed).length;

  const claimMission = (mission: Mission) => {
    if (completedMissions.includes(mission.id)) return;
    if (mission.progress < mission.target && !['dm2'].includes(mission.id)) return;
    setCompletedMissions(prev => [...prev, mission.id]);
    addExp(mission.expReward, `Misi: ${mission.title}`);
  };

  const resetTime = tab === 'daily' ? 'Reset tengah malam' : 'Reset Senin depan';

  return (
    <div className="pb-24 lg:pb-8">
      <div className="p-5 pb-3">
        <h1 className="text-foreground mb-1" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Misi</h1>
        <p className="text-muted-foreground mb-5" style={{ fontSize: '0.875rem' }}>Selesaikan misi untuk mendapatkan EXP</p>

        {/* Tab */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--muted)' }}>
          {(['daily', 'weekly'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 rounded-lg relative transition-all"
              style={{ fontWeight: 600, fontSize: '0.9rem' }}>
              {tab === t && <motion.div layoutId="mission-tab" className="absolute inset-0 rounded-lg" style={{ background: 'var(--card)', boxShadow: '0 1px 6px oklch(0 0 0 / 0.3)' }} />}
              <span className="relative z-10 flex items-center justify-center gap-2"
                style={{ color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {t === 'daily' ? <Flame size={16} /> : <Trophy size={16} />}
                {t === 'daily' ? 'Harian' : 'Mingguan'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress overview */}
      <div className="px-5 mb-5">
        <div className="rounded-2xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-foreground" style={{ fontWeight: 700 }}>{completedCount}/{filtered.length} Misi Selesai</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock size={12} className="text-muted-foreground" />
                <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{resetTime}</span>
              </div>
            </div>
            <div className="text-right">
              <p style={{ fontWeight: 800, color: 'var(--exp-color)', fontSize: '1.2rem' }}>{totalExp}</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>/{maxExp} EXP</p>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <motion.div className="h-full rounded-full"
              animate={{ width: `${maxExp > 0 ? (totalExp / maxExp) * 100 : 0}%` }}
              style={{ background: 'linear-gradient(90deg, oklch(0.72 0.19 145), oklch(0.80 0.17 75))' }} />
          </div>
        </div>
      </div>

      {/* Mission list */}
      <div className="px-5 space-y-3">
        {filtered.map((mission, i) => {
          const progressPct = Math.min((mission.progress / mission.target) * 100, 100);
          const canClaim = mission.progress >= mission.target && !completedMissions.includes(mission.id);
          const claimed = completedMissions.includes(mission.id);

          return (
            <motion.div key={mission.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4"
              style={{
                background: claimed ? 'oklch(0.72 0.19 145 / 0.05)' : 'var(--card)',
                border: `1px solid ${claimed ? 'oklch(0.72 0.19 145 / 0.25)' : 'var(--border)'}`,
              }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
                  style={{ background: claimed ? 'oklch(0.72 0.19 145 / 0.1)' : 'var(--muted)' }}>
                  {mission.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-foreground" style={{ fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {mission.title}
                    </p>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--exp-color)', flexShrink: 0 }}>
                      +{mission.expReward} EXP
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3" style={{ fontSize: '0.78rem', lineHeight: 1.5 }}>
                    {mission.description}
                  </p>

                  {/* Progress bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
                      <motion.div className="h-full rounded-full"
                        animate={{ width: `${progressPct}%` }}
                        style={{ background: claimed ? 'oklch(0.72 0.19 145)' : 'oklch(0.80 0.17 75)' }} />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--muted-foreground)', flexShrink: 0 }}>
                      {mission.progress}/{mission.target}
                    </span>
                  </div>

                  {/* Action button */}
                  {claimed ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={15} style={{ color: 'oklch(0.72 0.19 145)' }} />
                      <span style={{ color: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '0.82rem' }}>Misi Selesai!</span>
                    </div>
                  ) : canClaim ? (
                    <button onClick={() => claimMission(mission)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
                      style={{ background: 'oklch(0.72 0.19 145)', color: 'oklch(0.12 0.02 145)' }}>
                      <Zap size={14} />
                      <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>Klaim {mission.expReward} EXP</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Target size={13} className="text-muted-foreground" />
                      <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>
                        {mission.target - mission.progress} lagi untuk selesai
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="px-5 mt-6">
        <div className="rounded-xl p-4" style={{ background: 'oklch(0.60 0.20 265 / 0.08)', border: '1px solid oklch(0.60 0.20 265 / 0.2)' }}>
          <p style={{ color: 'oklch(0.60 0.20 265)', fontWeight: 700, fontSize: '0.82rem', marginBottom: '4px' }}>
            💡 Tips Menyelesaikan Misi
          </p>
          <p className="text-muted-foreground" style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
            Selesaikan modul materi untuk maju di misi "Selesaikan Modul". Login setiap hari membangun streak-mu.
            Coba fitur Challenge dan AI Assistant untuk misi lainnya!
          </p>
        </div>
      </div>
    </div>
  );
}
