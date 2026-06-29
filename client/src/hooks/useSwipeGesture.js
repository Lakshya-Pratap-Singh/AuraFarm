// useSwipeGesture — generic horizontal pointer-drag tracking.
//
// Deliberately element-agnostic: `trackRef` is just whatever element you
// want measured for width (a thumb's track, or the whole card), and
// `handlers` can be spread onto ANY element (a thumb, or the whole card).
// This is what lets the existing thumb-in-track SwipeToComplete and a new
// whole-tile drag share one implementation.
//
// Pointer events (not touch events) — identical behavior for touch and
// mouse, no isMobile branching needed anywhere that consumes this hook.
//
// Drag doesn't "commit" until the pointer moves past DRAG_START_THRESHOLD.
// Below that distance, it's treated as a potential tap/click and never
// calls onDragStart/onDrag — this is what lets buttons nested inside a
// draggable surface still receive normal clicks.
//
// ignoreSelector: if the pointerdown originated inside an element matching
// this selector (e.g. ".btn-card"), the whole gesture is skipped for that
// pointer — the click reaches the button untouched.
//
// Usage (thumb-in-track, unchanged from before):
//   const { trackRef, dragX, trackWidth, isDragging, handlers } =
//     useSwipeGesture({ disabled: completed, onRelease: (x, w) => {...} });
//   <div ref={trackRef}>...<div {...handlers}>thumb</div></div>
//
// Usage (whole-tile drag, new):
//   const { trackRef, dragX, trackWidth, isDragging, handlers } =
//     useSwipeGesture({ disabled: completed, ignoreSelector: ".btn-card",
//       onDrag: (x, width) => {...}, onRelease: (x, width) => {...} });
//   <article ref={trackRef} {...handlers}>...buttons inside...</article>

import { useCallback, useRef, useState } from "react";

const DRAG_START_THRESHOLD = 8; // px of movement before a pointerdown becomes a drag

function useSwipeGesture({
  disabled = false,
  ignoreSelector = null,
  onDragStart,
  onDrag,
  onRelease,
} = {}) {
  const trackRef = useRef(null);
  const [dragX, setDragX] = useState(0);
  const [trackWidth, setTrackWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const pointerIdRef = useRef(null);
  const committedRef = useRef(false); // has this pointer crossed the drag threshold
  const skipRef = useRef(false); // pointerdown started on an ignored element

  const measureTrack = useCallback(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.offsetWidth);
    }
  }, []);

  const handlePointerDown = useCallback(
    (e) => {
      if (disabled) return;

      if (ignoreSelector && e.target.closest(ignoreSelector)) {
        skipRef.current = true;
        return; // let the click/tap through untouched
      }
      skipRef.current = false;

      measureTrack();
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      pointerIdRef.current = e.pointerId;
      committedRef.current = false;
      // No setIsDragging yet — wait for the threshold so plain taps
      // aren't hijacked by a near-zero "drag".
    },
    [disabled, ignoreSelector, measureTrack]
  );

  const handlePointerMove = useCallback(
    (e) => {
      if (disabled || skipRef.current || pointerIdRef.current !== e.pointerId) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;

      if (!committedRef.current) {
        if (Math.abs(deltaX) < DRAG_START_THRESHOLD && Math.abs(deltaY) < DRAG_START_THRESHOLD) {
          return; // not committed yet — could still just be a tap
        }
        // Crossed the threshold: this is now a drag. Capture the pointer
        // so we keep getting move/up events even if it leaves the element.
        committedRef.current = true;
        setIsDragging(true);
        e.target.setPointerCapture?.(e.pointerId);
        onDragStart?.();
      }

      // Right-swipe-only, matches "swipe to complete" semantics — clamp
      // at 0 so dragging left never produces a negative offset.
      const clamped = Math.max(deltaX, 0);
      setDragX(clamped);
      onDrag?.(clamped, trackWidth);
    },
    [disabled, trackWidth, onDragStart, onDrag]
  );

  const endDrag = useCallback(() => {
    if (pointerIdRef.current === null) return;
    const wasDragging = committedRef.current;
    const finalX = dragX;
    const finalWidth = trackWidth;

    pointerIdRef.current = null;
    committedRef.current = false;
    skipRef.current = false;
    setIsDragging(false);
    setDragX(0);

    if (wasDragging) {
      onRelease?.(finalX, finalWidth);
    }
  }, [dragX, trackWidth, onRelease]);

  const handlers = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  return { trackRef, dragX, trackWidth, isDragging, handlers };
}

export default useSwipeGesture;