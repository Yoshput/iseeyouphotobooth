import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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

// Helper to ensure data file exists and read contents safely
function readSponsorships(): SponsorshipItem[] {
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
    console.error("Error reading sponsorships.json:", err);
    return [];
  }
}

// Helper to write contents safely
function writeSponsorships(items: SponsorshipItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing sponsorships.json:", err);
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
  const items = readSponsorships();
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

    const currentItems = readSponsorships();
    currentItems.unshift(newItem);
    writeSponsorships(currentItems);

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

    const items = readSponsorships();
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

    writeSponsorships(items);

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

    const items = readSponsorships();
    const filtered = items.filter((i) => i.id !== id);
    writeSponsorships(filtered);

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
