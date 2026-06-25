"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import type { UserProfile } from "./types";

interface AuthPageProps {
  onAuth: (authUser: Partial<UserProfile> & { name: string; email: string }) => void;
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (mode === "register") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
          }),
        });

        const data = await response.json();

        console.log("STATUS:", response.status);
        console.log("DATA:", data);

        if (!response.ok) {
          throw new Error(data.error);
        }

        alert("Register berhasil");

        setMode("login");

        setName("");
        setEmail("");
        setPassword("");
      } else {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        onAuth(data.user);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };
  const features = [
    { icon: TrendingUp, text: "Modul literasi keuangan & saham" },
    { icon: Zap, text: "Sistem gamifikasi & level up" },
    { icon: Shield, text: "AI Assistant pendamping belajar" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--background)" }}
    >
      {/* Left panel - branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 255) 0%, oklch(0.15 0.06 255) 100%)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, oklch(0.72 0.19 145), transparent)",
            }}
          />
          <div
            className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full opacity-15"
            style={{
              background:
                "radial-gradient(circle, oklch(0.80 0.17 75), transparent)",
            }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.72 0.19 145)" }}
            >
              <TrendingUp size={20} className="text-white" />
            </div>
            <span
              className="text-foreground"
              style={{ fontWeight: 800, fontSize: "1.25rem" }}
            >
              CAKRA
            </span>
            <span
              className="px-2 py-0.5 rounded-md text-xs"
              style={{
                background: "oklch(0.80 0.17 75 / 0.2)",
                color: "var(--exp-color)",
                fontWeight: 600,
              }}
            >
              BETA
            </span>
          </div>

          <h1
            style={{ fontWeight: 800, fontSize: "2.75rem", lineHeight: 1.15 }}
            className="text-foreground mb-6"
          >
            Kuasai Literasi
            <br />
            <span style={{ color: "oklch(0.72 0.19 145)" }}>
              Keuangan & Saham
            </span>
            <br />
            dengan Cara Seru
          </h1>
          <p
            className="text-muted-foreground mb-12"
            style={{ fontSize: "1.05rem", lineHeight: 1.6 }}
          >
            Belajar investasi cerdas melalui modul terstruktur, tantangan
            harian, dan simulasi portofolio interaktif.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.72 0.19 145 / 0.15)",
                    border: "1px solid oklch(0.72 0.19 145 / 0.3)",
                  }}
                >
                  <Icon size={16} style={{ color: "oklch(0.72 0.19 145)" }} />
                </div>
                <span className="text-foreground" style={{ fontWeight: 500 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8">
          {[
            ["10K+", "Pengguna"],
            ["50+", "Modul"],
            ["4.9★", "Rating"],
          ].map(([val, label]) => (
            <div key={label}>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: "1.5rem",
                  color: "oklch(0.72 0.19 145)",
                }}
              >
                {val}
              </p>
              <p
                className="text-muted-foreground"
                style={{ fontSize: "0.8rem" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "oklch(0.72 0.19 145)" }}
            >
              <TrendingUp size={18} className="text-white" />
            </div>
            <span
              className="text-foreground"
              style={{ fontWeight: 800, fontSize: "1.15rem" }}
            >
              CAKRA
            </span>
          </div>

          <div className="mb-8">
            <h2
              className="text-foreground mb-2"
              style={{ fontWeight: 800, fontSize: "1.75rem" }}
            >
              {mode === "login"
                ? "Selamat Datang Kembali!"
                : "Mulai Perjalananmu"}
            </h2>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Masuk untuk melanjutkan belajar"
                : "Daftar gratis dan mulai belajar hari ini"}
            </p>
          </div>

          {/* Tab switch */}
          <div
            className="flex rounded-xl p-1 mb-8"
            style={{ background: "var(--muted)" }}
          >
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex-1 py-2.5 rounded-lg transition-all relative"
                style={{ fontWeight: 600, fontSize: "0.9rem" }}
              >
                {mode === m && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-lg"
                    style={{
                      background: "var(--card)",
                      boxShadow: "0 1px 6px oklch(0 0 0 / 0.3)",
                    }}
                  />
                )}
                <span
                  className="relative z-10"
                  style={{
                    color:
                      mode === m
                        ? "var(--foreground)"
                        : "var(--muted-foreground)",
                  }}
                >
                  {m === "login" ? "Masuk" : "Daftar"}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="name-field"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: "hidden" }}
                >
                  <label
                    className="text-foreground mb-2 block"
                    style={{ fontWeight: 600, fontSize: "0.875rem" }}
                  >
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama lengkapmu"
                      required={mode === "register"}
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all"
                      style={{
                        background: "var(--input-background)",
                        border: "1.5px solid transparent",
                        fontSize: "0.95rem",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = "oklch(0.72 0.19 145)")
                      }
                      onBlur={(e) =>
                        (e.target.style.borderColor = "transparent")
                      }
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label
                className="text-foreground mb-2 block"
                style={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@contoh.com"
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all"
                  style={{
                    background: "var(--input-background)",
                    border: "1.5px solid transparent",
                    fontSize: "0.95rem",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "oklch(0.72 0.19 145)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
              </div>
            </div>

            <div>
              <label
                className="text-foreground mb-2 block"
                style={{ fontWeight: 600, fontSize: "0.875rem" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-11 pr-12 py-3.5 rounded-xl text-foreground placeholder:text-muted-foreground outline-none transition-all"
                  style={{
                    background: "var(--input-background)",
                    border: "1.5px solid transparent",
                    fontSize: "0.95rem",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "oklch(0.72 0.19 145)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "transparent")}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  style={{
                    color: "oklch(0.72 0.19 145)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                  }}
                >
                  Lupa password?
                </button>
              </div>
            )}

            {error && (
              <div
                className="p-3 rounded-lg text-sm"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  color: "rgb(239,68,68)",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-primary-foreground transition-all mt-2 relative overflow-hidden"
              style={{
                background: "oklch(0.72 0.19 145)",
                fontWeight: 700,
                fontSize: "1rem",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Memproses...
                </span>
              ) : mode === "login" ? (
                "Masuk Sekarang"
              ) : (
                "Buat Akun Gratis"
              )}
            </button>
          </form>

          <p
            className="text-center text-muted-foreground mt-6"
            style={{ fontSize: "0.875rem" }}
          >
            {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{ color: "oklch(0.72 0.19 145)", fontWeight: 700 }}
            >
              {mode === "login" ? "Daftar sekarang" : "Masuk"}
            </button>
          </p>

          <p
            className="text-center text-muted-foreground mt-4"
            style={{ fontSize: "0.75rem" }}
          >
            Dengan melanjutkan, kamu menyetujui{" "}
            <span style={{ color: "oklch(0.72 0.19 145)", cursor: "pointer" }}>
              Syarat & Ketentuan
            </span>{" "}
            serta{" "}
            <span style={{ color: "oklch(0.72 0.19 145)", cursor: "pointer" }}>
              Kebijakan Privasi
            </span>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
}
