import type { Metadata } from "next";
import GalleryExperience, {
  type GalleryFolderInput,
} from "@/components/sections/GalleryExperience";
import galleryPaths from "@/data/gallery.json";

export const metadata: Metadata = {
  title: "Gallery · Sparsh World School",
  description:
    "Step inside the moments that define a Sparsh year — annual day, sports, science labs, and life around the campus.",
};

// Cycled across folders so each card has a distinct accent without anyone hand-tuning it.
const TINT_PALETTE = [
  "from-amber-400/40 to-orange-700/30",
  "from-rose-500/40 to-red-700/30",
  "from-cyan-500/40 to-blue-700/30",
  "from-emerald-500/40 to-teal-700/30",
  "from-fuchsia-500/40 to-purple-700/30",
  "from-sky-500/40 to-cyan-700/30",
  "from-indigo-500/40 to-violet-700/30",
  "from-yellow-400/40 to-amber-700/30",
] as const;

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      // collapse multiple dashes that come from successive non-alphanumerics
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "folder"
  );
}

/**
 * Group flat image paths from gallery.json into folder buckets.
 *
 * Paths look like "/gallery/Chess%20Comp/photo.jpg" — segment 2 is the folder.
 * Top-level images directly under /gallery/ (no subfolder) go into "Gallery".
 */
function groupByFolder(paths: readonly string[]): GalleryFolderInput[] {
  const buckets = new Map<string, string[]>();
  for (const p of paths) {
    const parts = p.split("/").filter(Boolean); // ["gallery", "Chess%20Comp", "photo.jpg"]
    if (parts[0] !== "gallery") continue;
    const folderName = parts.length >= 3 ? decodeURIComponent(parts[1]) : "Gallery";
    const list = buckets.get(folderName);
    if (list) list.push(p);
    else buckets.set(folderName, [p]);
  }

  // Sort folder names alphabetically for deterministic order.
  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, photos], i) => ({
      id: slugify(name),
      label: name.trim(), // trim handles folder names like "Fruit party "
      tint: TINT_PALETTE[i % TINT_PALETTE.length],
      photos,
    }));
}

export default function GalleryPage() {
  const folders = groupByFolder(galleryPaths as string[]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
      <header className="mb-12 max-w-2xl md:mb-16">
        <span className="font-crest text-xs text-white/70 md:text-sm">
          Sparsh · Memory Vault
        </span>
        <h1 className="font-crest mt-3 text-4xl leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl">
          Our Gallery
        </h1>
        <p className="mt-5 text-base text-white/75 md:text-lg">
          Step inside the moments that define a Sparsh year. Open a folder to wander through.
        </p>
      </header>

      <GalleryExperience folders={folders} />
    </section>
  );
}
