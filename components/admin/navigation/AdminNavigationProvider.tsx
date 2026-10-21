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
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPathnameRef = useRef<string>(pathname);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const resetNavigation = useCallback(() => {
    clearWatchdog();
    setPhase("idle");
    setStatusMessage("");
    finishTopProgress();
  }, [clearWatchdog]);

  const markReady = useCallback(() => {
    clearWatchdog();
    setPhase("revealing");
    finishTopProgress();
    // Quick exit after brief reveal
    const timer = setTimeout(() => {
      setPhase("idle");
      setStatusMessage("");
    }, 250);
    return () => clearTimeout(timer);
  }, [clearWatchdog]);

  const startAuth = useCallback((customMessage?: string) => {
    setPhase("authenticating");
    setStatusMessage(customMessage || "Memverifikasi akses admin...");
    startTopProgress();
  }, []);

  const markRedirecting = useCallback(
    (destination?: string, customMessage?: string) => {
      clearWatchdog();
      setPhase("redirecting");
      setStatusMessage(customMessage || "Mempersiapkan dashboard...");
      startTopProgress();

      // Safety watchdog: after 9 seconds if still not ready, surface actionable recovery
      watchdogTimerRef.current = setTimeout(() => {
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
      if (destination === pathname) {
        return;
      }
      clearWatchdog();
      setPhase("loading-route");
      setStatusMessage(customMessage || "Memuat konten halaman...");
      startTopProgress();

      watchdogTimerRef.current = setTimeout(() => {
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

  // Automatically detect route changes and resolve loading states
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (phase === "loading-route" || phase === "redirecting") {
        markReady();
      }
    }
  }, [pathname, phase, markReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearWatchdog();
  }, [clearWatchdog]);

  const isNavigating = phase !== "idle" && phase !== "revealing";

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

export function useAdminNavigation() {
  const context = useContext(AdminNavigationContext);
  if (!context) {
    // Graceful fallback for non-provider components
    return {
      phase: "idle" as NavigationPhase,
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
