"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Bot,
  FileCheck,
  Settings,
  Bell,
  Download,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Wallet,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  ExternalLink,
  Copy,
  RefreshCcw,
  Sliders,
  Send,
  LogOut,
  User,
  Moon,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// ─── Mock Data ───────────────────────────────────────────────
const spendingData = [
  { date: "Mon", amount: 120, limit: 500 },
  { date: "Tue", amount: 230, limit: 500 },
  { date: "Wed", amount: 180, limit: 500 },
  { date: "Thu", amount: 340, limit: 500 },
  { date: "Fri", amount: 290, limit: 500 },
  { date: "Sat", amount: 150, limit: 500 },
  { date: "Sun", amount: 420, limit: 500 },
];

const agentDistribution = [
  { name: "Trading Bot Alpha", value: 35, color: "#c8a748" },
  { name: "Data Scraper", value: 20, color: "#22c55e" },
  { name: "DeFi Agent", value: 30, color: "#6366f1" },
  { name: "Content Creator", value: 15, color: "#f43f5e" },
];

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  tx: Math.floor(Math.random() * 15) + 1,
}));

const transactions = [
  { id: "tx_8f2a9c", agent: "Trading Bot Alpha", type: "Swap", amount: 8.5, token: "USDC", status: "approved", time: "2 min ago", to: "4kRf...9xPq", hash: "3nKm...7vWz" },
  { id: "tx_3b7c1d", agent: "Data Scraper", type: "API Payment", amount: 2.5, token: "USDC", status: "approved", time: "8 min ago", to: "7mNp...2wKz", hash: "8pLq...4xRm" },
  { id: "tx_9d1e4f", agent: "DeFi Agent", type: "Yield Entry", amount: 45.0, token: "USDC", status: "pending", time: "12 min ago", to: "2xLq...5vRm", hash: "pending" },
  { id: "tx_5f4a2b", agent: "Content Creator", type: "Service Fee", amount: 1.2, token: "USDC", status: "approved", time: "25 min ago", to: "9bCd...3jHn", hash: "1mKn...6wPt" },
  { id: "tx_1c8b3e", agent: "Trading Bot Alpha", type: "Large Purchase", amount: 150.0, token: "USDC", status: "rejected", time: "1 hr ago", to: "6pWx...8tYz", hash: "rejected" },
  { id: "tx_7d2f9a", agent: "DeFi Agent", type: "LP Deposit", amount: 25.0, token: "USDC", status: "approved", time: "2 hr ago", to: "3qNr...1kYm", hash: "5vBx...9rLw" },
  { id: "tx_4e6c1b", agent: "Trading Bot Alpha", type: "Token Swap", amount: 12.0, token: "USDC", status: "approved", time: "3 hr ago", to: "8wPm...4zXq", hash: "2nJk...7tSv" },
  { id: "tx_2a8d5f", agent: "Data Scraper", type: "Data Purchase", amount: 5.0, token: "USDC", status: "approved", time: "5 hr ago", to: "1cRt...6bWn", hash: "4pLm...8xQz" },
];

const agents = [
  { id: 1, name: "Trading Bot Alpha", pubkey: "7xKm...4pRt", spent: 234.5, limit: 500, maxPerTx: 10, dailyLimit: 100, txCount: 47, status: "active", lastActive: "2 min ago" },
  { id: 2, name: "Data Scraper", pubkey: "3mNq...8wKz", spent: 89.2, limit: 200, maxPerTx: 5, dailyLimit: 50, txCount: 23, status: "active", lastActive: "8 min ago" },
  { id: 3, name: "DeFi Agent", pubkey: "9pLr...2vXm", spent: 412.8, limit: 500, maxPerTx: 15, dailyLimit: 200, txCount: 31, status: "pending", lastActive: "12 min ago" },
  { id: 4, name: "Content Creator", pubkey: "5bCd...1jHn", spent: 15.6, limit: 100, maxPerTx: 3, dailyLimit: 25, txCount: 8, status: "active", lastActive: "25 min ago" },
];

