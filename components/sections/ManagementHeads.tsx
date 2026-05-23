"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import { cn } from "@/lib/utils";

interface Head {
  name: string;
  role: string;
  qualifications: string;
  slogan: string;
  tint: string;
  initials: string;
}

// Placeholder data — replace each entry with real details when ready.
const HEADS: Head[] = [
  {
    name: "Management Head 1",
    role: "Role",
    qualifications: "Placeholder qualifications — degrees, certifications, and years of experience.",
    slogan: "“Placeholder slogan or guiding philosophy.”",
    tint: "from-sky-500/40 to-blue-700/40",
    initials: "M1",
  },
  {
    name: "Management Head 2",
    role: "Role",
    qualifications: "Placeholder qualifications — degrees, certifications, and years of experience.",
    slogan: "“Placeholder slogan or guiding philosophy.”",
    tint: "from-fuchsia-500/40 to-purple-700/40",
    initials: "M2",
  },
  {
    name: "Management Head 3",
    role: "Role",
    qualifications: "Placeholder qualifications — degrees, certifications, and years of experience.",
    slogan: "“Placeholder slogan or guiding philosophy.”",
    tint: "from-amber-400/40 to-orange-700/40",
    initials: "M3",
  },
  {
    name: "Management Head 4",
    role: "Role",
    qualifications: "Placeholder qualifications — degrees, certifications, and years of experience.",
    slogan: "“Placeholder slogan or guiding philosophy.”",
    tint: "from-emerald-500/40 to-teal-700/40",
    initials: "M4",
  },
  {
    name: "Management Head 5",
    role: "Role",
    qualifications: "Placeholder qualifications — degrees, certifications, and years of experience.",
    slogan: "“Placeholder slogan or guiding philosophy.”",
    tint: "from-rose-500/40 to-pink-700/40",
    initials: "M5",
  },
];

function FrontFace({ head }: { head: Head }) {
  return (
    <div className="glass-panel relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl p-6 text-center md:p-8">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", head.tint)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.22),transparent_60%)]" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md md:h-24 md:w-24">
        <span className="font-crest text-2xl text-white md:text-3xl">{head.initials}</span>
      </div>
      <div className="relative mt-5 md:mt-6">
        <h3 className="font-crest text-lg text-white md:text-xl">{head.name}</h3>
        <p className="mt-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70 md:text-xs">
          {head.role}
        </p>
      </div>
    </div>
  );
}

function BackFace({ head }: { head: Head }) {
  return (
    <div className="glass-panel relative flex h-full flex-col justify-between rounded-3xl p-6 text-left md:p-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <User size={16} />
          </div>
          <div>
            <p className="font-crest text-base text-white">{head.name}</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-white/55 md:text-[0.65rem]">
              {head.role}
            </p>
          </div>
        </div>
        <p className="mt-5 text-[0.65rem] uppercase tracking-[0.3em] text-white/55 md:mt-6 md:text-xs">
          Qualifications
        </p>
        <p className="mt-2 text-xs text-white/85 md:text-sm">{head.qualifications}</p>
      </div>
      <p className="text-xs italic leading-relaxed text-white/90 md:text-sm">{head.slogan}</p>
    </div>
  );
}

export function ManagementHeads() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-crest text-xs text-white/70">Stewards of Sparsh</span>
          <h2 className="font-crest mt-3 max-w-2xl text-3xl text-white md:text-5xl">
            Meet Our Management Heads
          </h2>
        </div>
        {/* Arrows are only useful while the row scrolls (below xl). */}
        <div className="hidden gap-2 md:flex xl:hidden">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="glass-panel inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <motion.div
        ref={scrollerRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          // Carousel by default (mobile + tablet): one column row that snaps + scrolls horizontally.
          "scrollbar-hide mt-12 grid snap-x snap-mandatory grid-flow-col gap-5 overflow-x-auto pb-4",
          "auto-cols-[78%] sm:auto-cols-[55%] md:auto-cols-[38%] md:gap-6",
          // Desktop xl: lay out all 5 as an equal flex row, no scrolling.
          "xl:flex xl:auto-cols-auto xl:snap-none xl:gap-6 xl:overflow-visible",
        )}
      >
        {HEADS.map((head) => (
          <div key={head.name} className="snap-start xl:flex-1">
            <FlipCard
              ariaLabel={`${head.name}, ${head.role}`}
              front={<FrontFace head={head} />}
              back={<BackFace head={head} />}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export default ManagementHeads;
