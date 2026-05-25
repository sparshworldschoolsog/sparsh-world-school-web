"use client";

import { useEffect, useRef, useState } from "react";

const PLACEHOLDER_VIDEO_SRC = "/videos/MyRender.mp4";

interface OptimizedBackgroundVideoProps {
  src?: string;
  /**
   * Called once the browser fires `loadedmetadata` (duration + dimensions are
   * known and buffering has begun). The parent uses this to dismiss any
   * preloader gating the rest of the UI.
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

  // Imperative play attempt — iOS Safari sometimes ignores the `autoPlay`
  // attribute until `muted` is set as a property (not just an attribute) AND
  // play() is called after at least HAVE_CURRENT_DATA. The promise is caught
  // silently because low-power mode / saver settings can still refuse.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const tryPlay = () => {
      const p = video.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });
    return () => video.removeEventListener("loadeddata", tryPlay);
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
