import Image from "next/image";
import Link from "next/link";
import { BLOG_POSTS, BlogCategory } from "@/lib/blog";
import Navbar from "@/components/ui/Navbar";

function getCategoryColor(category: BlogCategory) {
  switch (category) {
    case "edukasi-mata": return "bg-blue-100 text-blue-800";
    case "tips-pilih-frame": return "bg-green-100 text-green-800";
    case "perawatan-softlens": return "bg-purple-100 text-purple-800";
    case "tren-gaya": return "bg-orange-100 text-orange-800";
    case "info-cabang-promo": return "bg-emerald-50 text-emerald-900 font-semibold border border-emerald-200/80";
    default: return "bg-gray-100 text-gray-800";
  }
}

function getCategoryLabel(category: BlogCategory) {
  if (category === "info-cabang-promo") return "Event & Promo";
  return category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export default function BlogIndex() {
  const featuredArticle = BLOG_POSTS[0];
  const restArticles = BLOG_POSTS.slice(1);

  return (
    <main className="min-h-screen bg-isy-gradient">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Top-Left Back Button to Home */}
        <div className="mb-6">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-isy-line bg-white/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-isy-green-deep shadow-xs hover:border-isy-green-bright hover:bg-isy-mist active:scale-95 transition-all cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Kembali ke Beranda</span>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-dm-serif text-isy-green-deep mb-4">Blog & Edukasi Mata</h1>
          <p className="text-lg text-isy-ink/70 max-w-2xl mx-auto">
            Temukan panduan lengkap seputar kesehatan mata, tips memilih kacamata yang tepat, hingga tren gaya frame terbaru.
          </p>
        </div>


        {/* Featured Article */}
        {featuredArticle && (
          <Link href={`/blog/${featuredArticle.slug}`} className="block group mb-16">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-isy-line transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
              <div className="md:col-span-5 relative aspect-[4/5] w-full max-w-sm mx-auto md:max-w-none rounded-2xl overflow-hidden bg-isy-mist shadow-xs">
                {featuredArticle.videoUrl && (
                  <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium tracking-wide shadow-sm">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Video Dokumentasi
                  </span>
                )}
                <Image 
                  src={featuredArticle.coverImage} 
                  alt={featuredArticle.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="md:col-span-7 flex flex-col justify-center">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 w-fit ${getCategoryColor(featuredArticle.category)}`}>
                  {getCategoryLabel(featuredArticle.category)}
                </span>
                <h2 className="text-2xl sm:text-4xl font-dm-serif text-isy-green-deep mb-4 group-hover:text-isy-green-bright transition-colors leading-snug">
                  {featuredArticle.title}
                </h2>
                <p className="text-isy-ink/70 mb-6 line-clamp-3 text-base sm:text-lg leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
                <div className="flex items-center text-sm text-isy-ink/50 space-x-4 mb-6">
                  <span>{new Date(featuredArticle.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span>•</span>
                  <span>{featuredArticle.readingTime} min baca</span>
                </div>
                <span className="font-semibold text-isy-green-deep group-hover:text-isy-green-bright transition-colors flex items-center text-sm sm:text-base">
                  Baca Selengkapnya
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {restArticles.map(article => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="block group">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-isy-line transition-transform duration-300 hover:-translate-y-1 hover:shadow-md h-full flex flex-col">
                <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-5 bg-isy-mist shadow-2xs">
                  <Image 
                    src={article.coverImage} 
                    alt={article.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3.5 left-3.5">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getCategoryColor(article.category)}`}>
                      {getCategoryLabel(article.category)}
                    </span>
                  </div>
                </div>

                <div className="flex-grow px-2 flex flex-col">
                  <h3 className="text-xl font-dm-serif text-isy-green-deep mb-3 group-hover:text-isy-green-bright transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-isy-ink/70 mb-4 line-clamp-3 text-sm flex-grow">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-isy-ink/50 pt-4 border-t border-isy-line">
                    <span>{new Date(article.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>{article.readingTime} min baca</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
