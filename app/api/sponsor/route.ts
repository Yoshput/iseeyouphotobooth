import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, isR2Configured } from "@/lib/r2Client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface SponsorshipItem {
  id: string;
  nama: string;
  instansi: string;
  whatsapp: string;
  email: string;
  cabang: string;
  namaKegiatan: string;
  tanggalKegiatan: string;
  targetPeserta: string;
  resumeKegiatan: string;
  bentukSponsor: string[];
  proposalUrl: string;
  status: "Menunggu Review" | "Dalam Proses" | "Disetujui" | "Ditolak";
  catatanInternal?: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "sponsorships.json");
const R2_DB_KEY = "data/sponsorships.json";

function getSponsorBucket(): string {
  return process.env.R2_SPONSOR_BUCKET_NAME?.trim() || "isy-sponsor-storage";
}

// Helper to read sponsorships from Cloudflare R2 or local fallback
async function readSponsorships(): Promise<SponsorshipItem[]> {
  // 1. Primary: Read from Cloudflare R2 (persistent across all Vercel serverless instances)
  if (isR2Configured()) {
    try {
      const client = getR2Client();
      const cmd = new GetObjectCommand({
        Bucket: getSponsorBucket(),
        Key: R2_DB_KEY,
      });
      const res = await client.send(cmd);
      const text = await res.Body?.transformToString();
      if (text) {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (r2Err: any) {
      if (r2Err.name === "NoSuchKey" || r2Err.Code === "NoSuchKey") {
        return [];
      }
      console.warn("R2 database read failed, falling back to local file:", r2Err.message);
    }
  }

  // 2. Fallback: Local filesystem for development
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading local sponsorships.json:", err);
    return [];
  }
}

// Helper to write sponsorships to Cloudflare R2 and local fallback
async function writeSponsorships(items: SponsorshipItem[]): Promise<void> {
  const jsonContent = JSON.stringify(items, null, 2);

  // 1. Primary: Save to Cloudflare R2
  if (isR2Configured()) {
    try {
      const client = getR2Client();
      const cmd = new PutObjectCommand({
        Bucket: getSponsorBucket(),
        Key: R2_DB_KEY,
        Body: jsonContent,
        ContentType: "application/json",
      });
      await client.send(cmd);
    } catch (r2Err: any) {
      console.error("R2 database write failed:", r2Err.message);
    }
  }

  // 2. Fallback: Local file
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, jsonContent, "utf-8");
  } catch {
    // Expected on Vercel read-only filesystem
  }
}

// Optional sync to Google Sheets via Webhook URL if configured
async function syncToGoogleSheet(item: SponsorshipItem) {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        timestamp: item.createdAt,
        nama: item.nama,
        instansi: item.instansi,
        whatsapp: item.whatsapp,
        email: item.email,
        cabang: item.cabang,
        namaKegiatan: item.namaKegiatan,
        tanggalKegiatan: item.tanggalKegiatan,
        targetPeserta: item.targetPeserta,
        bentukSponsor: item.bentukSponsor.join(", "),
        resumeKegiatan: item.resumeKegiatan,
        proposalUrl: item.proposalUrl,
        status: item.status,
      }),
    });
  } catch (e) {
    console.warn("Failed to sync to Google Sheet webhook:", e);
  }
}

// GET: Fetch all sponsorships
export async function GET() {
  const items = await readSponsorships();
  // Return descending by creation date
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ success: true, data: items });
}

// POST: Submit a new sponsorship proposal
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nama,
      instansi,
      whatsapp,
      email,
      cabang,
      namaKegiatan,
      tanggalKegiatan,
      targetPeserta,
      resumeKegiatan,
      bentukSponsor,
      proposalUrl,
    } = body;

    if (!nama || !instansi || !whatsapp || !namaKegiatan) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi semua kolom yang wajib diisi." },
        { status: 400 }
      );
    }

    const id = `SPN-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newItem: SponsorshipItem = {
      id,
      nama: String(nama).trim(),
      instansi: String(instansi).trim(),
      whatsapp: String(whatsapp).trim(),
      email: String(email || "").trim(),
      cabang: String(cabang || "Semua Cabang").trim(),
      namaKegiatan: String(namaKegiatan).trim(),
      tanggalKegiatan: String(tanggalKegiatan || "").trim(),
      targetPeserta: String(targetPeserta || "-").trim(),
      resumeKegiatan: String(resumeKegiatan || "").trim(),
      bentukSponsor: Array.isArray(bentukSponsor) ? bentukSponsor : [],
      proposalUrl: String(proposalUrl || "").trim(),
      status: "Menunggu Review",
      createdAt: new Date().toISOString(),
    };

    const currentItems = await readSponsorships();
    currentItems.unshift(newItem);
    await writeSponsorships(currentItems);

    // Asynchronously sync to Google Sheets if configured
    syncToGoogleSheet(newItem).catch(() => {});

    return NextResponse.json({
      success: true,
      message: "Proposal berhasil diajukan",
      data: newItem,
    });
  } catch (err) {
    console.error("Error in POST /api/sponsor:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses pengajuan sponsor" },
      { status: 500 }
    );
  }
}

// PATCH: Update proposal status or internal notes
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, catatanInternal } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID proposal diperlukan" },
        { status: 400 }
      );
    }

    const items = await readSponsorships();
    const index = items.findIndex((i) => i.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Proposal tidak ditemukan" },
        { status: 404 }
      );
    }

    if (status) items[index].status = status;
    if (catatanInternal !== undefined)
      items[index].catatanInternal = catatanInternal;

    await writeSponsorships(items);

    return NextResponse.json({
      success: true,
      message: "Data proposal berhasil diperbarui",
      data: items[index],
    });
  } catch (err) {
    console.error("Error in PATCH /api/sponsor:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status proposal" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a proposal record
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID proposal diperlukan" },
        { status: 400 }
      );
    }

    const items = await readSponsorships();
    const filtered = items.filter((i) => i.id !== id);
    await writeSponsorships(filtered);

    return NextResponse.json({
      success: true,
      message: "Proposal berhasil dihapus",
    });
  } catch (err) {
    console.error("Error in DELETE /api/sponsor:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus proposal" },
      { status: 500 }
    );
  }
}
