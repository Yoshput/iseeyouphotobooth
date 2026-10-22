import { NextResponse } from "next/server";
import {
  SponsorshipItem,
  readSponsorships,
  writeSponsorships,
  syncToGoogleSheet,
} from "@/lib/db/sponsorships";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (!nama || !instansi || !whatsapp || !cabang || !namaKegiatan) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Kolom wajib belum lengkap: nama, instansi, whatsapp, cabang, dan nama kegiatan harus diisi.",
        },
        { status: 400 }
      );
    }

    const newItem: SponsorshipItem = {
      id: `SP-${Date.now().toString(36).toUpperCase()}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      nama: String(nama).trim(),
      instansi: String(instansi).trim(),
      whatsapp: String(whatsapp).trim(),
      email: String(email || "").trim(),
      cabang: String(cabang).trim(),
      namaKegiatan: String(namaKegiatan).trim(),
      tanggalKegiatan: String(tanggalKegiatan || "").trim(),
      targetPeserta: String(targetPeserta || "").trim(),
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
