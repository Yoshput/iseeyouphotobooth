"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ScrollToTop from "@/components/admin/ScrollToTop";
import { SafeAdminUser } from "@/lib/auth/guard";

interface AdminLayoutClientProps {
  initialUser: SafeAdminUser | null;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  initialUser,
  children,
}: AdminLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SafeAdminUser | null>(initialUser);
  const [checkingAuth, setCheckingAuth] = useState(!initialUser);

  // If on login or standalone sponsor page, render children directly
  const isAuthPage = pathname === "/admin/login";
  const isStandalonePage = pathname.startsWith("/admin/sponsor");

  useEffect(() => {
    if (isAuthPage || isStandalonePage) {
      setCheckingAuth(false);
      return;
    }

    if (!currentUser) {
      // Check me endpoint
      fetch("/api/admin/auth/me")
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
          } else {
            router.push("/admin/login");
          }
        })
        .catch(() => {
          router.push("/admin/login");
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }
  }, [pathname, currentUser, isAuthPage, isStandalonePage, router]);

  if (isAuthPage || isStandalonePage) {
    return <>{children}</>;
  }

  if (checkingAuth && !currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-isy-ivory">
        <div className="flex flex-col items-center gap-3 text-isy-emerald">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-isy-emerald border-t-transparent" />
          <span className="text-xs font-bold tracking-wider uppercase">
            Memverifikasi Sesi Admin...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-isy-ivory font-sans selection:bg-isy-green-bright selection:text-white">
      {/* Sidebar — Fixed left panel on desktop with its own smooth scroll */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={currentUser?.role}
      />

      {/* Main Content Area — Fixed header + Independent smooth scrolling content area */}
      <div className="flex flex-1 flex-col h-full min-w-0 overflow-hidden">
        <AdminHeader
          onMenuClick={() => setSidebarOpen(true)}
          user={
            currentUser
              ? {
                  name: currentUser.name,
                  email: currentUser.email,
                  role: currentUser.role,
                }
              : undefined
          }
        />

        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative">
          <div
            key={pathname}
            className="flex-1 flex flex-col h-full min-h-0 overflow-hidden animate-in fade-in-50 slide-in-from-bottom-2 duration-300 ease-out"
          >
            {children}
          </div>
          <ScrollToTop />
        </main>
      </div>
    </div>
  );
}
