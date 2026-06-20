import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AIAssistantProps {
  addExp: (amount: number, reason?: string) => void;
}

const AI_RESPONSES: [RegExp, string][] = [
  [/saham|stock/i, 'Saham adalah bukti kepemilikan sebagian perusahaan. Ketika kamu membeli saham BBCA misalnya, kamu menjadi pemilik kecil Bank BCA. Keuntungan dari saham berasal dari dua sumber:\n\n1. **Dividen** — bagian laba perusahaan yang dibagikan kepada pemegang saham\n2. **Capital Gain** — selisih harga jual dan beli saham\n\nInvestasi saham memiliki risiko lebih tinggi dibanding deposito, namun potensi returnnya juga lebih besar secara historis. Di BEI, 1 lot = 100 lembar saham.\n\nAda yang ingin kamu tanya lebih lanjut tentang saham?'],
  [/inflasi|inflation/i, 'Inflasi adalah kenaikan harga barang dan jasa secara umum dan terus-menerus. Bayangkan: uang Rp100.000 tahun ini bisa beli 10 kg beras, tapi 10 tahun lagi mungkin hanya bisa beli 8 kg karena harga beras naik.\n\n**Dampak inflasi pada investasi:**\n- Tabungan biasa bisa kalah dari inflasi\n- Saham dan reksa dana saham historis mengalahkan inflasi jangka panjang\n- Bank Indonesia menargetkan inflasi 2-4% per tahun\n\nInilah mengapa penting berinvestasi — untuk mempertahankan dan menumbuhkan daya beli uangmu!'],
  [/reksa dana|reksadana|mutual fund/i, 'Reksa dana adalah wadah investasi kolektif yang dikelola manajer investasi profesional. Ibaratnya: uangmu dikumpulkan bersama ribuan investor lain, lalu dikelola oleh manajer berpengalaman.\n\n**4 Jenis Reksa Dana (dari risiko rendah ke tinggi):**\n1. 📊 Reksa Dana Pasar Uang — return 4-6% p.a., sangat likuid\n2. 📈 Reksa Dana Pendapatan Tetap — return 6-9% p.a., lebih stabil\n3. 🔀 Reksa Dana Campuran — return 8-12% p.a., balanced\n4. 🚀 Reksa Dana Saham — return > 12% p.a. jangka panjang, volatil\n\nKamu bisa mulai investasi reksa dana dari Rp10.000 saja!'],
  [/diversifikasi|diversification/i, '"Jangan taruh semua telur dalam satu keranjang" — itulah inti diversifikasi!\n\nDiversifikasi artinya menyebar investasi ke berbagai aset agar risiko berkurang. Contoh:\n\n✅ **Portofolio Terdiversifikasi:**\n- 40% Reksa Dana Saham\n- 30% Obligasi/ORI\n- 20% Reksa Dana Pasar Uang (dana darurat)\n- 10% Emas\n\n❌ **Risiko Konsentrasi:**\n- 100% dalam satu saham\n- Jika perusahaan itu bangkrut, seluruh modal hilang\n\nDiversifikasi tidak menghilangkan risiko, tapi menguranginya secara signifikan!'],
  [/pe ratio|per|price earning/i, 'PE Ratio (Price to Earnings Ratio) adalah rasio yang membandingkan harga saham dengan laba per saham (EPS).\n\n**Rumus:** PE = Harga Saham ÷ EPS\n\nContoh: Saham BBCA harga Rp9.000, EPS Rp450 → PE = 20x\n\n**Interpretasi PE:**\n- PE rendah (< 15x): bisa berarti saham murah (undervalued)\n- PE tinggi (> 25x): bisa berarti saham mahal (overvalued) atau ekspektasi pertumbuhan tinggi\n- Bandingkan selalu dengan rata-rata industri!\n\n⚠️ PE saja tidak cukup — selalu analisis bersama rasio lain seperti PBV, ROE, dan pertumbuhan laba.'],
  [/obligasi|bond|sbn|ori/i, 'Obligasi adalah surat utang — kamu meminjamkan uang ke perusahaan/pemerintah dan mendapat bunga (kupon) secara berkala.\n\n**Jenis Obligasi:**\n1. ORI (Obligasi Ritel Indonesia) — diterbitkan pemerintah, sangat aman\n2. SBR (Saving Bond Ritel) — bunga mengambang mengikuti BI Rate\n3. Sukuk Ritel — prinsip syariah\n4. Obligasi Korporasi — diterbitkan perusahaan, imbal hasil lebih tinggi, risiko lebih besar\n\nKeunggulan obligasi: aliran pendapatan tetap, lebih stabil dari saham, dan ORI dijamin negara!'],
  [/stop loss/i, 'Stop loss adalah order otomatis untuk menjual saham jika harganya turun ke level tertentu — melindungimu dari kerugian besar.\n\n**Contoh:**\nBeli GOTO di harga Rp100 → pasang stop loss di Rp85 (toleransi rugi 15%)\nJika harga turun ke Rp85, sistem otomatis jual → kerugianmu terbatas di 15%\n\n**Tips penggunaan stop loss:**\n✅ Tentukan sebelum masuk posisi, bukan setelah\n✅ Letakkan di bawah level support\n✅ Konsisten — jangan geser stop loss ke bawah saat harga mendekatinya\n❌ Jangan pasang terlalu ketat (kena "stop loss hunt")\n\nStop loss adalah alat manajemen risiko yang wajib bagi setiap trader!'],
  [/roe|return on equity/i, 'ROE (Return on Equity) mengukur seberapa efisien perusahaan menggunakan modal pemegang saham untuk menghasilkan laba.\n\n**Rumus:** ROE = Laba Bersih ÷ Ekuitas × 100%\n\nContoh: Laba Bersih Rp10 triliun, Ekuitas Rp50 triliun → ROE = 20%\n\n**Interpretasi:**\n- ROE > 15%: umumnya dianggap baik\n- ROE > 20%: sangat baik, perusahaan sangat efisien\n- ROE < 10%: perlu diwaspadai\n\nPerusahaan dengan ROE konsisten tinggi selama bertahun-tahun adalah tanda manajemen yang kompeten. Cek ROE BBCA, BBRI, atau UNVR untuk referensi!'],
  [/candlestick/i, 'Candlestick adalah representasi visual pergerakan harga dalam satu periode (menit, jam, hari, dll).\n\n**Anatomi Candlestick:**\n🕯️ Body (badan): selisih harga open dan close\n📏 Upper Shadow (ekor atas): harga tertinggi\n📏 Lower Shadow (ekor bawah): harga terendah\n\n**Warna:**\n🟢 Hijau/Putih: harga close > open (bullish)\n🔴 Merah/Hitam: harga close < open (bearish)\n\n**Pola Penting:**\n- Doji: open ≈ close, ketidakpastian\n- Hammer: ekor panjang bawah, potensi reversal naik\n- Shooting Star: ekor panjang atas, potensi reversal turun\n- Bullish Engulfing: candle hijau "menelan" candle merah sebelumnya'],
  [/portofolio|portfolio/i, 'Portofolio investasi adalah kumpulan aset investasi yang kamu miliki — bisa berisi saham, obligasi, reksa dana, emas, properti, dll.\n\n**Prinsip Membangun Portofolio:**\n1. Tentukan profil risiko (konservatif/moderat/agresif)\n2. Alokasikan aset sesuai profil dan horizon investasi\n3. Diversifikasi antar kelas aset\n4. Rebalancing berkala (tiap 6-12 bulan)\n\n**Contoh Alokasi:**\n🛡️ Konservatif: 20% saham, 60% obligasi, 20% pasar uang\n⚖️ Moderat: 50% saham, 35% obligasi, 15% pasar uang\n🚀 Agresif: 80% saham, 15% obligasi, 5% pasar uang\n\nPilih sesuai tujuan investasi dan toleransi risiko!'],
  [/soal|latihan|contoh soal/i, 'Oke! Coba selesaikan soal latihan ini:\n\n📝 **Soal:** Perusahaan XYZ memiliki harga saham Rp5.000 dan EPS (Earning Per Share) sebesar Rp250. Rata-rata PE industri adalah 18x. Apakah saham XYZ tergolong overvalued, fair value, atau undervalued?\n\n**Hint:** Hitung PE saham XYZ terlebih dahulu!\n\nJawab dulu di chat ini, nanti kita bahas bersama! 😊'],
  [/terima kasih|makasih|thanks/i, 'Sama-sama! Senang bisa membantu perjalanan belajarmu 😊\n\nJangan ragu untuk bertanya kapan saja — baik tentang konsep dasar keuangan, analisis saham, strategi investasi, atau minta soal latihan.\n\nTerus semangat belajar dan raih kebebasan finansialmu! 💪📈'],
  [/halo|hi|hello|hai/i, 'Halo! Saya CAKRA AI — asisten belajar literasi keuangan & investasimu 👋\n\nSaya bisa membantu kamu:\n📚 Menjelaskan konsep keuangan dan investasi\n💡 Menjawab pertanyaan tentang saham, reksa dana, obligasi\n🧮 Memberikan soal latihan untuk mengasah pemahamanmu\n📊 Menganalisis contoh kasus investasi\n\nAda yang ingin kamu pelajari hari ini?'],
];

