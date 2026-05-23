"use client";

import { useState, type PointerEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Info, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FacilityCardData {
  id: string;
  title: string;
  icon: LucideIcon;
  tint: string;
  description: string;
  highlights: readonly string[];
  /** Optional cover photo from /public/facilities/<id>/. Falls back to gradient. */
  src?: string;
}

export function FacilityCard({ data }: { data: FacilityCardData }) {
  const [flipped, setFlipped] = useState(false);
  const Icon = data.icon;

  const toggle = () => setFlipped((v) => !v);

  // Hover only for true pointing devices. Touch devices fall through to onClick → tap toggles.
  const onPointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") setFlipped(true);
  };
  const onPointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch") setFlipped(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${data.title} — flip for details`}
      aria-pressed={flipped}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onClick={toggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      }}
      className="group relative h-[26rem] w-full cursor-pointer rounded-3xl outline-none [perspective:1000px] focus-visible:ring-2 focus-visible:ring-white/40"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform" }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* FRONT */}
        <div className="glass-panel absolute inset-0 overflow-hidden rounded-3xl [backface-visibility:hidden]">
          {data.src ? (
            <>
              <Image
                src={data.src}
                alt={data.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            </>
          ) : (
            <>
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", data.tint)} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
            </>
          )}

          <div className="relative flex h-full flex-col justify-between p-7">
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white">
                <Icon size={22} />
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[0.6rem] uppercase tracking-[0.3em] text-white/85 backdrop-blur-md">
                <Info size={11} /> Tap
              </span>
            </div>
            <div className="drop-shadow-lg">
              <h3 className="font-crest text-2xl text-white md:text-3xl">{data.title}</h3>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-slate-950/65 backdrop-blur-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-30", data.tint)} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-10%,rgba(255,255,255,0.12),transparent_50%)]" />

          <div className="relative flex h-full flex-col p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                <Icon size={18} />
              </div>
              <h3 className="font-crest text-xl text-white">{data.title}</h3>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/85">
              {data.description}
            </p>

            <ul className="mt-6 space-y-2.5">
              {data.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-xs text-white/80">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/55" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default FacilityCard;
