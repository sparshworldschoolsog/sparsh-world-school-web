"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface PreloaderProps {
  /** When false, the preloader animates out and unmounts. Caller controls this. */
  visible: boolean;
  /**
   * Optional photo paths (e.g. covers from the Gallery). Any slot without a
   * photo falls back to a tinted gradient tile so the mosaic always feels
   * intentional even before real photos are wired up.
   */
  photos?: string[];
}

type Tile = {
  x: string; // CSS left (percentage)
  y: string; // CSS top  (percentage)
  w: string; // tile width
  h: string; // tile height
  rotate: number; // deg
};

// Desktop: scattered around the viewport, some flowing off-screen. Indices are
// chosen so the centre stays clear for the logo.
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
  hidden: { opacity: 0, y: 18, scale: 0.94 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.08 },
  },
};

export function Preloader({ visible, photos = [] }: PreloaderProps) {
  // Simulated progress — asymptotic toward 95% over ~5s, snaps to 100% when hidden.
  // The bar is purely a perceived-wait sweetener; real readiness is the `visible` prop.
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!visible) {
      setProgress(100);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      // 1 - e^(-t/2.5) → asymptotic, capped at 95%
      const p = 95 * (1 - Math.exp(-elapsed / 2.5));
      setProgress(p);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel fixed inset-0 z-[100] overflow-hidden"
          aria-busy="true"
          role="status"
        >
          {/* Deep-blue base sits behind the glass tint to keep the screen opaque. */}
          <div className="absolute inset-0 bg-blue-950/85" />

          {/* Centred ambient glow */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,113,232,0.32),transparent_55%)]" />

          {/* ── Photo mosaic ─────────────────────────────────────────────── */}
          {/* Desktop: scattered absolute tiles, gentle group drift. */}
          <motion.div
            className="pointer-events-none absolute inset-0 hidden md:block"
            animate={{ x: [0, 8, -6, 0], y: [0, -4, 6, 0] }}
            transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              animate="show"
              variants={staggerParent}
            >
              {DESKTOP_TILES.map((tile, i) => (
                <MosaicTile
                  key={`d-${i}`}
                  tile={tile}
                  src={photos[i]}
                  tint={TINTS[i % TINTS.length]}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Mobile: dense wrapping mosaic via CSS columns, gentle breathing scale. */}
          <motion.div
            className="pointer-events-none absolute inset-0 px-2 py-4 opacity-70 md:hidden"
            animate={{ scale: [1, 1.025, 1] }}
            transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
            style={{ willChange: "transform" }}
          >
            <motion.div
              className="columns-3 gap-2"
              initial="hidden"
              animate="show"
              variants={staggerParent}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <MosaicTileMobile
                  key={`m-${i}`}
                  src={photos[i]}
                  tint={TINTS[i % TINTS.length]}
                  height={i % 3 === 0 ? "h-28" : i % 3 === 1 ? "h-20" : "h-36"}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* ── Centerpiece: logo + caption + bar ────────────────────────── */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            {/* Perspective lives on the parent so the rotateY reads as true 3D. */}
            <div className="h-28 w-28 [perspective:1000px] md:h-36 md:w-36">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                style={{ transformStyle: "preserve-3d", willChange: "transform" }}
                className="h-full w-full"
              >
                <Image
                  src="/logo.png"
                  alt="Sparsh World School"
                  width={144}
                  height={144}
                  priority
                  className="h-full w-full object-contain drop-shadow-[0_4px_24px_rgba(255,255,255,0.18)]"
                />
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
              className="font-crest mt-8 text-sm text-white/90 md:text-base"
            >
              Pre-loading Sparsh World School…
            </motion.p>

            {/* Thin progress bar */}
            <div className="mt-5 h-px w-56 overflow-hidden rounded-full bg-white/10 md:w-72">
              <motion.div
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="h-full bg-white/85"
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

function MosaicTile({
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
          <Image
            src={src}
            alt=""
            fill
            sizes="20vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
        )}
      </div>
    </motion.div>
  );
}

function MosaicTileMobile({
  src,
  tint,
  height,
}: {
  src?: string;
  tint: string;
  height: string;
}) {
  return (
    <motion.div
      variants={tileVariants}
      className={cn(
        "mb-2 block w-full overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm break-inside-avoid",
        height,
      )}
    >
      <div
        className={cn(
          "relative h-full w-full overflow-hidden rounded-lg",
          !src && `bg-gradient-to-br ${tint}`,
        )}
      >
        {src ? (
          <Image src={src} alt="" fill sizes="33vw" className="object-cover" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
        )}
      </div>
    </motion.div>
  );
}

export default Preloader;
