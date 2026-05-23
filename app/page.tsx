import { listPublicPhotos } from "@/lib/listPublicPhotos";
import Hero from "@/components/sections/Hero";
import CoreValues from "@/components/sections/CoreValues";
import GalleryMarquee from "@/components/sections/GalleryMarquee";
import FacilitiesTeaser from "@/components/sections/FacilitiesTeaser";
import ManagementHeads from "@/components/sections/ManagementHeads";

const GALLERY_IDS = [
  "annual-day-2025",
  "sports-meet",
  "science-labs",
  "campus-life",
  "music-arts",
  "field-trips",
] as const;

export default function Home() {
  const heroPhotos = listPublicPhotos("hero");

  // First photo of each gallery folder becomes the marquee cover for that category.
  const marqueeCovers: Record<string, string | undefined> = Object.fromEntries(
    GALLERY_IDS.map((id) => [id, listPublicPhotos(`gallery/${id}`)[0]]),
  );

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
