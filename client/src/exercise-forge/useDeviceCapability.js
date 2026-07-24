import { useEffect, useState } from "react";

/**
 * Decides whether to render the full 3D interactive body (React Three
 * Fiber) or gracefully degrade to a 2D SVG muscle map.
 *
 * Checks, in order of how disqualifying they are:
 *   1. WebGL actually available (some in-app browsers / locked-down
 *      corporate devices disable it entirely)
 *   2. prefers-reduced-motion (respect explicit user/OS preference)
 *   3. Rough low-end-device heuristics (hardwareConcurrency, deviceMemory)
 *      — best-effort signals, not exact, deliberately conservative
 *
 * Returns "checking" | "3d" | "2d" — "checking" is the initial render
 * (avoids a flash of the 3D model on devices that will immediately be
 * downgraded).
 */
export function useDeviceCapability() {
  const [capability, setCapability] = useState("checking");

  useEffect(() => {
    let webglOk = false;
    try {
      const canvas = document.createElement("canvas");
      webglOk = !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (e) {
      webglOk = false;
    }

    if (!webglOk) {
      setCapability("2d");
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setCapability("2d");
      return;
    }

    // Best-effort low-end-device heuristic. Not universally supported
    // (Safari doesn't expose deviceMemory) — treat "unknown" as "assume
    // capable" rather than penalizing browsers that don't report it.
    const cores = navigator.hardwareConcurrency || 8;
    const memory = navigator.deviceMemory || 8; // GB, Chrome/Android only

    if (cores <= 2 || memory <= 2) {
      setCapability("2d");
      return;
    }

    setCapability("3d");
  }, []);

  return capability;
}
