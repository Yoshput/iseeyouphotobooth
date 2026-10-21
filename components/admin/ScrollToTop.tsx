"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ScrollToTopProps {
  targetId?: string;
}

export default function ScrollToTop({ targetId = "admin-table-scroll" }: ScrollToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getTarget = () =>
      document.getElementById(targetId) ||
      document.querySelector(".admin-scrollbar") ||
      document.getElementById("admin-main-viewport");

    const targetElement = getTarget();

    const handleScroll = () => {
      const el = getTarget();
      const scrollY = el ? el.scrollTop : window.scrollY;
      if (scrollY > 180) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    if (targetElement) {
      targetElement.addEventListener("scroll", handleScroll, { passive: true });
      return () => targetElement.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [targetId]);

  const scrollToTop = () => {
    const targetElement =
      document.getElementById(targetId) ||
      document.querySelector(".admin-scrollbar") ||
      document.getElementById("admin-main-viewport");

    if (targetElement) {
      targetElement.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke bagian atas halaman"
      title="Kembali ke Atas"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-isy-line bg-white/95 px-3.5 py-2.5 text-xs font-bold text-isy-emerald shadow-lg backdrop-blur-md transition-all duration-300 hover:border-isy-green-bright hover:bg-isy-mist hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-isy-green-bright/40"
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-isy-mist text-isy-emerald">
        <ArrowUp className="h-3.5 w-3.5 stroke-[2.5]" />
      </div>
      <span className="hidden sm:inline-block pr-1 font-semibold text-isy-emerald">Ke Atas</span>
    </button>
  );
}
