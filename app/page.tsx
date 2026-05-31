import Hero from "@/components/sections/Hero";
import CoreValues from "@/components/sections/CoreValues";
import GalleryMarquee from "@/components/sections/GalleryMarquee";
import FacilitiesTeaser from "@/components/sections/FacilitiesTeaser";
import ManagementHeads from "@/components/sections/ManagementHeads";
import heroPhotos from "@/data/hero.json";
import galleryPathsJson from "@/data/gallery.json";

// Cast to string[] — JSON imports widen to never[] if the file is empty.
const galleryPaths = galleryPathsJson as string[];

const GALLERY_IDS = [
  "annual-day-2025",
  "sports-meet",
  "science-labs",
  "campus-life",
  "music-arts",
  "field-trips",
] as const;

/**
 * Build a cover map keyed by GALLERY_IDS from the auto-generated gallery.json.
 * Pure data manipulation — no fs access, so Vercel's NFT can't trace public/
 * into the serverless function.
 */
function buildMarqueeCovers(): Record<string, string | undefined> {
  const firstByFolder = new Map<string, string>();
  for (const p of galleryPaths) {
    const parts = p.split("/").filter(Boolean); // ["gallery", "<folder>", "<file>"]
    if (parts[0] !== "gallery" || parts.length < 3) continue;
    const folder = parts[1];
    if (!firstByFolder.has(folder)) firstByFolder.set(folder, p);
  }
  return Object.fromEntries(
    GALLERY_IDS.map((id) => [id, firstByFolder.get(id)]),
  );
}

export default function Home() {
  const marqueeCovers = buildMarqueeCovers();

  return (
    <div className="relative">
      <Hero photos={heroPhotos} />
      <CoreValues />
      <GalleryMarquee covers={marqueeCovers} />
      <FacilitiesTeaser />
      <ManagementHeads />
    </div>
  );
}
