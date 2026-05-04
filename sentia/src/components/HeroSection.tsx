"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Send } from "lucide-react";
import AgentMarquee from "./AgentMarquee";

export default function HeroSection() {
  return (
    <section className="relative">
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[400px] bg-gold-400/3 rounded-full blur-[120px] pointer-events-none" />

        {/* Text */}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          {/* Logo + Sentia branding */}
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex items-center justify-center gap-3 mb-8"
          >
            <div className="relative w-10 h-10">
              <Image
                src="/sentia.png"
                alt="Sentia"
                fill
                sizes="40px"
                className="object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                priority
              />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-gradient-gold font-[Outfit]">
              Sentia
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-[Outfit] tracking-[-0.03em] leading-[0.95] mb-6"
          >
            <span className="block text-[clamp(2.4rem,6.5vw,5.5rem)] font-medium text-surface-800">
              Agent Wallets
            </span>
            <span className="block text-[clamp(2.4rem,6.5vw,5.5rem)] font-semibold text-gradient-gold">
              Reimagined
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-sm md:text-base text-surface-500 max-w-md mx-auto leading-relaxed mb-10 font-light tracking-wide"
          >
            Non-custodial wallet infrastructure for AI agents on Solana.
            <br className="hidden md:block" />
            On-chain spending limits. Human-in-the-loop approvals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8"
          >
            <a href="#sdk" className="btn-gold group w-full sm:w-auto text-center">
              <span className="flex items-center justify-center gap-2">
                Start Building
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
            <a href="#features" className="btn-outline group w-full sm:w-auto text-center">
              How it Works
            </a>
          </motion.div>

          {/* Telegram Bot CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.9 }}
          >
            <a
              href="https://t.me/SentiaaBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-[#229ED9]/8 hover:border-[#229ED9]/20 transition-all duration-300 group hover:-translate-y-0.5"
            >
              <div className="w-7 h-7 rounded-lg bg-[#229ED9]/15 flex items-center justify-center group-hover:bg-[#229ED9] transition-colors">
                <Send className="w-3 h-3 text-[#229ED9] group-hover:text-white transition-colors" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-normal text-surface-600 group-hover:text-[#229ED9] transition-colors">
                  Try Sentia on Telegram
                </div>
                <div className="text-[9px] text-surface-400 font-mono tracking-wide">
                  @SentiaaBot
                </div>
              </div>
              <ArrowRight className="w-3 h-3 text-surface-400 group-hover:text-[#229ED9] group-hover:translate-x-0.5 transition-all" />
            </a>
          </motion.div>
        </div>
      </div>

      <AgentMarquee />
    </section>
  );
}
