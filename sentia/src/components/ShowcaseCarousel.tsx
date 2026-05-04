"use client";

import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/slide 01.png",
    title: "AI Trading Assistant",
    description: "Chat with Sentia Bot on Telegram for real-time AI-powered trading analysis, wallet management, and autonomous agent control.",
    accent: "#d4af37",
  },
  {
    image: "/slide 02.png",
    title: "Real-Time Dashboard",
    description: "Monitor every agent transaction live. Visual analytics, spending breakdowns, and one-click approval workflows.",
    accent: "#818cf8",
  },
  {
    image: "/slide 03.png",
    title: "Smart Trading Signals",
    description: "AI-powered market analysis with session key management. Autonomous trading with on-chain spending guardrails.",
    accent: "#4ade80",
  },
];

export default function ShowcaseCarousel() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragX = useMotionValue(0);

  const goTo = useCallback((index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  }, [current]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  // Auto-play — always running, paused only on hover
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, 4000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, next]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.96,
    }),
  };

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    if (info.offset.x < -50 || info.velocity.x < -200) next();
    else if (info.offset.x > 50 || info.velocity.x > 200) prev();
  };

  return (
    <section id="showcase" className="relative py-24 overflow-hidden">
      <div className="section-line mb-16" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-[9px] uppercase tracking-[0.35em] text-gold-600/80 font-normal mb-3 block">
            Showcase
          </span>
          <h2 className="text-3xl md:text-4xl font-light font-[Outfit] leading-[1.15] mb-3 tracking-[-0.02em]">
            <span className="text-surface-800">See Sentia </span>
            <span className="text-gradient-gold">in action.</span>
          </h2>
          <p className="text-sm text-surface-500 max-w-md mx-auto font-light">
            From Telegram bot to dashboard — explore how Sentia empowers autonomous AI agents.
          </p>
        </motion.div>

        <div
          ref={containerRef}
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="relative overflow-hidden rounded-2xl bg-[#080808] border border-white/[0.05] shadow-xl shadow-black/40" style={{ minHeight: "440px" }}>
            <div
              className="absolute inset-0 pointer-events-none transition-colors duration-700"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${slides[current].accent}08, transparent 60%)`,
              }}
            />

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.25 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragEnd={handleDragEnd}
                style={{ x: dragX }}
                className="grid md:grid-cols-2 gap-6 items-center p-6 md:p-10 cursor-grab active:cursor-grabbing"
              >
                <div className={`relative aspect-[4/3] w-full rounded-xl overflow-hidden shadow-2xl shadow-black/30 group ${current === 0 ? 'bg-[#080808]' : ''}`}>
                  <Image
                    src={slides[current].image}
                    alt={slides[current].title}
                    fill
                    className={`${current === 0 ? 'object-contain scale-[1.05] group-hover:scale-[1.08]' : 'object-cover object-center group-hover:scale-[1.03]'} transition-transform duration-700`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>

                <div className="flex flex-col justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    <span
                      className="inline-block text-[8px] uppercase tracking-[0.3em] font-normal px-2.5 py-1 rounded-md mb-4"
                      style={{
                        background: `${slides[current].accent}0a`,
                        color: `${slides[current].accent}cc`,
                        border: `1px solid ${slides[current].accent}15`,
                      }}
                    >
                      {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                    </span>
                    <h3 className="text-xl md:text-2xl font-light font-[Outfit] text-surface-800 mb-3 tracking-[-0.01em]">
                      {slides[current].title}
                    </h3>
                    <p className="text-surface-500 leading-relaxed text-[13px] mb-5 font-light">
                      {slides[current].description}
                    </p>
                    <div className="flex items-center gap-2">
                      {slides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => goTo(i)}
                          className="relative h-[3px] flex-1 rounded-full overflow-hidden bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                        >
                          {i === current && (
                            <motion.div
                              className="absolute inset-y-0 left-0 rounded-full"
                              style={{ background: slides[current].accent }}
                              initial={{ width: "0%" }}
                              animate={{ width: "100%" }}
                              transition={{
                                duration: isPaused ? 999 : 4,
                                ease: "linear",
                              }}
                              key={`progress-${current}-${isPaused}`}
                            />
                          )}
                          {i < current && (
                            <div
                              className="absolute inset-0 rounded-full"
                              style={{ background: slides[current].accent, opacity: 0.2 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Nav buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-3 md:-left-5 z-10">
            <button onClick={prev} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#080808]/90 backdrop-blur border border-white/[0.06] shadow-lg shadow-black/30 flex items-center justify-center hover:border-gold-500/20 transition-all hover:scale-110 active:scale-95">
              <ChevronLeft className="w-4 h-4 text-surface-500" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-3 md:-right-5 z-10">
            <button onClick={next} className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#080808]/90 backdrop-blur border border-white/[0.06] shadow-lg shadow-black/30 flex items-center justify-center hover:border-gold-500/20 transition-all hover:scale-110 active:scale-95">
              <ChevronRight className="w-4 h-4 text-surface-500" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-5 md:hidden">
            {slides.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-gold-500 w-5" : "bg-surface-300 w-1.5 hover:bg-surface-400"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
