import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

interface AIAssistantProps {
  addExp: (amount: number, reason?: string) => void;
}

const SUGGESTIONS = [
  'Apa itu saham dan cara belinya?',
  'Jelaskan diversifikasi portofolio',
  'Berikan soal latihan analisis saham',
  'Apa perbedaan reksa dana dan saham?',
  'Cara menghitung PE Ratio?',
  'Apa itu stop loss?',
];

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
  const [limitReached, setLimitReached] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading || limitReached) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed, time: 'sekarang' };
    setMessages(prev => [...prev, userMsg]);
    const q = trimmed;
    setInput('');
    setLoading(true);
    setErrorMessage('');

    try {
      let userEmail = '';
      let guestId = '';

      if (typeof window !== 'undefined') {
        const storedUser = window.localStorage.getItem('cakra-user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            userEmail = typeof parsed?.email === 'string' ? parsed.email : '';
          } catch {
            userEmail = '';
          }
        }

        guestId = window.localStorage.getItem('cakra-ai-guest-id') || '';
        if (!guestId) {
          guestId = `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          window.localStorage.setItem('cakra-ai-guest-id', guestId);
        }
      }

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          userEmail,
          guestId,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.error === 'Daily AI limit reached.') {
          setLimitReached(true);
        }
        throw new Error(data.error || 'AI request failed');
      }

      const resp = data.reply || 'Saya belum bisa menjawab saat ini.';
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: resp, time: 'sekarang' }]);

      const newCount = questionCount + 1;
      setQuestionCount(newCount);
      if (!expGiven) {
        setExpGiven(true);
        addExp(10, 'Tanya AI Assistant');
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: error instanceof Error ? error.message : 'Maaf, AI sedang tidak tersedia.', time: 'sekarang' }]);
      setErrorMessage(error instanceof Error ? error.message : 'Maaf, AI sedang tidak tersedia.');
    } finally {
      setLoading(false);
    }
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
            <span style={{ color: 'var(--exp-color)', fontSize: '0.72rem', fontWeight: 700 }}>+10 EXP / tanya</span>
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
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
              placeholder={limitReached ? 'Batas AI harian tercapai' : 'Tanya tentang investasi, saham, reksa dana...'}
              rows={1}
              disabled={limitReached || loading}
              className="w-full px-4 py-3 rounded-xl resize-none text-foreground placeholder:text-muted-foreground outline-none"
              style={{ background: 'var(--input-background)', border: '1px solid var(--border)', fontSize: '0.875rem', lineHeight: 1.5, maxHeight: '120px', overflow: 'hidden', opacity: limitReached ? 0.7 : 1 }}
            />
          </div>
          <button onClick={() => { void send(); }} disabled={!input.trim() || loading || limitReached}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:opacity-90 active:scale-95 flex-shrink-0"
            style={{ background: input.trim() && !limitReached ? 'oklch(0.72 0.19 145)' : 'var(--muted)', opacity: !input.trim() || loading || limitReached ? 0.5 : 1 }}>
            <Send size={18} style={{ color: input.trim() && !limitReached ? 'oklch(0.12 0.02 145)' : 'var(--muted-foreground)' }} />
          </button>
        </div>
        {limitReached ? (
          <p className="text-muted-foreground mt-2 text-center" style={{ fontSize: '0.68rem', color: 'oklch(0.72 0.19 145)' }}>
            <Sparkles size={10} className="inline mr-1" />
            You have reached today's AI limit. Please come back tomorrow.
          </p>
        ) : (
          <p className="text-muted-foreground mt-2 text-center" style={{ fontSize: '0.68rem' }}>
            <Sparkles size={10} className="inline mr-1" />
            AI simulasi untuk tujuan edukasi — bukan saran investasi
          </p>
        )}
        {errorMessage && (
          <p className="text-center mt-2" style={{ fontSize: '0.7rem', color: 'var(--destructive)' }}>{errorMessage}</p>
        )}
      </div>
    </div>
  );
}
