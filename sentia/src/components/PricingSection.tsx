"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Check, X, ArrowRight, Sparkles, Zap, Building2 } from "lucide-react";

const plans = [
  { name: "Free", price: 0, icon: Zap, features: ["1 agent", "100 tx/mo", "Basic dashboard", "Standard webhooks", "Community support"], excluded: ["Advanced analytics", "Priority webhooks"], cta: "Start Free", highlight: false },
  { name: "Pro", price: 29, icon: Sparkles, features: ["Unlimited agents", "Unlimited tx", "Advanced dashboard", "Priority webhooks", "Email + Telegram", "Analytics & trends", "CSV/API export", "Priority support"], excluded: [], cta: "Start Pro", highlight: true },
  { name: "Enterprise", price: -1, icon: Building2, features: ["Everything in Pro", "100+ agents", "Dedicated infra", "Custom policies", "SSO & teams", "SLA 99.9%", "Custom integrations", "Account manager"], excluded: [], cta: "Contact Sales", highlight: false },
];

export default function PricingSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="relative py-28" ref={ref}>
      <div className="section-line mb-20" />
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="mb-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-lg">
              <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">Pricing</span>
              <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-3 tracking-[-0.02em]">
                <span className="text-surface-800">Simple.</span>{" "}
                <span className="text-gradient-gold">Transparent.</span>
              </h2>
              <p className="text-sm text-surface-500 font-light">Start free. Scale as your agents grow.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${!annual ? "text-surface-800" : "text-surface-400"}`}>Monthly</span>
              <button onClick={() => setAnnual(!annual)} className={`w-11 h-6 rounded-full relative border transition-all ${annual ? "bg-gold-100 border-gold-500/30" : "bg-surface-200 border-white/[0.06]"}`}>
                <div className={`w-4 h-4 rounded-full bg-gold-500 absolute top-[3px] transition-transform ${annual ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
              </button>
              <span className={`text-xs font-medium ${annual ? "text-surface-800" : "text-surface-400"}`}>Annual <span className="text-green-400 text-[10px]">-20%</span></span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-4">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 25 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 transition-all group ${p.highlight ? "bg-gradient-to-b from-gold-50 to-[#0a0a0a] border-2 border-gold-500/30 shadow-lg shadow-gold-500/10" : "bg-[#0a0a0a] border border-white/[0.06] hover:border-gold-500/20 hover:shadow-md hover:shadow-gold-500/5"}`}>
              {p.highlight && <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gold-500 text-[8px] font-medium text-black uppercase tracking-wider">Popular</div>}
              <div className="flex items-center gap-2.5 mb-5">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${p.highlight ? "bg-gold-100" : "bg-surface-100"}`}>
                  <p.icon className={`w-4 h-4 ${p.highlight ? "text-gold-600" : "text-surface-400"}`} />
                </div>
                <span className="text-[13px] font-normal text-surface-700">{p.name}</span>
              </div>
              <div className="mb-6">
                {p.price === -1 ? <span className="text-2xl font-light text-surface-700 font-[Outfit]">Custom</span> : (
                  <><span className="text-3xl font-light text-surface-800 font-[Outfit]">${annual && p.price > 0 ? Math.round(p.price * 0.8) : p.price}</span>{p.price > 0 && <span className="text-[11px] text-surface-400 ml-1 font-light">/mo</span>}</>
                )}
              </div>
              <div className="space-y-2 mb-7">
                {p.features.map((f) => <div key={f} className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-gold-500 shrink-0" /><span className="text-xs text-surface-600">{f}</span></div>)}
                {p.excluded.map((f) => <div key={f} className="flex items-center gap-2 opacity-40"><X className="w-3.5 h-3.5 shrink-0" /><span className="text-xs text-surface-400">{f}</span></div>)}
              </div>
              <button className={`w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                p.highlight ? "bg-gradient-to-r from-gold-500 to-gold-600 text-black shadow-md shadow-gold-500/20 hover:shadow-lg hover:shadow-gold-500/30" : "border border-white/[0.08] text-surface-600 hover:border-gold-500/30 hover:text-gold-600 hover:bg-gold-50"
              }`}>{p.cta} <ArrowRight className="w-3.5 h-3.5" /></button>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.5 }} className="mt-10 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-surface-50 border border-white/[0.06]">
            <Sparkles className="w-4 h-4 text-gold-500" />
            <span className="text-xs text-surface-500"><strong className="text-surface-700">0.1% transaction fee</strong> — 1K agents × $100/mo = $100/mo revenue</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
