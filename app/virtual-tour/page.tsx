import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VirtualTourNarrative from "@/components/sections/VirtualTourNarrative";

export const metadata: Metadata = {
  title: "Virtual Tour · Sparsh World School",
  description:
    "A cinematic, scroll-driven walk through the Sparsh World School campus.",
};

export default function VirtualTourPage() {
  return (
    <div className="relative min-h-[500vh]">
      <Link
        href="/"
        className="glass-panel fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:left-6 md:top-6"
      >
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <VirtualTourNarrative />
    </div>
  );
}
