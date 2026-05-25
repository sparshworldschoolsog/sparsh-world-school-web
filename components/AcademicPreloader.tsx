"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useAnimation,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils";

const FAILSAFE_MS = 7000;

interface AcademicPreloaderProps {
  /** When false, the preloader animates out. */
  visible: boolean;
  /**
   * Optional photo paths (e.g. covers from /public/gallery). Any slot left
   * empty falls back to a tinted gradient tile so the mosaic always looks
   * intentional even without real photos wired up.
   */
  photos?: string[];
}

type Tile = {
  x: string;
  y: string;
  w: string;
  h: string;
  rotate: number;
};

// Desktop: 8 scattered tiles, some flow off-screen. Centre stays clear for the crest.
const DESKTOP_TILES: Tile[] = [
  { x: "-6%",  y: "8%",   w: "16rem", h: "11rem", rotate: -4 },
  { x: "76%",  y: "4%",   w: "13rem", h: "10rem", rotate: 5  },
  { x: "-4%",  y: "62%",  w: "14rem", h: "11rem", rotate: 3  },
  { x: "78%",  y: "66%",  w: "15rem", h: "12rem", rotate: -5 },
  { x: "28%",  y: "-8%",  w: "11rem", h: "8rem",  rotate: 7  },
  { x: "58%",  y: "84%",  w: "12rem", h: "10rem", rotate: -6 },
  { x: "12%",  y: "32%",  w: "9rem",  h: "7rem",  rotate: 4  },
  { x: "82%",  y: "38%",  w: "10rem", h: "9rem",  rotate: -3 },
];

// Mobile: 4 small corner tiles only — no rotation, no backdrop-blur, no border.
// iOS Safari chokes on per-tile compositor work, so these stay flat-fast.
const MOBILE_TILES: Omit<Tile, "rotate">[] = [
  { x: "4%",  y: "8%",  w: "6.5rem", h: "5rem"   },
  { x: "70%", y: "10%", w: "6rem",   h: "5.5rem" },
  { x: "5%",  y: "72%", w: "6rem",   h: "5rem"   },
  { x: "70%", y: "76%", w: "6.5rem", h: "5.5rem" },
];

const TINTS = [
  "from-sky-500/40 to-blue-700/40",
  "from-fuchsia-500/40 to-purple-700/40",
  "from-amber-400/40 to-orange-700/40",
  "from-emerald-500/40 to-teal-700/40",
  "from-rose-500/40 to-pink-700/40",
  "from-indigo-500/40 to-blue-700/40",
  "from-cyan-500/40 to-blue-700/40",
  "from-yellow-400/40 to-amber-600/40",
];

const tileVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" },
  },
};

const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.18 },
  },
};

