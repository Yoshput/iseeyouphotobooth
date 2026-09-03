import { Suspense } from "react";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import { SOFTLENS_PRODUCTS } from "@/lib/softlens";
import KatalogClient from "./KatalogClient";
import Navbar from "@/components/ui/Navbar";

export default function KatalogPage() {
  return (
    <main className="relative min-h-dvh w-full bg-isy-white overflow-x-hidden">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-isy-ivory flex items-center justify-center">Loading...</div>}>
        <KatalogClient initialCollections={CATALOG_COLLECTIONS} initialSoftlens={SOFTLENS_PRODUCTS} />
      </Suspense>
    </main>
  );
}

