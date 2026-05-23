"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Microscope, Trophy, BookOpen, ArrowRight, type LucideIcon } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import { cn } from "@/lib/utils";

interface Facility {
  icon: LucideIcon;
  title: string;
  blurb: string;
  detail: string;
  tint: string;
}

const FACILITIES: Facility[] = [
  {
    icon: Microscope,
    title: "Labs",
    blurb: "Physics · Chemistry · Biology · Robotics",
    detail:
      "Fully equipped labs with research-grade instruments and a dedicated robotics & makerspace where students build, code, and ship.",
    tint: "from-cyan-500/40 to-blue-700/30",
  },
  {
    icon: Trophy,
    title: "Sports",
    blurb: "Cricket · Football · Athletics · Swimming",
    detail:
      "International-size playfields, a 25m swimming pool, indoor courts, and coaches who've competed at national level.",
    tint: "from-amber-500/40 to-orange-700/30",
  },
  {
    icon: BookOpen,
    title: "Library",
    blurb: "30,000+ titles · Reading lounges · Digital archives",
    detail:
      "A two-floor library with curated reading lounges, quiet study pods, and a digital archive of journals and e-books.",
    tint: "from-emerald-500/40 to-teal-700/30",
  },
];

function FrontFace({ facility }: { facility: Facility }) {
  const Icon = facility.icon;
  return (
    <div className="glass-panel relative flex h-full flex-col justify-between overflow-hidden rounded-3xl p-8">
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-80", facility.tint)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
        <Icon size={22} className="text-white" />
      </div>
      <div className="relative">
        <h3 className="font-crest text-3xl text-white">{facility.title}</h3>
        <p className="mt-2 text-sm text-white/80">{facility.blurb}</p>
        <p className="mt-4 text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
          Tap to learn more
        </p>
      </div>
    </div>
  );
}

function BackFace({ facility }: { facility: Facility }) {
  return (
    <div className="glass-panel relative flex h-full flex-col justify-between rounded-3xl p-8">
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
          About
        </p>
        <h3 className="font-crest mt-2 text-2xl text-white">{facility.title}</h3>
      </div>
      <p className="text-sm leading-relaxed text-white/85">{facility.detail}</p>
      <Link
        href="/facilities"
        className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-white/90 transition hover:bg-white/15"
      >
        Explore <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function FacilitiesTeaser() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-crest text-xs text-white/70">A Campus Built for Curiosity</span>
          <h2 className="font-crest mt-3 max-w-2xl text-3xl text-white md:text-5xl">
            Facilities, Refined.
          </h2>
        </div>
        <Link
          href="/facilities"
          className="glass-panel inline-flex items-center gap-2 self-start rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 md:self-auto"
        >
          View All Facilities <ArrowRight size={16} />
        </Link>
      </div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.15 } },
        }}
        className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {FACILITIES.map((facility) => (
          <motion.div
            key={facility.title}
            variants={{
              hidden: { opacity: 0, y: 30 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <FlipCard
              ariaLabel={`${facility.title} facility`}
              front={<FrontFace facility={facility} />}
              back={<BackFace facility={facility} />}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default FacilitiesTeaser;