const SUGGESTIONS = [
  'Apa itu saham dan cara belinya?',
  'Jelaskan diversifikasi portofolio',
  'Berikan soal latihan analisis saham',
  'Apa perbedaan reksa dana dan saham?',
  'Cara menghitung PE Ratio?',
  'Apa itu stop loss?',
];

function getResponse(input: string): string {
  for (const [pattern, resp] of AI_RESPONSES) {
    if (pattern.test(input)) return resp;
  }
  return `Pertanyaan yang bagus tentang "${input}"! 🤔\n\nSaat ini saya paling bisa membantu tentang:\n• Saham & analisis fundamental/teknikal\n• Reksa dana & obligasi\n• Manajemen risiko & diversifikasi\n• Konsep keuangan dasar\n• Soal latihan investasi\n\nCoba tanyakan lebih spesifik tentang topik di atas, atau ketik "soal latihan" untuk berlatih soal!`;
}

export function AIAssistant({ addExp }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0', role: 'assistant', time: 'sekarang',
      text: 'Halo! Saya CAKRA AI — asisten belajar literasi keuangan & investasimu 👋\n\nAda yang ingin kamu pelajari atau tanyakan hari ini? Saya siap membantu menjelaskan konsep, memberikan contoh soal, atau menganalisis instrumen investasi bersama kamu!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [expGiven, setExpGiven] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, time: 'sekarang' };
    setMessages(prev => [...prev, userMsg]);
    const q = input;
    setInput('');
    setLoading(true);

    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    if (newCount === 3 && !expGiven) {
      setExpGiven(true);
      addExp(30, 'Tanya AI Assistant 3x');
    }

    setTimeout(() => {
      const resp = getResponse(q);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: resp, time: 'sekarang' }]);
      setLoading(false);
    }, 800 + Math.random() * 600);
  };

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      const formatted = line.split('**').map((part, j) =>
        j % 2 === 1 ? <strong key={j}>{part}</strong> : part
      );
      return <span key={i}>{formatted}{i < text.split('\n').length - 1 && <br />}</span>;
    });
  };

  return (
    <div className="flex flex-col h-screen pb-16 lg:pb-0" style={{ maxHeight: '100vh' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 265), oklch(0.72 0.19 145))' }}>
            <Bot size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-foreground" style={{ fontWeight: 800, fontSize: '1.1rem' }}>CAKRA AI</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.72 0.19 145)' }} />
              <span className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Online — siap membantu</span>
            </div>
          </div>
          <div className="ml-auto px-3 py-1 rounded-full"
            style={{ background: 'oklch(0.80 0.17 75 / 0.15)', border: '1px solid oklch(0.80 0.17 75 / 0.3)' }}>
            <span style={{ color: 'var(--exp-color)', fontSize: '0.72rem', fontWeight: 700 }}>+30 EXP / 3 tanya</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-2">
            <p className="text-muted-foreground mb-3" style={{ fontSize: '0.78rem' }}>💡 Pertanyaan populer:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="px-3 py-1.5 rounded-full text-left transition-all hover:opacity-80"
                  style={{ background: 'var(--muted)', border: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--foreground)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map(msg => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1`}
                style={{ background: msg.role === 'assistant' ? 'linear-gradient(135deg, oklch(0.60 0.20 265), oklch(0.72 0.19 145))' : 'oklch(0.72 0.19 145 / 0.2)' }}>
                {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} style={{ color: 'oklch(0.72 0.19 145)' }} />}
              </div>
              <div className="max-w-[85%]">
                <div className="px-4 py-3 rounded-2xl"
                  style={{
                    background: msg.role === 'assistant' ? 'var(--card)' : 'oklch(0.72 0.19 145)',
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    color: msg.role === 'assistant' ? 'var(--foreground)' : 'oklch(0.12 0.02 145)',
                    borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                  }}>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.75 }}>{formatText(msg.text)}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, oklch(0.60 0.20 265), oklch(0.72 0.19 145))' }}>
              <Bot size={16} className="text-white" />
            </div>
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                    className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.72 0.19 145)' }} />
                ))}
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Tanya tentang investasi, saham, reksa dana..."
              rows={1}
              className="w-full px-4 py-3 rounded-xl resize-none text-foreground placeholder:text-muted-foreground outline-none"
              style={{ background: 'var(--input-background)', border: '1px solid var(--border)', fontSize: '0.875rem', lineHeight: 1.5, maxHeight: '120px', overflow: 'hidden' }}
            />
          </div>
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{ background: input.trim() ? 'oklch(0.72 0.19 145)' : 'var(--muted)', opacity: !input.trim() || loading ? 0.5 : 1 }}>
            <Send size={18} style={{ color: input.trim() ? 'oklch(0.12 0.02 145)' : 'var(--muted-foreground)' }} />
          </button>
        </div>
        <p className="text-muted-foreground mt-2 text-center" style={{ fontSize: '0.68rem' }}>
          <Sparkles size={10} className="inline mr-1" />
          AI simulasi untuk tujuan edukasi — bukan saran investasi
        </p>
      </div>
    </div>
  );
}
