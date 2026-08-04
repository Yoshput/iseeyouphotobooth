"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Tracks an element's rendered CSS pixel size via ResizeObserver.
 *
 * This is what makes the booth responsive: instead of a hardcoded
 * width/height (which only ever looked right on one device), the camera
 * viewport and the Three.js canvas both read their size from the actual
 * container — whatever that container ends up being: full-bleed on a
 * tablet/phone, or a centered kiosk card on a laptop (see page.tsx).
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}
