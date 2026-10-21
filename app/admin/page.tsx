import Link from "next/link";
import {
  Glasses,
  Eye,
  BookOpen,
  Image as ImageIcon,
  PlusCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileEdit,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
} from "lucide-react";
import {
  getFrames,
  getSoftlens,
  getBlogPosts,
  getMediaFiles,
  getAuditLogs,
} from "@/lib/db/repository";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverview() {
  const [frames, softlens, blogPosts, mediaFiles, auditLogs] = await Promise.all([
    getFrames(),
    getSoftlens(),
    getBlogPosts(),
    getMediaFiles(),
    getAuditLogs({ limit: 10 }),
  ]);

  const totalFrames = frames.length;
  const publishedFrames = frames.filter((f) => f.isPublished).length;

  const totalSoftlens = softlens.length;
  const publishedSoftlens = softlens.filter((s) => s.isPublished).length;

  const publishedBlog = blogPosts.filter((b) => b.status === "published").length;
  const draftBlog = blogPosts.filter((b) => b.status === "draft").length;
  const totalMedia = mediaFiles.length;

  // Recent content items across modules
  const recentContent = [
    ...frames.map((f) => ({
      id: f.id,
      title: f.name,
      module: "Frame Kacamata",
      moduleHref: "/admin/katalog-frame",
      updatedAt: f.updatedAt,
      status: f.isPublished ? "Terbit" : "Draft",
    })),
    ...softlens.map((s) => ({
      id: s.id,
      title: s.name,
      module: "Katalog Softlens",
      moduleHref: "/admin/softlens",
      updatedAt: s.updatedAt,
      status: s.isPublished ? "Terbit" : "Draft",
    })),
    ...blogPosts.map((b) => ({
      id: b.slug,
      title: b.title,
      module: "Artikel Blog",
      moduleHref: "/admin/blog",
      updatedAt: b.updatedAt,
      status: b.status === "published" ? "Terbit" : b.status === "draft" ? "Draft" : "Arsip",
    })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col h-full min-h-0 space-y-4">
      {/* Welcome Banner (FIXED — Tidak Ikut Ter-scroll) */}
      <div className="flex-shrink-0 rounded-3xl border border-isy-line bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-isy-mist px-3 py-1 text-xs font-bold text-isy-emerald border border-isy-line mb-2">
              <span className="h-2 w-2 rounded-full bg-isy-green-bright animate-pulse" />
              <span>Sistem Manajemen Konten Aktif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-isy-emerald">
              Ringkasan Data Website
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm text-isy-text-secondary">
              Semua angka dan data di bawah ini terhubung langsung secara real-time ke penyimpanan permanen.
            </p>
          </div>

          {/* Quick Action Button Group */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/katalog-frame"
              className="inline-flex items-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-isy-green-bright" />
              <span>Tambah Frame</span>
            </Link>
            <Link
              href="/admin/softlens"
              className="inline-flex items-center gap-2 rounded-xl bg-isy-emerald px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-isy-emerald-hover transition-colors"
            >
              <PlusCircle className="h-4 w-4 text-isy-green-bright" />
              <span>Tambah Softlens</span>
            </Link>
            <Link
              href="/admin/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-isy-line bg-white px-4 py-2.5 text-xs font-bold text-isy-emerald shadow-xs hover:bg-isy-mist transition-colors"
            >
              <FileEdit className="h-4 w-4" />
              <span>Tulis Artikel</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dashboard Body (SCROLLABLE AREA) */}
      <div id="admin-table-scroll" className="flex-1 min-h-0 overflow-y-auto admin-scrollbar pr-1 sm:pr-2 space-y-6">
        {/* Real Statistics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Frame */}
        <Link
          href="/admin/katalog-frame"
          className="group rounded-2xl border border-isy-line bg-white p-5 shadow-xs hover:border-isy-emerald hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-isy-text-secondary">
              Katalog Frame
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald group-hover:bg-isy-emerald group-hover:text-white transition-colors">
              <Glasses className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-isy-emerald">{totalFrames}</div>
            <div className="text-xs font-bold text-isy-green-bright">
              {publishedFrames} Terbit
            </div>
          </div>
          <p className="mt-2 text-[11px] text-isy-text-secondary flex items-center justify-between">
            <span>Model kacamata aktif</span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Metric 2: Softlens */}
        <Link
          href="/admin/softlens"
          className="group rounded-2xl border border-isy-line bg-white p-5 shadow-xs hover:border-isy-emerald hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-isy-text-secondary">
              Katalog Softlens
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald group-hover:bg-isy-emerald group-hover:text-white transition-colors">
              <Eye className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-isy-emerald">{totalSoftlens}</div>
            <div className="text-xs font-bold text-isy-green-bright">
              {publishedSoftlens} Tersedia
            </div>
          </div>
          <p className="mt-2 text-[11px] text-isy-text-secondary flex items-center justify-between">
            <span>Lensa kontak & cairan</span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Metric 3: Blog */}
        <Link
          href="/admin/blog"
          className="group rounded-2xl border border-isy-line bg-white p-5 shadow-xs hover:border-isy-emerald hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-isy-text-secondary">
              Artikel Edukasi
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald group-hover:bg-isy-emerald group-hover:text-white transition-colors">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-isy-emerald">{publishedBlog}</div>
            <div className="text-xs font-bold text-amber-700">{draftBlog} Draft</div>
          </div>
          <p className="mt-2 text-[11px] text-isy-text-secondary flex items-center justify-between">
            <span>Artikel blog terbit</span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* Metric 4: Media */}
        <Link
          href="/admin/media"
          className="group rounded-2xl border border-isy-line bg-white p-5 shadow-xs hover:border-isy-emerald hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-isy-text-secondary">
              Media Library
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald group-hover:bg-isy-emerald group-hover:text-white transition-colors">
              <ImageIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl font-extrabold text-isy-emerald">{totalMedia}</div>
            <div className="text-xs font-bold text-isy-emerald">Aset Gambar</div>
          </div>
          <p className="mt-2 text-[11px] text-isy-text-secondary flex items-center justify-between">
            <span>Foto & banner terkelola</span>
            <ArrowRight className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>
      </div>

      {/* Two Column Layout: Recent Content Updates & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Recent Content Updates */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-isy-emerald" />
              <h3 className="text-base font-bold text-isy-emerald">
                Konten Terakhir Diperbarui
              </h3>
            </div>
            <span className="text-xs text-isy-text-secondary">6 item terbaru</span>
          </div>

          <div className="rounded-2xl border border-isy-line bg-white shadow-xs overflow-hidden">
            <div className="divide-y divide-isy-line">
              {recentContent.map((item) => (
                <div
                  key={`${item.module}-${item.id}`}
                  className="flex items-center justify-between p-4 hover:bg-isy-mist/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded-md bg-isy-ivory px-2 py-0.5 text-[10px] font-bold text-isy-emerald border border-isy-line">
                        {item.module}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                          item.status === "Terbit"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-isy-emerald truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-isy-text-secondary mt-0.5">
                      Diperbarui:{" "}
                      {new Date(item.updatedAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  <Link
                    href={item.moduleHref}
                    className="flex-shrink-0 rounded-lg p-2 text-isy-text-secondary hover:text-isy-emerald hover:bg-isy-mist transition-colors"
                    title="Buka modul"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Audit Logs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-isy-emerald" />
              <h3 className="text-base font-bold text-isy-emerald">
                Aktivitas Admin Terbaru
              </h3>
            </div>
            <Link
              href="/admin/pengguna"
              className="text-xs font-bold text-isy-emerald hover:underline"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="rounded-2xl border border-isy-line bg-white p-4 shadow-xs">
            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-isy-text-secondary">
                Belum ada aktivitas admin yang tercatat.
              </div>
            ) : (
              <div className="space-y-3">
                {auditLogs.slice(0, 6).map((log) => {
                  const deviceName = log.device || (log.details?.device as string | undefined);
                  const isMobile = log.deviceType === "mobile" || deviceName?.toLowerCase().includes("hp") || deviceName?.toLowerCase().includes("iphone") || deviceName?.toLowerCase().includes("android");
                  const isTablet = log.deviceType === "tablet" || deviceName?.toLowerCase().includes("ipad") || deviceName?.toLowerCase().includes("tablet");
                  const isAuth = log.module === "auth" || log.action.includes("login");

                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 pb-3 border-b border-isy-line/60 last:border-b-0 last:pb-0"
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-isy-mist text-isy-emerald border border-isy-line/70">
                        {isAuth ? (
                          isMobile ? (
                            <Smartphone className="h-4 w-4 text-emerald-700" />
                          ) : isTablet ? (
                            <Tablet className="h-4 w-4 text-emerald-700" />
                          ) : (
                            <Laptop className="h-4 w-4 text-emerald-700" />
                          )
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-isy-green-bright" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-isy-emerald">
                            {log.action.toUpperCase()}
                          </span>
                          <span className="rounded-md bg-isy-mist px-1.5 py-0.5 text-[9px] font-bold text-isy-emerald border border-isy-line">
                            {log.module}
                          </span>
                        </div>

                        {/* Nama Admin & Email */}
                        <div className="text-[11px] text-isy-ink font-medium mt-0.5 truncate">
                          {log.userName ? (
                            <span>
                              <strong className="text-isy-emerald">{log.userName}</strong>{" "}
                              <span className="text-isy-text-secondary">({log.userEmail})</span>
                            </span>
                          ) : (
                            <span>
                              Oleh: <strong className="text-isy-emerald">{log.userEmail}</strong>
                            </span>
                          )}
                        </div>

                        {/* Nama Perangkat Laptop / HP */}
                        {deviceName && (
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 rounded-md bg-[#FAF7F0] px-2 py-0.5 text-[10px] font-semibold text-[#183C30] border border-isy-line">
                              {isMobile ? (
                                <Smartphone className="h-3 w-3 text-isy-emerald" />
                              ) : isTablet ? (
                                <Tablet className="h-3 w-3 text-isy-emerald" />
                              ) : (
                                <Laptop className="h-3 w-3 text-isy-emerald" />
                              )}
                              <span>{deviceName}</span>
                            </span>
                            {log.ipAddress && log.ipAddress !== "127.0.0.1" && log.ipAddress !== "::1" && (
                              <span className="text-[10px] text-isy-text-secondary/60">
                                IP: {log.ipAddress}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Waktu Login */}
                        <div className="text-[10px] text-isy-text-secondary/70 mt-1">
                          {new Date(log.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          WIB
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
