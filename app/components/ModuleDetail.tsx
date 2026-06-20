import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Play, CheckCircle, XCircle, BookOpen, Clock, Zap, Video, FileText } from 'lucide-react';
import type { Screen } from './types';
import { MODULES, QUIZ_QUESTIONS } from './data';

interface ModuleDetailProps {
  moduleId: string;
  navigate: (screen: Screen, moduleId?: string) => void;
  addExp: (amount: number, reason?: string) => void;
  completedModules: string[];
  setCompletedModules: React.Dispatch<React.SetStateAction<string[]>>;
}

const MODULE_CONTENT: Record<string, string[]> = {
  m1: [
    'Keuangan pribadi adalah cara kita mengelola uang untuk memenuhi kebutuhan hidup, mencapai tujuan, dan mempersiapkan masa depan.',
    'Prinsip dasar: **Pendapatan > Pengeluaran**. Selisihnya disebut tabungan yang bisa diinvestasikan.',
    'Aturan 50/30/20: 50% kebutuhan, 30% keinginan, 20% tabungan & investasi.',
    'Dana darurat adalah fondasi keuangan: siapkan 3–6 bulan pengeluaran dalam instrumen yang mudah dicairkan.',
    'Strategi "Pay Yourself First": segera sisihkan tabungan/investasi begitu menerima penghasilan, sebelum belanja.',
    'Buat anggaran bulanan dan lacak pengeluaran — ini adalah langkah pertama menuju kebebasan finansial.',
  ],
  m2: [
    'Inflasi adalah kenaikan harga barang dan jasa secara umum dan terus-menerus dari waktu ke waktu.',
    'Inflasi menggerus daya beli uang: uang Rp1 juta hari ini akan membeli lebih sedikit 10 tahun lagi.',
    'Bank Indonesia menargetkan inflasi 2–4% per tahun melalui kebijakan suku bunga (BI Rate).',
    'Investasi bertujuan mengalahkan inflasi: return investasi harus > tingkat inflasi agar kekayaan riil bertumbuh.',
    'Reksa dana saham dan saham historis memberikan return di atas inflasi jangka panjang.',
    'Deflasi (penurunan harga) juga berbahaya karena menurunkan keuntungan bisnis dan mendorong PHK.',
  ],
  m3: [
    'Rekening tabungan: cocok untuk dana darurat dan kebutuhan jangka pendek, mudah dicairkan.',
    'Deposito: bunga lebih tinggi (3–6% p.a.) dengan jangka waktu tertentu (1, 3, 6, 12 bulan).',
    'LPS (Lembaga Penjamin Simpanan) menjamin simpanan nasabah hingga Rp2 miliar per bank.',
    'Pilih bank dengan bunga tabungan tinggi, biaya administrasi rendah, dan layanan digital yang baik.',
    'Strategi terbaik: jadwalkan transfer otomatis ke rekening tabungan/investasi setiap awal bulan.',
    'Perhatikan fitur bank digital: bebas biaya transfer, bunga tinggi, dan kemudahan manajemen keuangan.',
  ],
  m4: [
    'Bursa Efek Indonesia (BEI) adalah pasar tempat saham perusahaan publik diperdagangkan.',
    'OJK (Otoritas Jasa Keuangan) mengawasi dan mengatur seluruh industri keuangan termasuk pasar modal.',
    'Instrumen pasar modal: saham, obligasi, reksa dana, ETF, waran, dan instrumen derivatif.',
    '1 lot saham di BEI = 100 lembar. Contoh: BBCA Rp9.000/lembar = 1 lot senilai Rp900.000.',
    'Manfaat berinvestasi saham: dividen (bagian laba) dan capital gain (kenaikan harga saham).',
    'Risiko saham: harga bisa turun (capital loss), perusahaan bisa bangkrut, dan likuiditas rendah untuk saham kecil.',
  ],
  m5: [
    'Reksa dana adalah wadah menghimpun dana dari banyak investor yang dikelola manajer investasi profesional.',
    'Jenis reksa dana berdasarkan risiko: Pasar Uang < Pendapatan Tetap < Campuran < Saham.',
    'NAB (Nilai Aktiva Bersih) adalah harga per unit penyertaan reksa dana, dihitung setiap hari.',
    'Keunggulan: diversifikasi otomatis, dikelola profesional, bisa mulai dari Rp10.000.',
    'Perhatikan expense ratio (biaya pengelolaan) yang mempengaruhi return bersih investor.',
    'Platform investasi reksa dana: Bibit, Bareksa, Ajaib, dan aplikasi perbankan digital.',
  ],
  m6: [
    'Obligasi adalah surat utang yang diterbitkan perusahaan/pemerintah dengan janji membayar bunga (kupon) dan pokok.',
    'ORI (Obligasi Ritel Indonesia) dan SBR (Saving Bond Ritel) adalah produk investasi aman dari pemerintah.',
    'Kupon obligasi dibayar berkala (bulanan/kuartalan) dan pokok dibayar saat jatuh tempo.',
    'Hubungan harga dan yield: harga obligasi naik → yield turun, dan sebaliknya.',
    'Rating obligasi: AAA (paling aman) hingga D (default). Makin tinggi risiko, makin tinggi kupon.',
    'YTM (Yield to Maturity) adalah total return jika obligasi dipegang hingga jatuh tempo.',
  ],
  m7: [
    'Analisis fundamental menilai nilai intrinsik saham berdasarkan kinerja keuangan perusahaan.',
    'PER (Price to Earnings Ratio) = Harga Saham ÷ EPS. PER rendah bisa berarti saham murah.',
    'PBV (Price to Book Value) = Harga ÷ Nilai Buku per Saham. PBV < 1 = trading below book value.',
    'ROE (Return on Equity) mengukur profitabilitas: ROE > 15% umumnya dianggap baik.',
    'Analisis laporan keuangan: Neraca, Laporan Laba Rugi, dan Laporan Arus Kas.',
    'Valuasi DCF (Discounted Cash Flow) memproyeksikan arus kas masa depan untuk menentukan nilai wajar saham.',
  ],
  m8: [
    'Analisis teknikal menggunakan data historis harga dan volume untuk memprediksi pergerakan harga.',
    'Candlestick: menampilkan harga open, high, low, close dalam satu periode. Pola candlestick memberikan sinyal.',
    'Support: level harga yang sulit ditembus ke bawah. Resistance: level yang sulit ditembus ke atas.',
    'Moving Average (MA): rata-rata harga selama periode tertentu. MA 50 dan 200 paling populer.',
    'RSI (Relative Strength Index): > 70 = overbought, < 30 = oversold. Berguna untuk identifikasi pembalikan.',
    'Golden Cross: MA jangka pendek memotong MA jangka panjang ke atas = sinyal bullish kuat.',
  ],
  m9: [
    'Diversifikasi: "jangan taruh semua telur dalam satu keranjang" — sebarkan investasi ke berbagai aset.',
    'Korelasi aset: pilih aset dengan korelasi rendah/negatif untuk mengurangi risiko portofolio.',
    'Stop Loss: order otomatis menjual saham jika harga turun ke level tertentu untuk membatasi kerugian.',
    'Position Sizing: tentukan berapa persen modal yang dialokasikan per posisi. Umumnya maksimal 5–10%.',
    'Risk/Reward Ratio: minimal 1:2, artinya potensi keuntungan 2x lipat dari risiko yang diambil.',
    'Rebalancing: sesuaikan ulang alokasi aset secara berkala agar sesuai target risiko dan return.',
  ],
  m10: [
    'Swing trading: menangkap pergerakan harga dalam 2–14 hari menggunakan analisis teknikal dan fundamental.',
    'Momentum investing: membeli aset yang memiliki tren kuat, didukung volume tinggi dan sentimen positif.',
    'Fibonacci Retracement: level 38.2%, 50%, dan 61.8% sering menjadi area support/resistance kuat.',
    'Volume Profile: menunjukkan distribusi volume pada level harga tertentu; area high volume = support/resistance kuat.',
    'VWAP (Volume Weighted Average Price): harga rata-rata berbobot volume, digunakan sebagai acuan institusi.',
    'Market structure: identifikasi Higher Highs & Higher Lows (uptrend) vs Lower Highs & Lower Lows (downtrend).',
  ],
  m11: [
    'Hedging adalah strategi melindungi portofolio dari kerugian besar menggunakan instrumen derivatif.',
    'Opsi Call: hak membeli aset pada harga tertentu (strike price) sebelum tanggal kedaluwarsa.',
    'Opsi Put: hak menjual aset pada strike price tertentu — digunakan untuk melindungi posisi long.',
    'Kontrak Futures: perjanjian membeli/menjual aset di masa depan dengan harga yang disepakati sekarang.',
    'Greeks (Delta, Gamma, Theta, Vega): parameter yang mengukur sensitivitas harga opsi terhadap berbagai faktor.',
    'Covered Call: menjual opsi call atas saham yang dimiliki untuk menghasilkan pendapatan tambahan.',
  ],
  m12: [
    'Teori Markowitz: portofolio optimal memaksimalkan return untuk setiap level risiko (Efficient Frontier).',
    'Sharpe Ratio = (Return Portofolio − Risk-Free Rate) ÷ Standar Deviasi. Makin tinggi, makin baik.',
    'Beta: mengukur sensitivitas portofolio terhadap pasar. Beta > 1 = lebih volatile dari pasar.',
    'Alokasi aset strategis: tentukan proporsi saham, obligasi, dan aset lain sesuai profil risiko.',
    'Rebalancing berkala (triwulan/tahunan) memastikan portofolio kembali ke target alokasi.',
    'Monte Carlo simulation: mensimulasikan ribuan skenario untuk memperkirakan distribusi return portofolio.',
  ],
};

