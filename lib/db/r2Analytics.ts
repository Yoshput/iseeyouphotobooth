/**
 * lib/db/r2Analytics.ts
 *
 * Cloudflare R2 Storage Manager for Photobooth, Virtual Try-On, and Antrian Analytics.
 * Groups data by month (YYYY-MM) in R2 bucket 'iseeyou-photobooth-photos'.
 */

import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, R2_BUCKET_NAME, isR2Configured } from "@/lib/r2Client";

export interface MonthlyAnalyticsSummary {
  month: string; // "2026-11"
  totalSessions: number;
  uniqueVisitors: number;
  photosShared: number;
  antrianBookings: number;
  branches: {
    purwokerto: number;
    cilacap: number;
    purbalingga: number;
    wonosobo: number;
  };
  topFrames: Record<string, { tryOnCount: number; frameName: string }>;
  acquisitionChannels: Record<string, number>;
  lastUpdated: string;
}

export function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export async function writeJsonToR2(key: string, data: unknown): Promise<boolean> {
  if (!isR2Configured()) return false;
  try {
    const s3 = getR2Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: Buffer.from(JSON.stringify(data, null, 2)),
      ContentType: "application/json",
      CacheControl: "no-cache",
    });
    await s3.send(command);
    return true;
  } catch (err) {
    console.warn(`R2 write JSON error for key ${key}:`, err);
    return false;
  }
}

export async function readJsonFromR2<T>(key: string): Promise<T | null> {
  if (!isR2Configured()) return null;
  try {
    const s3 = getR2Client();
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });
    const res = await s3.send(command);
    const text = await res.Body?.transformToString();
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function getMonthlySummary(month?: string): Promise<MonthlyAnalyticsSummary> {
  const targetMonth = month || getCurrentYearMonth();
  const key = `tryon/${targetMonth}/summary.json`;

  const existing = await readJsonFromR2<MonthlyAnalyticsSummary>(key);
  if (existing) return existing;

  return {
    month: targetMonth,
    totalSessions: 0,
    uniqueVisitors: 0,
    photosShared: 0,
    antrianBookings: 0,
    branches: {
      purwokerto: 0,
      cilacap: 0,
      purbalingga: 0,
      wonosobo: 0,
    },
    topFrames: {},
    acquisitionChannels: {},
    lastUpdated: new Date().toISOString(),
  };
}

export async function updateMonthlySummary(
  updater: (prev: MonthlyAnalyticsSummary) => void,
  month?: string
): Promise<MonthlyAnalyticsSummary> {
  const targetMonth = month || getCurrentYearMonth();
  const summary = await getMonthlySummary(targetMonth);

  updater(summary);
  summary.lastUpdated = new Date().toISOString();

  const key = `tryon/${targetMonth}/summary.json`;
  await writeJsonToR2(key, summary);

  return summary;
}
