import type { Metadata } from "next";
import FacilitiesGrid from "@/components/sections/FacilitiesGrid";
import { listPublicPhotos } from "@/lib/listPublicPhotos";

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

export default function FacilitiesPage() {
  // First photo found in /public/facilities/<id>/ becomes that card's cover.
  const covers: Record<string, string | undefined> = Object.fromEntries(
    FACILITY_IDS.map((id) => [id, listPublicPhotos(`facilities/${id}`)[0]]),
  );

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
