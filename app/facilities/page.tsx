import type { Metadata } from "next";
import FacilitiesGrid from "@/components/sections/FacilitiesGrid";
import facilityPathsJson from "@/data/facilities.json";

// Cast to string[] — the JSON is `[]` when no facility photos exist yet, which
// TS narrows to `never[]`. The shape from the scanner is always string[].
const facilityPaths = facilityPathsJson as string[];

const FACILITY_IDS = [
  "science-labs",
  "computer-lab",
  "library",
  "sports-complex",
  "smart-classrooms",
  "transport",
] as const;

export const metadata: Metadata = {
  title: "Facilities · Sparsh World School",
  description:
    "World-class infrastructure designed for curiosity — labs, library, sports complex, smart classrooms, and a secure transport system.",
};

/**
 * Pick the first photo found inside /public/facilities/<id>/ for each facility.
 * Data comes from the build-time JSON manifest — no runtime fs reads, so
 * Vercel's NFT doesn't drag /public into the function bundle.
 */
function buildFacilityCovers(): Record<string, string | undefined> {
  const firstByFolder = new Map<string, string>();
  for (const p of facilityPaths) {
    const parts = p.split("/").filter(Boolean); // ["facilities", "<folder>", "<file>"]
    if (parts[0] !== "facilities" || parts.length < 3) continue;
    const folder = parts[1];
    if (!firstByFolder.has(folder)) firstByFolder.set(folder, p);
  }
  return Object.fromEntries(
    FACILITY_IDS.map((id) => [id, firstByFolder.get(id)]),
  );
}

export default function FacilitiesPage() {
  const covers = buildFacilityCovers();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-24 pt-28 md:px-8 md:pb-32 md:pt-36">
      <header className="mb-12 max-w-2xl md:mb-16">
        <span className="font-crest text-xs text-white/70 md:text-sm">
          Built for Curiosity
        </span>
        <h1 className="font-crest mt-3 text-4xl leading-[1.05] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-6xl lg:text-7xl">
          World-Class Facilities
        </h1>
        <p className="mt-5 text-base text-white/80 md:text-lg">
          At Sparsh, every space is engineered around the child's curiosity. From
          research-grade laboratories to thoughtfully tuned reading rooms, our
          infrastructure exists to put students one step closer to the questions
          they're chasing — and to make pursuing them safe, supported, and beautifully
          resourced.
        </p>
      </header>

      <FacilitiesGrid covers={covers} />
    </section>
  );
}
