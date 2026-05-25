"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

// Lerp factor — fraction of the remaining delta we cover each frame.
const LERP = 0.18;

// Stop the RAF loop once we're within this many seconds of the target.
const CONVERGE_EPSILON = 0.005;

interface VideoBackgroundProps {
  src?: string;
  /** Fires when the video has buffered enough to play through. Parent uses this to dismiss the preloader. */
  onReady?: () => void;
}

export function VideoBackground({
  src = PLACEHOLDER_VIDEO_SRC,
  onReady,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Keep the latest callback in a ref so the <video> handler stays stable.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

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
      if (video.readyState >= 1) showFirstFrame();
      else video.addEventListener("loadedmetadata", showFirstFrame, { once: true });
      return () => video.removeEventListener("loadedmetadata", showFirstFrame);
    }

    // ── Mobile branch: skip GSAP entirely ────────────────────────────────────
    //
    // iOS Safari crashes (memory overflow) when forced to seek a video on every
    // scroll frame — each scrub triggers a decode and accumulates GPU buffers
    // faster than the OS can reclaim them. Phones get a plain autoplay loop
    // instead: same visual, one decode pipeline that the OS already optimizes.
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      video.loop = true;
      video.muted = true;
      const tryPlay = () => {
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      };
      if (video.readyState >= 2) tryPlay();
      else video.addEventListener("loadeddata", tryPlay, { once: true });
      return () => video.removeEventListener("loadeddata", tryPlay);
    }

    let trigger: ScrollTrigger | undefined;
    let cancelled = false;

    // ── Decoupled scroll → render pipeline ──────────────────────────────────
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
        return;
      }
      smoothedTime += delta * LERP;
      try {
        video.currentTime = smoothedTime;
      } catch {
        /* buffered range not ready */
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
        onCanPlayThrough={() => onReadyRef.current?.()}
        className="h-full w-full object-cover blur-[2px] brightness-[0.55] saturate-[1.1]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/70" />
    </div>
  );
}

export default VideoBackground;
