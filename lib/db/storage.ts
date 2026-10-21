import fs from "fs";
import path from "path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, isR2Configured } from "@/lib/r2Client";

export const STORE_DIR = path.join(process.cwd(), "data", "store");

function getStorageBucket(): string {
  return (
    process.env.R2_BUCKET_NAME?.trim() ||
    process.env.R2_SPONSOR_BUCKET_NAME?.trim() ||
    "iseeyou-photobooth-photos"
  );
}

/**
 * Read persistent JSON data from Cloudflare R2 (production) or local store (development).
 */
export async function readStore<T>(collectionName: string, defaultValue: T): Promise<T> {
  const r2Key = `db/${collectionName}.json`;
  const localFile = path.join(STORE_DIR, `${collectionName}.json`);

  // 1. Try reading from Cloudflare R2
  if (isR2Configured()) {
    try {
      const client = getR2Client();
      const cmd = new GetObjectCommand({
        Bucket: getStorageBucket(),
        Key: r2Key,
      });
      const res = await client.send(cmd);
      const body = await res.Body?.transformToString();
      if (body) {
        return JSON.parse(body) as T;
      }
    } catch (r2Err: any) {
      if (r2Err.name !== "NoSuchKey" && r2Err.Code !== "NoSuchKey") {
        console.warn(`R2 store read failed for ${collectionName}:`, r2Err.message);
      }
    }
  }

  // 2. Fallback to local filesystem
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    if (!fs.existsSync(localFile)) {
      // Write default value initially
      fs.writeFileSync(localFile, JSON.stringify(defaultValue, null, 2), "utf-8");
      return defaultValue;
    }
    const raw = fs.readFileSync(localFile, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading local store for ${collectionName}:`, err);
    return defaultValue;
  }
}

/**
 * Write persistent JSON data to Cloudflare R2 (production) and local store (development).
 */
export async function writeStore<T>(collectionName: string, data: T): Promise<void> {
  const jsonContent = JSON.stringify(data, null, 2);
  const r2Key = `db/${collectionName}.json`;
  const localFile = path.join(STORE_DIR, `${collectionName}.json`);

  // 1. Save to Cloudflare R2
  if (isR2Configured()) {
    try {
      const client = getR2Client();
      const cmd = new PutObjectCommand({
        Bucket: getStorageBucket(),
        Key: r2Key,
        Body: jsonContent,
        ContentType: "application/json",
      });
      await client.send(cmd);
    } catch (r2Err: any) {
      console.error(`R2 store write failed for ${collectionName}:`, r2Err.message);
    }
  }

  // 2. Save to local filesystem
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(localFile, jsonContent, "utf-8");
  } catch {
    // Expected on read-only environments
  }
}
