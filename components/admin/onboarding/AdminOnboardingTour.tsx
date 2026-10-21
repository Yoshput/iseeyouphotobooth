"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Compass,
  Map,
} from "lucide-react";
import { TOUR_STEPS, TourStep } from "./tourSteps";
import { getTourStatus, setTourStatus } from "./tourStorage";

interface AdminOnboardingTourProps {
  userId?: string;
  userRole?: "owner" | "admin";
  onOpenSidebar?: () => void;
  onCloseSidebar?: () => void;
}

export default function AdminOnboardingTour({
  userId,
  userRole = "admin",
  onOpenSidebar,
  onCloseSidebar,
}: AdminOnboardingTourProps) {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [sidebarOpenedByTour, setSidebarOpenedByTour] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const prevStepRequiredSidebarRef = useRef(false);

  // Stable memoized step list — recalculated only when userRole changes
  const filteredSteps = useMemo(
    () =>
      TOUR_STEPS.filter((step) => {
        if (!step.roles) return true;
        return step.roles.includes(userRole);
      }),
    [userRole]
  );

  const currentStep: TourStep | undefined = filteredSteps[currentStepIndex];
  const totalSteps = filteredSteps.length;

  // First-run check — runs once when userId is available
  useEffect(() => {
    if (!userId) return;
    const status = getTourStatus(userId);
    if (status === "never_started") {
      // Wait for page to fully render before showing welcome
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Manual replay from header button
  useEffect(() => {
    const handleReplay = () => {
      setShowWelcome(false);
      setCurrentStepIndex(0);
      setSidebarOpenedByTour(false);
      setIsActive(true);
    };
    window.addEventListener("admin:start-tour", handleReplay);
    return () => window.removeEventListener("admin:start-tour", handleReplay);
  }, []);

  // Sidebar management: open when step needs it, close when step doesn't
  const manageSidebarForStep = useCallback(
    (step: TourStep | undefined) => {
      if (!step) return;
      const isMobile = window.innerWidth < 1024;
      if (!isMobile) return; // Desktop: sidebar always visible

      if (step.requiresSidebarOpen) {
        if (!sidebarOpenedByTour) {
          onOpenSidebar?.();
          setSidebarOpenedByTour(true);
        }
        prevStepRequiredSidebarRef.current = true;
      } else {
        // If previous step opened sidebar and this one doesn't need it, close it
        if (prevStepRequiredSidebarRef.current && sidebarOpenedByTour) {
          onCloseSidebar?.();
          setSidebarOpenedByTour(false);
        }
        prevStepRequiredSidebarRef.current = false;
      }
    },
    [onOpenSidebar, onCloseSidebar, sidebarOpenedByTour]
  );

  // Tooltip positioning — computed from actual DOM rect
  const updatePosition = useCallback(() => {
    if (!isActive || !currentStep) return;

    // Small delay for sidebar animation to settle on mobile
    const doUpdate = () => {
      const element = document.querySelector(currentStep.target);
      if (!element) {
        setTargetRect(null);
        return;
      }

      element.scrollIntoView({ behavior: "smooth", block: "nearest" });

      // Wait a frame for scroll to settle
      requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);

        const tooltipWidth = Math.min(340, window.innerWidth - 32);
        const gap = 14;
        const tooltipHeight = 180; // approximate
        const placement = currentStep.placement || "bottom";

        let top = 0;
        let left = 0;

        switch (placement) {
          case "bottom":
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case "top":
            top = rect.top - tooltipHeight - gap;
            left = rect.left + rect.width / 2 - tooltipWidth / 2;
            break;
          case "right":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.right + gap;
            break;
          case "left":
            top = rect.top + rect.height / 2 - tooltipHeight / 2;
            left = rect.left - tooltipWidth - gap;
            break;
          default:
            top = rect.bottom + gap;
            left = rect.left;
        }

        // Viewport boundary clamping
        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

        setTooltipStyle({
          position: "fixed",
          top: `${Math.round(top)}px`,
          left: `${Math.round(left)}px`,
          width: `${tooltipWidth}px`,
          zIndex: 999999,
        });
      });
    };

    // If sidebar step on mobile, wait for drawer animation before positioning
    if (currentStep.requiresSidebarOpen && window.innerWidth < 1024) {
      setTimeout(doUpdate, 320);
    } else {
      doUpdate();
    }
  }, [isActive, currentStep]);

  // Reposition on resize and scroll
  useEffect(() => {
    if (!isActive) return;
    manageSidebarForStep(currentStep);
    updatePosition();

    const handleUpdate = () => updatePosition();
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, { passive: true, capture: true });
    return () => {
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, { capture: true });
    };
  }, [isActive, currentStepIndex, updatePosition, manageSidebarForStep, currentStep]);

  // Keyboard navigation
  useEffect(() => {
    if (!isActive && !showWelcome) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleSkip();
      else if (isActive && (e.key === "ArrowRight" || e.key === "Tab")) {
        e.preventDefault();
        handleNext();
      } else if (isActive && e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, showWelcome, currentStepIndex, filteredSteps.length]);

  const cleanupTour = useCallback(() => {
    setIsActive(false);
    setTargetRect(null);
    // Always restore sidebar to closed state on mobile when tour ends
    if (sidebarOpenedByTour) {
      onCloseSidebar?.();
      setSidebarOpenedByTour(false);
    }
    prevStepRequiredSidebarRef.current = false;
  }, [onCloseSidebar, sidebarOpenedByTour]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStepIndex(0);
    setSidebarOpenedByTour(false);
    setIsActive(true);
    if (userId) setTourStatus(userId, "started");
  };

  const handleSkip = useCallback(() => {
    setShowWelcome(false);
    cleanupTour();
    if (userId) setTourStatus(userId, "skipped");
  }, [cleanupTour, userId]);

  const handleFinish = useCallback(() => {
    cleanupTour();
    if (userId) setTourStatus(userId, "completed");
  }, [cleanupTour, userId]);

  const handleNext = useCallback(() => {
    if (currentStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  }, [currentStepIndex, filteredSteps.length, handleFinish]);

  const handlePrev = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  // ── Welcome Dialog ──────────────────────────────────────────────────────
  if (showWelcome) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-welcome-title"
        aria-describedby="tour-welcome-desc"
        className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
      >
        <div className="w-full max-w-md rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          {/* Icon */}
          <div className="flex justify-center" aria-hidden="true">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-isy-mist border border-isy-line shadow-xs">
              <Compass className="h-7 w-7 text-isy-green-bright" />
            </div>
          </div>

          {/* Copy */}
          <div className="space-y-2">
            <div
              className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-1 text-xs font-bold text-isy-emerald border border-isy-line"
              aria-hidden="true"
            >
              <Sparkles className="h-3.5 w-3.5 text-isy-green-bright" />
              <span>Panduan Fitur Panel Admin</span>
            </div>
            <h3
              id="tour-welcome-title"
              className="text-lg sm:text-xl font-extrabold text-isy-emerald"
            >
              Selamat Datang di I See You CMS
            </h3>
            <p id="tour-welcome-desc" className="text-xs sm:text-sm text-isy-text-secondary leading-relaxed">
              Kelola katalog kacamata, softlens, dan konten website dari satu panel
              terpusat. Ikuti tur singkat untuk mengenal fungsi utamanya.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              autoFocus
              onClick={handleStartTour}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-isy-emerald-hover transition-colors"
            >
              <span>Mulai Panduan</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full sm:w-auto rounded-xl border border-isy-line bg-white px-5 py-3 text-xs font-semibold text-isy-text-primary hover:bg-isy-mist transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Spotlight Tour ───────────────────────────────────────────────────────
  if (!isActive || !currentStep) return null;

  const missingTarget = !targetRect;

  return (
    <>
      {/* Scrim with spotlight cut-out */}
      <div
        aria-hidden="true"
        className="fixed inset-0 z-[999990] pointer-events-none"
      >
        {targetRect && (
          <div
            className="fixed rounded-xl border-2 border-isy-green-bright pointer-events-none"
            style={{
              top: `${targetRect.top - 6}px`,
              left: `${targetRect.left - 6}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
              boxShadow:
                "0 0 0 9999px rgba(0,0,0,0.52), 0 0 0 2px #2FA84F, 0 0 20px rgba(47,168,79,0.6)",
              transition: "all 0.25s ease-out",
            }}
          />
        )}
      </div>

      {/* Tooltip popover */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-step-title"
        aria-describedby="tour-step-desc"
        style={tooltipStyle}
        className="rounded-2xl border border-isy-line bg-white p-5 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200 ease-out"
      >
        {/* Header: progress + close */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Map className="h-3.5 w-3.5 text-isy-green-bright" aria-hidden="true" />
            <span className="text-[10px] font-bold text-isy-emerald">
              Langkah {currentStepIndex + 1} dari {totalSteps}
            </span>
          </div>
          {/* Step dot indicators */}
          <div className="flex items-center gap-1 flex-1 justify-center px-2" aria-hidden="true">
            {filteredSteps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === currentStepIndex
                    ? "w-4 bg-isy-emerald"
                    : i < currentStepIndex
                    ? "w-1.5 bg-isy-green-bright/60"
                    : "w-1.5 bg-isy-line"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-lg p-1 text-isy-text-secondary/60 hover:bg-isy-mist hover:text-isy-text-primary transition-colors flex-shrink-0"
            aria-label="Tutup panduan (Esc)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step content */}
        {missingTarget && (
          <p className="text-[11px] text-amber-600 bg-amber-50 px-2 py-1 rounded-lg mb-2 border border-amber-200">
            Elemen sedang tidak tersedia — lanjutkan ke langkah berikutnya.
          </p>
        )}
        <h4 id="tour-step-title" className="text-sm font-bold text-isy-emerald mb-1">
          {currentStep.title}
        </h4>
        <p id="tour-step-desc" className="text-xs text-isy-text-secondary leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-isy-line/60">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors ${
              currentStepIndex === 0
                ? "text-isy-text-secondary/30 cursor-not-allowed"
                : "text-isy-text-secondary hover:bg-isy-mist hover:text-isy-text-primary"
            }`}
            aria-label="Langkah sebelumnya"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-[11px] text-isy-text-secondary/60 hover:text-isy-text-secondary px-2 py-1.5 transition-colors"
            >
              Lewati
            </button>

            {currentStepIndex < filteredSteps.length - 1 ? (
              <button
                type="button"
                autoFocus
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-xl bg-isy-emerald px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
                aria-label="Langkah berikutnya"
              >
                <span>Lanjut</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                autoFocus
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-isy-green-bright px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-colors"
                aria-label="Selesaikan panduan"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
