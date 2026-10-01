import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface HomeServiceBooking {
  id: string;
  nama: string;
  whatsapp: string;
  cabang: string;
  alamat: string;
  jadwal: string;
  jumlahOrang: string;
  layanan: string[];
  catatan?: string;
  status: "Menunggu Konfirmasi" | "Jadwal Dikonfirmasi" | "Selesai" | "Dibatalkan";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "home-service.json");

function readBookings(): HomeServiceBooking[] {
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
    console.error("Error reading home-service.json:", err);
    return [];
  }
}

function writeBookings(items: HomeServiceBooking[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing home-service.json:", err);
  }
}

export async function GET() {
  const items = readBookings();
  items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return NextResponse.json({ success: true, data: items });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nama, whatsapp, cabang, alamat, jadwal, jumlahOrang, layanan, catatan } = body;

    if (!nama || !whatsapp || !cabang || !alamat || !jadwal) {
      return NextResponse.json(
        { success: false, error: "Mohon lengkapi formulir wajib" },
        { status: 400 }
      );
    }

    const id = `HS-${Date.now().toString(36).toUpperCase()}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newBooking: HomeServiceBooking = {
      id,
      nama: String(nama).trim(),
      whatsapp: String(whatsapp).trim(),
      cabang: String(cabang).trim(),
      alamat: String(alamat).trim(),
      jadwal: String(jadwal).trim(),
      jumlahOrang: String(jumlahOrang || "1 orang").trim(),
      layanan: Array.isArray(layanan) ? layanan : [],
      catatan: String(catatan || "").trim(),
      status: "Menunggu Konfirmasi",
      createdAt: new Date().toISOString(),
    };

    const bookings = readBookings();
    bookings.unshift(newBooking);
    writeBookings(bookings);

    return NextResponse.json({
      success: true,
      message: "Booking Home Service berhasil dicatat",
      data: newBooking,
    });
  } catch (err) {
    console.error("Error in POST /api/home-service:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan booking Home Service" },
      { status: 500 }
    );
  }
}
