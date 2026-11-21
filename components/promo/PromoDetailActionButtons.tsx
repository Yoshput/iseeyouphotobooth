"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ArrowRight, ExternalLink } from "lucide-react";
import BranchWhatsAppModal from "@/components/ui/BranchWhatsAppModal";
import { Branch } from "@/lib/branches";

interface PromoDetailActionButtonsProps {
  promoTitle: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export default function PromoDetailActionButtons({
  promoTitle,
  ctaLabel,
  ctaUrl,
}: PromoDetailActionButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If ctaUrl is an explicit non-whatsapp web address (e.g. google forms, blog, app)
  const isExternalNonWa =
    Boolean(ctaUrl) &&
    !ctaUrl?.includes("wa.me") &&
    !ctaUrl?.includes("whatsapp.com") &&
    !ctaUrl?.startsWith("#");

  const getCustomMessage = (branch: Branch) => {
    return `Halo Optik I See You cabang ${branch.city}, saya mau klaim ${promoTitle}. Mohon info syarat dan ketentuannya ya!`;
  };

  return (
    <>
      <div className="pt-4 flex flex-wrap items-center gap-3">
        {isExternalNonWa && ctaUrl ? (
          <a
            href={ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] py-3.5 px-7 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#208c49]/25 hover:scale-102 hover:shadow-xl active:scale-98 transition-all"
          >
            <span>{ctaLabel || "Klaim Promo di Cabang"}</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#208c49] via-[#1b703e] to-[#124734] py-3.5 px-7 text-xs sm:text-sm font-black uppercase tracking-wider text-white shadow-lg shadow-[#208c49]/25 hover:scale-102 hover:shadow-xl active:scale-98 transition-all cursor-pointer"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{ctaLabel || "KLAIM UNDIAN DI CABANG"}</span>
          </button>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-2xl border border-[#E3E7DF] bg-white px-5 py-3.5 text-xs sm:text-sm font-bold text-[#124734] hover:bg-[#FAF8F3] transition-colors"
        >
          <span>Lihat Promo Lainnya</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 4-Branch WhatsApp Selection Modal (Matches Screenshot 2) */}
      <BranchWhatsAppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Pilih WhatsApp Cabang Terdekat"
        description={`Silakan hubungi admin cabang kota Anda untuk klaim ${promoTitle}:`}
        customMessage={getCustomMessage}
      />
    </>
  );
}
