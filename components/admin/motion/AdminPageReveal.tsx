"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";

export default function AdminPageReveal({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Respect user's accessibility preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(containerRef.current, { opacity: 1, y: 0 });
      return;
    }

    // Scoped GSAP animation context for memory safety & automatic cleanup
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: "power2.out",
          clearProps: "transform,opacity",
        }
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div
      ref={containerRef}
      data-admin-page={pathname}
      className="flex-1 flex flex-col h-full min-h-0 overflow-hidden"
    >
      {children}
    </div>
  );
}
