import { getPromos, getPromoPopupSettings } from "@/lib/db/repository";
import PromoListClient from "@/components/admin/promos/PromoListClient";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const [promos, settings] = await Promise.all([
    getPromos(),
    getPromoPopupSettings(),
  ]);

  return <PromoListClient initialPromos={promos} initialSettings={settings} />;
}
