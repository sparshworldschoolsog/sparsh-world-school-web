"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface NarrativeBlock {
  eyebrow: string;
  title: string;
  body: string;
}

const BLOCKS: readonly NarrativeBlock[] = [
  {
    eyebrow: "Chapter 01",
    title: "Welcome to the Future of Education",
    body:
      "A campus designed around how children actually learn — not how they used to be taught. Step in, breathe out, and let the building introduce itself.",
  },
  {
    eyebrow: "Chapter 02",
    title: "State-of-the-Art Architecture",
    body:
      "Open courtyards, natural light, acoustic-treated studios. Every surface, ceiling height, and corridor angle has been engineered to lower cognitive load and lift attention.",
  },
  {
    eyebrow: "Chapter 03",
    title: "Designed for Innovation",
    body:
      "From the robotics bay to the maker lab and the high-spec computer suite — every tool the next generation needs is already here, waiting for hands.",
  },
  {
    eyebrow: "Chapter 04",
    title: "Where Tradition Meets Tomorrow",
    body:
      "Authoritative academics, daily mindfulness, classical arts — the foundations that build character — paired with the modern tools that build the future.",
  },
  {
    eyebrow: "Chapter 05",
    title: "Begin Your Journey",
    body:
      "Step inside. The next chapter of a Sparsh story might be yours. Reach out to admissions when you're ready to write it.",
  },
];

function Block({ block }: { block: NarrativeBlock }) {
  const ref = useRef<HTMLElement | null>(null);

  // Track this block's scroll progress: 0 when its top hits the viewport bottom,
  // 1 when its bottom hits the viewport top. So we get the full lifecycle.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Cinematic fade: in (0→30%), hold (30→70%), out (70→100%).
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [60, 0, 0, -60]);

  return (
    <section
      ref={ref}
      className="flex min-h-screen items-center justify-center px-4 py-16 md:px-8"
    >
      <motion.div
        style={{ opacity, y, willChange: "transform, opacity" }}
        className="glass-panel relative max-w-2xl rounded-3xl p-8 text-center md:p-14"
      >
        <p className="font-crest text-xs text-white/65 md:text-sm">{block.eyebrow}</p>
        <h2 className="font-crest mt-4 text-3xl leading-tight text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] md:text-5xl">
          {block.title}
        </h2>
        <p className="mt-5 text-sm text-white/85 md:text-base md:leading-relaxed">
          {block.body}
        </p>
      </motion.div>
    </section>
  );
}

export function VirtualTourNarrative() {
  return (
    <>
      {BLOCKS.map((block) => (
        <Block key={block.title} block={block} />
      ))}
    </>
  );
}

export default VirtualTourNarrative;
