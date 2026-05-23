"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const HIDDEN_ON: ReadonlySet<string> = new Set(["/virtual-tour"]);

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "Facilities", href: "/facilities" },
  { label: "Contact Us", href: "/contact" },
  { label: "Student Request", href: "/student-request" },
] as const;

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group relative text-sm font-medium text-white/85 transition hover:text-white"
    >
      {label}
      <span className="absolute -bottom-1 left-0 h-px w-0 bg-white transition-all duration-300 group-hover:w-full" />
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (HIDDEN_ON.has(pathname)) return null;

  return (
    <header className="glass-panel sticky top-0 z-50 w-full">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        {/* LEFT — revolving logo + authoritative wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 [perspective:1000px]"
        >
          {/* NOTE: place the real logo file at `public/logo.png` (PNG with a transparent background works best). */}
          <motion.div
            animate={{ rotateY: 360 }}
            transition={{ repeat: Infinity, ease: "linear", duration: 10 }}
            className="relative h-12 w-12 shrink-0 md:h-14 md:w-14"
            style={{ transformStyle: "preserve-3d" }}
            aria-hidden="true"
          >
            <Image
              src="/logo.png"
              alt="Sparsh World School crest"
              width={56}
              height={56}
              priority
              className="h-full w-full object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.45)]"
            />
          </motion.div>

          <span className="flex flex-col leading-none">
            <span className="font-crest text-base font-bold tracking-wide text-white md:text-lg">
              SPARSH WORLD SCHOOL
            </span>
            <span className="mt-1 hidden text-[0.65rem] tracking-[0.5em] text-white/60 md:block">
              EST · KNOWLEDGE · VIRTUE
            </span>
          </span>
        </Link>

        {/* CENTER — primary navigation (absolutely centered so it doesn't shift with left/right widths) */}
        <nav className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <span key={link.href} className="pointer-events-auto">
              <NavLink {...link} />
            </span>
          ))}
        </nav>

        {/* RIGHT — mobile hamburger only (logo lives on the left) */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 md:hidden"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <nav className="flex flex-col gap-4 px-6 py-5">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  onClick={() => setOpen(false)}
                />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;
