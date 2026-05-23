"use client";

import { motion, type Variants } from "framer-motion";
import { Microscope, Cpu, BookOpen, Trophy, Monitor, Bus } from "lucide-react";
import FacilityCard, { type FacilityCardData } from "@/components/FacilityCard";

const FACILITIES: FacilityCardData[] = [
  {
    id: "science-labs",
    title: "Advanced Science Labs",
    icon: Microscope,
    tint: "from-cyan-500/40 to-blue-700/30",
    description:
      "Three discipline-specific laboratories — Physics, Chemistry, and Biology — outfitted with research-grade instruments and staffed by trained lab technicians during every session.",
    highlights: [
      "Physics · Chemistry · Biology benches",
      "Fume hood, dissection bay, optics rig",
      "16 student stations per lab",
      "Open during evening study hall",
    ],
  },
  {
    id: "computer-lab",
    title: "Next-Gen Computer Lab",
    icon: Cpu,
    tint: "from-indigo-500/40 to-violet-700/30",
    description:
      "A 40-seat lab anchored by high-spec workstations, ergonomic furniture, and an adjoining robotics + maker corner where coding, electronics, and 3D printing happen side by side.",
    highlights: [
      "40 workstations (iMac & Windows)",
      "Robotics + 3D printing bay",
      "1 Gbps fibre internet",
      "Saturday Coding Club for grades 6–12",
    ],
  },
  {
    id: "library",
    title: "Interactive Library",
    icon: BookOpen,
    tint: "from-emerald-500/40 to-teal-700/30",
    description:
      "Two floors of curated reading, quiet study pods, and a digital archive of journals and e-books — a place to research, to read, and to think uninterrupted.",
    highlights: [
      "30,000+ titles across genres",
      "Silent + collaborative reading zones",
      "Digital journals & e-book lending",
      "Open 7 AM — 8 PM, six days a week",
    ],
  },
  {
    id: "sports-complex",
    title: "Sports Complex & Grounds",
    icon: Trophy,
    tint: "from-amber-500/40 to-orange-700/30",
    description:
      "International-size playfields, indoor courts, a 25-meter swimming pool, and coaches who've competed at national level — built so every student finds a sport that fits.",
    highlights: [
      "FIFA-spec football turf",
      "25 m heated swimming pool",
      "Indoor badminton & table tennis",
      "Strength & conditioning gym",
    ],
  },
  {
    id: "smart-classrooms",
    title: "Smart Classrooms",
    icon: Monitor,
    tint: "from-rose-500/40 to-pink-700/30",
    description:
      "Every classroom is fitted with 86-inch interactive panels, document cameras, and circadian-tuned lighting — engineered as a learning environment, not just a room.",
    highlights: [
      "86-inch interactive touch panels",
      "Tunable circadian lighting",
      "Acoustic-treated, climate-controlled",
      "Built-in lesson recording",
    ],
  },
  {
    id: "transport",
    title: "Secure Transport System",
    icon: Bus,
    tint: "from-sky-500/40 to-cyan-700/30",
    description:
      "GPS-tracked, female attendant-staffed buses with biometric boarding and a live tracking app — so parents always know exactly where their child is.",
    highlights: [
      "Live GPS in parent app",
      "Biometric boarding on every route",
      "Female attendant on every bus",
      "Speed governors capped at 40 km/h",
    ],
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

interface FacilitiesGridProps {
  /** Cover photo path per facility id, e.g. { "library": "/facilities/library/01.jpg" } */
  covers?: Record<string, string | undefined>;
}

export function FacilitiesGrid({ covers = {} }: FacilitiesGridProps) {
  const facilities = FACILITIES.map((f) =>
    covers[f.id] ? { ...f, src: covers[f.id] } : f,
  );

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {facilities.map((facility) => (
        <motion.div key={facility.id} variants={item}>
          <FacilityCard data={facility} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default FacilitiesGrid;
