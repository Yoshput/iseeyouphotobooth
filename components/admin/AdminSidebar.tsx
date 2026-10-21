"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Glasses,
  Eye,
  BookOpen,
  Image as ImageIcon,
  Globe,
  Settings,
  Users,
  Handshake,
  ExternalLink,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export default function AdminSidebar({
  isOpen,
  onClose,
  userRole,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
      exact: true,
      tourId: "sidebar-dashboard",
    },
    {
      name: "Katalog Frame",
      href: "/admin/katalog-frame",
      icon: Glasses,
      tourId: "sidebar-frame",
    },
    {
      name: "Katalog Softlens",
      href: "/admin/softlens",
      icon: Eye,
      tourId: "sidebar-softlens",
    },
    {
      name: "Blog & Artikel",
      href: "/admin/blog",
      icon: BookOpen,
      tourId: "sidebar-blog",
    },
    {
      name: "Media Library",
      href: "/admin/media",
      icon: ImageIcon,
      tourId: "sidebar-media",
    },
    {
      name: "Konten Website",
      href: "/admin/konten-website",
      icon: Globe,
      tourId: "sidebar-content",
    },
    {
      name: "Pengaturan Global",
      href: "/admin/pengaturan",
      icon: Settings,
      tourId: "sidebar-settings",
    },
    {
      name: "Proposal Sponsor",
      href: "/admin/sponsor",
      icon: Handshake,
      tourId: "sidebar-sponsor",
    },
    ...(userRole === "owner"
      ? [
          {
            name: "Pengguna & Audit",
            href: "/admin/pengguna",
            icon: Users,
            tourId: "sidebar-users",
          },
        ]
      : []),
  ];

  const isActive = (item: (typeof navigation)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-isy-line bg-white transition-transform duration-300 ease-in-out lg:static lg:h-full lg:shrink-0 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-isy-line px-5 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.webp"
              alt="Optik I See You"
              width={130}
              height={40}
              className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-102"
              priority
            />
            <span className="rounded-md bg-isy-mist px-2 py-0.5 text-[11px] font-bold text-isy-emerald border border-isy-line shadow-2xs">
              CMS
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-isy-text-secondary hover:bg-isy-mist lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Tutup sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 admin-scrollbar">
          <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-wider text-isy-text-secondary/70">
            Navigasi Utama
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? "bg-isy-emerald text-white shadow-xs"
                      : "text-isy-text-primary hover:bg-isy-mist hover:text-isy-emerald"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      active ? "text-white scale-105" : "text-isy-text-secondary group-hover:text-isy-emerald group-hover:scale-105"
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                  {active && (
                    <span className="ml-auto flex h-2 w-2 items-center justify-center">
                      <span className="h-1.5 w-1.5 rounded-full bg-isy-green-bright shadow-[0_0_8px_#2FA84F]" />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Shortcut to Public Site */}
        <div className="shrink-0 border-t border-isy-line p-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-isy-line bg-isy-mist/60 px-4 py-2.5 text-xs font-semibold text-isy-emerald hover:border-isy-green-bright hover:bg-isy-mist transition-all"
          >
            <span>Kunjungi Website Publik</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </aside>
    </>
  );
}
