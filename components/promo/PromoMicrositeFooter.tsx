import Link from "next/link";
import Image from "next/image";
import { BRANCHES, SHOPEE_STORE_URL } from "@/lib/branches";

export default function PromoMicrositeFooter() {
  return (
    <footer className="w-full bg-[#0D2F1D] text-white border-t border-white/10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand identity */}
        <div className="space-y-3">
          <Link href="/promo" className="inline-block">
            <Image
              src="/logo/logo-isy-putih-cropped.png"
              alt="Optik I See You"
              width={180}
              height={60}
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-white/70 leading-relaxed max-w-sm">
            Portal promosi resmi Optik I See You Purwokerto, Wonosobo, Cilacap, dan Purbalingga. Temukan diskon frame kacamata, paket lensa hemat, dan penawaran spesial bulanan.
          </p>
          <div className="pt-2">
            <a
              href="https://optikiseeyou.com"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>← Buka Website optikiseeyou.com</span>
            </a>
          </div>
        </div>

        {/* 4 Cabang */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#5ec97a]">
            Lokasi 4 Cabang Resmi
          </h4>
          <ul className="space-y-2 text-xs text-white/70">
            {BRANCHES.map((b) => (
              <li key={b.id} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <div>
                  <span className="font-bold text-white">Optik I See You {b.city}:</span>{" "}
                  <span className="text-white/60">{b.address}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#5ec97a]">
            Kanal Resmi
          </h4>
          <ul className="space-y-2 text-xs text-white/70">
            <li>
              <a
                href={SHOPEE_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Shopee Official Store ↗
              </a>
            </li>
            <li>
              <a
                href="https://optikiseeyou.com/katalog"
                className="hover:text-white transition-colors"
              >
                Katalog 100+ Frame Optik ↗
              </a>
            </li>
            <li>
              <a
                href="https://optikiseeyou.com/photobooth"
                className="hover:text-white transition-colors"
              >
                AR Photobooth & Try-On ↗
              </a>
            </li>
            <li>
              <a
                href="https://optikiseeyou.com/kebijakan-privasi"
                className="hover:text-white transition-colors"
              >
                Kebijakan Privasi
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/50">
        &copy; 2019 – 2026 Optik I See You. Hak Cipta Dilindungi Undang-Undang.
      </div>
    </footer>
  );
}
