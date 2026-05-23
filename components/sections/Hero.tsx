"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Compass, BookOpen, Trophy, Music, Palette, Microscope, Users, Globe2, Sparkles } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

interface Tile {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  tint: string;
  span?: 1 | 2;
  /** Optional photo path under /public, e.g. "/hero/labs.jpg". Falls back to gradient placeholder. */
  src?: string;
}

// Photos from /public/hero/ are layered on top of these tiles in order
// (left column first, then right column). Tiles without a photo show the gradient.
const TILES_LEFT: Tile[] = [
  { label: "Science Labs", icon: Microscope, tint: "from-cyan-500/40 to-blue-700/40", span: 2 },
  { label: "Sports", icon: Trophy, tint: "from-amber-400/40 to-orange-600/30" },
  { label: "Music", icon: Music, tint: "from-fuchsia-500/40 to-purple-700/30" },
  { label: "Library", icon: BookOpen, tint: "from-emerald-500/40 to-teal-700/30", span: 2 },
];

const TILES_RIGHT: Tile[] = [
  { label: "Community", icon: Users, tint: "from-rose-500/40 to-pink-700/30" },
  { label: "Arts", icon: Palette, tint: "from-indigo-500/40 to-blue-700/30", span: 2 },
  { label: "Global", icon: Globe2, tint: "from-sky-500/40 to-cyan-700/30", span: 2 },
  { label: "Excellence", icon: Sparkles, tint: "from-yellow-400/40 to-amber-600/30" },
];

function GalleryColumn({ tiles, direction }: { tiles: Tile[]; direction: "up" | "down" }) {
  const items = [...tiles, ...tiles];
  return (
    <div className="relative h-[42rem] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
      <motion.div
        animate={{ y: direction === "up" ? ["0%", "-50%"] : ["-50%", "0%"] }}
        transition={{ duration: 38, ease: "linear", repeat: Infinity }}
        className="flex flex-col gap-4 will-change-transform"
      >
        {items.map((tile, i) => {
          const Icon = tile.icon;
          return (
            <div
              key={`${tile.label}-${i}`}
              className={cn(
                "glass-panel relative flex flex-col justify-end overflow-hidden rounded-3xl p-5",
                tile.span === 2 ? "h-56" : "h-40",
              )}
            >
              {tile.src ? (
                <>
                  <Image
                    src={tile.src}
                    alt={tile.label}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    // Only the first tile in each column is above the fold — others enter via marquee scroll.
                    priority={i === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                </>
              ) : (
                <>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", tile.tint)} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
                </>
              )}
              <div className="relative flex items-center gap-3 text-white">
                <Icon size={20} className="opacity-90 drop-shadow" />
                <span className="text-sm font-semibold tracking-wide drop-shadow">{tile.label}</span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}

interface HeroProps {
  /** Photo paths (from /public/hero/) discovered on the server. Applied to tiles in order. */
  photos?: string[];
}

function applyPhotos(tiles: Tile[], photos: string[]): Tile[] {
  return tiles.map((tile, i) => (photos[i] ? { ...tile, src: photos[i] } : tile));
}

export function Hero({ photos = [] }: HeroProps) {
  const openChat = () => {
    window.dispatchEvent(new CustomEvent("sparsh:open-chat"));
  };

  // Split photos across the two columns so the hero feels balanced.
  const half = Math.ceil(photos.length / 2);
  const leftPhotos = photos.slice(0, half);
  const rightPhotos = photos.slice(half);
  const tilesLeft = applyPhotos(TILES_LEFT, leftPhotos);
  const tilesRight = applyPhotos(TILES_RIGHT, rightPhotos);

  return (
    <section className="relative mx-auto flex min-h-[100svh] w-full max-w-7xl items-center px-4 py-12 md:px-8">
      <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <span className="font-crest text-xs text-white/70 md:text-sm">
            Sparsh World School · Est. for Tomorrow
          </span>
          <h1 className="font-crest mt-4 text-4xl font-bold leading-[1.1] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl">
            The Power Of Education,
            <br />
            <span className="bg-gradient-to-r from-white via-sky-100 to-white bg-clip-text text-transparent">
              The Touch Of Excellence
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/80 md:text-lg">
            An ICSE-driven journey where rigorous academics meet character, creativity,
            and a globally-minded community.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={openChat}
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-sky-100"
            >
              Fill Form
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <Link
              href="/virtual-tour"
              className="glass-panel inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Compass size={16} />
              Virtual Tour
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="glass-panel relative w-full rounded-3xl p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <GalleryColumn tiles={tilesLeft} direction="up" />
            <GalleryColumn tiles={tilesRight} direction="down" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
