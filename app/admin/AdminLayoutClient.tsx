"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ScrollToTop from "@/components/admin/ScrollToTop";
import { AdminNavigationProvider } from "@/components/admin/navigation/AdminNavigationProvider";
import { AdminOnboardingProvider } from "@/components/admin/onboarding/AdminOnboardingProvider";
import AdminEntryLoader from "@/components/admin/motion/AdminEntryLoader";
import AdminPageReveal from "@/components/admin/motion/AdminPageReveal";
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

  // If on login page, render children directly
  const isAuthPage = pathname === "/admin/login";
  

  useEffect(() => {
    if (isAuthPage) {
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
  }, [pathname, currentUser, isAuthPage, router]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (checkingAuth && !currentUser) {
    // Consistent with AdminEntryLoader visual language — ivory bg + brand logo + spinner
    return (
      <div
        role="status"
        aria-label="Memverifikasi sesi admin..."
        className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#F8F5ED] px-4"
      >
        <div className="flex flex-col items-center text-center max-w-sm mx-auto w-full">
          <div className="mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.webp"
              alt="Optik I See You"
              className="h-10 w-auto object-contain mx-auto"
            />
          </div>
          <div className="w-full rounded-2xl border border-isy-line bg-white/80 p-5 shadow-xs">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-isy-mist border border-isy-line/60 mb-4">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#124734] via-[#2FA84F] to-[#86EFAC] rounded-full animate-[progressIndeterminate_1.4s_ease-in-out_infinite]" />
            </div>
            <p className="text-xs font-bold text-isy-emerald tracking-wide">
              Memverifikasi Sesi Admin...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminNavigationProvider>
      <AdminOnboardingProvider
        userId={currentUser?.id}
        userRole={currentUser?.role}
        onOpenSidebar={() => setSidebarOpen(true)}
        onCloseSidebar={() => setSidebarOpen(false)}
      >
        <AdminEntryLoader />
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
              <AdminPageReveal key={pathname}>
                {children}
              </AdminPageReveal>
              <ScrollToTop />
            </main>
          </div>
        </div>
      </AdminOnboardingProvider>
    </AdminNavigationProvider>
  );
}
