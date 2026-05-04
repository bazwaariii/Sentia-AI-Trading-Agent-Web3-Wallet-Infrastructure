"use client";

import Image from "next/image";
import Link from "next/link";
import { Globe, Send, MessageSquare, Mail, FileText, ArrowUpRight, Heart } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Agent Wallet SDK", href: "#sdk" },
    { label: "Owner Dashboard", href: "#dashboard" },
    { label: "Approval Webhooks", href: "#docs" },
    { label: "Pricing", href: "#pricing" },
  ],
  Developers: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "#" },
    { label: "SDK on npm", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  Resources: [
    { label: "Blog", href: "#" },
    { label: "Changelog", href: "#" },
    { label: "Status Page", href: "#" },
    { label: "Community", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Legal", href: "#" },
  ],
};

const socials = [
  { icon: Globe, href: "#", label: "GitHub" },
  { icon: Send, href: "#", label: "Twitter" },
  { icon: MessageSquare, href: "#", label: "Discord" },
  { icon: Mail, href: "#", label: "Email" },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Links */}
        <div className="grid md:grid-cols-6 gap-10 pb-14">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <Image src="/sentia.png" alt="Sentia" width={32} height={32} className="object-contain" />
              <span className="text-base font-normal text-gradient-gold font-[Outfit]">Sentia</span>
            </div>
            <p className="text-[13px] text-surface-500 leading-relaxed mb-5 max-w-xs font-light">Non-custodial wallet SDK for AI agents on Solana. Full autonomy with human control.</p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} className="w-9 h-9 rounded-xl bg-surface-100 border border-white/[0.06] hover:border-gold-500/30 hover:bg-gold-50 flex items-center justify-center transition-all group">
                  <s.icon className="w-4 h-4 text-surface-400 group-hover:text-gold-600 transition-colors" />
                </a>
              ))}
            </div>
          </div>
          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <h4 className="text-[11px] font-normal text-surface-700 mb-3 font-[Outfit]">{cat}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => <li key={l.label}><a href={l.href} className="text-[13px] text-surface-400 hover:text-gold-600 transition-colors font-light">{l.label}</a></li>)}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/[0.06] py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <span>© 2026 Sentia. Built with</span><Heart className="w-3 h-3 text-red-400 mx-0.5" /><span>for Colosseum Hackathon</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-surface-400">
            <a href="#" className="hover:text-gold-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gold-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-gold-600 transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
