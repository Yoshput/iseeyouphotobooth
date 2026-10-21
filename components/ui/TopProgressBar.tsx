"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Complete progress whenever route changes
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Intercept all internal navigation clicks for instant interactive loading feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, download, tel, mailto, target="_blank", or hash-only links
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Check if it's the exact same page
      const currentPath = window.location.pathname;
      if (href === currentPath) {
        return;
      }

      // Start smooth progress animation
      setLoading(true);
      setProgress(28);

      const t1 = setTimeout(() => setProgress((p) => (p < 70 ? 70 : p)), 120);
      const t2 = setTimeout(() => setProgress((p) => (p < 88 ? 88 : p)), 300);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3.5px] overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#124734] via-[#2FA84F] to-[#86EFAC] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration:
            progress === 100 ? "200ms" : progress === 0 ? "0ms" : "350ms",
          boxShadow:
            "0 0 14px rgba(47, 168, 79, 0.9), 0 0 6px rgba(18, 71, 52, 0.7)",
        }}
      />
    </div>
  );
}

export default function TopProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarInner />
    </Suspense>
  );
}
