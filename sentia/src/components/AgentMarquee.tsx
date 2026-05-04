"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Cpu, Workflow, Users, Zap, Globe, Blocks, Sparkles, Network } from "lucide-react";

const agents = [
  { name: "ElizaOS", desc: "Conversational AI Framework", icon: Brain, color: "#3b82f6", bg: "#3b82f615" },
  { name: "Solana Agent Kit", desc: "On-chain Agent Toolkit", icon: Blocks, color: "#9333ea", bg: "#9333ea15" },
  { name: "LangChain", desc: "LLM Application Framework", icon: Network, color: "#0d9488", bg: "#0d948815" },
  { name: "AutoGPT", desc: "Autonomous GPT Agent", icon: Cpu, color: "#f97316", bg: "#f9731615" },
  { name: "CrewAI", desc: "Multi-Agent Orchestrator", icon: Users, color: "#ef4444", bg: "#ef444415" },
  { name: "Virtuals Protocol", desc: "Decentralized Agent Infra", icon: Globe, color: "#06b6d4", bg: "#06b6d415" },
  { name: "GAME Framework", desc: "Goal-Oriented Agents", icon: Zap, color: "#eab308", bg: "#eab30815" },
  { name: "Rig Framework", desc: "Rust AI Agent Engine", icon: Workflow, color: "#8b5cf6", bg: "#8b5cf615" },
  { name: "Fetch.ai", desc: "Autonomous Economic Agents", icon: Sparkles, color: "#ec4899", bg: "#ec489915" },
  { name: "SuperAGI", desc: "Open-Source AGI Infra", icon: Bot, color: "#10b981", bg: "#10b98115" },
];

// Duplicate for seamless infinite scroll
const doubledAgents = [...agents, ...agents];

export default function AgentMarquee() {
  return (
    <div className="py-16 relative">
      {/* Label */}
      <div className="text-center mb-10">
        <span className="text-[9px] uppercase tracking-[0.35em] text-surface-500 font-light">
          Compatible with leading agent frameworks
        </span>
      </div>

      {/* Row 1 - moves left */}
      <div className="marquee-container mb-4">
        <div className="flex animate-marquee" style={{ width: "max-content" }}>
          {doubledAgents.map((agent, i) => (
            <div
              key={`r1-${i}`}
              className="flex items-center gap-3.5 mx-3 px-5 py-3.5 rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/80 hover:border-gold-500/20 hover:shadow-lg hover:shadow-gold-500/[0.06] transition-all duration-300 cursor-default group shrink-0"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: agent.bg }}
              >
                <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <div>
                <div className="text-sm font-semibold text-surface-800 whitespace-nowrap">{agent.name}</div>
                <div className="text-[10px] text-surface-500 whitespace-nowrap">{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 - moves right (reverse) */}
      <div className="marquee-container">
        <div className="flex animate-marquee-reverse" style={{ width: "max-content" }}>
          {[...doubledAgents].reverse().map((agent, i) => (
            <div
              key={`r2-${i}`}
              className="flex items-center gap-3.5 mx-3 px-5 py-3.5 rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/80 hover:border-gold-500/20 hover:shadow-lg hover:shadow-gold-500/[0.06] transition-all duration-300 cursor-default group shrink-0"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                style={{ background: agent.bg }}
              >
                <agent.icon className="w-5 h-5" style={{ color: agent.color }} />
              </div>
              <div>
                <div className="text-[13px] font-normal text-surface-700 whitespace-nowrap">{agent.name}</div>
                <div className="text-[9px] text-surface-500 whitespace-nowrap font-light">{agent.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
