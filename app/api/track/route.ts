/**
 * app/api/track/route.ts
 *
 * Telemetry endpoint for Optik I See You Photobooth & Virtual Try-On.
 * - Saves session & booking data partitioned by month (tryon/YYYY-MM/ & antrian/YYYY-MM/) in Cloudflare R2.
 * - Forwards live events to IMI (iseeyou-marketing-intelligence.vercel.app) for real-time dashboard analytics.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentYearMonth,
  writeJsonToR2,
  updateMonthlySummary,
  getMonthlySummary,
} from "@/lib/db/r2Analytics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IMI_TRACK_URL =
  process.env.IMI_API_URL ||
  "https://iseeyou-marketing-intelligence.vercel.app/api/track-event";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || getCurrentYearMonth();
    const summary = await getMonthlySummary(month);
    return NextResponse.json({ ok: true, summary }, { headers: corsHeaders() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error reading analytics";
    return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      type = "tryon_session",
      sessionId = `ses-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      visitorId = "anon",
      frameId,
      frameName,
      faceShape,
      channel,
      branch,
      customerName,
      customerPhone,
      bookingDate,
      bookingTime,
    } = body;

    const yearMonth = getCurrentYearMonth();
    const timestamp = new Date().toISOString();

    // 1. Save specific event record into Cloudflare R2 per month
    if (type === "antrian_booking") {
      const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const bookingRecord = {
        bookingId,
        sessionId,
        visitorId,
        branch: branch || "purwokerto",
        customerName: customerName || "Pelanggan",
        customerPhone: customerPhone || "-",
        bookingDate: bookingDate || "Hari Ini",
        bookingTime: bookingTime || "Siang",
        timestamp,
        yearMonth,
      };

      // Save to antrian/YYYY-MM/
      await writeJsonToR2(`antrian/${yearMonth}/${bookingId}.json`, bookingRecord);

      // Update monthly summary in R2
      await updateMonthlySummary((prev) => {
        prev.antrianBookings = (prev.antrianBookings || 0) + 1;
        const b = (branch || "purwokerto").toLowerCase();
        if (b.includes("clp") || b.includes("cilacap")) {
          prev.branches.cilacap = (prev.branches.cilacap || 0) + 1;
        } else if (b.includes("pbg") || b.includes("purbalingga")) {
          prev.branches.purbalingga = (prev.branches.purbalingga || 0) + 1;
        } else if (b.includes("wns") || b.includes("wonosobo")) {
          prev.branches.wonosobo = (prev.branches.wonosobo || 0) + 1;
        } else {
          prev.branches.purwokerto = (prev.branches.purwokerto || 0) + 1;
        }
      }, yearMonth);
    } else if (type === "photo_share") {
      // Photo share/download event
      await updateMonthlySummary((prev) => {
        prev.photosShared = (prev.photosShared || 0) + 1;
      }, yearMonth);
    } else {
      // Try-on session or frame selection event
      const sessionRecord = {
        sessionId,
        visitorId,
        type,
        frameId: frameId || "default",
        frameName: frameName || "Model Standar",
        faceShape: faceShape || "normal",
        channel: channel || "direct",
        timestamp,
        yearMonth,
      };

      // Save to tryon/YYYY-MM/sessions/
      await writeJsonToR2(`tryon/${yearMonth}/sessions/${sessionId}.json`, sessionRecord);

      // Update monthly summary in R2
      await updateMonthlySummary((prev) => {
        if (type === "tryon_session") {
          prev.totalSessions = (prev.totalSessions || 0) + 1;
          if (channel) {
            prev.acquisitionChannels[channel] = (prev.acquisitionChannels[channel] || 0) + 1;
          }
        }
        if (frameName) {
          if (!prev.topFrames[frameName]) {
            prev.topFrames[frameName] = { tryOnCount: 1, frameName };
          } else {
            prev.topFrames[frameName].tryOnCount += 1;
          }
        }
      }, yearMonth);
    }

    // 2. Forward telemetry to IMI (iseeyou-marketing-intelligence)
    try {
      const imiPayload = {
        eventType:
          type === "antrian_booking"
            ? "antrian_booking"
            : type === "photo_share"
            ? "photobooth_share"
            : "photobooth_tryon",
        branch: branch || "pwt",
        sourceUrl: "https://optikiseeyou.com",
        device: "mobile",
        frameName,
        sessionId,
        timestamp,
      };

      // Non-blocking fetch with 2.5s timeout to not slow down user
      fetch(IMI_TRACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imiPayload),
        signal: AbortSignal.timeout(2500),
      }).catch((err) => {
        console.warn("IMI webhook dispatch skipped:", err?.message || err);
      });
    } catch (imiErr) {
      console.warn("IMI sync skipped:", imiErr);
    }

    return NextResponse.json(
      {
        ok: true,
        type,
        month: yearMonth,
        timestamp,
      },
      { headers: corsHeaders() }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal telemetry error";
    console.error("Telemetry error:", err);
    return NextResponse.json({ ok: false, error: msg }, { status: 500, headers: corsHeaders() });
  }
}
