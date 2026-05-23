"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import {
  ArrowLeft,
  Folder,
  Camera,
  Sparkles,
  Trophy,
  Microscope,
  Music,
  Palette,
  Map,
  Users,
  BookOpen,
  Play,
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
  isVideo?: boolean;
  /** Optional photo path under /public, e.g. "/gallery/annual-day-2025/01.jpg". Falls back to gradient. */
  src?: string;
}

interface FolderData {
  id: string;
  label: string;
  caption: string;
  count: number;
  tint: string;
  media: MediaItem[];
  /** Optional cover photo for the folder card (gallery page). Falls back to gradient. */
  cover?: string;
}

// Each folder maps to a directory under /public/gallery/<folderId>/.
// Photos are named 01.jpg, 02.jpg, ... in the order labels are declared below.
// If a file doesn't exist yet, Next.js Image will 404 quietly — comment out the
// `src` line on that item to keep its gradient placeholder until you add the file.
const mediaFor = (
  folderId: string,
  labels: readonly string[],
  icons: readonly LucideIcon[],
  tints: readonly string[],
): MediaItem[] =>
  labels.map((label, i) => ({
    id: `${folderId}-${i}`,
    label,
    icon: icons[i % icons.length],
    tint: tints[i % tints.length],
    span: i % 4 === 0 ? "tall" : i % 5 === 0 ? "wide" : "square",
    isVideo: i % 6 === 0,
    // To use a real photo: drop the file at this path under /public/, then uncomment.
    // src: `/gallery/${folderId}/${String(i + 1).padStart(2, "0")}.jpg`,
  }));

const FOLDERS: FolderData[] = [
  {
    id: "annual-day-2025",
    label: "Annual Day 2025",
    caption: "A night of light, music, and milestones",
    tint: "from-amber-400/40 to-orange-700/30",
    count: 8,
    media: mediaFor(
      "ad",
      [
        "Opening Procession",
        "Cultural Showcase",
        "Award Ceremony",
        "Choir Performance",
        "Dance Recital",
        "Principal's Address",
        "Backstage",
        "Closing Lights",
      ],
      [Sparkles, Music, Camera, Music, Sparkles, Camera, Camera, Sparkles],
      [
        "from-amber-500/40 to-orange-700/30",
        "from-fuchsia-500/35 to-rose-700/30",
        "from-yellow-400/40 to-amber-700/30",
        "from-violet-500/35 to-fuchsia-700/30",
      ],
    ),
  },
  {
    id: "sports-meet",
    label: "Sports Meet",
    caption: "Field, court, pool — and a lot of cheering",
    tint: "from-rose-500/40 to-red-700/30",
    count: 8,
    media: mediaFor(
      "sp",
      [
        "March Past",
        "100m Final",
        "Relay Race",
        "Long Jump",
        "Football Final",
        "Cricket Match",
        "Swimming Heat",
        "Closing Parade",
      ],
      [Trophy, Trophy, Trophy, Camera, Trophy, Camera, Camera, Trophy],
      [
        "from-rose-500/40 to-red-700/30",
        "from-amber-500/40 to-orange-700/30",
        "from-emerald-500/35 to-teal-700/30",
        "from-sky-500/35 to-blue-700/30",
      ],
    ),
  },
  {
    id: "science-labs",
    label: "Science Labs",
    caption: "Where curiosity becomes evidence",
    tint: "from-cyan-500/40 to-blue-700/30",
    count: 7,
    media: mediaFor(
      "sci",
      [
        "Chemistry Bench",
        "Physics Optics",
        "Biology Dissection",
        "Robotics Build",
        "Microscope Lab",
        "Maker Workshop",
        "Open House Demo",
      ],
      [Microscope, Microscope, Camera, Camera, Microscope, Camera, Microscope],
      [
        "from-cyan-500/40 to-blue-700/30",
        "from-indigo-500/35 to-violet-700/30",
        "from-emerald-500/40 to-teal-700/30",
        "from-sky-500/35 to-cyan-700/30",
      ],
    ),
  },
  {
    id: "campus-life",
    label: "Campus Life",
    caption: "The everyday moments that make Sparsh",
    tint: "from-emerald-500/40 to-teal-700/30",
    count: 8,
    media: mediaFor(
      "cl",
      [
        "Library Mornings",
        "Quad Lunch",
        "Senior Common Room",
        "Hostel Block",
        "Coffee Cart",
        "Reading Garden",
        "Atrium",
        "Sunset Path",
      ],
      [BookOpen, Users, Users, Camera, Users, BookOpen, Camera, Camera],
      [
        "from-emerald-500/40 to-teal-700/30",
        "from-amber-500/40 to-orange-700/30",
        "from-sky-500/35 to-blue-700/30",
        "from-fuchsia-500/35 to-purple-700/30",
      ],
    ),
  },
  {
    id: "music-arts",
    label: "Music & Arts",
    caption: "Brushes, strings, and standing ovations",
    tint: "from-fuchsia-500/40 to-purple-700/30",
    count: 7,
    media: mediaFor(
      "ma",
      [
        "Orchestra Rehearsal",
        "Solo Violin",
        "Art Studio",
        "Pottery Class",
        "Painting Wall",
        "Theatre Night",
        "Mural Reveal",
      ],
      [Music, Music, Palette, Palette, Palette, Music, Palette],
      [
        "from-fuchsia-500/40 to-purple-700/30",
        "from-violet-500/35 to-indigo-700/30",
        "from-rose-500/35 to-pink-700/30",
        "from-amber-500/35 to-orange-700/30",
      ],
    ),
  },
  {
    id: "field-trips",
    label: "Field Trips",
    caption: "Lessons that don't fit in a classroom",
    tint: "from-sky-500/40 to-cyan-700/30",
    count: 6,
    media: mediaFor(
      "ft",
      [
        "Heritage Walk · Jaipur",
        "Forest Camp",
        "Tech Museum",
        "Coastal Study",
        "Mountain Trek",
        "Maker Faire",
      ],
      [Map, Map, Camera, Camera, Map, Camera],
      [
        "from-sky-500/40 to-cyan-700/30",
        "from-emerald-500/40 to-teal-700/30",
        "from-amber-500/40 to-orange-700/30",
        "from-fuchsia-500/35 to-purple-700/30",
      ],
    ),
  },
];

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

