"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ArrowLeft, MessageCircle } from "lucide-react";
import { BRANCHES } from "@/lib/branches";
import BranchWhatsAppModal from "@/components/ui/BranchWhatsAppModal";

interface PromoMicrositeHeaderProps {
  showBackToAll?: boolean;
}

export default function PromoMicrositeHeader({
  showBackToAll = false,
}: PromoMicrositeHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E3E7DF] shadow-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-4">
          {showBackToAll && (
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E3E7DF] bg-[#FAF8F3] px-3 py-1.5 text-xs font-bold text-[#124734] hover:bg-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Semua Promo</span>
            </Link>
          )}

          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.webp"
              alt="Optik I See You"
              width={130}
              height={45}
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#124734]">
          <Link
            href="/"
            className="hover:text-[#2FA84F] transition-colors"
          >
            Daftar Promo
          </Link>
          <a
            href="https://optikiseeyou.com"
            className="hover:text-[#2FA84F] transition-colors"
          >
            Website Utama
          </a>
          <a
            href="https://optikiseeyou.com/katalog"
            className="hover:text-[#2FA84F] transition-colors"
          >
            Katalog Frame
          </a>
          <a
            href="https://optikiseeyou.com/softlens"
            className="hover:text-[#2FA84F] transition-colors"
          >
            Softlens
          </a>
          <button
            type="button"
            onClick={() => setIsBranchModalOpen(true)}
            className="hover:text-[#2FA84F] transition-colors cursor-pointer"
          >
            4 Cabang
          </button>
        </nav>

        {/* Right CTA */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsBranchModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] px-4 py-2 text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Tanya Promo ke CS</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Buka navigasi"
          className="md:hidden p-2 rounded-xl text-[#124734] hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E3E7DF] bg-white px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2.5 text-xs font-bold text-[#124734]">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#2FA84F]"
            >
              Daftar Promo & Campaign
            </Link>
            <a
              href="https://optikiseeyou.com"
              className="py-1.5 hover:text-[#2FA84F]"
            >
              Kembali ke Website Utama
            </a>
            <a
              href="https://optikiseeyou.com/katalog"
              className="py-1.5 hover:text-[#2FA84F]"
            >
              Katalog Frame Kacamata
            </a>
            <a
              href="https://optikiseeyou.com/softlens"
              className="py-1.5 hover:text-[#2FA84F]"
            >
              Katalog Softlens
            </a>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsBranchModalOpen(true);
              }}
              className="py-1.5 text-left hover:text-[#2FA84F] cursor-pointer"
            >
              Info 4 Cabang Resmi
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsBranchModalOpen(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#208c49] to-[#124734] py-3 text-xs font-bold text-white shadow-sm cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Pilih WhatsApp 4 Cabang</span>
            </button>
          </div>
        </div>
      )}

      {/* 4-Branch WhatsApp Modal */}
      <BranchWhatsAppModal
        isOpen={isBranchModalOpen}
        onClose={() => setIsBranchModalOpen(false)}
        title="Pilih WhatsApp Cabang Terdekat"
        description="Silakan hubungi admin cabang kota Anda untuk tanya promo, kacamata, dan jadwal periksa mata:"
        customMessage={(branch) =>
          `Halo Optik I See You cabang ${branch.city}, saya ingin tanya info promo kacamata & periksa mata.`
        }
      />
    </header>
  );
}