const VIDEO_THUMBNAILS: Record<string, string> = {
  m1: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop&auto=format',
  m2: 'https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?w=800&h=450&fit=crop&auto=format',
  m3: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=450&fit=crop&auto=format',
  m4: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop&auto=format',
  m5: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=800&h=450&fit=crop&auto=format',
  m6: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&h=450&fit=crop&auto=format',
  m7: 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop&auto=format',
  m8: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop&auto=format',
  m9: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop&auto=format',
  m10: 'https://images.unsplash.com/photo-1642543348745-03b1f42b6e4a?w=800&h=450&fit=crop&auto=format',
  m11: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop&auto=format',
  m12: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop&auto=format',
};

type TabType = 'video' | 'materi' | 'quiz';

export function ModuleDetail({ moduleId, navigate, addExp, completedModules, setCompletedModules }: ModuleDetailProps) {
  const mod = MODULES.find(m => m.id === moduleId);
  const [tab, setTab] = useState<TabType>('video');
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [quizDone, setQuizDone] = useState(false);
  const [retrying, setRetrying] = useState(false);

  if (!mod) return null;

  const questions = QUIZ_QUESTIONS[moduleId] ?? [];
  const isCompleted = completedModules.includes(moduleId);
  const catColor = mod.category === 'saham' ? 'oklch(0.60 0.20 265)' : 'oklch(0.80 0.17 75)';
  const content = MODULE_CONTENT[moduleId] ?? [];

  const handleQuizAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => {
      const newAnswers = [...answers, idx];
      setAnswers(newAnswers);
      if (current + 1 >= questions.length) {
        setQuizDone(true);
        const score = newAnswers.filter((a, i) => a === questions[i].answer).length;
        const passed = score >= Math.ceil(questions.length * 0.6);
        if (passed && !isCompleted) {
          setCompletedModules(prev => [...prev, moduleId]);
          addExp(mod.expReward, `Menyelesaikan: ${mod.title}`);
        }
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 900);
  };

  const retryQuiz = () => {
    setCurrent(0);
    setAnswers([]);
    setSelected(null);
    setQuizDone(false);
    setRetrying(true);
  };

  const score = answers.filter((a, i) => a === questions[i].answer).length;
  const passed = score >= Math.ceil(questions.length * 0.6);

  const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'video', label: 'Video', icon: <Video size={15} /> },
    { id: 'materi', label: 'Materi', icon: <FileText size={15} /> },
    { id: 'quiz', label: 'Quiz', icon: <CheckCircle size={15} /> },
  ];

  return (
    <div className="pb-24 lg:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 pt-4 pb-3"
        style={{ background: 'oklch(0.10 0.025 255 / 0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('modules')}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)' }}>
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>
              {mod.category === 'saham' ? 'Investasi Saham' : 'Literasi Keuangan'}
            </p>
            <p className="text-foreground truncate" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{mod.title}</p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: 'oklch(0.72 0.19 145 / 0.15)', border: '1px solid oklch(0.72 0.19 145 / 0.3)' }}>
              <CheckCircle size={12} style={{ color: 'oklch(0.72 0.19 145)' }} />
              <span style={{ color: 'oklch(0.72 0.19 145)', fontSize: '0.7rem', fontWeight: 700 }}>Selesai</span>
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex px-5 pt-4 pb-0 gap-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all flex-1 justify-center"
            style={{
              background: tab === t.id ? 'oklch(0.72 0.19 145)' : 'var(--muted)',
              color: tab === t.id ? 'oklch(0.12 0.02 145)' : 'var(--muted-foreground)',
              fontWeight: tab === t.id ? 700 : 500, fontSize: '0.82rem',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        <AnimatePresence mode="wait">
          {/* VIDEO TAB */}
          {tab === 'video' && (
            <motion.div key="video" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl overflow-hidden mb-5 relative"
                style={{ aspectRatio: '16/9', background: 'oklch(0.08 0.02 255)' }}>
                {!videoPlaying ? (
                  <>
                    <img src={VIDEO_THUMBNAILS[moduleId] ?? mod.thumbnail} alt={mod.title}
                      className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <button onClick={() => setVideoPlaying(true)}
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-2xl"
                        style={{ background: 'oklch(0.72 0.19 145)' }}>
                        <Play size={26} className="text-white ml-1" fill="white" />
                      </button>
                      <span className="text-white" style={{ fontWeight: 600, fontSize: '0.85rem', textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
                        Tonton Video Penjelasan
                      </span>
                    </div>
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(0,0,0,0.6)' }}>
                      <Clock size={12} className="text-white" />
                      <span className="text-white" style={{ fontSize: '0.72rem', fontWeight: 600 }}>{mod.duration}</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4"
                    style={{ background: 'oklch(0.08 0.02 255)' }}>
                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: 'oklch(0.72 0.19 145 / 0.2)' }}>
                      <Video size={30} style={{ color: 'oklch(0.72 0.19 145)' }} />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-foreground mb-1" style={{ fontWeight: 700 }}>Video sedang diputar</p>
                      <p className="text-muted-foreground" style={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                        Dalam versi lengkap, video edukasi tentang <em>{mod.title}</em> akan tampil di sini
                        dari platform pembelajaran CAKRA.
                      </p>
                    </div>
                    <button onClick={() => setVideoPlaying(false)}
                      className="px-4 py-2 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '0.82rem', fontWeight: 600 }}>
                      Tutup Video
                    </button>
                  </div>
                )}
              </div>

              {/* Module info */}
              <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-0.5 rounded-md text-white" style={{ background: catColor, fontSize: '0.65rem', fontWeight: 700 }}>
                    {mod.category === 'saham' ? 'INVESTASI SAHAM' : 'LITERASI KEUANGAN'}
                  </span>
                  <span style={{ color: 'var(--exp-color)', fontSize: '0.75rem', fontWeight: 700 }}>+{mod.expReward} EXP</span>
                </div>
                <h2 className="text-foreground mb-2" style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: 1.4 }}>{mod.title}</h2>
                <p className="text-muted-foreground" style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>{mod.description}</p>
              </div>

              <button onClick={() => setTab('materi')}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{ background: 'oklch(0.72 0.19 145 / 0.1)', border: '1px solid oklch(0.72 0.19 145 / 0.25)', color: 'oklch(0.72 0.19 145)', fontWeight: 700 }}>
                <BookOpen size={16} /> Baca Materi Lengkap
              </button>
            </motion.div>
          )}

          {/* MATERI TAB */}
          {tab === 'materi' && (
            <motion.div key="materi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-2xl p-5 mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen size={18} style={{ color: catColor }} />
                  <h2 className="text-foreground" style={{ fontWeight: 700, fontSize: '1.05rem' }}>Ringkasan Materi</h2>
                </div>
                <div className="space-y-4">
                  {content.map((point, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${catColor}18`, border: `1px solid ${catColor}33` }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: catColor }}>{i + 1}</span>
                      </div>
                      <p className="text-foreground" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>
                        {point.split('**').map((part, j) =>
                          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                        )}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl p-4 mb-5 flex items-center gap-3"
                style={{ background: 'oklch(0.80 0.17 75 / 0.1)', border: '1px solid oklch(0.80 0.17 75 / 0.25)' }}>
                <Zap size={18} style={{ color: 'var(--exp-color)', flexShrink: 0 }} />
                <p style={{ color: 'var(--exp-color)', fontSize: '0.85rem', fontWeight: 600 }}>
                  Selesaikan quiz untuk mendapatkan +{mod.expReward} EXP!
                </p>
              </div>

              <button onClick={() => setTab('quiz')}
                className="w-full py-3.5 rounded-xl text-primary-foreground flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'oklch(0.72 0.19 145)', fontWeight: 700 }}>
                <CheckCircle size={18} /> Mulai Quiz
              </button>
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {tab === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {!quizStarted && !quizDone ? (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: 'oklch(0.72 0.19 145 / 0.15)' }}>
                    <CheckCircle size={36} style={{ color: 'oklch(0.72 0.19 145)' }} />
                  </div>
                  <h2 className="text-foreground mb-2" style={{ fontWeight: 800, fontSize: '1.3rem' }}>Quiz: {mod.title}</h2>
                  <p className="text-muted-foreground mb-6" style={{ lineHeight: 1.7 }}>
                    {questions.length} pertanyaan pilihan ganda. Minimal {Math.ceil(questions.length * 0.6)} jawaban benar untuk lulus.
                    Kamu akan mendapatkan <strong style={{ color: 'var(--exp-color)' }}>+{mod.expReward} EXP</strong> saat lulus!
                  </p>
                  <button onClick={() => setQuizStarted(true)}
                    className="w-full py-4 rounded-xl text-primary-foreground transition-all hover:opacity-90"
                    style={{ background: 'oklch(0.72 0.19 145)', fontWeight: 700 }}>
                    Mulai Quiz
                  </button>
                </div>
              ) : quizDone ? (
                <div className="text-center">
                  <div className="text-6xl mb-4">{passed ? '🎉' : '😔'}</div>
                  <h2 className="text-foreground mb-2" style={{ fontWeight: 800, fontSize: '1.5rem' }}>
                    {passed ? 'Selamat, Lulus!' : 'Belum Lulus'}
                  </h2>
                  <p className="text-muted-foreground mb-5">
                    Skormu: <strong style={{ color: passed ? 'oklch(0.72 0.19 145)' : 'oklch(0.55 0.22 25)' }}>{score}/{questions.length}</strong>
                    {' '}({Math.round((score / questions.length) * 100)}%)
                  </p>
                  {passed ? (
                    <div className="rounded-xl p-4 mb-5"
                      style={{ background: 'oklch(0.72 0.19 145 / 0.1)', border: '1px solid oklch(0.72 0.19 145 / 0.3)' }}>
                      <p style={{ color: 'oklch(0.72 0.19 145)', fontWeight: 700 }}>
                        {isCompleted ? 'Modul sudah diselesaikan sebelumnya.' : `+${mod.expReward} EXP berhasil didapatkan!`}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl p-4 mb-5"
                      style={{ background: 'oklch(0.55 0.22 25 / 0.1)', border: '1px solid oklch(0.55 0.22 25 / 0.3)' }}>
                      <p style={{ color: 'oklch(0.55 0.22 25)', fontWeight: 600, fontSize: '0.875rem' }}>
                        Kamu perlu minimal {Math.ceil(questions.length * 0.6)} jawaban benar. Coba baca ulang materinya dan ulangi quiz!
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3">
                    {!passed && (
                      <button onClick={retryQuiz}
                        className="flex-1 py-3 rounded-xl transition-all"
                        style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 700 }}>
                        Ulangi Quiz
                      </button>
                    )}
                    <button onClick={() => { setTab('materi'); setQuizStarted(false); setQuizDone(false); setCurrent(0); setAnswers([]); setSelected(null); }}
                      className="flex-1 py-3 rounded-xl text-primary-foreground transition-all"
                      style={{ background: 'oklch(0.72 0.19 145)', fontWeight: 700 }}>
                      {passed ? 'Kembali ke Materi' : 'Baca Ulang Materi'}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-muted-foreground" style={{ fontSize: '0.82rem' }}>Soal {current + 1} dari {questions.length}</span>
                    <span style={{ color: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '0.82rem' }}>
                      {Math.round((current / questions.length) * 100)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden mb-5" style={{ background: 'var(--muted)' }}>
                    <motion.div className="h-full rounded-full"
                      animate={{ width: `${(current / questions.length) * 100}%` }}
                      style={{ background: 'oklch(0.72 0.19 145)' }} />
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="rounded-xl p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <p className="text-foreground" style={{ fontWeight: 600, lineHeight: 1.6 }}>
                          {questions[current].question}
                        </p>
                      </div>
                      <div className="space-y-2.5">
                        {questions[current].options.map((opt, idx) => {
                          const isSelected = selected === idx;
                          const isCorrect = idx === questions[current].answer;
                          const showResult = selected !== null;
                          let bg = 'var(--card)', border = 'var(--border)', textColor = 'var(--foreground)';
                          if (showResult && isCorrect) { bg = 'oklch(0.72 0.19 145 / 0.15)'; border = 'oklch(0.72 0.19 145)'; textColor = 'oklch(0.72 0.19 145)'; }
                          else if (showResult && isSelected && !isCorrect) { bg = 'oklch(0.55 0.22 25 / 0.15)'; border = 'oklch(0.55 0.22 25)'; textColor = 'oklch(0.55 0.22 25)'; }

                          return (
                            <button key={idx} onClick={() => handleQuizAnswer(idx)}
                              className="w-full text-left p-4 rounded-xl flex items-center gap-3 transition-all"
                              style={{ background: bg, border: `1.5px solid ${border}`, color: textColor, cursor: selected !== null ? 'default' : 'pointer' }}>
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: showResult && isCorrect ? 'oklch(0.72 0.19 145)' : showResult && isSelected && !isCorrect ? 'oklch(0.55 0.22 25)' : 'var(--muted)' }}>
                                {showResult && isCorrect ? <CheckCircle size={14} className="text-white" /> :
                                  showResult && isSelected && !isCorrect ? <XCircle size={14} className="text-white" /> :
                                    <span style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{String.fromCharCode(65 + idx)}</span>}
                              </div>
                              <span style={{ fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 500 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