export function AcademicPreloader({ visible, photos = [] }: AcademicPreloaderProps) {
  const [internalDismissed, setInternalDismissed] = useState(false);
  const [progress, setProgress] = useState(0);
  const mosaicControls = useAnimation();

  // 7-second failsafe: forces dismissal regardless of `visible` so a slow connection
  // can't trap the user on the preloader.
  useEffect(() => {
    if (!visible || internalDismissed) return;
    const id = window.setTimeout(() => setInternalDismissed(true), FAILSAFE_MS);
    return () => window.clearTimeout(id);
  }, [visible, internalDismissed]);

  // Cascading mosaic reveal — kicked off shortly after mount via useAnimation
  // controls so the centerpiece registers first, then the mosaic blooms.
  useEffect(() => {
    if (!visible) return;
    const t = window.setTimeout(() => {
      mosaicControls.start("show");
    }, 180);
    return () => window.clearTimeout(t);
  }, [visible, mosaicControls]);

  // Simulated progress — asymptotic toward 99% over ~6s, snaps to 100% on dismiss.
  useEffect(() => {
    if (!visible) {
      setProgress(100);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const p = 100 * (1 - Math.exp(-elapsed / 2.2));
      setProgress(Math.min(99, p));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const show = visible && !internalDismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="academic-preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.99 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          // iOS Safari note: backdrop-filter is the single most expensive thing
          // .glass-panel does, so we gate it behind md:. Phones get a flat opaque
          // bg-blue-950 (no GPU surface for blur). transform-gpu + translateZ(0)
          // promotes this overlay to its own compositor layer.
          className="fixed inset-0 z-[100] overflow-hidden bg-blue-950 transform-gpu md:glass-panel"
          style={{ transform: "translateZ(0)" }}
          aria-busy="true"
          role="status"
        >
          {/* Desktop deep-blue base over the glass tint to keep the screen opaque. No-op on mobile. */}
          <div className="absolute inset-0 hidden bg-blue-950/70 md:block" />

          {/* Ambient radial glow — cheap, fine on both breakpoints. */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,113,232,0.32),transparent_55%)]" />

          {/* ── Photo mosaic ─────────────────────────────────────────────── */}
          {/* Desktop: scattered absolute tiles with gentle group drift. */}
          <motion.div
            className="pointer-events-none absolute inset-0 hidden md:block"
            animate={{ x: [0, 6, -4, 0], y: [0, -3, 5, 0] }}
            transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate={mosaicControls}
              variants={staggerParent}
            >
              {DESKTOP_TILES.map((tile, i) => (
                <DesktopMosaicTile
                  key={`d-${i}`}
                  tile={tile}
                  src={photos[i]}
                  tint={TINTS[i % TINTS.length]}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Mobile: 4 lightweight corner tiles, subtle breathing scale. */}
          <motion.div
            className="pointer-events-none absolute inset-0 md:hidden"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate={mosaicControls}
              variants={staggerParent}
            >
              {MOBILE_TILES.map((tile, i) => (
                <MobileMosaicTile
                  key={`m-${i}`}
                  tile={tile}
                  src={photos[i]}
                  tint={TINTS[i % TINTS.length]}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* ── Centerpiece: revolving logo + caption + progress bar ─────── */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            {/* Perspective on the parent so rotateY reads as true depth, not a vertical squash. */}
            <div className="h-28 w-28 [perspective:1200px] md:h-36 md:w-36">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                style={{
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                }}
                className="h-full w-full"
              >
                <Image
                  src="/logo.png"
                  alt="Sparsh World School"
                  width={144}
                  height={144}
                  priority
                  className="h-full w-full object-contain drop-shadow-[0_4px_24px_rgba(255,255,255,0.20)]"
                />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
              className="font-crest mt-8 text-sm text-white/90 md:text-base"
            >
              Uncovering the Future at Sparsh…
            </motion.p>

            {/* Glassmorphic progress bar */}
            <div className="mt-6 h-1 w-56 overflow-hidden rounded-full border border-white/10 bg-white/10 md:w-80">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-white/70 via-white to-white/70 shadow-[0_0_12px_rgba(255,255,255,0.35)]"
                style={{ willChange: "width" }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Mosaic tile primitives ────────────────────────────────────────────── */

function DesktopMosaicTile({
  tile,
  src,
  tint,
}: {
  tile: Tile;
  src?: string;
  tint: string;
}) {
  return (
    <motion.div
      variants={tileVariants}
      style={{
        position: "absolute",
        left: tile.x,
        top: tile.y,
        width: tile.w,
        height: tile.h,
        transform: `rotate(${tile.rotate}deg)`,
      }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm"
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl",
          !src && `bg-gradient-to-br ${tint}`,
        )}
      >
        {src ? (
          <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
        )}
      </div>
    </motion.div>
  );
}

function MobileMosaicTile({
  tile,
  src,
  tint,
}: {
  tile: Omit<Tile, "rotate">;
  src?: string;
  tint: string;
}) {
  // Deliberately bare: no rotation, no backdrop-filter, no per-tile border.
  // Keeps the GPU layer count low so iOS Safari doesn't blow its memory budget.
  return (
    <motion.div
      variants={tileVariants}
      style={{
        position: "absolute",
        left: tile.x,
        top: tile.y,
        width: tile.w,
        height: tile.h,
        opacity: 0.55,
      }}
      className="overflow-hidden rounded-xl"
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-xl",
          !src && `bg-gradient-to-br ${tint}`,
        )}
      >
        {src ? (
          <Image src={src} alt="" fill sizes="40vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
        )}
      </div>
    </motion.div>
  );
}

export default AcademicPreloader;
