import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Bell, Shield, Palette, Globe, Smartphone, HelpCircle,
  ChevronRight, ChevronDown, LogOut, Moon, Sun, Volume2,
  VolumeX, Lock, Eye, EyeOff, Check,
} from 'lucide-react';
import type { UserProfile } from './types';

interface SettingsPageProps {
  user: UserProfile;
  onLogout: () => void;
}

interface SettingSection {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  content: React.ReactNode;
}

export function SettingsPage({ user, onLogout }: SettingsPageProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState({ daily: true, weekly: true, levelUp: true, streak: true });
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState('id');
  const [privacy2fa, setPrivacy2fa] = useState(false);

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id);

  const sections: SettingSection[] = [
    {
      id: 'profile',
      icon: <User size={18} />,
      title: 'Akun & Profil',
      description: 'Kelola informasi profil dan akunmu',
      color: 'oklch(0.72 0.19 145)',
      content: (
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'oklch(0.72 0.19 145 / 0.2)', border: '2px solid oklch(0.72 0.19 145 / 0.4)' }}>
              <span style={{ fontWeight: 900, fontSize: '1.5rem', color: 'oklch(0.72 0.19 145)' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-foreground" style={{ fontWeight: 700, fontSize: '1rem' }}>{user.name}</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.82rem' }}>{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'oklch(0.72 0.19 145 / 0.15)', color: 'oklch(0.72 0.19 145)', fontSize: '0.7rem', fontWeight: 700 }}>
                  Level {user.level}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>Bergabung {user.joinDate}</span>
              </div>
            </div>
          </div>
          {[
            { label: 'Nama Lengkap', value: user.name },
            { label: 'Email', value: user.email },
            { label: 'Level', value: `Level ${user.level}` },
            { label: 'Total EXP', value: `${user.exp} EXP` },
            { label: 'Streak Harian', value: `${user.streak} hari 🔥` },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <span className="text-muted-foreground" style={{ fontSize: '0.875rem' }}>{item.label}</span>
              <span className="text-foreground" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.value}</span>
            </div>
          ))}
          <button className="w-full py-2.5 rounded-xl text-center"
            style={{ background: 'oklch(0.72 0.19 145 / 0.1)', color: 'oklch(0.72 0.19 145)', fontWeight: 700, fontSize: '0.875rem' }}>
            Edit Profil
          </button>
        </div>
      ),
    },
    {
      id: 'notifications',
      icon: <Bell size={18} />,
      title: 'Pengelola Notifikasi',
      description: 'Atur notifikasi yang ingin diterima',
      color: 'oklch(0.80 0.17 75)',
      content: (
        <div className="space-y-3 pt-2">
          {[
            { key: 'daily' as const, label: 'Misi Harian', desc: 'Pengingat misi harian setiap pagi' },
            { key: 'weekly' as const, label: 'Misi Mingguan', desc: 'Update progress misi mingguan' },
            { key: 'levelUp' as const, label: 'Level Up', desc: 'Notifikasi saat naik level' },
            { key: 'streak' as const, label: 'Streak Reminder', desc: 'Pengingat untuk menjaga streak' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
              <div>
                <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.label}</p>
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{item.desc}</p>
              </div>
              <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className="w-12 h-6 rounded-full relative transition-all"
                style={{ background: notifications[item.key] ? 'oklch(0.72 0.19 145)' : 'var(--border)' }}>
                <motion.div animate={{ x: notifications[item.key] ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 rounded-full" style={{ background: 'white' }} />
              </button>
            </div>
          ))}
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
            <div>
              <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Suara Notifikasi</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Aktifkan efek suara</p>
            </div>
            <button onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-6 rounded-full relative transition-all"
              style={{ background: soundEnabled ? 'oklch(0.72 0.19 145)' : 'var(--border)' }}>
              <motion.div animate={{ x: soundEnabled ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full" style={{ background: 'white' }} />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: 'privacy',
      icon: <Shield size={18} />,
      title: 'Privasi & Keamanan',
      description: 'Keamanan akun dan pengaturan privasi',
      color: 'oklch(0.60 0.20 265)',
      content: (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
            <div>
              <p className="text-foreground" style={{ fontWeight: 600, fontSize: '0.875rem' }}>Autentikasi 2 Faktor (2FA)</p>
              <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>Tambahkan lapisan keamanan ekstra</p>
            </div>
            <button onClick={() => setPrivacy2fa(!privacy2fa)}
              className="w-12 h-6 rounded-full relative transition-all"
              style={{ background: privacy2fa ? 'oklch(0.72 0.19 145)' : 'var(--border)' }}>
              <motion.div animate={{ x: privacy2fa ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 rounded-full" style={{ background: 'white' }} />
            </button>
          </div>
          {['Ubah Password', 'Riwayat Login', 'Sesi Aktif', 'Hapus Data Akun'].map(item => (
            <button key={item} className="w-full flex items-center justify-between p-3 rounded-xl text-left"
              style={{ background: 'var(--muted)' }}>
              <span className="text-foreground" style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'theme',
      icon: <Palette size={18} />,
      title: 'Tema',
      description: 'Sesuaikan tampilan aplikasi',
      color: 'oklch(0.65 0.18 310)',
      content: (
        <div className="space-y-3 pt-2">
          <p className="text-muted-foreground" style={{ fontSize: '0.82rem' }}>Pilih tema tampilan:</p>
          {[
            { id: 'dark', label: 'Gelap (Dark)', icon: <Moon size={16} />, active: darkMode },
            { id: 'light', label: 'Terang (Light)', icon: <Sun size={16} />, active: !darkMode },
          ].map(theme => (
            <button key={theme.id} onClick={() => setDarkMode(theme.id === 'dark')}
              className="w-full flex items-center gap-3 p-4 rounded-xl transition-all"
              style={{ background: theme.active ? 'oklch(0.65 0.18 310 / 0.1)' : 'var(--muted)', border: theme.active ? '1.5px solid oklch(0.65 0.18 310 / 0.4)' : '1.5px solid transparent' }}>
              <div style={{ color: theme.active ? 'oklch(0.65 0.18 310)' : 'var(--muted-foreground)' }}>{theme.icon}</div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: theme.active ? 'var(--foreground)' : 'var(--muted-foreground)', flex: 1 }}>{theme.label}</span>
              {theme.active && <Check size={16} style={{ color: 'oklch(0.65 0.18 310)' }} />}
            </button>
          ))}
          <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>* Tema terang akan tersedia di versi mendatang</p>
        </div>
      ),
    },
    {
      id: 'language',
      icon: <Globe size={18} />,
      title: 'Bahasa',
      description: 'Pilih bahasa tampilan aplikasi',
      color: 'oklch(0.70 0.20 40)',
      content: (
        <div className="space-y-2 pt-2">
          {[{ id: 'id', label: 'Indonesia 🇮🇩' }, { id: 'en', label: 'English 🇺🇸' }].map(lang => (
            <button key={lang.id} onClick={() => setLanguage(lang.id)}
              className="w-full flex items-center justify-between p-3 rounded-xl"
              style={{ background: language === lang.id ? 'oklch(0.70 0.20 40 / 0.1)' : 'var(--muted)', border: language === lang.id ? '1.5px solid oklch(0.70 0.20 40 / 0.4)' : '1.5px solid transparent' }}>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: language === lang.id ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{lang.label}</span>
              {language === lang.id && <Check size={16} style={{ color: 'oklch(0.70 0.20 40)' }} />}
            </button>
          ))}
        </div>
      ),
    },
    {
      id: 'permissions',
      icon: <Smartphone size={18} />,
      title: 'Izin Aplikasi',
      description: 'Kelola izin yang diberikan ke aplikasi',
      color: 'oklch(0.55 0.22 25)',
      content: (
        <div className="space-y-3 pt-2">
          {[
            { label: 'Notifikasi Push', granted: true },
            { label: 'Kamera', granted: false },
            { label: 'Penyimpanan', granted: true },
            { label: 'Biometric/Sidik Jari', granted: false },
          ].map(perm => (
            <div key={perm.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
              <span className="text-foreground" style={{ fontWeight: 500, fontSize: '0.875rem' }}>{perm.label}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: perm.granted ? 'oklch(0.72 0.19 145)' : 'var(--muted-foreground)', padding: '2px 8px', borderRadius: '999px', background: perm.granted ? 'oklch(0.72 0.19 145 / 0.12)' : 'var(--border)' }}>
                {perm.granted ? 'Diizinkan' : 'Ditolak'}
              </span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'help',
      icon: <HelpCircle size={18} />,
      title: 'Bantuan & Informasi',
      description: 'FAQ, kontak, dan informasi aplikasi',
      color: 'oklch(0.72 0.19 145)',
      content: (
        <div className="space-y-3 pt-2">
          {['Pusat Bantuan & FAQ', 'Hubungi Kami', 'Laporkan Masalah', 'Syarat & Ketentuan', 'Kebijakan Privasi', 'Tentang CAKRA'].map(item => (
            <button key={item} className="w-full flex items-center justify-between p-3 rounded-xl text-left"
              style={{ background: 'var(--muted)' }}>
              <span className="text-foreground" style={{ fontWeight: 500, fontSize: '0.875rem' }}>{item}</span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
          <div className="pt-2 text-center">
            <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>CAKRA v1.0.0-beta</p>
            <p className="text-muted-foreground" style={{ fontSize: '0.72rem' }}>© 2024 CAKRA. All rights reserved.</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="pb-24 lg:pb-8">
      <div className="p-5 pb-3">
        <h1 className="text-foreground mb-1" style={{ fontWeight: 800, fontSize: '1.5rem' }}>Pengaturan</h1>
        <p className="text-muted-foreground mb-5" style={{ fontSize: '0.875rem' }}>Konfigurasi dan preferensi aplikasi</p>
      </div>

      <div className="px-5 space-y-2">
        {sections.map((section, i) => (
          <motion.div key={section.id}
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card)', border: `1px solid ${expanded === section.id ? section.color + '40' : 'var(--border)'}`, transition: 'border-color 0.2s' }}>
            <button onClick={() => toggle(section.id)}
              className="w-full flex items-center gap-3 p-4 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${section.color}15` }}>
                <span style={{ color: section.color }}>{section.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{section.title}</p>
                <p className="text-muted-foreground" style={{ fontSize: '0.75rem' }}>{section.description}</p>
              </div>
              <motion.div animate={{ rotate: expanded === section.id ? 180 : 0 }} className="flex-shrink-0">
                <ChevronDown size={18} className="text-muted-foreground" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}>
                  <div className="px-4 pb-4">
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}

        {/* Logout */}
        <button onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl mt-4 transition-all hover:opacity-90"
          style={{ background: 'oklch(0.55 0.22 25 / 0.1)', border: '1px solid oklch(0.55 0.22 25 / 0.25)', color: 'oklch(0.55 0.22 25)', fontWeight: 700 }}>
          <LogOut size={18} />
          Keluar dari Akun
        </button>
      </div>
    </div>
  );
}
