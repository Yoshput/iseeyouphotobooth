"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { startTopProgress, finishTopProgress } from "@/components/ui/TopProgressBar";

export type NavigationPhase =
  | "idle"
  | "authenticating"
  | "redirecting"
  | "loading-route"
  | "revealing"
  | "error";

interface AdminNavigationContextType {
  phase: NavigationPhase;
  statusMessage: string;
  isNavigating: boolean;
  startAuth: (customMessage?: string) => void;
  markRedirecting: (destination?: string, customMessage?: string) => void;
  startNavigation: (destination: string, customMessage?: string) => void;
  markReady: () => void;
  failNavigation: (errorMessage: string) => void;
  resetNavigation: () => void;
}

const AdminNavigationContext = createContext<AdminNavigationContextType | undefined>(
  undefined
);

export function AdminNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<NavigationPhase>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  // Use ref for watchdog timer — prevents stale closure issues
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Use ref for reveal exit timer — prevents leak on fast unmount
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track previous pathname with ref, not state — avoids render cycle
  const prevPathnameRef = useRef<string>(pathname);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current !== null) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (revealTimerRef.current !== null) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  const resetNavigation = useCallback(() => {
    clearWatchdog();
    setPhase("idle");
    setStatusMessage("");
    finishTopProgress();
  }, [clearWatchdog]);

  // FIX: markReady does NOT return cleanup — caller never uses it.
  // Instead manage the reveal timer via ref for safe cleanup.
  const markReady = useCallback(() => {
    clearWatchdog();
    setPhase("revealing");
    finishTopProgress();
    revealTimerRef.current = setTimeout(() => {
      setPhase("idle");
      setStatusMessage("");
      revealTimerRef.current = null;
    }, 240);
  }, [clearWatchdog]);

  const startAuth = useCallback((customMessage?: string) => {
    clearWatchdog();
    setPhase("authenticating");
    setStatusMessage(customMessage || "Memverifikasi akses admin...");
    startTopProgress();
  }, [clearWatchdog]);

  const markRedirecting = useCallback(
    (destination?: string, customMessage?: string) => {
      clearWatchdog();
      setPhase("redirecting");
      setStatusMessage(customMessage || "Mempersiapkan dashboard...");
      startTopProgress();

      // Watchdog: 9 seconds max — then surface actionable error, never silently hide
      watchdogTimerRef.current = setTimeout(() => {
        watchdogTimerRef.current = null;
        setPhase("error");
        setStatusMessage(
          "Proses memuat membutuhkan waktu lebih lama dari biasanya. Silakan muat ulang halaman."
        );
      }, 9000);

      if (destination) {
        router.push(destination);
      }
    },
    [clearWatchdog, router]
  );

  const startNavigation = useCallback(
    (destination: string, customMessage?: string) => {
      if (destination === pathname) return;
      clearWatchdog();
      setPhase("loading-route");
      setStatusMessage(customMessage || "Memuat konten halaman...");
      startTopProgress();

      watchdogTimerRef.current = setTimeout(() => {
        watchdogTimerRef.current = null;
        setPhase("error");
        setStatusMessage("Gagal memuat rute tepat waktu. Silakan coba lagi.");
      }, 8000);

      router.push(destination);
    },
    [clearWatchdog, pathname, router]
  );

  const failNavigation = useCallback(
    (errorMessage: string) => {
      clearWatchdog();
      setPhase("error");
      setStatusMessage(errorMessage);
      finishTopProgress();
    },
    [clearWatchdog]
  );

  // Route change detection — resolves loading state when pathname actually changes
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      // Read phase directly from ref-captured closure won't work with state,
      // so we use a functional setState pattern
      setPhase((currentPhase) => {
        if (currentPhase === "loading-route" || currentPhase === "redirecting") {
          clearWatchdog();
          finishTopProgress();
          // Trigger reveal cycle
          revealTimerRef.current = setTimeout(() => {
            setPhase("idle");
            setStatusMessage("");
            revealTimerRef.current = null;
          }, 240);
          return "revealing";
        }
        return currentPhase;
      });
    }
  }, [pathname, clearWatchdog]);

  // Hard cleanup on unmount
  useEffect(() => {
    return () => clearWatchdog();
  }, [clearWatchdog]);

  const isNavigating =
    phase === "authenticating" ||
    phase === "redirecting" ||
    phase === "loading-route";

  return (
    <AdminNavigationContext.Provider
      value={{
        phase,
        statusMessage,
        isNavigating,
        startAuth,
        markRedirecting,
        startNavigation,
        markReady,
        failNavigation,
        resetNavigation,
      }}
    >
      {children}
    </AdminNavigationContext.Provider>
  );
}

export function useAdminNavigation(): AdminNavigationContextType {
  const context = useContext(AdminNavigationContext);
  if (!context) {
    // Safe no-op fallback — never throws in disconnected components
    return {
      phase: "idle",
      statusMessage: "",
      isNavigating: false,
      startAuth: () => {},
      markRedirecting: () => {},
      startNavigation: () => {},
      markReady: () => {},
      failNavigation: () => {},
      resetNavigation: () => {},
    };
  }
  return context;
}