function FolderGrid({
  folders,
  onOpen,
}: {
  folders: FolderData[];
  onOpen: (id: string) => void;
}) {
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
                <p className="mt-3 text-sm text-white/85">{folder.caption}</p>
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
      {item.src ? (
        <>
          <Image
            src={item.src}
            alt={item.label}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </>
      ) : (
        <>
          <div className={cn("absolute inset-0 bg-gradient-to-br opacity-90", item.tint)} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.22),transparent_60%)]" />
        </>
      )}

      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-white">
            <Icon size={18} />
          </div>
          {item.isVideo && (
            <div className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-white">
              <Play size={10} fill="currentColor" /> Video
            </div>
          )}
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
  /** Photo paths discovered on the server, keyed by FolderData.id. */
  photosByFolder?: Record<string, string[]>;
}

const SPAN_ROTATION: Span[] = ["tall", "square", "square", "wide", "square", "square", "tall", "square"];

function buildMediaFromPhotos(folder: FolderData, photos: string[]): MediaItem[] {
  const icons: LucideIcon[] = [Camera, Sparkles, Music, BookOpen];
  return photos.map((src, i) => ({
    id: `${folder.id}-${i}`,
    label: `Moment ${String(i + 1).padStart(2, "0")}`,
    icon: icons[i % icons.length],
    tint: folder.tint,
    span: SPAN_ROTATION[i % SPAN_ROTATION.length],
    isVideo: false,
    src,
  }));
}

export function GalleryExperience({ photosByFolder = {} }: GalleryExperienceProps) {
  // Replace placeholder media with real photos for any folder that has them.
  const folders: FolderData[] = FOLDERS.map((folder) => {
    const photos = photosByFolder[folder.id];
    if (!photos || photos.length === 0) return folder;
    const media = buildMediaFromPhotos(folder, photos);
    return { ...folder, count: media.length, media, cover: photos[0] };
  });

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
