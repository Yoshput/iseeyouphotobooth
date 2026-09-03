import TestimoniClient from "./TestimoniClient";
import Navbar from "@/components/ui/Navbar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Testimoni Pelanggan - Optik I See You",
  description: "Apa kata pelanggan tentang Optik I See You? Baca review asli dari Google Maps untuk cabang Purwokerto, Purbalingga, Wonosobo, dan Cilacap.",
};

export default function TestimoniPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#FAF6EC] pb-20">
      <Navbar />
      <div className="pt-24 sm:pt-32">
        <TestimoniClient />
      </div>
    </main>
  );
}
