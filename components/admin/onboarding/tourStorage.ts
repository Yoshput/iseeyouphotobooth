export type TourStatus = "never_started" | "started" | "completed" | "skipped";

const STORAGE_PREFIX = "isy_cms_tour_v1:";

export function getTourStatus(userId?: string): TourStatus {
  if (typeof window === "undefined" || !userId) {
    return "completed"; // Server-side or unauthenticated fallback
  }

  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    const value = window.localStorage.getItem(key);
    if (!value) {
      return "never_started";
    }
    if (
      value === "never_started" ||
      value === "started" ||
      value === "completed" ||
      value === "skipped"
    ) {
      return value;
    }
    return "never_started";
  } catch (err) {
    console.warn("localStorage unavailable for tour status:", err);
    return "completed";
  }
}

export function setTourStatus(userId: string, status: TourStatus): void {
  if (typeof window === "undefined" || !userId) return;

  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    window.localStorage.setItem(key, status);
  } catch (err) {
    console.warn("Unable to save tour status to localStorage:", err);
  }
}

export function resetTourStatus(userId: string): void {
  if (typeof window === "undefined" || !userId) return;

  try {
    const key = `${STORAGE_PREFIX}${userId}`;
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn("Unable to reset tour status:", err);
  }
}
