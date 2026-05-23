"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award, Activity, type LucideIcon } from "lucide-react";

interface Value {
  icon: LucideIcon;
  title: string;
  caption: string;
  body: string;
}

const VALUES: Value[] = [
  {
    icon: GraduationCap,
    title: "ICSE Curriculum",
    caption: "Academic standards",
    body:
      "A globally respected ICSE framework grounded in analytical thinking, deep subject mastery, and intellectual curiosity.",
  },
  {
    icon: Award,
    title: "Excellence",
    caption: "Character for the future",
    body:
      "We build leaders of conscience — integrity, empathy, and resilience are woven into every classroom and every interaction.",
  },
  {
    icon: Activity,
    title: "Extracurriculars",
    caption: "Beyond the classroom",
    body:
      "From robotics to debate, music to athletics — students discover passions that shape who they become.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export function CoreValues() {
  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-24 md:px-8 md:py-32">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={container}
        className="mx-auto max-w-2xl text-center"
      >
        <motion.span variants={item} className="font-crest text-xs text-white/70">
          What We Stand For
        </motion.span>
        <motion.h2
          variants={item}
          className="font-crest mt-4 text-3xl text-white md:text-5xl"
        >
          Three Pillars of a Sparsh Education
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        variants={container}
        className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {VALUES.map(({ icon: Icon, title, caption, body }) => (
          <motion.article
            key={title}
            variants={item}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="glass-panel relative rounded-3xl p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Icon size={22} className="text-white" />
            </div>
            <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/55">
              {caption}
            </p>
            <h3 className="font-crest mt-3 text-2xl text-white">{title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/75">{body}</p>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}

export default CoreValues;
