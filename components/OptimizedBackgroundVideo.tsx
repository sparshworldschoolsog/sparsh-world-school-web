"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

// Lerp factor — fraction of remaining delta we cover each frame.
// 0.18 ≈ 5 frames to feel caught up; smooth enough to absorb stepped wheel inputs.
const LERP = 0.18;

// Stop the RAF loop once we're within this many seconds of the target time.
const CONVERGE_EPSILON = 0.005;

interface OptimizedBackgroundVideoProps {
  src?: string;
  /**
   * Called once the browser fires `loadedmetadata` (duration + dimensions are
   * known). Parent uses this to dismiss any preloader gating the UI.
   */
  onReady?: () => void;
}

export function OptimizedBackgroundVideo({
  src = PLACEHOLDER_VIDEO_SRC,
  onReady,
}: OptimizedBackgroundVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // Keep the latest callback in a ref so the JSX handler stays stable.
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const handleLoadedMetadata = () => {
    setVideoReady(true);
    onReadyRef.current?.();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Respect OS-level reduced-motion: park on first frame, no playback or scrub.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      video.autoplay = false;
      video.loop = false;
      video.pause();
      const showFirstFrame = () => {
        try {
          video.currentTime = 0;
        } catch {
          /* buffered range not ready yet */
        }
      };
      if (video.readyState >= 1) showFirstFrame();
      else video.addEventListener("loadedmetadata", showFirstFrame, { once: true });
      return () => video.removeEventListener("loadedmetadata", showFirstFrame);
    }

    // ── Device detection ───────────────────────────────────────────────────
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;

    // ── Mobile branch: simple autoplay loop ────────────────────────────────
    //
    // iOS Safari crashes (memory overflow) when forced to seek per scroll frame.
    // Phones get the JSX-default autoplay + loop. We just ensure muted-as-property
    // (some Safari builds ignore the attribute) and an imperative play() since
    // iOS sometimes needs the explicit call after metadata loads.
    if (!isDesktop) {
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

    // ── Desktop branch: GSAP scroll-scrubbing ──────────────────────────────
    //
    // The JSX has `autoPlay loop` for mobile defaults. Override them here so
    // the video stays paused and we drive `currentTime` from scroll progress.
    video.autoplay = false;
    video.loop = false;
    video.pause();

    let trigger: ScrollTrigger | undefined;
    let cancelled = false;

    // Decoupled scroll → render pipeline. GSAP's `onUpdate` only mutates the
    // plain `targetTime` number (cheap, no DOM). A separate rAF loop reads it,
    // lerps `smoothedTime` toward it, and writes to `video.currentTime` — one
    // seek per animation frame at most.
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
          /* buffered range not ready — next tick will retry */
        }
        return; // suspend RAF until next onUpdate wakes it
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
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          targetTime = duration * self.progress;
          ensureRunning();
        },
      });

      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Initialize only after the browser knows the video's duration.
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
      aria-hidden={!videoReady}
    >
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        controls={false}
        disablePictureInPicture
        disableRemotePlayback
        onLoadedMetadata={handleLoadedMetadata}
        className="h-full w-full object-cover blur-[2px] brightness-[0.55] saturate-[1.1]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/70" />
    </div>
  );
}

export default OptimizedBackgroundVideo;
