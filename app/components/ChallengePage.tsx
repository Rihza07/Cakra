import { motion } from 'motion/react';
import { TrendingUp, BarChart3, ChevronRight, Calendar, Target, Trophy, Zap } from 'lucide-react';
import type { Screen } from './types';

interface ChallengePageProps {
  navigate: (screen: Screen, moduleId?: string) => void;
  challengeDay: number;
}

export function ChallengePage({ navigate, challengeDay }: ChallengePageProps) {
  const challenges = [
    {
      id: 'challenge-15day' as Screen,
      icon: '📈',
      title: 'Investasi 15 Hari',
      description: 'Simulasi investasi saham selama 15 hari. Ikuti pergerakan harga, ambil keputusan buy/sell, dan lihat hasil portofoliomu di hari ke-15.',
      expReward: 500,
      duration: '15 Hari',
      difficulty: 'Menengah',
      diffColor: 'oklch(0.80 0.17 75)',
      features: ['Data harga saham real-time simulasi', 'Keputusan buy/sell setiap hari', 'Review performa di akhir periode'],
      participants: '2.847',
      currentDay: challengeDay,
      totalDays: 15,
      color: 'oklch(0.72 0.19 145)',
      bg: 'oklch(0.72 0.19 145 / 0.08)',
      border: 'oklch(0.72 0.19 145 / 0.25)',
    },
    {
      id: 'portfolio-sim' as Screen,
      icon: '💼',
      title: 'Simulasi Portofolio',
      description: 'Kelola portofolio investasi virtual dengan modal awal Rp10 juta. Alokasikan aset, pantau kinerja, dan optimalkan strategi investasimu.',
      expReward: 300,
      duration: 'Fleksibel',
      difficulty: 'Pemula',
      diffColor: 'oklch(0.72 0.19 145)',
      features: ['Modal awal Rp10 juta virtual', 'Pilihan saham & reksa dana', 'Analisis performa portofolio'],
      participants: '5.124',
      currentDay: 0,
      totalDays: 0,
      color: 'oklch(0.60 0.20 265)',
      bg: 'oklch(0.60 0.20 265 / 0.08)',
      border: 'oklch(0.60 0.20 265 / 0.25)',
    },
  ];

  return (
    <div className="pb-24 lg:pb-8">
      <div className="p-5 pb-4">
        <h1 className="text-foreground mb-1" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Challenge</h1>
        <p className="text-muted-foreground mb-5" style={{ fontSize: '0.875rem' }}>Uji kemampuan investasimu dengan simulasi nyata</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Challenge Aktif', value: '2', icon: Target, color: 'oklch(0.72 0.19 145)' },
            { label: 'Total Peserta', value: '7.9K', icon: Trophy, color: 'oklch(0.80 0.17 75)' },
            { label: 'EXP Tersedia', value: '800', icon: Zap, color: 'oklch(0.60 0.20 265)' },
          ].map(item => (
            <div key={item.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <item.icon size={18} style={{ color: item.color, margin: '0 auto 4px' }} />
              <p style={{ fontWeight: 800, fontSize: '1rem', color: item.color }}>{item.value}</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.65rem' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Challenge cards */}
      <div className="px-5 space-y-4">
        {challenges.map((ch, i) => (
          <motion.div key={ch.id}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: ch.bg, border: `1px solid ${ch.border}` }}>
            {/* Progress bar for 15-day challenge */}
            {ch.totalDays > 0 && ch.currentDay > 0 && (
              <div className="h-1" style={{ background: 'var(--muted)' }}>
                <div className="h-full" style={{ width: `${(ch.currentDay / ch.totalDays) * 100}%`, background: ch.color }} />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{ch.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h2 className="text-foreground" style={{ fontWeight: 800, fontSize: '1.05rem' }}>{ch.title}</h2>
                    <span className="px-2 py-0.5 rounded-full" style={{ background: `${ch.diffColor}22`, color: ch.diffColor, fontSize: '0.65rem', fontWeight: 700 }}>
                      {ch.difficulty}
                    </span>
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>{ch.description}</p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                {ch.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                    <span className="text-muted-foreground" style={{ fontSize: '0.8rem' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Meta info */}
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-muted-foreground" />
                  <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>{ch.duration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Trophy size={13} style={{ color: 'var(--exp-color)' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--exp-color)', fontWeight: 700 }}>+{ch.expReward} EXP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground" style={{ fontSize: '0.78rem' }}>{ch.participants} peserta</span>
                </div>
              </div>

              {/* Progress for 15-day challenge */}
              {ch.totalDays > 0 && (
                <div className="rounded-xl p-3 mb-4 flex items-center gap-3"
                  style={{ background: `${ch.color}15`, border: `1px solid ${ch.color}30` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ch.color}25` }}>
                    <span style={{ fontWeight: 900, color: ch.color, fontSize: '1rem' }}>
                      {ch.currentDay}
                    </span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, color: ch.color, fontSize: '0.85rem' }}>
                      {ch.currentDay === 0 ? 'Belum dimulai' : `Hari ${ch.currentDay} dari ${ch.totalDays}`}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>
                      {ch.currentDay === 0 ? 'Mulai challenge hari ini!' : `${ch.totalDays - ch.currentDay} hari tersisa`}
                    </p>
                  </div>
                </div>
              )}

              <button onClick={() => navigate(ch.id)}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
                style={{ background: ch.color, color: 'oklch(0.10 0.025 255)', fontWeight: 700 }}>
                {ch.totalDays > 0 && ch.currentDay > 0 ? 'Lanjutkan Challenge' : 'Mulai Challenge'}
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement section */}
      <div className="px-5 mt-6">
        <h2 className="text-foreground mb-3" style={{ fontWeight: 700, fontSize: '1rem' }}>Lencana Challenge</h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { emoji: '🌱', label: 'Pemula', unlocked: true },
            { emoji: '📈', label: 'Trader', unlocked: challengeDay >= 15 },
            { emoji: '💼', label: 'Investor', unlocked: false },
            { emoji: '🏆', label: 'Master', unlocked: false },
          ].map(badge => (
            <div key={badge.label} className="rounded-xl p-3 text-center"
              style={{ background: badge.unlocked ? 'var(--card)' : 'var(--muted)', border: badge.unlocked ? '1px solid var(--border)' : 'none', opacity: badge.unlocked ? 1 : 0.5 }}>
              <div className="text-2xl mb-1" style={{ filter: badge.unlocked ? 'none' : 'grayscale(1)' }}>
                {badge.emoji}
              </div>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: badge.unlocked ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {badge.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
