"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Camera, Sparkles, Trophy, Music, Palette, Microscope, Globe2, Users, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderItem {
  label: string;
  icon: LucideIcon;
  tint: string;
  /** Optional cover photo under /public, e.g. "/marquee/annual-day.jpg". Falls back to gradient. */
  src?: string;
}

// Each entry maps to a gallery folder by `galleryId`. The home page passes in
// the first photo from /public/gallery/<galleryId>/ to use as the cover.
interface FolderDef extends FolderItem {
  galleryId: string;
}

const FOLDERS: FolderDef[] = [
  { label: "Annual Day", icon: Sparkles, tint: "from-amber-400/40 to-orange-600/30", galleryId: "annual-day-2025" },
  { label: "Sports Meet", icon: Trophy, tint: "from-rose-500/40 to-red-700/30", galleryId: "sports-meet" },
  { label: "Science Fair", icon: Microscope, tint: "from-cyan-400/40 to-blue-700/30", galleryId: "science-labs" },
  { label: "Music Night", icon: Music, tint: "from-fuchsia-500/40 to-purple-700/30", galleryId: "music-arts" },
  { label: "Art Show", icon: Palette, tint: "from-indigo-500/40 to-violet-700/30", galleryId: "music-arts" },
  { label: "Model UN", icon: Globe2, tint: "from-emerald-500/40 to-teal-700/30", galleryId: "campus-life" },
  { label: "Alumni Meet", icon: Users, tint: "from-yellow-400/40 to-amber-600/30", galleryId: "campus-life" },
  { label: "Field Trips", icon: Camera, tint: "from-sky-500/40 to-cyan-700/30", galleryId: "field-trips" },
];

function Folder({ item }: { item: FolderItem }) {
  const Icon = item.icon;
  return (
    <Link
      href="/gallery"
      className="group relative block w-56 shrink-0 md:w-64"
      aria-label={`Open ${item.label} gallery`}
    >
      <div className="relative h-3 w-24 translate-y-px rounded-t-lg bg-white/15 backdrop-blur-md border border-white/10 border-b-0" />
      <div className="glass-panel relative h-40 overflow-hidden rounded-2xl rounded-tl-none p-5 transition-transform duration-500 group-hover:-translate-y-1 md:h-48">
        {item.src ? (
          <>
            <Image
              src={item.src}
              alt={item.label}
              fill
              sizes="(max-width: 768px) 14rem, 16rem"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
          </>
        ) : (
          <>
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", item.tint)} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
          </>
        )}
        <div className="relative flex h-full flex-col justify-between">
          <Icon size={26} className="text-white/95 drop-shadow" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/70 drop-shadow">Folder</p>
            <p className="font-crest text-lg text-white drop-shadow">{item.label}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

interface GalleryMarqueeProps {
  /** Cover photo per `galleryId`, e.g. { "annual-day-2025": "/gallery/annual-day-2025/PHOTO-1.jpg" } */
  covers?: Record<string, string | undefined>;
}

export function GalleryMarquee({ covers = {} }: GalleryMarqueeProps) {
  const withCovers: FolderItem[] = FOLDERS.map((f) => ({
    ...f,
    src: covers[f.galleryId] ?? f.src,
  }));
  const items = [...withCovers, ...withCovers];
  return (
    <section className="relative w-full overflow-hidden py-20 md:py-28">
      <div className="mx-auto mb-10 max-w-7xl px-4 text-center md:px-8">
        <span className="font-crest text-xs text-white/70">Moments at Sparsh</span>
        <h2 className="font-crest mt-3 text-3xl text-white md:text-5xl">
          Glimpses of Campus Life
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/75 md:text-base">
          Tap any folder to step into the moment.
        </p>
      </div>

      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
          className="flex w-max gap-6 px-6 will-change-transform"
        >
          {items.map((item, i) => (
            <Folder key={`${item.label}-${i}`} item={item} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default GalleryMarquee;
