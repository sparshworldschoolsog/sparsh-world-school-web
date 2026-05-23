"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

// Lerp factor — fraction of the remaining delta we cover each frame.
// 0.18 = ~5 frames to feel "caught up" on a fast scroll, smooth enough to absorb
// stepped wheel inputs without feeling laggy. Tune between 0.12 (smoother) and 0.3 (snappier).
const LERP = 0.18;

// Stop the RAF loop once we're within this many seconds of the target.
const CONVERGE_EPSILON = 0.005;

// Max time we wait for `canplaythrough` before revealing the site anyway.
// Catches bad networks, mobile data, and browsers that under-fire the event.
const PRELOADER_FAILSAFE_MS = 8000;

export function VideoBackground({ src = PLACEHOLDER_VIDEO_SRC }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Failsafe: if `canplaythrough` doesn't fire within 8s, reveal the site anyway.
  useEffect(() => {
    if (isVideoLoaded) return;
    const id = window.setTimeout(() => setIsVideoLoaded(true), PRELOADER_FAILSAFE_MS);
    return () => window.clearTimeout(id);
  }, [isVideoLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect OS-level reduced-motion: show the first frame, skip the scrub entirely.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const showFirstFrame = () => {
        try {
          video.currentTime = 0;
        } catch {
          /* buffered range not ready — first frame paints when it is */
        }
      };
      if (video.readyState >= 1 /* HAVE_METADATA */) showFirstFrame();
      else video.addEventListener("loadedmetadata", showFirstFrame, { once: true });
      return () => video.removeEventListener("loadedmetadata", showFirstFrame);
    }

    let trigger: ScrollTrigger | undefined;
    let cancelled = false;

    // ── Decoupled scroll → render pipeline ──────────────────────────────────
    //
    // GSAP's onUpdate ONLY mutates `targetTime` (a plain number — cheap, no
    // layout/paint work). A separate rAF loop reads `targetTime` once per
    // frame, lerps `smoothedTime` toward it, and writes to `video.currentTime`.
    let targetTime = 0;
    let smoothedTime = 0;
    let rafId: number | null = null;

    const tick = () => {
      rafId = null;
      const delta = targetTime - smoothedTime;
      if (Math.abs(delta) < CONVERGE_EPSILON) {
        smoothedTime = targetTime;
        try {
          video.currentTime = smoothedTime;
        } catch {
          /* buffered range not ready — next scroll tick will retry */
        }
        return; // suspend RAF until next onUpdate wakes it
      }
      smoothedTime += delta * LERP;
      try {
        video.currentTime = smoothedTime;
      } catch {
        /* buffered range not ready — keep looping; the value will catch up */
      }
      rafId = requestAnimationFrame(tick);
    };

    const ensureRunning = () => {
      if (rafId === null) rafId = requestAnimationFrame(tick);
    };

    const initScrub = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      video.pause();
      trigger?.kill();

      smoothedTime = video.currentTime;
      targetTime = smoothedTime;

      trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetTime = duration * self.progress;
          ensureRunning();
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Initialize after the browser knows the video's duration.
    if (video.readyState >= 1 && Number.isFinite(video.duration) && video.duration > 0) {
      initScrub();
    } else {
      video.addEventListener("loadedmetadata", initScrub, { once: true });
    }

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      trigger?.kill();
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      video.removeEventListener("loadedmetadata", initScrub);
    };
  }, [src]);

  return (
    <>
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          loop={false}
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          onCanPlayThrough={() => setIsVideoLoaded(true)}
          className="h-full w-full object-cover blur-[2px] brightness-[0.55] saturate-[1.1]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/70" />
      </div>

      <AnimatePresence>
        {!isVideoLoaded && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-blue-950"
            aria-busy="true"
            role="status"
          >
            {/* Soft ambient glow behind the crest */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(56,113,232,0.25),transparent_60%)]" />

            {/* NOTE: requires /public/logo.png. Falls back to a blank circle if missing. */}
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.06, 1] }}
              transition={{
                rotate: { duration: 9, repeat: Infinity, ease: "linear" },
                scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative h-28 w-28 md:h-32 md:w-32"
              style={{ willChange: "transform" }}
            >
              <Image
                src="/logo.png"
                alt="Sparsh World School"
                width={128}
                height={128}
                priority
                className="h-full w-full object-contain drop-shadow-[0_4px_20px_rgba(255,255,255,0.18)]"
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
              className="font-crest mt-8 text-sm text-white/85 md:text-base"
            >
              Loading Sparsh World School…
            </motion.p>

            {/* Indeterminate progress bar — purely a perceived-wait sweetener. */}
            <div className="mt-6 h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="h-full w-1/3 rounded-full bg-white/70"
                style={{ willChange: "transform" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default VideoBackground;
