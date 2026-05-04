"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Wallet, Shield, Bell, BarChart3, Lock, FileCheck, ArrowUpRight,
  Zap, Globe, Code2,
} from "lucide-react";

const features = [
  { id: "wallet", icon: Wallet, title: "Agent Wallet SDK", desc: "Non-custodial wallets for AI agents. 3 lines of code — full Solana wallet with guardrails.", tag: "Core", size: "large", color: "#c8a748", bg: "#c8a74812" },
  { id: "limits", icon: Shield, title: "On-Chain Spending Limits", desc: "Transaction caps enforced by Solana smart contracts. Max per-tx, daily caps, token-specific.", tag: "Security", size: "medium", color: "#4ade80", bg: "#4ade8012" },
  { id: "webhook", icon: Bell, title: "Approval Webhooks", desc: "Over-limit? Instant Telegram/Email alert. One-click approve → funds flow.", tag: "Automation", size: "medium", color: "#818cf8", bg: "#818cf812" },
  { id: "dashboard", icon: BarChart3, title: "Real-Time Dashboard", desc: "Monitor every agent transaction live. Visual analytics and spending breakdowns.", tag: "Analytics", size: "medium", color: "#c084fc", bg: "#c084fc12" },
  { id: "security", icon: Lock, title: "Non-Custodial", desc: "You own your keys. Agents operate within your boundaries. Always.", tag: "Privacy", size: "small", color: "#f87171", bg: "#f8717112" },
  { id: "audit", icon: FileCheck, title: "Audit Trail + CSV Export", desc: "Every spend logged on-chain with Supabase backup. Export for accounting.", tag: "Compliance", size: "small", color: "#2dd4bf", bg: "#2dd4bf12" },
];

function MiniCodePreview() {
  return (
    <div className="mt-4 rounded-lg bg-[#050508] p-3 font-mono text-[10px] leading-5">
      <div className="flex gap-1 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400/50" />
      </div>
      <div><span className="text-purple-400/80">import</span> <span className="text-blue-300/80">{"{ SentiaWallet }"}</span> <span className="text-purple-400/80">from</span> <span className="text-green-400/80">&apos;sentia-sdk&apos;</span></div>
      <div className="mt-0.5"><span className="text-blue-400/80">const</span> <span className="text-white/60">wallet</span> <span className="text-white/40">=</span> <span className="text-blue-400/80">new</span> <span className="text-yellow-300/80">SentiaWallet</span><span className="text-white/30">({"{"}</span></div>
      <div className="pl-3"><span className="text-white/50">maxPerTx</span><span className="text-white/20">:</span> <span className="text-gold-400">10</span></div>
      <div><span className="text-white/30">{"}"});</span></div>
    </div>
  );
}

function MiniNotifPreview() {
  return (
    <div className="mt-4 space-y-2">
      <motion.div initial={{ x: -15, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex items-center gap-2 bg-blue-500/6 border border-blue-500/10 rounded-lg px-3 py-2">
        <span className="text-[8px]">🤖</span>
        <span className="text-[9px] text-blue-300/80 truncate font-light">Agent requests <span className="text-gold-600">50 USDC</span></span>
      </motion.div>
      <motion.div initial={{ x: 15, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}
        className="flex items-center gap-2 bg-green-500/6 border border-green-500/10 rounded-lg px-3 py-2 ml-auto w-fit">
        <span className="text-[9px] text-green-400/80 font-light">✅ Approved</span>
      </motion.div>
    </div>
  );
}

function MiniChartPreview() {
  const bars = [35, 52, 41, 67, 48, 73, 55, 62];
  return (
    <div className="mt-4 flex items-end gap-1 h-12">
      {bars.map((h, i) => (
        <motion.div key={i} initial={{ height: 0 }} whileInView={{ height: `${h}%` }} transition={{ delay: i * 0.06, duration: 0.4 }}
          className="flex-1 rounded-t bg-gradient-to-t from-gold-500/40 to-gold-400/10 min-w-0" />
      ))}
    </div>
  );
}

export default function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const getVisual = (id: string) => {
    if (id === "wallet") return <MiniCodePreview />;
    if (id === "webhook") return <MiniNotifPreview />;
    if (id === "dashboard") return <MiniChartPreview />;
    return null;
  };

  return (
    <section id="features" className="relative py-24" ref={ref}>
      <div className="section-line mb-16" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="mb-12 max-w-2xl">
          <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">Infrastructure</span>
          <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-4 tracking-[-0.02em]">
            <span className="text-surface-800">Everything for</span>{" "}
            <span className="text-gradient-gold">agent finance.</span>
          </h2>
          <p className="text-sm text-surface-500 font-light">A complete layer that makes AI agents financially autonomous while keeping humans in control.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[minmax(160px,auto)]">
          {features.map((f, i) => (
            <motion.div key={f.id} initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-xl p-5 bg-[#080808] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300
                ${f.size === "large" ? "col-span-1 sm:col-span-2 row-span-2" : ""}`}
            >
              <span className="text-[7px] uppercase tracking-[0.25em] font-normal text-gold-600/60 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-md">{f.tag}</span>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-3 mb-2 group-hover:scale-105 transition-transform" style={{ background: f.bg }}>
                <f.icon className="w-4 h-4" style={{ color: f.color }} />
              </div>
              <h3 className={`font-[Outfit] font-normal text-surface-800 mb-1 ${f.size === "large" ? "text-lg" : "text-[13px]"}`}>{f.title}</h3>
              <p className={`text-surface-500 leading-relaxed font-light ${f.size === "large" ? "text-[13px]" : "text-[11px]"}`}>{f.desc}</p>
              {getVisual(f.id)}
              <ArrowUpRight className="absolute top-4 right-4 w-3.5 h-3.5 text-surface-300 opacity-0 group-hover:opacity-100 group-hover:text-gold-500 transition-all" />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap items-center justify-center gap-5">
          <span className="text-[9px] uppercase tracking-[0.25em] text-surface-400 font-light">Powered by</span>
          {[{ icon: Zap, label: "Solana" }, { icon: Globe, label: "Helius" }, { icon: Code2, label: "Anchor" }, { icon: Lock, label: "Privy" }].map((t) => (
            <div key={t.label} className="flex items-center gap-1.5 text-surface-500 hover:text-gold-600 transition-colors cursor-default">
              <t.icon className="w-3 h-3" />
              <span className="text-[11px] font-light">{t.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
