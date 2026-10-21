"use client";

import React, { useEffect, useRef, memo } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

// Memoized to prevent re-renders from parent prop changes unrelated to pathname
const AdminPageReveal = memo(function AdminPageReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  // Track if this is the very first mount — skip animation on initial render
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    // On first mount: set visible immediately, no animation needed
    // (content was already rendered by SSR/loading.tsx)
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      if (containerRef.current) {
        gsap.set(containerRef.current, { opacity: 1, y: 0 });
      }
      return;
    }

    if (!containerRef.current) return;

    // Respect prefers-reduced-motion — instant reveal, no spatial movement
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(containerRef.current, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    // Scoped GSAP context — auto-cleans all tweens when context is reverted
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.26,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    }, containerRef);

    // Cleanup: kill tweens before next navigation fires
    return () => {
      ctx.revert();
    };
    // NOTE: We intentionally depend only on pathname.
    // The component is keyed by pathname in parent, so this
    // effect runs once per page mount — correct behavior.
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      data-admin-page={pathname}
      // Start invisible to prevent flash before GSAP kicks in
      style={{ opacity: 0 }}
      className="flex-1 flex flex-col h-full min-h-0 overflow-hidden"
    >
      {children}
    </div>
  );
});

export default AdminPageReveal;
