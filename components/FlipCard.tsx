"use client";

import { useState, type PointerEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FlipCardProps {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  ariaLabel?: string;
}

export function FlipCard({ front, back, className, ariaLabel }: FlipCardProps) {
  const [flipped, setFlipped] = useState(false);

  // Hover only for true pointing devices (mouse, pen). Touch falls through to onClick → tap toggles.
  const handlePointerEnter = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    setFlipped(true);
  };
  const handlePointerLeave = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    setFlipped(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-pressed={flipped}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={() => setFlipped((v) => !v)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setFlipped((v) => !v);
        }
      }}
      className={cn(
        "group relative h-80 w-full cursor-pointer outline-none",
        "[perspective:1200px] focus-visible:ring-2 focus-visible:ring-white/40 rounded-3xl",
        className,
      )}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ willChange: "transform" }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          {front}
        </div>
        <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          {back}
        </div>
      </motion.div>
    </div>
  );
}

export default FlipCard;
