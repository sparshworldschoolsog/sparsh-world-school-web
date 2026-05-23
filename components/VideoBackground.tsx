"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

// Lerp factor — fraction of the remaining delta we cover each frame.
// 0.18 = ~5 frames to feel "caught up" on a fast scroll, smooth enough to absorb
// stepped wheel inputs without feeling laggy. Tune between 0.12 (smoother) and 0.3 (snappier).
const LERP = 0.18;

// Stop the RAF loop once we're within this many seconds of the target.
// 0.005s is well below a 60fps frame budget — no visible drift.
const CONVERGE_EPSILON = 0.005;

export function VideoBackground({ src = PLACEHOLDER_VIDEO_SRC }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

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
    //
    // This means:
    //   1. Fast scroll wheels / trackpads can't queue up multiple seeks per frame.
    //   2. Stepped inputs feel smooth because the lerp absorbs the gap.
    //   3. Idle scrolls cost zero — RAF self-suspends on convergence.
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

      // Seed the smoothed value so we don't lerp from 0 on remount.
      smoothedTime = video.currentTime;
      targetTime = smoothedTime;

      trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Hot path: just a number write + maybe a rAF schedule. No DOM work here.
          targetTime = duration * self.progress;
          ensureRunning();
        },
      });

      // Recompute layout-dependent measurements once everything has settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    // Only initialize after the browser knows the video's duration.
    // HAVE_METADATA (readyState 1) is enough — no need to wait for HAVE_CURRENT_DATA.
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
        className="h-full w-full object-cover blur-[2px] brightness-[0.55] saturate-[1.1]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/70" />
    </div>
  );
}

export default VideoBackground;
