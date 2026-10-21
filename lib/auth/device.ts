/**
 * lib/auth/device.ts
 *
 * Utilitas untuk mengidentifikasi dan mem-parsing nama perangkat, sistem operasi,
 * dan browser dari User-Agent HTTP headers secara akurat dan manusiawi (human-readable).
 */

export interface ParsedDeviceInfo {
  device: string; // e.g. "Laptop (Windows 11) • Chrome"
  deviceType: "desktop" | "mobile" | "tablet" | "unknown";
  os: string; // e.g. "Windows 11", "macOS", "iOS", "Android"
  browser: string; // e.g. "Chrome 128", "Safari 17", "Edge"
  rawUserAgent?: string;
}

export function parseUserAgent(ua: string | null | undefined): ParsedDeviceInfo {
  if (!ua || typeof ua !== "string" || ua.trim() === "") {
    return {
      device: "Perangkat Tidak Dikenal",
      deviceType: "unknown",
      os: "Unknown OS",
      browser: "Unknown Browser",
    };
  }

  const u = ua.toLowerCase();

  // ── 1. Detect Device Type & OS ───────────────────────────────────────────
  let os = "Unknown OS";
  let deviceType: "desktop" | "mobile" | "tablet" | "unknown" = "desktop";
  let deviceCategory = "Laptop / PC";

  if (u.includes("iphone")) {
    deviceType = "mobile";
    deviceCategory = "HP iPhone";
    const match = ua.match(/iPhone OS ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, ".") : "";
    os = version ? `iOS ${version}` : "iOS";
  } else if (u.includes("ipad")) {
    deviceType = "tablet";
    deviceCategory = "Tablet iPad";
    const match = ua.match(/CPU OS ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, ".") : "";
    os = version ? `iPadOS ${version}` : "iPadOS";
  } else if (u.includes("android")) {
    const isTablet = !u.includes("mobile");
    deviceType = isTablet ? "tablet" : "mobile";
    deviceCategory = isTablet ? "Tablet Android" : "HP Android";

    // Detect brand / model if present
    const brandMatch = ua.match(/Android[^;]+;\s*([^;)]+)\s*\)/);
    let brand = "";
    if (brandMatch && brandMatch[1]) {
      const rawModel = brandMatch[1].trim();
      if (!rawModel.toLowerCase().includes("wv") && !rawModel.toLowerCase().includes("build")) {
        brand = ` (${rawModel})`;
      }
    }
    const verMatch = ua.match(/Android\s+([\d.]+)/);
    const ver = verMatch ? ` ${verMatch[1]}` : "";
    os = `Android${ver}${brand}`;
  } else if (u.includes("windows nt 10.0") || u.includes("windows nt 11.0")) {
    deviceType = "desktop";
    deviceCategory = "Laptop (Windows)";
    os = "Windows 11/10";
  } else if (u.includes("windows nt 6.3")) {
    deviceType = "desktop";
    deviceCategory = "Laptop (Windows)";
    os = "Windows 8.1";
  } else if (u.includes("windows nt 6.1")) {
    deviceType = "desktop";
    deviceCategory = "Laptop (Windows)";
    os = "Windows 7";
  } else if (u.includes("windows")) {
    deviceType = "desktop";
    deviceCategory = "Laptop (Windows)";
    os = "Windows";
  } else if (u.includes("macintosh") || u.includes("mac os x")) {
    deviceType = "desktop";
    deviceCategory = "MacBook / Mac";
    const match = ua.match(/Mac OS X ([\d_]+)/);
    const version = match ? match[1].replace(/_/g, ".") : "";
    os = version ? `macOS ${version}` : "macOS";
  } else if (u.includes("cros")) {
    deviceType = "desktop";
    deviceCategory = "Chromebook";
    os = "ChromeOS";
  } else if (u.includes("linux")) {
    deviceType = "desktop";
    deviceCategory = "PC Linux";
    os = "Linux";
  }

  // ── 2. Detect Browser ───────────────────────────────────────────────────
  let browser = "Browser";

  if (u.includes("edg/")) {
    const match = ua.match(/Edg\/([\d.]+)/);
    browser = match ? `Edge ${match[1].split(".")[0]}` : "Microsoft Edge";
  } else if (u.includes("opr/") || u.includes("opera/")) {
    browser = "Opera";
  } else if (u.includes("samsungbrowser/")) {
    browser = "Samsung Internet";
  } else if (u.includes("chrome/") && !u.includes("chromium/")) {
    const match = ua.match(/Chrome\/([\d.]+)/);
    browser = match ? `Chrome ${match[1].split(".")[0]}` : "Google Chrome";
  } else if (u.includes("firefox/")) {
    const match = ua.match(/Firefox\/([\d.]+)/);
    browser = match ? `Firefox ${match[1].split(".")[0]}` : "Mozilla Firefox";
  } else if (u.includes("safari/") && !u.includes("chrome/")) {
    const match = ua.match(/Version\/([\d.]+)/);
    browser = match ? `Safari ${match[1].split(".")[0]}` : "Safari";
  }

  // ── 3. Combined Friendly Name ───────────────────────────────────────────
  // Format contoh:
  // "Laptop (Windows 11/10) • Chrome 128"
  // "MacBook (macOS) • Safari 17"
  // "HP iPhone (iOS 17.5) • Safari"
  // "HP Android • Chrome 128"
  const device = `${deviceCategory} • ${browser}`;

  return {
    device,
    deviceType,
    os,
    browser,
    rawUserAgent: ua,
  };
}
