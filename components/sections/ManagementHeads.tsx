"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FlipCard from "@/components/FlipCard";
import { cn } from "@/lib/utils";

interface Head {
  name: string;
  role: string;
  qualifications: string;
  slogan: string;
  image: string;
  /**
   * CSS object-position for the front-face photo. Defaults to "center 25%" which
   * works for most headshots (head + face + shoulders visible, lower torso cropped).
   * Override per-leader if a specific photo needs a different crop.
   */
  objectPosition?: string;
}

const HEADS: Head[] = [
  {
    name: "Ms Sangita Talwar",
    role: "Principal",
    qualifications: "MSc Maths, B.Ed · 6 years experience",
    slogan:
      "“Learning today, leading tomorrow — together we create a journey of excellence and values.”",
    image: "/leader-1.jpg",
  },
  {
    name: "Ms Shalu Raj",
    role: "Senior Academic In-charge",
    qualifications: "Double M.A. in Sociology & Hindi, B.Ed. · 10 years experience",
    slogan:
      "“A leader is one who knows the way, who goes the way, and shows the way.”",
    image: "/leader-2.jpg",
  },
  {
    name: "Sunil Talwar",
    role: "Founder",
    qualifications: "FCA, M.Com (ABST) · 15 years experience",
    slogan:
      "“Behind every successful school is a leader who believes in the power of education and the touch of excellence.”",
    image: "/leader-3.jpg",
  },
  {
    name: "Rohit Wadhwa",
    role: "H.O.D. — Curricular & Co-Curricular Activities",
    qualifications: "M.Sc. (I.T.) Computer Science · 15 years experience",
    slogan:
      "“Great leaders build great schools by nurturing great teachers and motivated students.”",
    image: "/leader-4.jpg",
  },
  {
    name: "Ms Anuradha Laroiya",
    role: "Kindergarten Academic In-charge",
    qualifications: "M.A. in Hindi · 20+ years experience",
    slogan:
      "“Education is not just about gaining knowledge but also about building values and self-confidence.”",
    image: "/leader-5.jpg",
  },
];

function FrontFace({ head }: { head: Head }) {
  return (
    <div className="glass-panel relative h-full overflow-hidden rounded-3xl">
      {/* Photo fills the card. object-cover + object-position keeps the face in frame
          regardless of card aspect ratio (mobile carousel vs. desktop 5-col row). */}
      <Image
        src={head.image}
        alt={head.name}
        fill
        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 38vw, 20vw"
        style={{ objectPosition: head.objectPosition ?? "center 25%" }}
        className="object-cover"
      />

      {/* Bottom-up gradient for text legibility — strongest at the very bottom. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      {/* Small "Tap" hint pinned top-right */}
      <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.3em] text-white/85 backdrop-blur-sm">
        Tap
      </span>

      {/* Name + role pinned bottom-left, left-aligned */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-left md:p-6">
        <h3 className="font-crest text-base leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-lg">
          {head.name}
        </h3>
        <p className="mt-1.5 text-pretty text-[0.6rem] uppercase tracking-[0.28em] text-white/85 md:text-[0.65rem]">
          {head.role}
        </p>
      </div>
    </div>
  );
}

function BackFace({ head }: { head: Head }) {
  return (
    <div className="glass-panel relative flex h-full flex-col justify-between rounded-3xl p-5 text-left md:p-6">
      <div>
        {/* Mini avatar + identity header */}
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/20 bg-white/10">
            <Image
              src={head.image}
              alt=""
              fill
              sizes="40px"
              style={{ objectPosition: head.objectPosition ?? "center 25%" }}
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-crest truncate text-sm text-white md:text-base">
              {head.name}
            </p>
            <p className="text-pretty text-[0.55rem] uppercase tracking-[0.28em] text-white/55 md:text-[0.6rem]">
              {head.role}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[0.6rem] uppercase tracking-[0.3em] text-white/55 md:mt-5">
          Qualifications
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/85 md:text-[0.8rem]">
          {head.qualifications}
        </p>
      </div>

      <p className="mt-4 text-pretty text-[0.72rem] italic leading-relaxed text-white/90 md:text-[0.82rem]">
        {head.slogan}
      </p>
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
          "scrollbar-hide mt-12 grid snap-x snap-mandatory grid-flow-col gap-5 overflow-x-auto pb-4",
          "auto-cols-[78%] sm:auto-cols-[55%] md:auto-cols-[38%] md:gap-6",
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
