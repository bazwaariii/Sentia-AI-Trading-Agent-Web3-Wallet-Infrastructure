"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const pin = formData.get('pin');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, pin })
      });
      if (res.ok) {
        localStorage.setItem('userEmail', email as string);
        router.push("/dashboard");
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Mock authentication delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#030303] overflow-hidden text-[#e0e0e0]">
      {/* Visual / Branding Side */}
      <div className="hidden md:flex w-1/2 relative flex-col justify-between p-12 border-r border-[#ffffff10]">
        {/* Background Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#c8a748] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#c8a748] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="noise-overlay" />

        <Link href="/" className="relative z-10 flex items-center gap-3 w-fit">
          <Image src="/sentia.png" alt="Sentia" width={40} height={40} className="object-contain" />
          <span className="text-2xl font-bold text-gradient-gold font-[Outfit]">Sentia</span>
        </Link>

        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#f5f5f5] font-[Outfit] leading-tight mb-6">
              Join the future of <br />
              <span className="text-gradient-gold">Autonomous Trading.</span>
            </h1>
            <ul className="space-y-4">
              {[
                "Deploy non-custodial AI wallets",
                "Set strict on-chain spending limits",
                "Approve transactions in real-time"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#888888] text-lg">
                  <div className="w-6 h-6 rounded-full bg-[#c8a74820] flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-[#c8a748]" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-sm text-[#555555]">
          <span>© 2026 Sentia AI</span>
          <span>•</span>
          <Link href="#" className="hover:text-[#c8a748] transition-colors">Privacy</Link>
          <span>•</span>
          <Link href="#" className="hover:text-[#c8a748] transition-colors">Terms</Link>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <Link href="/" className="md:hidden absolute top-8 left-6 flex items-center gap-2">
          <Image src="/sentia.png" alt="Sentia" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-gradient-gold font-[Outfit]">Sentia</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mt-12 md:mt-0"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#f5f5f5] font-[Outfit] mb-2">Create an account</h2>
            <p className="text-[#888888]">Setup your owner account to start managing agents</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5 mb-6">
            <div>
              <label className="text-sm font-medium text-[#aaaaaa] mb-1.5 block">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-[#555555]" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c0c] border border-[#ffffff10] text-[#e0e0e0] placeholder:text-[#555555] focus:border-[#c8a74850] focus:ring-1 focus:ring-[#c8a74850] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#aaaaaa] mb-1.5 block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#555555]" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c0c] border border-[#ffffff10] text-[#e0e0e0] placeholder:text-[#555555] focus:border-[#c8a74850] focus:ring-1 focus:ring-[#c8a74850] transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#aaaaaa] mb-1.5 block">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#555555]" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c0c] border border-[#ffffff10] text-[#e0e0e0] placeholder:text-[#555555] focus:border-[#c8a74850] focus:ring-1 focus:ring-[#c8a74850] transition-all outline-none"
                />
              </div>
              <p className="text-[#555555] text-xs mt-2">Must be at least 8 characters.</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#aaaaaa] mb-1.5 block">Telegram Bot PIN</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#555555]" />
                </div>
                <input
                  type="password"
                  name="pin"
                  required
                  placeholder="••••••"
                  minLength={6}
                  maxLength={6}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0c0c0c] border border-[#ffffff10] text-[#e0e0e0] placeholder:text-[#555555] focus:border-[#c8a74850] focus:ring-1 focus:ring-[#c8a74850] transition-all outline-none"
                />
              </div>
              <p className="text-[#555555] text-xs mt-2">Create a 6-digit PIN for Telegram Bot Login.</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full btn-gold !py-3.5 mt-2 flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#030303]" />
              ) : (
                <>
                  <span className="text-[15px]">Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-[#ffffff10]"></div>
            <span className="flex-shrink-0 mx-4 text-[#555555] text-xs uppercase tracking-wider">Or continue with</span>
            <div className="flex-grow border-t border-[#ffffff10]"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading || googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 mt-2 rounded-xl bg-[#0c0c0c] border border-[#ffffff10] text-[#e0e0e0] hover:bg-[#151515] hover:border-[#ffffff20] transition-all disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#aaaaaa]" />
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span className="font-medium">Google</span>
              </>
            )}
          </button>

          <p className="mt-8 text-center text-sm text-[#888888]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#c8a748] hover:text-[#d4af37] font-medium transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
