import { PromoCategory, PromoItem, PromoPopupSettings } from "./db/types";

export const DEFAULT_PROMO_POPUP_SETTINGS: PromoPopupSettings = {
  enabled: true,
  frequency: "once-per-session",
  delayMs: 1500,
  layout: "image-left",
  updatedAt: new Date().toISOString(),
};

export const PROMO_CATEGORIES: { id: PromoCategory; label: string; desc: string }[] = [
  { id: "weekly", label: "Promo Mingguan", desc: "Penawaran terbatas yang berganti setiap minggu" },
  { id: "monthly", label: "Promo Bulanan", desc: "Program promo utama untuk bulan berjalan" },
  { id: "special", label: "Promo Spesial", desc: "Promo event khusus, hari raya, dan kolaborasi" },
];

export function getCategoryLabel(category: PromoCategory): string {
  switch (category) {
    case "weekly":
      return "Promo Mingguan";
    case "monthly":
      return "Promo Bulanan";
    case "special":
      return "Promo Spesial";
    default:
      return "Promo";
  }
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

/**
 * Checks if a promo is currently active for public display.
 * Requires:
 * 1. status is 'published'
 * 2. startAt <= now (in Asia/Jakarta time or ISO comparison)
 * 3. endAt is undefined/null or now <= endAt
 */
export function isPromoActive(promo: PromoItem, refDate: Date = new Date()): boolean {
  if (promo.status !== "published") return false;

  const refTime = refDate.getTime();
  const startTime = new Date(promo.startAt).getTime();
  if (isNaN(startTime) || refTime < startTime) return false;

  if (promo.endAt) {
    const endTime = new Date(promo.endAt).getTime();
    if (!isNaN(endTime) && refTime > endTime) return false;
  }

  return true;
}

export type PromoDisplayStatus = "active" | "scheduled" | "expired" | "draft" | "archived";

export function getPromoDisplayStatus(
  promo: PromoItem,
  refDate: Date = new Date()
): PromoDisplayStatus {
  if (promo.status === "draft") return "draft";
  if (promo.status === "archived") return "archived";

  const refTime = refDate.getTime();
  const startTime = new Date(promo.startAt).getTime();
  if (!isNaN(startTime) && refTime < startTime) return "scheduled";

  if (promo.endAt) {
    const endTime = new Date(promo.endAt).getTime();
    if (!isNaN(endTime) && refTime > endTime) return "expired";
  }

  return "active";
}

export function formatPromoDate(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatPromoDateTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Jakarta",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date) + " WIB";
  } catch {
    return dateString;
  }
}

export function formatPromoPeriod(startAt: string, endAt?: string): string {
  if (!startAt) return "";
  const startFmt = formatPromoDate(startAt);
  if (!endAt) return `Mulai ${startFmt}`;
  const endFmt = formatPromoDate(endAt);
  return `${startFmt} – ${endFmt}`;
}

/**
 * Returns the full URL to the promo microsite.
 * In production or on optikiseeyou.com, points directly to https://promo.optikiseeyou.com
 */
export function getPromoSubdomainUrl(slug?: string): string {
  const isProd =
    process.env.NODE_ENV === "production" ||
    (typeof window !== "undefined" &&
      window.location.hostname.includes("optikiseeyou.com"));

  if (isProd) {
    return slug
      ? `https://promo.optikiseeyou.com/${slug}`
      : "https://promo.optikiseeyou.com";
  }

  return slug ? `/promo/${slug}` : "/promo";
}