const approvalRequests = [
  { id: "req_001", agent: "DeFi Agent", amount: 45.0, token: "USDC", reason: "Yield farming entry on Raydium", currentLimit: 15, time: "12 min ago", urgency: "high" },
  { id: "req_002", agent: "Trading Bot Alpha", amount: 75.0, token: "USDC", reason: "Arbitrage opportunity detected", currentLimit: 10, time: "45 min ago", urgency: "medium" },
  { id: "req_003", agent: "Data Scraper", amount: 20.0, token: "USDC", reason: "Premium API tier upgrade", currentLimit: 5, time: "2 hr ago", urgency: "low" },
];

// ─── Main Dashboard Component ────────────────────────────────

// ─── Main Dashboard Component ────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [dbUser, setDbUser] = useState<any>(null);
  const [solBalance, setSolBalance] = useState<number>(0);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    router.push('/login');
  };

  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) {
      router.push('/login');
      return;
    }
    fetch(`/api/dashboard?email=${email}`)
      .then(res => res.json())
      .then(data => {
        if (data.user) setDbUser(data.user);
      })
      .catch(console.error);
  }, [router]);

  const StatusBadge = ({ status }: { status: string }) => {
    const cls = status === "approved" || status === "active" ? "badge-approved" : status === "pending" ? "badge-pending" : "badge-rejected";
    const Icon = status === "approved" || status === "active" ? CheckCircle2 : status === "pending" ? Clock : XCircle;
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return (
      <span className={`${cls} inline-flex items-center gap-1.5`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  const handleUpdateStatus = async (txId: string, status: string) => {
    try {
      const res = await fetch('/api/telegram/transaction/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txId, status })
      });
      if (res.ok) {
        // Refresh data
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const transactionsList = dbUser?.transactions || [];
  const pendingApprovalsCount = transactionsList.filter((tx: any) => tx.status === 'pending').length;

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Overview", id: "overview" },
    { icon: Bot, label: "Agents", id: "agents" },
    { icon: FileCheck, label: "Approvals", id: "approvals", badge: pendingApprovalsCount },
    { icon: Activity, label: "Transactions", id: "transactions" },
    { icon: Sliders, label: "Limits", id: "limits" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];

  // ─── Render Content Based on Active Tab ──────────
  const renderContent = () => {
    const transactions = dbUser?.transactions || [];
    const pendingApprovals = transactions.filter((tx: any) => tx.status === 'pending');

    switch (activeTab) {
      case "overview":
        return <OverviewTab StatusBadge={StatusBadge} solBalance={solBalance} transactions={transactions} />;
      case "agents":
        return <AgentsTab StatusBadge={StatusBadge} agents={dbUser?.agents || []} />;
      case "approvals":
        return <ApprovalsTab pendingApprovals={pendingApprovals} onUpdate={handleUpdateStatus} />;
      case "transactions":
        return <TransactionsTab StatusBadge={StatusBadge} transactions={transactions} />;
      case "limits":
        return <LimitsTab agents={dbUser?.agents || agents} user={dbUser} />;
      case "settings":
        return <SettingsTab user={dbUser} />;
      default:
        return <OverviewTab StatusBadge={StatusBadge} solBalance={solBalance} transactions={transactions} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] flex">
      {/* ─── Sidebar ─── */}
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col dashboard-sidebar transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        } fixed top-0 left-0 h-screen z-30`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/[0.06]">
          <Image src="/sentia.png" alt="Sentia" width={32} height={32} className="object-contain" />
          {sidebarOpen && (
            <span className="text-lg font-bold text-gradient-gold font-[Outfit]">Sentia</span>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`sidebar-link w-full ${activeTab === item.id ? "active" : ""} ${
                !sidebarOpen ? "justify-center !px-3" : ""
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.badge && (
                <span className="ml-auto w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 text-[10px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 border-t border-white/[0.06]">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="sidebar-link w-full"
          >
            <ChevronRight
              className={`w-5 h-5 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
            />
            {sidebarOpen && <span>Collapse</span>}
          </button>
          <Link href="/" className="sidebar-link w-full mt-1">
            <ExternalLink className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Back to Home</span>}
          </Link>
          <button onClick={handleLogout} className="sidebar-link w-full mt-1 text-red-400 hover:!bg-red-500/10 hover:!text-red-400">
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 left-0 h-screen w-64 dashboard-sidebar z-50 lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                  <Image src="/sentia.png" alt="Sentia" width={32} height={32} />
                  <span className="text-lg font-bold text-gradient-gold font-[Outfit]">Sentia</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                    className={`sidebar-link w-full ${activeTab === item.id ? "active" : ""}`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-gold-500/20 text-gold-400 text-[10px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-white/[0.06] space-y-1">
                <Link href="/" className="sidebar-link w-full" onClick={() => setMobileSidebarOpen(false)}>
                  <ExternalLink className="w-5 h-5 shrink-0" />
                  <span>Back to Home</span>
                </Link>
                <button onClick={() => { setMobileSidebarOpen(false); handleLogout(); }} className="sidebar-link w-full text-red-400 hover:!bg-red-500/10 hover:!text-red-400">
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ─── Main Content ─── */}
      <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-20 bg-[#030303]/80 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 hover:bg-gold-500/10 rounded-xl" onClick={() => setMobileSidebarOpen(true)}>
                <Menu className="w-5 h-5 text-[#aaaaaa]" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-[#f5f5f5] font-[Outfit]">
                  {sidebarItems.find((i) => i.id === activeTab)?.label}
                </h1>
                <p className="text-xs text-[#777777]">Welcome back, {dbUser?.name || 'owner'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0c0c0c] border border-white/[0.06]">
                <Search className="w-4 h-4 text-[#777777]" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent text-sm text-[#f5f5f5] placeholder:text-[#777777] outline-none w-32"
                />
              </div>
              <button className="relative p-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] hover:border-gold-500/30 transition-colors">
                <Bell className="w-4 h-4 text-[#888888]" />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold-500 text-[9px] font-bold text-[#030303] flex items-center justify-center">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>
              <button className="p-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] hover:border-gold-500/30 transition-colors">
                <RefreshCcw className="w-4 h-4 text-[#888888]" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-white/[0.06]">
                <div className="w-8 h-8 rounded-full bg-gold-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-gold-400" />
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-[#f5f5f5]">
                    {dbUser?.walletAddress ? `${dbUser.walletAddress.slice(0, 4)}...${dbUser.walletAddress.slice(-4)}` : 'Loading...'}
                  </div>
                  <div className="text-xs text-[#777777] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Connected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

// ─── Overview Tab ────────────────────────────────────────────
function OverviewTab({ StatusBadge, solBalance, transactions }: { 
  StatusBadge: React.FC<{ status: string }>, 
  solBalance: number,
  transactions: any[]
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Wallet Balance", value: `${solBalance.toFixed(4)} SOL`, change: "Real-time from chain", up: true, icon: Wallet, color: "text-gold-400" },
          { label: "Active Agents", value: "2", change: "Running on Bot", up: true, icon: Bot, color: "text-blue-400" },
          { label: "Transactions (24h)", value: transactions.length.toString(), change: "Syncing...", up: true, icon: Activity, color: "text-green-400" },
          { label: "Spending Bound", value: "$500", change: "Daily Limit", up: false, icon: Shield, color: "text-amber-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card-static p-6 group hover:border-gold-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#888888] uppercase tracking-wider">{stat.label}</span>
              <stat.icon className={`w-5 h-5 ${stat.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
            </div>
            <div className="text-3xl font-bold text-[#f5f5f5] font-[Outfit]">{stat.value}</div>
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${stat.up ? "text-green-400" : "text-amber-400"}`}>
              {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Spending Chart */}
        <div className="lg:col-span-2 glass-card-static p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit]">Spending Overview</h3>
            <div className="flex gap-2">
              {["7D", "30D", "90D"].map((period) => (
                <button key={period} className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${period === "7D" ? "bg-gold-500/15 text-gold-400" : "text-[#777777] hover:text-[#f5f5f5]"}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={spendingData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c8a748" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#c8a748" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,167,72,0.05)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "#5a5a78", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a5a78", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "12px 16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                labelStyle={{ color: "#525252", fontSize: 12 }}
                itemStyle={{ color: "#a8872a" }}
              />
              <Area type="monotone" dataKey="amount" stroke="#c8a748" strokeWidth={2} fill="url(#goldGradient)" />
              <Area type="monotone" dataKey="limit" stroke="#2a2a45" strokeWidth={1} strokeDasharray="5 5" fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Distribution */}
        <div className="glass-card-static p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6">Agent Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={agentDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {agentDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {agentDistribution.map((agent) => (
              <div key={agent.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: agent.color }} />
                  <span className="text-[#aaaaaa]">{agent.name}</span>
                </div>
                <span className="text-[#f5f5f5] font-medium">{agent.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Activity + Recent Transactions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Hourly Activity */}
        <div className="glass-card-static p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6">Hourly Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData.slice(0, 12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(200,167,72,0.05)" />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: "#5a5a78", fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#5a5a78", fontSize: 10 }} />
              <Bar dataKey="tx" fill="#c8a748" radius={[4, 4, 0, 0]} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 glass-card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit]">Recent Transactions</h3>
            <button className="text-xs text-gold-400 hover:text-gold-300 flex items-center gap-1">
              View All <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>ID</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 5).map((tx: any) => (
                  <tr key={tx.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gold-400/50" />
                        <span className="text-[#f5f5f5] text-sm">{tx.type}</span>
                      </div>
                    </td>
                    <td className="font-mono text-[#f5f5f5] text-sm">{tx.amount} {tx.token}</td>
                    <td><StatusBadge status={tx.status} /></td>
                    <td className="text-[#777777] text-xs font-mono">{tx.id.slice(0, 8)}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-[#555555]">No transactions found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Agents Tab ──────────────────────────────────────────────
function AgentsTab({ StatusBadge, agents }: { StatusBadge: React.FC<{ status: string }>, agents: any[] }) {
  const [editingAgent, setEditingAgent] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#f5f5f5] font-[Outfit]">Agent Management</h2>
          <p className="text-sm text-[#888888] mt-1">Monitor and configure your AI agent wallets</p>
        </div>
        <button className="btn-gold !px-5 !py-2.5 text-sm flex items-center gap-2">
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Agent
          </span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="glass-card-static p-6 hover:border-gold-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#f5f5f5]">{agent.name}</h4>
                  <span className="text-xs font-mono text-[#777777]">{agent.pubkey}</span>
                </div>
              </div>
              <StatusBadge status={agent.status} />
            </div>

            {/* Spending Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#888888]">Spent / Limit</span>
                <span className="text-[#f5f5f5] font-mono">${agent.spent} / ${agent.limit}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-[#1a1a1a] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min((agent.spent / agent.limit) * 100, 100)}%`,
                    background: agent.spent / agent.limit > 0.8 ? "linear-gradient(90deg, #ef4444, #f97316)" : agent.spent / agent.limit > 0.5 ? "linear-gradient(90deg, #eab308, #f97316)" : "linear-gradient(90deg, #c8a748, #a8872a)",
                  }}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 rounded-xl bg-[#0c0c0c]">
                <div className="text-base font-bold text-[#f5f5f5]">{agent.txCount}</div>
                <div className="text-[10px] text-[#777777]">Transactions</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#0c0c0c]">
                <div className="text-base font-bold text-[#f5f5f5]">${agent.maxPerTx}</div>
                <div className="text-[10px] text-[#777777]">Max/tx</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#0c0c0c]">
                <div className="text-base font-bold text-[#f5f5f5]">${agent.dailyLimit}</div>
                <div className="text-[10px] text-[#777777]">Daily Cap</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-[#777777]">
              <span>Last active: {agent.lastActive}</span>
              <button onClick={() => setEditingAgent(editingAgent === agent.id ? null : agent.id)} className="text-gold-400 hover:text-gold-300 flex items-center gap-1">
                <Settings className="w-3 h-3" /> Configure
              </button>
            </div>

            {/* Edit Panel */}
            {editingAgent === agent.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                <div>
                  <label className="text-xs text-[#888888] mb-1 block">Max Per Transaction (USDC)</label>
                  <input type="number" defaultValue={agent.maxPerTx} className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] text-sm outline-none focus:border-gold-500/30" />
                </div>
                <div>
                  <label className="text-xs text-[#888888] mb-1 block">Daily Limit (USDC)</label>
                  <input type="number" defaultValue={agent.dailyLimit} className="w-full px-4 py-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] text-sm outline-none focus:border-gold-500/30" />
                </div>
                <button className="btn-gold w-full !py-2.5 text-sm"><span>Save Changes</span></button>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Approvals Tab ───────────────────────────────────────────
function ApprovalsTab({ pendingApprovals, onUpdate }: { pendingApprovals: any[], onUpdate: (id: string, s: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#f5f5f5] font-[Outfit]">Approval Requests</h2>
          <p className="text-sm text-[#888888] mt-1">Review and approve agent spending requests that exceed limits</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-amber-400">{pendingApprovals.length} pending</span>
        </div>
      </div>

      <div className="grid gap-4">
        {pendingApprovals.map((req) => (
          <motion.div
            key={req.id}
            layout
            className="glass-card-static p-6 hover:border-gold-500/20 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-500/15">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{req.type}</h4>
                  <div className="flex items-center gap-4 text-xs text-[#777777] mt-1">
                    <span>Amount: <strong className="text-gold-400">{req.amount} {req.token}</strong></span>
                    <span>Recipient: <strong className="text-[#f5f5f5]">{req.to}</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 shrink-0">
                <button onClick={() => onUpdate(req.id, 'rejected')} className="px-6 py-2.5 rounded-xl bg-red-500/15 border border-red-500/25 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
                <button onClick={() => onUpdate(req.id, 'approved')} className="px-6 py-2.5 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 text-sm font-semibold hover:bg-green-500/25 transition-colors flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {pendingApprovals.length === 0 && (
          <div className="text-center py-20 glass-card-static">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-[#f5f5f5]">No pending approvals</h3>
            <p className="text-[#555555] text-sm">You are all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TransactionsTab({ StatusBadge, transactions }: { StatusBadge: React.FC<{ status: string }>, transactions: any[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#f5f5f5] font-[Outfit]">Transaction History</h2>
          <p className="text-sm text-[#888888] mt-1">Complete audit trail of all agent transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] hover:border-gold-500/30 text-sm text-[#aaaaaa] transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0c0c0c] border border-white/[0.06] hover:border-gold-500/30 text-sm text-[#aaaaaa] transition-all">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="glass-card-static overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>TX ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Recipient</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx: any) => (
                <tr key={tx.id}>
                  <td className="text-xs font-mono text-[#777777]">{tx.id.slice(0, 12)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-gold-400/50" />
                      <span className="text-[#f5f5f5] text-sm">{tx.type}</span>
                    </div>
                  </td>
                  <td className="font-mono text-[#f5f5f5] text-sm">{tx.amount} {tx.token}</td>
                  <td className="text-xs text-[#888888] font-mono">{tx.to}</td>
                  <td><StatusBadge status={tx.status} /></td>
                  <td className="text-[#777777] text-sm">{new Date(tx.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-[#555555]">No transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Limits Tab ──────────────────────────────────────────────
function LimitsTab({ agents, user }: { agents: any[], user: any }) {
  const [maxPerTx, setMaxPerTx] = useState(user?.defaultMaxPerTx || 10);
  const [dailyLimit, setDailyLimit] = useState(user?.defaultDailyLimit || 100);
  const [monthlyCap, setMonthlyCap] = useState(user?.monthlyBudgetCap || 2000);
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/dashboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'limits',
          updates: { defaultMaxPerTx: maxPerTx, defaultDailyLimit: dailyLimit, monthlyBudgetCap: monthlyCap }
        })
      });
      if (res.ok) {
        alert("Global Limits successfully updated!");
        window.location.reload();
      } else {
        alert("Failed to update limits.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating limits.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#f5f5f5] font-[Outfit]">Spending Limits</h2>
        <p className="text-sm text-[#888888] mt-1">Configure on-chain spending policies for each agent</p>
      </div>

      <div className="glass-card-static p-8">
        <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6">Global Limits</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Default Max Per Transaction (USDC)</label>
            <input type="number" value={maxPerTx} onChange={e => setMaxPerTx(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] outline-none focus:border-gold-500/30 transition-colors" />
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Default Daily Limit (USDC)</label>
            <input type="number" value={dailyLimit} onChange={e => setDailyLimit(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] outline-none focus:border-gold-500/30 transition-colors" />
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Monthly Budget Cap (USDC)</label>
            <input type="number" value={monthlyCap} onChange={e => setMonthlyCap(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] outline-none focus:border-gold-500/30 transition-colors" />
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Allowed Tokens</label>
            <div className="flex flex-wrap gap-2">
              {["USDC", "SOL", "USDT"].map((token) => (
                <span key={token} className="px-4 py-2 rounded-xl bg-gold-500/10 border border-gold-500/20 text-sm text-gold-400 font-medium">{token}</span>
              ))}
              <button className="px-4 py-2 rounded-xl border border-dashed border-white/[0.1] text-sm text-[#777777] hover:border-gold-500/30 hover:text-gold-400 transition-all">+ Add Token</button>
            </div>
          </div>
        </div>
        <button onClick={handleUpdate} disabled={isSaving} className="btn-gold mt-8 !py-3">
          <span>{isSaving ? "Updating..." : "Update Global Limits"}</span>
        </button>
      </div>

      {/* Per-Agent Limits */}
      <div className="glass-card-static p-8">
        <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6">Per-Agent Overrides</h3>
        <div className="space-y-4">
          {agents.map((agent: any) => (
            <div key={agent.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a] border border-white/[0.06] hover:border-gold-500/15 transition-all">
              <div className="flex items-center gap-3">
                <Bot className="w-5 h-5 text-gold-400/60" />
                <div>
                  <div className="text-sm font-medium text-[#f5f5f5]">{agent.name}</div>
                  <div className="text-xs text-[#777777] font-mono">{agent.pubkey}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-xs text-[#777777]">Max/tx</div>
                  <div className="text-sm font-mono text-[#f5f5f5]">${agent.maxPerTx || user?.defaultMaxPerTx || 10}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#777777]">Daily</div>
                  <div className="text-sm font-mono text-[#f5f5f5]">${agent.dailyLimit || user?.defaultDailyLimit || 100}</div>
                </div>
                <button 
                  onClick={async () => {
                    const newMax = prompt(`Enter new Max/tx for ${agent.name} (USDC):`, agent.maxPerTx || user?.defaultMaxPerTx || 10);
                    if (!newMax) return;
                    const newDaily = prompt(`Enter new Daily Limit for ${agent.name} (USDC):`, agent.dailyLimit || user?.defaultDailyLimit || 100);
                    if (!newDaily) return;
                    
                    try {
                      const res = await fetch('/api/dashboard/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: user.email,
                          type: 'agent_limits',
                          updates: { agentId: agent.id, maxPerTx: newMax, dailyLimit: newDaily }
                        })
                      });
                      if (res.ok) {
                        alert("Agent limits updated successfully!");
                        window.location.reload();
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-gold-500/10 transition-colors"
                >
                  <Settings className="w-4 h-4 text-[#888888] hover:text-gold-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Settings Tab ────────────────────────────────────────────
function SettingsTab({ user }: { user: any }) {
  const [webhookUrl, setWebhookUrl] = useState(user?.webhookUrl || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/dashboard/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          type: 'settings',
          updates: { webhookUrl }
        })
      });
      if (res.ok) {
        alert("Settings successfully updated!");
        window.location.reload();
      } else {
        alert("Failed to update settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating settings.");
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#f5f5f5] font-[Outfit]">Settings</h2>
          <p className="text-sm text-[#888888] mt-1">Configure your Sentia dashboard preferences</p>
        </div>
        <button onClick={handleUpdate} disabled={isSaving} className="btn-gold !px-6 !py-2">
          <span>{isSaving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Webhook Configuration */}
      <div className="glass-card-static p-8">
        <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6 flex items-center gap-2">
          <Bell className="w-5 h-5 text-gold-400" /> Notification Channels
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Webhook URL</label>
            <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://api.your-app.com/sentia/webhook" className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] font-mono text-sm outline-none focus:border-gold-500/30 transition-colors" />
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Telegram Notification Chat ID</label>
            <input type="text" readOnly defaultValue={user?.telegramChatId || "Not Linked"} className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] text-sm outline-none opacity-70" />
            <p className="text-xs text-[#777777] mt-2">Linked via Telegram Bot. Used for approval alerts.</p>
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Account Email</label>
            <input type="email" readOnly defaultValue={user?.email || ""} className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] text-sm outline-none opacity-70" />
          </div>
        </div>
      </div>

      {/* Auth Settings */}
      <div className="glass-card-static p-8">
        <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-gold-400" /> Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a]">
            <div>
              <div className="text-sm font-medium text-[#f5f5f5]">Two-Factor Authentication</div>
              <div className="text-xs text-[#777777]">Add extra security to your dashboard</div>
            </div>
            <button className="w-12 h-6 rounded-full bg-gold-500/30 border border-gold-500/50 relative">
              <div className="w-4 h-4 rounded-full bg-gold-400 absolute top-[3px] right-[3px]" />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-[#0a0a0a]">
            <div>
              <div className="text-sm font-medium text-[#f5f5f5]">Auto-Reject After Timeout</div>
              <div className="text-xs text-[#777777]">Automatically reject unresponded requests after 24h</div>
            </div>
            <button className="w-12 h-6 rounded-full bg-[#1a1a1a] border border-white/[0.1] relative">
              <div className="w-4 h-4 rounded-full bg-dark-400 absolute top-[3px] left-[3px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="glass-card-static p-8">
        <h3 className="text-lg font-semibold text-[#f5f5f5] font-[Outfit] mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gold-400" /> Database & Audit Trail
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Supabase Project URL</label>
            <input type="url" defaultValue="https://abc123.supabase.co" className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] font-mono text-sm outline-none focus:border-gold-500/30 transition-colors" />
          </div>
          <div>
            <label className="text-sm text-[#888888] mb-2 block">Supabase Anon Key</label>
            <input type="password" defaultValue="hidden-key" className="w-full px-4 py-3 rounded-xl bg-[#0c0c0c] border border-white/[0.06] text-[#f5f5f5] text-sm outline-none focus:border-gold-500/30 transition-colors" />
          </div>
        </div>
      </div>

      <button className="btn-gold !py-3"><span>Save All Settings</span></button>
    </div>
  );
}

