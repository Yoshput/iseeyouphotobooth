"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function startTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin:nav-start"));
  }
}

export function finishTopProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("admin:nav-done"));
  }
}

function ProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const startProgress = () => {
    clearAllTimers();
    setLoading(true);
    setProgress(28);

    const t1 = setTimeout(() => {
      setProgress((p) => (p < 72 ? 72 : p));
    }, 120);

    const t2 = setTimeout(() => {
      setProgress((p) => (p < 88 ? 88 : p));
    }, 320);

    timersRef.current.push(t1, t2);
  };

  const completeProgress = () => {
    clearAllTimers();
    setProgress(100);
    const t = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 280);
    timersRef.current.push(t);
  };

  // Complete progress whenever route changes
  useEffect(() => {
    if (loading) {
      completeProgress();
    }
  }, [pathname, searchParams]);

  // Listen to custom programmatic navigation events
  useEffect(() => {
    const handleStart = () => startProgress();
    const handleDone = () => completeProgress();

    window.addEventListener("admin:nav-start", handleStart);
    window.addEventListener("admin:nav-done", handleDone);

    return () => {
      window.removeEventListener("admin:nav-start", handleStart);
      window.removeEventListener("admin:nav-done", handleDone);
    };
  }, []);

  // Intercept internal link anchor clicks for immediate tactile feedback
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, download, tel, mailto, target="_blank", or modifier clicks
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

      startProgress();
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      clearAllTimers();
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div
      role="progressbar"
      aria-hidden="true"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="fixed top-0 left-0 right-0 z-[999999] pointer-events-none h-[3px] overflow-hidden"
    >
      <div
        className="h-full bg-gradient-to-r from-[#124734] via-[#2FA84F] to-[#86EFAC] transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration:
            progress === 100 ? "200ms" : progress === 0 ? "0ms" : "320ms",
          boxShadow:
            "0 0 12px rgba(47, 168, 79, 0.9), 0 0 5px rgba(18, 71, 52, 0.6)",
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
