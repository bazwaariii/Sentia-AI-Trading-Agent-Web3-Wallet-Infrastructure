"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LayoutDashboard, ExternalLink } from "lucide-react";

const navLinks = [
  { label: "Showcase", href: "#showcase" },
  { label: "Features", href: "#features" },
  { label: "SDK", href: "#sdk" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-[#030303]/80 backdrop-blur-xl border-b border-white/[0.04] shadow-sm shadow-black/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <Image src="/sentia.png" alt="Sentia" fill className="object-contain group-hover:scale-105 transition-transform" />
              </div>
              <span className="text-lg font-semibold tracking-tight text-gradient-gold font-[Outfit]">Sentia</span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} className="px-4 py-2 rounded-xl text-[12px] font-normal text-surface-500 hover:text-gold-600 hover:bg-gold-50 transition-all">
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="btn-outline !px-4 !py-2 text-[12px] flex items-center gap-2">
                Log in
              </Link>
              <Link href="/register" className="btn-gold !px-5 !py-2 text-[12px]">
                <span className="flex items-center gap-2">Get Started <ExternalLink className="w-3 h-3" /></span>
              </Link>
            </div>

            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-xl hover:bg-surface-200 transition-colors">
              {mobileOpen ? <X className="w-5 h-5 text-gold-600" /> : <Menu className="w-5 h-5 text-surface-500" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#030303]/98 backdrop-blur-2xl lg:hidden pt-20 overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-2 mb-10">
              {navLinks.map((link, i) => (
                <motion.a key={link.label} href={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} onClick={() => setMobileOpen(false)} className="block px-5 py-3 rounded-xl text-base font-medium text-surface-600 hover:text-gold-600 hover:bg-gold-50 transition-all">
                  {link.label}
                </motion.a>
              ))}
              <div className="pt-4 space-y-3">
                <Link href="/login" className="block text-center btn-outline w-full !py-3" onClick={() => setMobileOpen(false)}>Log in</Link>
                <Link href="/register" className="block text-center btn-gold w-full !py-3" onClick={() => setMobileOpen(false)}><span>Register</span></Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
