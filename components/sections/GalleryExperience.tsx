"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Folder,
  Camera,
  Sparkles,
  Music,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Span = "tall" | "wide" | "square";

interface MediaItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tint: string;
  span: Span;
  src: string;
}

/** What the page passes in — one entry per discovered folder under /public/gallery. */
export interface GalleryFolderInput {
  id: string;
  label: string;
  /** Optional human-readable subtitle. Falls back to "{count} photos" if absent. */
  caption?: string;
  tint: string;
  photos: string[];
}

interface FolderData extends GalleryFolderInput {
  count: number;
  cover: string | undefined;
  media: MediaItem[];
}

const fadeView: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.25, ease: "easeIn" } },
};

const gridContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

const gridItem: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const SPAN_ROTATION: Span[] = ["tall", "square", "square", "wide", "square", "square", "tall", "square"];
const ICONS: LucideIcon[] = [Camera, Sparkles, Music, BookOpen];

function buildMediaFromPhotos(folder: GalleryFolderInput): MediaItem[] {
  return folder.photos.map((src, i) => ({
    id: `${folder.id}-${i}`,
    label: `Moment ${String(i + 1).padStart(2, "0")}`,
    icon: ICONS[i % ICONS.length],
    tint: folder.tint,
    span: SPAN_ROTATION[i % SPAN_ROTATION.length],
    src,
  }));
}

function FolderGrid({
  folders,
  onOpen,
}: {
  folders: FolderData[];
  onOpen: (id: string) => void;
}) {
  if (folders.length === 0) {
    return (
      <div className="glass-panel rounded-3xl p-10 text-center text-white/70">
        <p className="font-crest text-lg">No photos yet.</p>
        <p className="mt-2 text-sm">
          Add a new folder under <code className="rounded bg-white/10 px-1.5 py-0.5">public/gallery/</code>
          {" "}with some images, then redeploy.
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={fadeView} initial="initial" animate="animate" exit="exit">
      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {folders.map((folder) => (
          <motion.button
            key={folder.id}
            variants={gridItem}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => onOpen(folder.id)}
            className="group relative block text-left outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-3xl"
          >
            <div className="relative h-3 w-28 translate-y-px rounded-t-lg bg-white/15 backdrop-blur-md border border-white/10 border-b-0" />
            <div
              className={cn(
                "glass-panel relative overflow-hidden rounded-3xl rounded-tl-none p-7",
                "transition-shadow duration-500 group-hover:shadow-2xl",
                "min-h-[14rem]",
              )}
            >
              {folder.cover ? (
                <>
                  <Image
                    src={folder.cover}
                    alt={folder.label}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
                </>
              ) : (
                <>
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", folder.tint)} />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
                </>
              )}

              <div className="relative flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md text-white">
                  <Folder size={22} />
                </div>
                <span className="rounded-full bg-black/30 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/85">
                  {folder.count} items
                </span>
              </div>

              <div className="relative mt-10 drop-shadow">
                <h2 className="font-crest text-2xl text-white md:text-3xl">{folder.label}</h2>
                <p className="mt-3 text-sm text-white/85">
                  {folder.caption ?? `${folder.count} ${folder.count === 1 ? "photo" : "photos"}`}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

function MediaTile({ item }: { item: MediaItem }) {
  const Icon = item.icon;
  const heightClass =
    item.span === "tall"
      ? "row-span-2"
      : item.span === "wide"
        ? "sm:col-span-2"
        : "";

  return (
    <motion.figure
      variants={gridItem}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={cn(
        "glass-panel relative overflow-hidden rounded-2xl",
        heightClass,
      )}
    >
      <Image
        src={item.src}
        alt={item.label}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white">
            <Icon size={18} />
          </div>
        </div>
        <figcaption className="text-white drop-shadow">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/65">Moment</p>
          <p className="mt-1 font-crest text-base">{item.label}</p>
        </figcaption>
      </div>
    </motion.figure>
  );
}

function MediaView({
  folder,
  onBack,
}: {
  folder: FolderData;
  onBack: () => void;
}) {
  return (
    <motion.div variants={fadeView} initial="initial" animate="animate" exit="exit">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="glass-panel inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          <ArrowLeft size={16} /> Back to Folders
        </button>
        <div className="sm:text-right">
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-white/55">
            Now Viewing
          </p>
          <h2 className="font-crest mt-1 text-2xl text-white md:text-3xl">
            {folder.label}
          </h2>
        </div>
      </div>

      <motion.div
        variants={gridContainer}
        initial="hidden"
        animate="show"
        className="grid auto-rows-[12rem] grid-cols-2 gap-4 [grid-auto-flow:dense] sm:grid-cols-3 lg:grid-cols-4"
      >
        {folder.media.map((item) => (
          <MediaTile key={item.id} item={item} />
        ))}
      </motion.div>
    </motion.div>
  );
}

interface GalleryExperienceProps {
  folders: GalleryFolderInput[];
}

export function GalleryExperience({ folders: foldersInput }: GalleryExperienceProps) {
  const folders: FolderData[] = foldersInput.map((f) => ({
    ...f,
    count: f.photos.length,
    cover: f.photos[0],
    media: buildMediaFromPhotos(f),
  }));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? folders.find((f) => f.id === selectedId) ?? null : null;

  return (
    <AnimatePresence mode="wait">
      {selected ? (
        <MediaView
          key={`media-${selected.id}`}
          folder={selected}
          onBack={() => setSelectedId(null)}
        />
      ) : (
        <FolderGrid key="folders" folders={folders} onOpen={setSelectedId} />
      )}
    </AnimatePresence>
  );
}

export default GalleryExperience;
