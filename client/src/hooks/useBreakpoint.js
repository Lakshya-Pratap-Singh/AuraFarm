// useBreakpoint — single source of truth for mobile/tablet/desktop detection.
//
// Mirrors the CSS breakpoints in tokens/breakpoints.css so JS branching
// (e.g. "render BottomNav vs Sidebar") never drifts out of sync with the
// CSS media queries doing the visual work.
//
// Usage:
//   const { isMobile, isTablet, isDesktop, width } = useBreakpoint();

import { useEffect, useState } from "react";

const BREAKPOINTS = {
  xs: 360,
  sm: 390,
  md: 430,
  tablet: 768,
  desktop: 1024,
};

function getCurrentBreakpoint(width) {
  if (width >= BREAKPOINTS.desktop) return "desktop";
  if (width >= BREAKPOINTS.tablet) return "tablet";
  if (width >= BREAKPOINTS.md) return "md";
  if (width >= BREAKPOINTS.sm) return "sm";
  return "xs";
}

function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : BREAKPOINTS.sm
  );

  useEffect(() => {
    let frame = null;

    function handleResize() {
      // rAF-throttle so resize doesn't trigger a render storm
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setWidth(window.innerWidth);
        frame = null;
      });
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const breakpoint = getCurrentBreakpoint(width);

  return {
    width,
    breakpoint,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
}

export { BREAKPOINTS };
export default useBreakpoint;