/**
 * lib/telemetry.ts
 *
 * Client-side Telemetry Dispatcher for Optik I See You.
 * Sends user actions to both the local /api/track endpoint (which writes to Cloudflare R2 per month)
 * and directly to iseeyou-marketing-intelligence.vercel.app for real-time dashboard updates.
 */

function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let vid = localStorage.getItem("isy_vid");
    if (!vid) {
      vid = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem("isy_vid", vid);
    }
    return vid;
  } catch {
    return "anon";
  }
}

function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = sessionStorage.getItem("isy_sid");
    if (!sid) {
      sid = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      sessionStorage.setItem("isy_sid", sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

function detectChannel(): string {
  if (typeof window === "undefined") return "direct";
  const ref = document.referrer.toLowerCase();
  if (ref.includes("instagram.com")) return "Instagram Bio Link";
  if (ref.includes("tiktok.com")) return "TikTok Bio Link";
  if (ref.includes("google.com")) return "Google Search Organik";
  if (window.location.search.includes("src=qr") || window.location.search.includes("source=store")) {
    return "QR Code Booth Display di 4 Store";
  }
  return "Direct / Organik";
}

/**
 * Track an Antrian Cek Mata booking event when the customer submits the booking form.
 */
export async function trackAntrianBooking(data: {
  branch: string;
  customerName: string;
  customerPhone?: string;
  bookingDate?: string;
  bookingTime?: string;
}): Promise<void> {
  const payload = {
    type: "antrian_booking",
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    channel: detectChannel(),
    ...data,
  };

  try {
    // 1. Post to local photobooth API (which saves to Cloudflare R2 antrian/YYYY-MM/)
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    // 2. Direct ping to IMI for instant dashboard update
    fetch("https://iseeyou-marketing-intelligence.vercel.app/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "antrian_booking",
        branch: data.branch,
        sourceUrl: typeof window !== "undefined" ? window.location.href : "https://optikiseeyou.com",
        device: "mobile",
        customerName: data.customerName,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Graceful fallback
  }
}

/**
 * Track Virtual Try-On frame trial or session start
 */
export async function trackTryOn(frameName?: string, faceShape?: string): Promise<void> {
  const payload = {
    type: "tryon_session",
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    channel: detectChannel(),
    frameName: frameName || "Model Standar",
    faceShape: faceShape || "normal",
  };

  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Graceful fallback
  }
}

/**
 * Track photo download or social share
 */
export async function trackPhotoShare(photoId?: string): Promise<void> {
  const payload = {
    type: "photo_share",
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    photoId,
  };

  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});

    fetch("https://iseeyou-marketing-intelligence.vercel.app/api/track-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "photobooth_share",
        sourceUrl: typeof window !== "undefined" ? window.location.href : "https://optikiseeyou.com",
        device: "mobile",
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Graceful fallback
  }
}
