"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Bot, Bell, MessageSquare, Mail, CheckCircle2, Shield, Clock, Zap, XCircle } from "lucide-react";

const flowNodes = [
  { icon: Bot, label: "Agent", sub: "Over-limit spend", iconColor: "#60a5fa", borderColor: "rgba(96,165,250,0.15)", bgColor: "rgba(96,165,250,0.06)" },
  { icon: Zap, label: "SDK", sub: "Fires webhook", iconColor: "#c084fc", borderColor: "rgba(192,132,252,0.15)", bgColor: "rgba(192,132,252,0.06)" },
  { icon: Bell, label: "Notify", sub: "Telegram + Email", iconColor: "#fbbf24", borderColor: "rgba(251,191,36,0.15)", bgColor: "rgba(251,191,36,0.06)" },
  { icon: CheckCircle2, label: "Approve", sub: "Funds released", iconColor: "#4ade80", borderColor: "rgba(74,222,128,0.15)", bgColor: "rgba(74,222,128,0.06)" },
];

export default function WebhookSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);

  return (
    <section id="docs" className="relative py-28" ref={ref}>
      <div className="section-line mb-20" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 max-w-2xl">
          <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">Approval Flow</span>
          <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-4 tracking-[-0.02em]">
            <span className="text-surface-800">Human in the loop.</span>{" "}
            <span className="text-gradient-gold">Always.</span>
          </h2>
          <p className="text-sm text-surface-500 font-light">Over-limit requests trigger instant notifications. One-click approve — funds flow, everything on-chain.</p>
        </motion.div>

        {/* Flow */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 }} className="mb-16">
          <div className="relative flex items-center justify-between max-w-3xl mx-auto">
            <div className="absolute top-7 left-10 right-10 h-[1px] bg-white/[0.04]">
              <motion.div initial={{ scaleX: 0 }} animate={isInView ? { scaleX: 1 } : {}} transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 via-amber-400/20 to-green-400/20 origin-left" />
            </div>
            {flowNodes.map((n, i) => (
              <motion.div key={n.label} initial={{ opacity: 0, scale: 0.8 }} animate={isInView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.3 + i * 0.15 }}
                onMouseEnter={() => setActive(i)} className="relative z-10 flex flex-col items-center cursor-pointer group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
                  style={{ background: n.bgColor, border: `1px solid ${n.borderColor}` }}
                >
                  <n.icon className="w-5 h-5" style={{ color: n.iconColor }} />
                </div>
                <div className="mt-3 text-center">
                  <div className="text-[11px] font-normal text-surface-700">{n.label}</div>
                  <div className="text-[8px] text-surface-400 font-light">{n.sub}</div>
                </div>
                {active === i && <motion.div layoutId="dot" className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-gold-500" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Previews */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 25 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.4 }}
            className="card-elevated overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-blue-500/8 flex items-center justify-center"><MessageSquare className="w-2.5 h-2.5 text-blue-400/80" /></div>
              <div><div className="text-[11px] font-normal text-surface-700">Telegram</div><div className="text-[8px] text-surface-400">@SentiaBot</div></div>
            </div>
            <div className="p-5 space-y-3">
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl rounded-tl-sm p-4 max-w-[90%]">
                <div className="text-[8px] text-blue-400/70 font-medium mb-1.5 uppercase tracking-wider">🤖 Sentia Alert</div>
                <div className="text-[11px] text-surface-600 font-light"><span className="text-surface-700">Trading Bot Alpha</span> requests <span className="text-gold-600">50 USDC</span></div>
                <div className="text-[8px] text-surface-400 mt-1.5 font-light">Memo: &quot;API subscription&quot;</div>
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1.5 rounded-lg bg-green-500/6 border border-green-500/10 text-green-400/80 text-[8px] font-medium hover:bg-green-500/12 transition-colors">✅ Approve</button>
                  <button className="px-3 py-1.5 rounded-lg bg-red-500/6 border border-red-500/10 text-red-400/80 text-[8px] font-medium hover:bg-red-500/12 transition-colors">❌ Reject</button>
                </div>
              </div>
              <motion.div initial={{ opacity: 0, x: 15 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 1 }}
                className="bg-gold-400/4 border border-gold-500/10 rounded-xl rounded-tr-sm p-3 max-w-[45%] ml-auto">
                <div className="text-[9px] text-gold-600/80 font-normal">✅ Approved</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 25 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.5 }}
            className="card-elevated overflow-hidden">
            <div className="px-5 py-3 border-b border-white/[0.04] flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-purple-500/8 flex items-center justify-center"><Mail className="w-2.5 h-2.5 text-purple-400/80" /></div>
              <div><div className="text-[11px] font-normal text-surface-700">Email</div><div className="text-[8px] text-surface-400">via Resend</div></div>
            </div>
            <div className="p-5">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-5">
                <div className="flex items-center gap-2 mb-3"><Shield className="w-3.5 h-3.5 text-gold-500/70" /><span className="text-[11px] font-normal text-surface-700">Approval Required</span></div>
                <div className="space-y-2 text-[11px]">
                  {[{ k: "Agent", v: "DeFi Agent" }, { k: "Amount", v: "45 USDC", gold: true }, { k: "Limit", v: "10 USDC/tx" }, { k: "Reason", v: "Yield farming" }].map((r) => (
                    <div key={r.k} className="flex justify-between py-1.5 border-b border-white/[0.03] last:border-0">
                      <span className="text-surface-400 font-light">{r.k}</span>
                      <span className={r.gold ? "text-gold-600 font-normal font-mono" : "text-surface-600 font-normal"}>{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 py-2 rounded-lg bg-green-500/6 border border-green-500/10 text-green-400/80 text-[9px] font-medium hover:bg-green-500/12 transition-colors flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3" /> Approve</button>
                  <button className="flex-1 py-2 rounded-lg bg-red-500/6 border border-red-500/10 text-red-400/80 text-[9px] font-medium hover:bg-red-500/12 transition-colors flex items-center justify-center gap-1"><XCircle className="w-3 h-3" /> Reject</button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.8 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-10">
          {[{ v: "<200ms", l: "Latency" }, { v: "E2E Encrypted", l: "Signing" }, { v: "On-Chain", l: "Audit Trail" }, { v: "Multi-Channel", l: "Notifications" }].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-xs font-normal text-surface-700 font-[Outfit]">{s.v}</div>
              <div className="text-[8px] text-surface-400 uppercase tracking-[0.2em] mt-0.5 font-light">{s.l}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
