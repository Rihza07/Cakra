import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle, Brain, Target } from 'lucide-react';
import { PLACEMENT_QUESTIONS } from './data';

interface PlacementTestProps {
  onComplete: (score: number) => void;
}

export function PlacementTest({ onComplete }: PlacementTestProps) {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      if (current + 1 >= PLACEMENT_QUESTIONS.length) {
        setStep('result');
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 900);
  };

  const score = answers.filter((a, i) => a === PLACEMENT_QUESTIONS[i].answer).length;
  const level = score <= 2 ? 'pemula' : score <= 4 ? 'menengah' : 'mahir';
  const levelLabel = level === 'pemula' ? 'Pemula' : level === 'menengah' ? 'Menengah' : 'Mahir';
  const levelColor = level === 'pemula' ? 'oklch(0.80 0.17 75)' : level === 'menengah' ? 'oklch(0.72 0.19 145)' : 'oklch(0.60 0.20 265)';
  const startLevel = level === 'pemula' ? 1 : level === 'menengah' ? 2 : 3;

  const q = PLACEMENT_QUESTIONS[current];
  const progress = ((current) / PLACEMENT_QUESTIONS.length) * 100;

  if (step === 'intro') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'oklch(0.72 0.19 145 / 0.15)', border: '1px solid oklch(0.72 0.19 145 / 0.3)' }}>
            <Brain size={44} style={{ color: 'oklch(0.72 0.19 145)' }} />
          </div>
          <h1 className="text-foreground mb-3" style={{ fontWeight: 800, fontSize: '2rem' }}>Placement Test</h1>
          <p className="text-muted-foreground mb-8" style={{ lineHeight: 1.7 }}>
            Sebelum mulai belajar, kami perlu mengukur tingkat pemahamanmu saat ini. Tes ini terdiri dari{' '}
            <strong className="text-foreground">{PLACEMENT_QUESTIONS.length} pertanyaan</strong> pilihan ganda tentang
            literasi keuangan dan investasi.
          </p>

          <div className="rounded-2xl p-5 mb-8 text-left space-y-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {[
              { icon: '⏱️', text: `${PLACEMENT_QUESTIONS.length} pertanyaan, sekitar 5–7 menit` },
              { icon: '🎯', text: 'Hasil menentukan level awal dan modul yang terbuka' },
              { icon: '🔄', text: 'Tidak perlu sempurna — jawab sesuai kemampuanmu' },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{item.icon}</span>
                <span className="text-foreground" style={{ fontSize: '0.9rem' }}>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('test')}
            className="w-full py-4 rounded-xl text-primary-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '1rem' }}>
            Mulai Tes <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 'result') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">{score >= 5 ? '🏆' : score >= 3 ? '🎯' : '📚'}</div>
          <h1 className="text-foreground mb-2" style={{ fontWeight: 800, fontSize: '2rem' }}>
            Tes Selesai!
          </h1>
          <p className="text-muted-foreground mb-6">Berikut hasil placement test-mu</p>

          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="text-5xl mb-3" style={{ fontWeight: 900, color: levelColor }}>
              {score}/{PLACEMENT_QUESTIONS.length}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4"
              style={{ background: `${levelColor}22`, border: `1px solid ${levelColor}55` }}>
              <Target size={14} style={{ color: levelColor }} />
              <span style={{ color: levelColor, fontWeight: 700 }}>Level {levelLabel}</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              {level === 'pemula' && 'Kamu akan memulai dari dasar-dasar keuangan pribadi. Langkah yang bagus!'}
              {level === 'menengah' && 'Kamu sudah paham dasar-dasar! Modul pasar modal menunggumu.'}
              {level === 'mahir' && 'Pengetahuanmu sudah solid! Langsung ke analisis mendalam.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-8">
            {['Benar', 'Salah', 'Level Awal'].map((label, i) => (
              <div key={label} className="rounded-xl p-3" style={{ background: 'var(--muted)' }}>
                <p style={{ fontWeight: 800, fontSize: '1.25rem', color: i === 0 ? 'oklch(0.72 0.19 145)' : i === 1 ? 'oklch(0.55 0.22 25)' : 'var(--exp-color)' }}>
                  {i === 0 ? score : i === 1 ? PLACEMENT_QUESTIONS.length - score : startLevel}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{label}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => onComplete(score)}
            className="w-full py-4 rounded-xl text-primary-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '1rem' }}>
            Mulai Belajar! <ChevronRight size={20} />
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Progress bar */}
      <div className="p-4 pt-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-muted-foreground" style={{ fontSize: '0.85rem' }}>Pertanyaan {current + 1} dari {PLACEMENT_QUESTIONS.length}</span>
            <span style={{ color: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '0.85rem' }}>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <motion.div className="h-full rounded-full" animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }} style={{ background: 'oklch(0.72 0.19 145)' }} />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          <AnimatePresence mode="wait">
            <motion.div key={current}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
              <div className="rounded-2xl p-6 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'oklch(0.72 0.19 145 / 0.15)' }}>
                  <span style={{ color: 'oklch(0.72 0.19 145)', fontWeight: 800 }}>{current + 1}</span>
                </div>
                <p className="text-foreground" style={{ fontWeight: 600, fontSize: '1.05rem', lineHeight: 1.6 }}>
                  {q.question}
                </p>
              </div>

              <div className="space-y-3">
                {q.options.map((opt, idx) => {
                  const isSelected = selected === idx;
                  const isCorrect = idx === q.answer;
                  const showResult = selected !== null;
                  let bg = 'var(--card)';
                  let border = 'var(--border)';
                  let textColor = 'var(--foreground)';

                  if (showResult && isCorrect) { bg = 'oklch(0.72 0.19 145 / 0.15)'; border = 'oklch(0.72 0.19 145)'; textColor = 'oklch(0.72 0.19 145)'; }
                  else if (showResult && isSelected && !isCorrect) { bg = 'oklch(0.55 0.22 25 / 0.15)'; border = 'oklch(0.55 0.22 25)'; textColor = 'oklch(0.55 0.22 25)'; }

                  return (
                    <motion.button
                      key={idx} onClick={() => handleAnswer(idx)}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all"
                      style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: selected !== null ? 'default' : 'pointer' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: showResult && isCorrect ? 'oklch(0.72 0.19 145)' : showResult && isSelected && !isCorrect ? 'oklch(0.55 0.22 25)' : 'var(--muted)' }}>
                        {showResult && isCorrect ? <CheckCircle size={16} className="text-white" /> :
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                            {String.fromCharCode(65 + idx)}
                          </span>}
                      </div>
                      <span style={{ fontWeight: 500, lineHeight: 1.5 }}>{opt}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
