import Link from "next/link";
import Image from "next/image";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { PromoItem } from "@/lib/db/types";
import { formatPromoPeriod, getCategoryLabel } from "@/lib/promo";

interface PromoCardProps {
  promo: PromoItem;
  featured?: boolean;
}

export default function PromoCard({ promo, featured = false }: PromoCardProps) {
  const period = formatPromoPeriod(promo.startAt, promo.endAt);
  const categoryLabel = getCategoryLabel(promo.category);

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-3xl border border-[#E3E7DF] bg-white overflow-hidden shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-[#2FA84F]/40 hover:shadow-xl hover:shadow-[#2FA84F]/5 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <div>
        {/* Thumbnail Hero Image */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
          {promo.heroImageUrl ? (
            <Image
              src={promo.heroImageUrl}
              alt={promo.heroImageAlt || promo.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-103"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-300">
              <Tag className="h-8 w-8 stroke-[1.5]" />
              <span className="text-[11px] mt-1">Optik I See You</span>
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
            <span className="rounded-full bg-[#124734]/90 backdrop-blur-xs px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
              {categoryLabel}
            </span>
            {featured && (
              <span className="rounded-full bg-[#2FA84F] px-2.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs">
                Unggulan
              </span>
            )}
          </div>
        </div>

        {/* Content Details */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Period Badge */}
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Calendar className="h-3 w-3 text-[#2FA84F]" />
            <span>{period}</span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#124734] transition-colors leading-snug line-clamp-2">
            {promo.title}
          </h3>

          {/* Excerpt */}
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-3 font-normal">
            {promo.excerpt || promo.description}
          </p>
        </div>
      </div>

      {/* Card Footer / CTA */}
      <div className="p-5 sm:p-6 pt-0">
        <Link
          href={`/${promo.slug}`}
          className="w-full inline-flex items-center justify-between rounded-2xl border border-[#E3E7DF] bg-[#F8F5ED] px-4 py-3 text-xs font-bold text-[#124734] group-hover:border-[#124734] group-hover:bg-[#124734] group-hover:text-white transition-all duration-300"
        >
          <span>{promo.ctaLabel || "Lihat Detail Promo"}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
