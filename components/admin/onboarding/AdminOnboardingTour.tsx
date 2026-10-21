"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  X,
  Compass,
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
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Filter steps based on current user role
  const filteredSteps = TOUR_STEPS.filter((step) => {
    if (!step.roles) return true;
    return step.roles.includes(userRole);
  });

  const currentStep: TourStep | undefined = filteredSteps[currentStepIndex];

  // Check if first-run tour should display
  useEffect(() => {
    if (!userId) return;
    const status = getTourStatus(userId);
    if (status === "never_started") {
      // Small timeout to allow initial page hydration to settle
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [userId]);

  // Listen to manual replay request from AdminHeader
  useEffect(() => {
    const handleReplay = () => {
      setShowWelcome(false);
      setCurrentStepIndex(0);
      setIsActive(true);
    };

    window.addEventListener("admin:start-tour", handleReplay);
    return () => window.removeEventListener("admin:start-tour", handleReplay);
  }, []);

  // Update target rect and tooltip position
  const updatePosition = useCallback(() => {
    if (!isActive || !currentStep) return;

    // Check if sidebar needs to be open on mobile
    if (currentStep.requiresSidebarOpen && window.innerWidth < 1024) {
      if (onOpenSidebar) onOpenSidebar();
      window.dispatchEvent(new CustomEvent("admin:open-sidebar"));
    }

    const element = document.querySelector(currentStep.target);
    if (!element) {
      setTargetRect(null);
      return;
    }

    // Scroll element into view smoothly if offscreen
    element.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });

    const rect = element.getBoundingClientRect();
    setTargetRect(rect);

    // Compute tooltip coordinates
    const tooltipWidth = Math.min(340, window.innerWidth - 32);
    const padding = 12;

    let top = 0;
    let left = 0;

    const placement = currentStep.placement || "bottom";

    if (placement === "bottom") {
      top = rect.bottom + padding;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else if (placement === "right") {
      top = rect.top + rect.height / 2 - 60;
      left = rect.right + padding;
    } else if (placement === "top") {
      top = rect.top - 140;
      left = rect.left + rect.width / 2 - tooltipWidth / 2;
    } else {
      top = rect.bottom + padding;
      left = rect.left;
    }

    // Viewport bounds clamp
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) {
      left = window.innerWidth - tooltipWidth - 16;
    }
    if (top < 16) top = rect.bottom + padding;
    if (top + 160 > window.innerHeight) {
      top = Math.max(16, rect.top - 150);
    }

    setTooltipStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
      zIndex: 999999,
    });
  }, [isActive, currentStep, onOpenSidebar]);

  useEffect(() => {
    if (isActive) {
      updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleResize, { capture: true });
      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleResize, { capture: true });
      };
    }
  }, [isActive, currentStepIndex, updatePosition]);

  // Keyboard navigation: Escape to skip, ArrowRight to next, ArrowLeft to prev
  useEffect(() => {
    if (!isActive && !showWelcome) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      } else if (isActive && e.key === "ArrowRight") {
        handleNext();
      } else if (isActive && e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, showWelcome, currentStepIndex]);

  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStepIndex(0);
    setIsActive(true);
    if (userId) setTourStatus(userId, "started");
  };

  const handleSkip = () => {
    setShowWelcome(false);
    setIsActive(false);
    if (onCloseSidebar && window.innerWidth < 1024) onCloseSidebar();
    if (userId) setTourStatus(userId, "skipped");
  };

  const handleFinish = () => {
    setIsActive(false);
    if (onCloseSidebar && window.innerWidth < 1024) onCloseSidebar();
    if (userId) setTourStatus(userId, "completed");
  };

  const handleNext = () => {
    if (currentStepIndex < filteredSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  // 1. Welcome Modal
  if (showWelcome) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-welcome-title"
        className="fixed inset-0 z-[999998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in-50 duration-200"
      >
        <div className="w-full max-w-md rounded-3xl border border-isy-line bg-white p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-isy-mist text-isy-emerald border border-isy-line shadow-xs">
              <Compass className="h-7 w-7 text-isy-green-bright animate-spin [animation-duration:12s]" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-1 text-xs font-bold text-isy-emerald border border-isy-line">
              <Sparkles className="h-3.5 w-3.5 text-isy-green-bright" />
              <span>Panduan Fitur Panel Admin</span>
            </div>
            <h3
              id="tour-welcome-title"
              className="text-lg sm:text-xl font-extrabold text-isy-emerald pt-1"
            >
              Selamat Datang di I See You CMS
            </h3>
            <p className="text-xs sm:text-sm text-isy-text-secondary leading-relaxed">
              Kelola katalog kacamata, softlens, artikel blog, dan informasi
              website resmi Optik I See You dari satu panel terpusat. Ikuti tur
              singkat untuk mengenali fungsi penting.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleStartTour}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-isy-emerald px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-isy-emerald-hover transition-colors"
            >
              <span>Mulai Panduan</span>
              <ArrowRight className="h-4 w-4" />
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

  // 2. Active Spotlight Tour
  if (!isActive || !currentStep) return null;

  return (
    <>
      {/* Dimmed Backdrop & Spotlight Cut-Out */}
      <div
        className="fixed inset-0 z-[999990] pointer-events-none transition-all duration-200"
        aria-hidden="true"
      >
        {targetRect && (
          <div
            className="fixed rounded-2xl border-2 border-isy-green-bright pointer-events-none transition-all duration-300 ease-out"
            style={{
              top: `${targetRect.top - 6}px`,
              left: `${targetRect.left - 6}px`,
              width: `${targetRect.width + 12}px`,
              height: `${targetRect.height + 12}px`,
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 20px rgba(47, 168, 79, 0.7)",
            }}
          />
        )}
      </div>

      {/* Floating Contextual Tooltip Popover */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={currentStep.title}
        style={tooltipStyle}
        className="rounded-2xl border border-isy-line bg-white p-5 shadow-2xl transition-all duration-200 animate-in fade-in-50 zoom-in-95 ease-out"
      >
        {/* Header: Progress Fraction & Close Button */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="rounded-full bg-isy-mist px-2.5 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line">
            Langkah {currentStepIndex + 1} dari {filteredSteps.length}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="rounded-lg p-1 text-isy-text-secondary hover:bg-isy-mist hover:text-isy-emerald transition-colors"
            title="Tutup panduan (Esc)"
            aria-label="Tutup panduan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Content */}
        <h4 className="text-sm font-bold text-isy-emerald mb-1">
          {currentStep.title}
        </h4>
        <p className="text-xs text-isy-text-secondary leading-relaxed mb-4">
          {currentStep.description}
        </p>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-isy-line/60">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-isy-text-secondary hover:bg-isy-mist transition-colors ${
              currentStepIndex === 0 ? "opacity-30 cursor-not-allowed" : ""
            }`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="text-xs text-isy-text-secondary/70 hover:text-isy-text-secondary px-2 py-1"
            >
              Lewati
            </button>

            {currentStepIndex < filteredSteps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-xl bg-isy-emerald px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
              >
                <span>Lanjut</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center gap-1.5 rounded-xl bg-isy-green-bright px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-600 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Selesai</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
