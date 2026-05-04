"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Copy, Check, Terminal, ArrowRight } from "lucide-react";

const codeLines = [
  { type: "comment", text: "// 1. Install" },
  { type: "command", text: "npm install sentia-sdk" },
  { type: "blank", text: "" },
  { type: "comment", text: "// 2. Initialize wallet with limits" },
  { type: "import", text: "import { SentiaWallet } from 'sentia-sdk'" },
  { type: "blank", text: "" },
  { type: "code", text: "const wallet = new SentiaWallet({" },
  { type: "prop", text: "  ownerPublicKey: 'YOUR_PUBKEY'," },
  { type: "prop", text: "  spendingLimit: {" },
  { type: "highlight", text: "    maxPerTransaction: 10,  // 10 USDC" },
  { type: "highlight", text: "    dailyLimit: 100,        // 100 USDC/day" },
  { type: "prop", text: "    token: 'USDC'" },
  { type: "prop", text: "  }," },
  { type: "prop", text: "  webhookUrl: 'https://api.you.com/approve'," },
  { type: "code", text: "})" },
  { type: "blank", text: "" },
  { type: "comment", text: "// 3. Agent transacts within limits" },
  { type: "code", text: "await wallet.transfer({" },
  { type: "prop", text: "  to: 'RECIPIENT'," },
  { type: "highlight", text: "  amount: 5,   // ✅ Under limit" },
  { type: "prop", text: "  token: 'USDC'" },
  { type: "code", text: "})" },
  { type: "blank", text: "" },
  { type: "code", text: "await wallet.transfer({" },
  { type: "prop", text: "  to: 'RECIPIENT'," },
  { type: "highlight", text: "  amount: 50,  // ⚠️ Over limit → webhook" },
  { type: "prop", text: "  token: 'USDC'" },
  { type: "code", text: "})" },
];

const getColor = (t: string) => {
  switch (t) {
    case "comment": return "text-gray-500";
    case "command": return "text-green-400";
    case "import": return "text-purple-400";
    case "highlight": return "text-amber-300";
    case "prop": return "text-gray-400";
    default: return "text-white/80";
  }
};

export default function SDKSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [copied, setCopied] = useState(false);
  const fullCode = codeLines.map((l) => l.text).join("\n");
  const handleCopy = () => { navigator.clipboard.writeText(fullCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <section id="sdk" className="relative py-28" ref={ref}>
      <div className="section-line mb-20" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="lg:col-span-4 lg:sticky lg:top-28">
            <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">Developer Experience</span>
            <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-5 tracking-[-0.02em]">
              <span className="text-surface-800">Three lines.</span><br />
              <span className="text-gradient-gold">Full control.</span>
            </h2>
            <p className="text-sm text-surface-500 leading-relaxed mb-8 font-light">Integrate Sentia into any agent framework. Your agent gets a wallet with on-chain guardrails in minutes.</p>

            <div className="space-y-5 mb-8">
              {[
                { s: "01", t: "Install", d: "One npm package" },
                { s: "02", t: "Configure", d: "Set spending boundaries" },
                { s: "03", t: "Deploy", d: "Agent live with guardrails" },
              ].map((step, i) => (
                <motion.div key={step.s} initial={{ opacity: 0, x: -15 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 + i * 0.12 }} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-md bg-gold-50 border border-gold-500/15 flex items-center justify-center text-[9px] font-normal text-gold-600 font-[Outfit] shrink-0">{step.s}</div>
                  <div>
                    <div className="text-[13px] font-normal text-surface-700">{step.t}</div>
                    <div className="text-[11px] text-surface-500 font-light">{step.d}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-2.5 bg-surface-100 border border-surface-200 rounded-xl px-4 py-3 mb-6">
              <Terminal className="w-3.5 h-3.5 text-gold-500 shrink-0" />
              <code className="text-sm text-surface-700 font-mono flex-1">npm install sentia-sdk</code>
              <button onClick={() => { navigator.clipboard.writeText("npm install sentia-sdk"); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-1.5 rounded-lg hover:bg-gold-50 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-surface-400" />}
              </button>
            </div>

            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] text-surface-400 block mb-2">Works with</span>
              <div className="flex flex-wrap gap-1.5">
                {["ElizaOS", "Solana Agent Kit", "LangChain", "AutoGPT", "CrewAI"].map((n) => (
                  <span key={n} className="text-[9px] px-2 py-0.5 rounded-md border border-white/[0.04] text-surface-500 hover:border-gold-500/20 hover:text-gold-600 transition-all cursor-default font-light">{n}</span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-8">
            <div className="code-block shadow-2xl shadow-black/30">
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[11px] text-gray-500 font-mono">agent-wallet.ts</span>
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] text-gray-500 hover:text-white hover:bg-white/5 transition-all">
                  {copied ? <><Check className="w-3 h-3 text-green-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] leading-7 font-mono">
                  {codeLines.map((line, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 + i * 0.03 }}
                      className={`flex hover:bg-white/[0.02] -mx-5 px-5 transition-colors ${line.type === "highlight" ? "bg-amber-500/[0.06]" : ""}`}>
                      <span className="text-gray-600 w-6 text-right mr-5 select-none text-[11px] leading-7">{line.text ? i + 1 : ""}</span>
                      <span className={getColor(line.type)}>{line.text || "\u00A0"}</span>
                    </motion.div>
                  ))}
                </pre>
              </div>
            </div>
            <div className="mt-5 text-right">
              <a href="#" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-gold-600 transition-colors group">
                Full documentation <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
