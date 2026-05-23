"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

export function VideoBackground({ src = PLACEHOLDER_VIDEO_SRC }: { src?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Honour the user's OS-level reduced-motion preference: skip the scrub entirely
    // and just show the first frame. Saves the per-frame seek cost on low-end devices too.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      const showFirstFrame = () => {
        try {
          video.currentTime = 0;
        } catch {
          /* buffered range not ready yet */
        }
      };
      if (video.readyState >= 2) showFirstFrame();
      else video.addEventListener("loadeddata", showFirstFrame, { once: true });
      return () => video.removeEventListener("loadeddata", showFirstFrame);
    }

    let trigger: ScrollTrigger | undefined;
    let cancelled = false;

    // Coalesce seek requests into one per animation frame. Without this, fast wheel
    // events could queue up multiple `currentTime` writes per frame — each one forces
    // a decode and competes with paint for the main thread.
    let pendingTime: number | null = null;
    let rafId: number | null = null;
    const flushSeek = () => {
      rafId = null;
      if (pendingTime === null) return;
      try {
        video.currentTime = pendingTime;
      } catch {
        // Buffered range hasn't reached target yet — next scroll tick will retry.
      }
      pendingTime = null;
    };
    const queueSeek = (target: number) => {
      pendingTime = target;
      if (rafId === null) rafId = requestAnimationFrame(flushSeek);
    };

    const setupScrub = () => {
      if (cancelled) return;
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      video.pause();
      trigger?.kill();

      trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        scrub: true, // GSAP's ticker already runs on rAF; we add a second rAF gate below to dedupe seeks.
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const target = duration * self.progress;
          // Skip imperceptible deltas so we don't seek every frame when the user idles.
          if (Math.abs(video.currentTime - target) > 0.04) {
            queueSeek(target);
          }
        },
      });

      // Force a recompute after layout has fully settled.
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    const init = () => {
      if (video.readyState >= 2 /* HAVE_CURRENT_DATA */ && Number.isFinite(video.duration)) {
        setupScrub();
      } else {
        video.addEventListener("loadeddata", setupScrub, { once: true });
      }
    };

    // Wait for window load — fonts, images, and the rest of the document
    // need to be measured before ScrollTrigger can map scroll → video time.
    if (document.readyState === "complete") {
      init();
    } else {
      window.addEventListener("load", init, { once: true });
    }

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      trigger?.kill();
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", init);
      video.removeEventListener("loadeddata", setupScrub);
    };
  }, [src]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        disableRemotePlayback
        className="h-full w-full object-cover blur-[2px] brightness-[0.55] saturate-[1.1]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950/70" />
    </div>
  );
}

export default VideoBackground;
