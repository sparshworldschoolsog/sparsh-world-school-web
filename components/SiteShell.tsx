"use client";

import { useCallback, useState } from "react";
import OptimizedBackgroundVideo from "@/components/OptimizedBackgroundVideo";
import AcademicPreloader from "@/components/AcademicPreloader";

/**
 * Owns the global "is the heavy background asset ready?" state and bridges it
 * between two components that both need to live near the top of the DOM:
 *
 *  - VideoBackground fires `onReady` when the video's `canplaythrough` fires.
 *  - AcademicPreloader receives `visible={!isLoaded}` and animates itself out.
 *
 * The preloader also has an internal 7s failsafe, so we don't duplicate that here.
 *
 * Rendered as a sibling to <Header />, <main>, and <ChatBot /> from layout.tsx —
 * both children are `fixed` overlays so DOM position doesn't matter, only z-index.
 */
export function SiteShell() {
  const [isLoaded, setIsLoaded] = useState(false);
  const handleReady = useCallback(() => setIsLoaded(true), []);

  return (
    <>
      <OptimizedBackgroundVideo onReady={handleReady} />
      <AcademicPreloader visible={!isLoaded} />
    </>
  );
}

export default SiteShell;
