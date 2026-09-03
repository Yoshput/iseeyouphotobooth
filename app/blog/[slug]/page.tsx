import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import Navbar from "@/components/ui/Navbar";
import ProgressBar from "@/components/blog/ProgressBar";
import ShareButtons from "@/components/blog/ShareButtons";
import BlogMedia from "@/components/blog/BlogMedia";
import { ArrowLeft } from "lucide-react";
import { CS_WHATSAPP_NUMBER } from "@/lib/branches";

// Generate static routes at build time
export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

// Generate per-article metadata
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan",
    };
  }

  const fullImageUrl = post.coverImage.startsWith("http")
    ? post.coverImage
    : `https://optikiseeyou.com${post.coverImage}`;

  return {
    title: `${post.title} | Blog Optik I See You`,
    description: post.excerpt,
    alternates: {
      canonical: `https://optikiseeyou.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://optikiseeyou.com/blog/${post.slug}`,
      siteName: "Optik I See You",
      locale: "id_ID",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [fullImageUrl],
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: [`https://optikiseeyou.com${post.coverImage}`],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Optik I See You",
      logo: {
        "@type": "ImageObject",
        url: "https://optikiseeyou.com/logo.png",
      },
    },
    description: post.excerpt,
  };

  // Find related articles (same category, exclude current)
  const relatedArticles = BLOG_POSTS.filter(
    (p) => p.category === post.category && p.slug !== post.slug
  ).slice(0, 3);

  return (
    <main className="min-h-screen bg-isy-ivory">
      <ProgressBar />
      <Navbar />

      <article className="pt-28 pb-20">
        {/* Article Header */}
        <header className="max-w-3xl mx-auto px-4 sm:px-6 mb-10">
          <div className="mb-6">
            <Link
              href="/blog"
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
              <span>Kembali ke Blog</span>
            </Link>
          </div>

          
          <h1 className="text-3xl md:text-5xl font-dm-serif text-isy-green-deep mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center text-sm text-isy-ink/60 gap-4">
            <span className="font-medium text-isy-ink">{post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            <span>•</span>
            <span>{post.readingTime} min baca</span>
          </div>
        </header>

        {/* Cover Media (Image or Playable Video) */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mb-12 flex justify-center">
          <BlogMedia
            title={post.title}
            coverImage={post.coverImage}
            videoUrl={post.videoUrl}
          />
        </div>


        {/* Article Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />

          {/* Inline CTA based on Category */}
          <div className="my-12 p-8 bg-isy-mist rounded-2xl border border-isy-line text-center">
            {post.category === 'tips-pilih-frame' && (
              <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Penasaran Mana yang Cocok?</h3>
                <p className="mb-6 text-isy-ink/80">Coba langsung berbagai model frame kacamata di wajahmu secara virtual sekarang juga!</p>
                <Link href="/try-on" className="inline-block bg-isy-green-deep text-white font-medium px-8 py-3 rounded-full hover:bg-isy-green-bright transition-colors">
                  Coba AR Try-On
                </Link>
              </>
            )}
            {post.category === 'perawatan-softlens' && (
              <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Butuh Softlens Baru?</h3>
                <p className="mb-6 text-isy-ink/80">Temukan koleksi softlens nyaman dan aman untuk pemakaian harian.</p>
                <Link href="/softlens" className="inline-block bg-isy-green-deep text-white font-medium px-8 py-3 rounded-full hover:bg-isy-green-bright transition-colors">
                  Lihat Katalog Softlens
                </Link>
              </>
            )}
            {post.category === 'tren-gaya' && (
              <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Tampil Trendy Tahun Ini</h3>
                <p className="mb-6 text-isy-ink/80">Jelajahi koleksi kacamata terbaru kami yang selalu update dengan tren terkini.</p>
                <Link href="/katalog" className="inline-block bg-isy-green-deep text-white font-medium px-8 py-3 rounded-full hover:bg-isy-green-bright transition-colors">
                  Lihat Katalog Frame
                </Link>
              </>
            )}
            {post.category === 'edukasi-mata' && (
              <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Masih Bingung dengan Resep Anda?</h3>
                <p className="mb-6 text-isy-ink/80">Konsultasikan kebutuhan kacamata dan mata Anda langsung dengan ahli kami secara gratis.</p>
                <a href={`https://wa.me/${CS_WHATSAPP_NUMBER}?text=Halo%20Optik%20I%20See%20You,%20saya%20mau%20konsultasi%20soal%20kesehatan%20mata%20dan%20kacamata.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#25D366] text-white font-medium px-8 py-3 rounded-full hover:bg-[#20b858] transition-colors">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Tanya via WhatsApp
                </a>
              </>
            )}
            {post.category === 'info-cabang-promo' && (
              <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Kunjungi Booth Kami di Rita SuperMall Purwokerto</h3>
                <p className="mb-6 text-isy-ink/80">Booth Optik I See You berada di Ground Floor (GF) tepat di depan gerai J.CO dan berdampingan dengan lift utama. Hubungi kami untuk informasi lebih lanjut seputar penawaran expo.</p>
                <a href={`https://wa.me/${CS_WHATSAPP_NUMBER}?text=Halo%20Optik%20I%20See%20You,%20saya%20ingin%20bertanya%20informasi%20booth%20di%20Rita%20SuperMall%20Purwokerto.`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-[#25D366] text-white font-medium px-8 py-3 rounded-full hover:bg-[#20b858] transition-colors shadow-xs">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="mr-2">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                  Hubungi Layanan Pelanggan WhatsApp
                </a>
              </>
            )}
            {!['tips-pilih-frame', 'perawatan-softlens', 'tren-gaya', 'edukasi-mata', 'info-cabang-promo'].includes(post.category) && (
               <>
                <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-3">Temukan Kacamata Impianmu</h3>
                <p className="mb-6 text-isy-ink/80">Kunjungi optik kami atau coba secara virtual dari rumah.</p>
                <Link href="/try-on" className="inline-block bg-isy-green-deep text-white font-medium px-8 py-3 rounded-full hover:bg-isy-green-bright transition-colors">
                  Coba AR Try-On
                </Link>
               </>
            )}
          </div>

          <ShareButtons title={post.title} slug={post.slug} />

        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 pt-10 border-t border-isy-line">
            <h3 className="text-2xl font-dm-serif text-isy-green-deep mb-8">Artikel Terkait</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.map((article) => (
                <Link key={article.slug} href={`/blog/${article.slug}`} className="group">
                  <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden mb-4 bg-isy-mist shadow-xs">
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  <h4 className="font-dm-serif text-lg text-isy-green-deep group-hover:text-isy-green-bright transition-colors line-clamp-2 mb-2">
                    {article.title}
                  </h4>
                  <p className="text-sm text-isy-ink/60 flex items-center">
                    {article.readingTime} min baca
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
