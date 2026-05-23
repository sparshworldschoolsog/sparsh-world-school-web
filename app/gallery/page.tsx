import type { Metadata } from "next";
import GalleryExperience from "@/components/sections/GalleryExperience";
import { listPublicPhotos } from "@/lib/listPublicPhotos";

export const metadata: Metadata = {
  title: "Gallery · Sparsh World School",
  description:
    "Step inside the moments that define a Sparsh year — annual day, sports, science labs, and life around the campus.",
};

const GALLERY_IDS = [
  "annual-day-2025",
  "sports-meet",
  "science-labs",
  "campus-life",
  "music-arts",
  "field-trips",
] as const;

export default function GalleryPage() {
  const photosByFolder: Record<string, string[]> = Object.fromEntries(
    GALLERY_IDS.map((id) => [id, listPublicPhotos(`gallery/${id}`)]),
  );

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

      <GalleryExperience photosByFolder={photosByFolder} />
    </section>
  );
}
