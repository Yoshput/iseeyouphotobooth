import { Metadata } from "next";
import { getServerAdminSession } from "@/lib/auth/session";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin CMS | Optik I See You",
  description: "Pusat pengelolaan konten dan katalog resmi website Optik I See You.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionContext = await getServerAdminSession();
  const initialUser = sessionContext ? sessionContext.user : null;

  return (
    <AdminLayoutClient initialUser={initialUser}>
      {children}
    </AdminLayoutClient>
  );
}
