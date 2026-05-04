"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Activity, ArrowUpRight, Bot, CheckCircle2, Clock, Download, TrendingUp, XCircle } from "lucide-react";

const transactions = [
  { id: "tx_8f2a", agent: "Trading Bot Alpha", amount: 8.5, token: "USDC", status: "approved", time: "2 min ago" },
  { id: "tx_3b7c", agent: "Data Scraper", amount: 2.5, token: "USDC", status: "approved", time: "8 min ago" },
  { id: "tx_9d1e", agent: "DeFi Agent", amount: 45.0, token: "USDC", status: "pending", time: "12 min ago" },
  { id: "tx_5f4a", agent: "Content Creator", amount: 1.2, token: "USDC", status: "approved", time: "25 min ago" },
  { id: "tx_1c8b", agent: "Trading Bot Alpha", amount: 150.0, token: "USDC", status: "rejected", time: "1 hr ago" },
];

const agents = [
  { name: "Trading Bot Alpha", spent: 234.5, limit: 500, txCount: 47, status: "active" },
  { name: "Data Scraper", spent: 89.2, limit: 200, txCount: 23, status: "active" },
  { name: "DeFi Agent", spent: 412.8, limit: 500, txCount: 31, status: "pending" },
  { name: "Content Creator", spent: 15.6, limit: 100, txCount: 8, status: "active" },
];

export default function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [tab, setTab] = useState<"tx" | "agents">("tx");

  const Badge = ({ status }: { status: string }) => {
    const cls = status === "approved" || status === "active" ? "badge-approved" : status === "pending" ? "badge-pending" : "badge-rejected";
    const Icon = status === "approved" || status === "active" ? CheckCircle2 : status === "pending" ? Clock : XCircle;
    return <span className={`${cls} inline-flex items-center gap-1`}><Icon className="w-3 h-3" />{status}</span>;
  };

  return (
    <section id="dashboard" className="relative py-28" ref={ref}>
      <div className="section-line mb-20" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }} className="mb-14 max-w-2xl">
          <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">Dashboard</span>
          <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-4 tracking-[-0.02em]">
            <span className="text-surface-800">Complete visibility.</span>{" "}
            <span className="text-gradient-gold">Total control.</span>
          </h2>
          <p className="text-sm text-surface-500 font-light">Monitor transactions, manage limits, approve requests — from one beautiful interface.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
          className="card-elevated overflow-hidden">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gold-50 flex items-center justify-center"><Bot className="w-3.5 h-3.5 text-gold-600" /></div>
              <div>
                <div className="text-[11px] font-normal text-surface-700">Sentia Dashboard</div>
                <div className="text-[10px] text-surface-400 font-mono">8xKm...4pRt</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.06] text-[11px] text-surface-500 hover:border-gold-500/30 hover:text-gold-600 transition-all">
                <Download className="w-3 h-3" /> Export CSV
              </button>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /><span className="text-[10px] text-green-400 font-medium">Live</span></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5">
            {[
              { label: "Total Spent (24h)", value: "$751.90", change: "+12.3%", icon: TrendingUp, color: "text-gold-600" },
              { label: "Active Agents", value: "4", change: "+1", icon: Bot, color: "text-blue-400" },
              { label: "Transactions", value: "109", change: "+23", icon: Activity, color: "text-green-400" },
              { label: "Pending", value: "2", change: "Action needed", icon: Clock, color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="p-4 rounded-xl bg-surface-50/60 border border-white/[0.04] group hover:border-gold-500/20 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-surface-400 uppercase tracking-wider">{s.label}</span>
                  <s.icon className={`w-4 h-4 ${s.color} opacity-40 group-hover:opacity-70 transition-opacity`} />
                </div>
                <div className="text-2xl font-bold text-surface-900 font-[Outfit]">{s.value}</div>
                <div className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1"><ArrowUpRight className="w-2.5 h-2.5" />{s.change}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="px-5">
            <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
              <button onClick={() => setTab("tx")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "tx" ? "bg-surface-200 text-gold-600 shadow-sm" : "text-surface-400 hover:text-surface-600"}`}>Transactions</button>
              <button onClick={() => setTab("agents")} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === "agents" ? "bg-surface-200 text-gold-600 shadow-sm" : "text-surface-400 hover:text-surface-600"}`}>Agents</button>
            </div>
          </div>

          {/* Table */}
          <div className="p-5 overflow-x-auto">
            {tab === "tx" ? (
              <table className="data-table">
                <thead><tr><th>Agent</th><th>Amount</th><th>Status</th><th>Time</th></tr></thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td><div className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-gold-400" /><span className="text-surface-800 font-medium text-sm">{tx.agent}</span></div></td>
                      <td className="font-mono text-surface-800 text-sm font-semibold">{tx.amount} {tx.token}</td>
                      <td><Badge status={tx.status} /></td>
                      <td className="text-surface-400 text-sm">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="data-table">
                <thead><tr><th>Agent</th><th>Usage</th><th>Transactions</th><th>Status</th></tr></thead>
                <tbody>
                  {agents.map((a) => (
                    <tr key={a.name}>
                      <td><div className="flex items-center gap-2"><Bot className="w-3.5 h-3.5 text-gold-400" /><span className="text-surface-800 font-medium text-sm">{a.name}</span></div></td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-surface-200 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-gold-400 to-gold-500" style={{ width: `${(a.spent / a.limit) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-surface-400">{Math.round((a.spent / a.limit) * 100)}%</span>
                        </div>
                      </td>
                      <td className="text-surface-600 text-sm">{a.txCount}</td>
                      <td><Badge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
