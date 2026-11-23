import fs from "fs";
import path from "path";
import { CATALOG_COLLECTIONS } from "@/lib/catalog";
import { SOFTLENS_SERIES_LIST } from "@/lib/softlens";
import { BLOG_POSTS } from "@/lib/blog";
import { BRANCHES } from "@/lib/branches";
import { hashPassword } from "@/lib/auth/passwords";
import { readStore, writeStore } from "./storage";
import {
  AdminUser,
  AdminSession,
  AuditLog,
  FrameItem,
  SoftlensItem,
  BlogPostItem,
  MediaFile,
  WebsiteSettings,
  PromoItem,
  PromoPopupSettings,
  PromoCategory,
  PromoStatus,
} from "./types";
import { isPromoActive, slugify, DEFAULT_PROMO_POPUP_SETTINGS } from "@/lib/promo";

// =============================================================================
// SEEDING HELPERS
// =============================================================================

function loadManifestSync(): any[] {
  try {
    const manifestPath = path.join(process.cwd(), "public", "glasses", "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read manifest.json for seeding:", err);
  }
  return [];
}

export async function seedInitialDataIfNeeded() {
  // 1. Seed Frames
  const existingFrames = await readStore<FrameItem[]>("frames", []);
  if (!existingFrames || existingFrames.length === 0) {
    const manifest = loadManifestSync();
    const manifestMap = new Map<string, any>();
    manifest.forEach((m) => {
      if (m.id) manifestMap.set(m.id, m);
    });

    const seededFrames: FrameItem[] = [];
    let order = 0;

    for (const col of CATALOG_COLLECTIONS) {
      for (const item of col.items) {
        order++;
        const matchedManifest = item.glassesId ? manifestMap.get(item.glassesId) : undefined;

        seededFrames.push({
          id: item.id,
          sku: item.sku || `SKU-${item.id.toUpperCase()}`,
          name: item.name,
          collection: item.collection,
          shape: item.shape,
          material: item.material,
          dimensions: item.dimensions,
          colors: item.colors || [],
          price: item.price,
          priceRange: item.priceRange,
          priceIncludesLens: item.priceIncludesLens,
          image: item.image,
          coverImage: item.coverImage,
          images: item.images || [item.image],
          lifestyleImages: item.lifestyleImages || [],
          posterImages: item.posterImages || [],
          specsImage: item.specsImage,
          arAssetId: item.arAssetId,
          glassesId: item.glassesId,
          fitWidthRatio: matchedManifest?.fitWidthRatio ?? undefined,
          ipdScaleRef: matchedManifest?.ipdScaleRef ?? undefined,
          model3D: matchedManifest?.model3D ?? undefined,
          recommendedFor: item.recommendedFor || [],
          description: item.description,
          style: item.style,
          isPublished: true,
          sortOrder: order,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    await writeStore("frames", seededFrames);
  }

  // 2. Seed Softlens
  const existingSoftlens = await readStore<SoftlensItem[]>("softlens", []);
  if (!existingSoftlens || existingSoftlens.length === 0) {
    const seededSoftlens: SoftlensItem[] = SOFTLENS_SERIES_LIST.map((series, idx) => ({
      id: series.id,
      name: series.name,
      brand: series.brand,
      category: series.category,
      type: series.type,
      colorFamily: series.colorFamily,
      coverImage: series.coverImage,
      description: series.description,
      specs: series.specs || [],
      diameter: series.diameter,
      waterContent: series.waterContent,
      usageDuration: series.usageDuration,
      volume: series.volume,
      isAccessory: series.isAccessory || false,
      basePrice: series.basePrice,
      basePriceFormatted: series.basePriceFormatted,
      hasPriceRange: series.hasPriceRange,
      maxPrice: series.maxPrice,
      maxPriceFormatted: series.maxPriceFormatted,
      badgeText: series.badgeText,
      variants: series.variants || [],
      isPublished: true,
      sortOrder: idx + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    await writeStore("softlens", seededSoftlens);
  }

  // 3. Seed Blog
  const existingBlog = await readStore<BlogPostItem[]>("blog", []);
  if (!existingBlog || existingBlog.length === 0) {
    const seededBlog: BlogPostItem[] = BLOG_POSTS.map((post) => ({
      slug: post.slug,
      title: post.title,
      category: post.category,
      excerpt: post.excerpt,
      coverImage: post.coverImage,
      videoUrl: post.videoUrl,
      content: post.content,
      author: post.author || "Tim Optik I See You",
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      readingTime: post.readingTime || 1,
      relatedCabang: post.relatedCabang,
      status: "published",
      seoTitle: `${post.title} | Blog Optik I See You`,
      seoDescription: post.excerpt,
      createdAt: post.publishedAt,
    }));
    await writeStore("blog", seededBlog);
  }

  // 4. Seed Website Settings
  const existingSettings = await readStore<WebsiteSettings | null>("settings", null);
  if (!existingSettings) {
    const defaultSettings: WebsiteSettings = {
      heroHeadline: "Kacamata & Softlens Terbaik untuk Kamu",
      heroSubheadline:
        "Coba puluhan model kacamata trendi di wajahmu secara virtual dengan AR Try-On real-time, atau kunjungi 4 cabang resmi kami.",
      heroCtaText: "Coba AR Try-On",
      heroCtaLink: "/start",
      branches: BRANCHES,
      globalSeoTitle: "Optik I See You | Kacamata Trendy & Softlens Resmi",
      globalSeoDescription:
        "Koleksi kacamata kekinian, softlens resmi Kemenkes RI, periksa mata akurat gratis, dan AR Try-On di Purwokerto, Purbalingga, Wonosobo, Cilacap.",
      contactPhone: "0895-4156-14261",
      contactWhatsapp: "62895415614261",
      instagramUrl: "https://www.instagram.com/iseeyou.glasses/",
      shopeeUrl: "https://shopee.co.id/iseeyou.id",
      updatedAt: new Date().toISOString(),
    };
    await writeStore("settings", defaultSettings);
  }

  // 5. Seed Initial Admin User if none exists
  const existingUsers = await readStore<AdminUser[]>("users", []);
  if (!existingUsers || existingUsers.length === 0) {
    const email = (process.env.INITIAL_ADMIN_EMAIL || "admin@optikiseeyou.com").toLowerCase().trim();
    const plainPassword =
      process.env.INITIAL_ADMIN_PASSWORD ||
      process.env.ADMIN_SPONSOR_PIN ||
      "iseeyou2026";

    const { hash, salt } = hashPassword(plainPassword);

    const initialOwner: AdminUser = {
      id: "usr-owner-initial",
      email,
      name: "Owner Optik I See You",
      passwordHash: hash,
      salt,
      role: "owner",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await writeStore("users", [initialOwner]);

    // Initial audit log
    await addAuditLog({
      userEmail: "system",
      action: "seed",
      module: "auth",
      targetId: initialOwner.id,
      details: { message: "Akun owner awal otomatis diinisialisasi" },
    });
  }

  // 6. Seed Media Library initially from catalog assets
  const existingMedia = await readStore<MediaFile[]>("media", []);
  if (!existingMedia || existingMedia.length === 0) {
    const mediaMap = new Map<string, MediaFile>();

    const addAsset = (url: string, name: string, category: string) => {
      if (!url || mediaMap.has(url)) return;
      const id = `med-${Math.abs(hashString(url))}`;
      mediaMap.set(url, {
        id,
        name: name || path.basename(url),
        url,
        sizeBytes: 0,
        mimeType: url.endsWith(".webp")
          ? "image/webp"
          : url.endsWith(".png")
          ? "image/png"
          : "image/jpeg",
        altText: name,
        category,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    };

    // Scan frames
    for (const col of CATALOG_COLLECTIONS) {
      if (col.coverImage) addAsset(col.coverImage, col.title, "katalog-frame");
      for (const item of col.items) {
        if (item.image) addAsset(item.image, item.name, "katalog-frame");
        for (const img of item.images || []) addAsset(img, item.name, "katalog-frame");
      }
    }

    // Scan softlens
    for (const series of SOFTLENS_SERIES_LIST) {
      if (series.coverImage) addAsset(series.coverImage, series.name, "softlens");
      for (const v of series.variants || []) {
        if (v.image) addAsset(v.image, `${series.name} - ${v.name}`, "softlens");
      }
    }

    // Scan blog
    for (const post of BLOG_POSTS) {
      if (post.coverImage) addAsset(post.coverImage, post.title, "blog");
    }

    await writeStore("media", Array.from(mediaMap.values()));
  }

  // 7. Seed Initial Promos if none exists
  const existingPromos = await readStore<PromoItem[]>("promos", []);
  if (!existingPromos || existingPromos.length === 0) {
    const seededPromos: PromoItem[] = [
      {
        id: "promo-undian-akhir-tahun-2026",
        slug: "undian-akhir-tahun",
        title: "Undian Akhir Tahun 2026",
        subtitle: "Ikuti Undiannya & Raih Kesempatan Bawa Pulang Hadiah Akhir Tahun!",
        excerpt:
          "Ikuti undian akhir tahun Optik I See You dan raih kesempatan bawa pulang TV Android, Tiket Hotel, Kompor, Magiccom, hingga Voucher Kacamata Rp250.000.",
        description:
          "Sambut kemeriahan akhir tahun bersama Optik I See You! Dapatkan kesempatan emas membawa pulang hadiah spektakuler akhir tahun:\n\n• TV Android\n• Tiket Hotel Liburan\n• Kompor Gas 2 Tungku\n• Magiccom Digital\n• Voucher Kacamata Rp250.000\n\nSetiap transaksi kacamata lengkap di 4 cabang resmi Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap) berhak mendapatkan kupon undian berhadiah istimewa ini.",
        category: "special",
        status: "published",
        startAt: "2026-11-01T00:00:00+07:00",
        endAt: "2026-12-31T23:59:59+07:00",
        heroImageUrl: "/PROMO/undian-akhir-tahun-display.webp",
        heroImageAlt: "Poster Undian Akhir Tahun 2026 Optik I See You",
        galleryImages: [
          {
            url: "/PROMO/undian-akhir-tahun.webp",
            alt: "Undian Akhir Tahun 2026 - TV Android, Tiket Hotel, Kompor, Magiccom, Voucher",
          },
          {
            url: "/PROMO/promo-hari-guru.webp",
            alt: "Special Hari Guru Diskon Pelajar & Mahasiswa",
          },
          {
            url: "/PROMO/lensa-antifog-blueray.webp",
            alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb",
          },
        ],
        detailLayout: "image-left",
        collageLayout: "grid-3",
        ctaLabel: "KLAIM UNDIAN DI CABANG",
        ctaUrl: "",
        termsAndConditions:
          "1. Periode promo berlangsung mulai 1 November hingga 31 Desember 2026.\n2. Berlaku untuk seluruh pelanggan di 4 cabang resmi (Purwokerto, Purbalingga, Wonosobo, Cilacap).\n3. Setiap transaksi pembelian kacamata lengkap (frame + lensa) berhak mendapatkan kupon undian.\n4. Hadiah undian mencakup TV Android, Tiket Hotel, Kompor Gas, Magiccom, dan Voucher Kacamata Rp250.000.\n5. Pengundian akan diumumkan secara transparan di Instagram resmi @iseeyou.glasses.\n6. Syarat dan ketentuan berlaku. Gambar hanya untuk ilustrasi.",
        showOnHomepage: true,
        showInPopup: true,
        popupPriority: 10,
        sortOrder: 1,
        seoTitle: "Undian Akhir Tahun 2026 Berhadiah TV & Tiket Hotel | Optik I See You",
        seoDescription:
          "Ikuti Undian Akhir Tahun 2026 di Optik I See You. Raih kesempatan memenangkan TV Android, Tiket Hotel, Kompor, Magiccom, dan Voucher Rp250.000.",
        createdAt: "2026-11-01T00:00:00+07:00",
        updatedAt: "2026-11-19T10:00:00+07:00",
        createdBy: "Owner Optik I See You",
      },
      {
        id: "promo-hari-guru-2026",
        slug: "promo-hari-guru",
        title: "Special Hari Guru — Diskon Pelajar & Mahasiswa",
        subtitle:
          "Diskon 20% Frame 1 Fokus & 15% Frame 2 Fokus untuk Guru, Dosen, Pelajar & Mahasiswa",
        excerpt:
          "Spesial Hari Guru! Dapatkan potongan diskon hingga 20% untuk frame kacamata 1 Fokus dan 15% untuk 2 Fokus bagi seluruh Guru, Pelajar, dan Mahasiswa.",
        description:
          "Dalam rangka memperingati Hari Guru Nasional, Optik I See You mempersembahkan apresiasi spesial berupa diskon frame kacamata untuk seluruh Pahlawan Tanpa Tanda Jasa, Dosen, Pelajar, dan Mahasiswa:\n\n• Potongan 20% Frame untuk pembelian paket lensa 1 Fokus (Single Vision)\n• Potongan 15% Frame untuk pembelian paket lensa 2 Fokus (Bifokal / Progresif)\n• Gratis Pemeriksaan Refraksi Mata Digital secara lengkap dan akurat\n\nCukup tunjukkan kartu identitas pelajar/mahasiswa atau kartu pengajar saat bertransaksi di kasir cabang resmi Optik I See You.",
        category: "weekly",
        status: "published",
        startAt: "2026-11-23T00:00:00+07:00",
        endAt: "2026-11-26T23:59:59+07:00",
        heroImageUrl: "/PROMO/promo-hari-guru-display.webp",
        heroImageAlt:
          "Poster Promo Special Hari Guru Diskon Pelajar dan Mahasiswa Optik I See You 23-26 November 2026",
        galleryImages: [
          {
            url: "/PROMO/promo-hari-guru.webp",
            alt: "Special Hari Guru Diskon Pelajar dan Mahasiswa 23-26 November 2026",
          },
          {
            url: "/PROMO/undian-akhir-tahun.webp",
            alt: "Undian Akhir Tahun 2026",
          },
          {
            url: "/PROMO/lensa-antifog-blueray.webp",
            alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb",
          },
        ],
        detailLayout: "image-left",
        collageLayout: "grid-2",
        ctaLabel: "Klaim Promo Hari Guru",
        ctaUrl: "",
        termsAndConditions:
          "1. Periode promo berlaku terbatas mulai 23 hingga 26 November 2026.\n2. Diskon 20% berlaku untuk pembelian frame kacamata dengan paket lensa 1 Fokus (Single Vision).\n3. Diskon 15% berlaku untuk pembelian frame kacamata dengan paket lensa 2 Fokus (Bifokal atau Progresif).\n4. Berlaku khusus untuk Guru, Dosen, Pelajar, dan Mahasiswa dengan menunjukkan kartu identitas/kartu pengajar/kartu pelajar yang masih aktif.\n5. Berlaku di seluruh 4 cabang resmi Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap).\n6. Termasuk fasilitas periksa mata gratis dan fitting kenyamanan kacamata.\n7. Syarat dan ketentuan berlaku.",
        showOnHomepage: true,
        showInPopup: false,
        popupPriority: 8,
        sortOrder: 2,
        seoTitle:
          "Promo Hari Guru Diskon Pelajar & Mahasiswa Hingga 20% | Optik I See You",
        seoDescription:
          "Promo Spesial Hari Guru di Optik I See You: Diskon 20% frame 1 fokus dan 15% frame 2 fokus khusus guru, dosen, pelajar, dan mahasiswa.",
        createdAt: "2026-11-23T00:00:00+07:00",
        updatedAt: "2026-11-23T12:00:00+07:00",
        createdBy: "Owner Optik I See You",
      },
      {
        id: "promo-lensa-antifog-blueray-2026",
        slug: "promo-lensa-antifog-blueray",
        title: "Promo Lensa Antifog Blueray — Potongan Up to 300rb",
        subtitle: "Embun? Ada Antifog! Nikmati Penglihatan Jernih Bebas Embun & Proteksi Sinar Biru",
        excerpt:
          "Embun saat minum kopi atau pakai masker? Upgrade ke Lensa Antifog Blueray dengan potongan harga hingga Rp300.000 selama bulan November 2026.",
        description:
          "Embun mengganggu aktivitas harian kamu? Atasi dengan Lensa Antifog Blueray dari Optik I See You!\n\nPerbedaan nyata Lensa Biasa vs Lensa Antifog:\n• Lensa Biasa: Cepat berembun pekat saat terkena uap panas kopi, masker, atau perubahan suhu ruangan ber-AC.\n• Lensa Antifog: Lapisan hidrofobik mutakhir yang mencegah kondensasi tetesan air sehingga pandangan tetap jernih seketika.\n• Dilengkapi proteksi Blueray untuk menangkal radiasi sinar biru monitor komputer dan gadget.\n\nDapatkan POTONGAN UP TO 300rb khusus selama bulan November 2026 di seluruh cabang Optik I See You.",
        category: "monthly",
        status: "published",
        startAt: "2026-11-01T00:00:00+07:00",
        endAt: "2026-11-30T23:59:59+07:00",
        heroImageUrl: "/PROMO/lensa-antifog-blueray-display.webp",
        heroImageAlt: "Poster Promo Lensa Antifog Blueray Potongan Up to 300rb",
        galleryImages: [
          {
            url: "/PROMO/lensa-antifog-blueray.webp",
            alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb",
          },
          {
            url: "/PROMO/undian-akhir-tahun.webp",
            alt: "Undian Akhir Tahun 2026",
          },
          {
            url: "/PROMO/promo-hari-guru.webp",
            alt: "Special Hari Guru Diskon Pelajar & Mahasiswa",
          },
        ],
        detailLayout: "image-left",
        collageLayout: "grid-2",
        ctaLabel: "Konsultasi Lensa Antifog",
        ctaUrl: "",
        termsAndConditions:
          "1. Periode promo berlaku selama bulan November 2026 (1 – 30 November 2026).\n2. Potongan harga hingga Rp300.000 berlaku untuk pemesanan paket lensa Antifog Blueray tertentu.\n3. Termasuk pemeriksaan refraksi mata digital gratis dan fitting kenyamanan kacamata.\n4. Pemotongan lensa diproses di lab optik CNC otomatis presisi tinggi.\n5. Berlaku di 4 cabang resmi Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap).\n6. Syarat dan ketentuan berlaku.",
        showOnHomepage: true,
        showInPopup: false,
        popupPriority: 6,
        sortOrder: 3,
        seoTitle: "Promo Lensa Antifog Blueray Potongan Up to 300rb | Optik I See You",
        seoDescription:
          "Promo Lensa Antifog Blueray di Optik I See You selama November 2026: Potongan harga hingga Rp300.000, bebas embun dan anti radiasi layar gadget.",
        createdAt: "2026-11-01T00:00:00+07:00",
        updatedAt: "2026-11-19T10:00:00+07:00",
        createdBy: "Owner Optik I See You",
      },
    ];

    await writeStore("promos", seededPromos);

    // Initial popup settings: enable popup and target Undian Akhir Tahun
    const defaultPopupSettings: PromoPopupSettings = {
      enabled: true,
      featuredPromoId: "promo-undian-akhir-tahun-2026",
      frequency: "once-per-session",
      delayMs: 150,
      layout: "image-left",
      updatedAt: new Date().toISOString(),
      updatedBy: "Owner Optik I See You",
    };
    await writeStore("promo-settings", defaultPopupSettings);

    await addAuditLog({
      userEmail: "system",
      action: "seed",
      module: "promos",
      targetId: "promo-undian-akhir-tahun-2026",
      details: { message: "Seeded initial authentic campaign promos" },
    });
  } else {
    // Migration & cleanup: remove expired NOvemBLUR, ensure Hari Guru exists, and set Antifog to monthly
    let needsUpdate = false;
    let updatedList = [...existingPromos];

    // 1. Remove expired NOvemBLUR
    if (updatedList.some((p) => p.slug.includes("novemblur") || p.id.includes("novemblur"))) {
      updatedList = updatedList.filter(
        (p) => !p.slug.includes("novemblur") && !p.id.includes("novemblur")
      );
      needsUpdate = true;
    }

    // 2. Ensure Hari Guru exists
    if (!updatedList.some((p) => p.slug.includes("guru") || p.id.includes("guru"))) {
      updatedList.push({
        id: "promo-hari-guru-2026",
        slug: "promo-hari-guru",
        title: "Special Hari Guru — Diskon Pelajar & Mahasiswa",
        subtitle:
          "Diskon 20% Frame 1 Fokus & 15% Frame 2 Fokus untuk Guru, Dosen, Pelajar & Mahasiswa",
        excerpt:
          "Spesial Hari Guru! Dapatkan potongan diskon hingga 20% untuk frame kacamata 1 Fokus dan 15% untuk 2 Fokus bagi seluruh Guru, Pelajar, dan Mahasiswa.",
        description:
          "Dalam rangka memperingati Hari Guru Nasional, Optik I See You mempersembahkan apresiasi spesial berupa diskon frame kacamata untuk seluruh Pahlawan Tanpa Tanda Jasa, Dosen, Pelajar, dan Mahasiswa:\n\n• Potongan 20% Frame untuk pembelian paket lensa 1 Fokus (Single Vision)\n• Potongan 15% Frame untuk pembelian paket lensa 2 Fokus (Bifokal / Progresif)\n• Gratis Pemeriksaan Refraksi Mata Digital secara lengkap dan akurat\n\nCukup tunjukkan kartu identitas pelajar/mahasiswa atau kartu pengajar saat bertransaksi di kasir cabang resmi Optik I See You.",
        category: "weekly",
        status: "published",
        startAt: "2026-11-23T00:00:00+07:00",
        endAt: "2026-11-26T23:59:59+07:00",
        heroImageUrl: "/PROMO/promo-hari-guru-display.webp",
        heroImageAlt:
          "Poster Promo Special Hari Guru Diskon Pelajar dan Mahasiswa Optik I See You 23-26 November 2026",
        galleryImages: [
          {
            url: "/PROMO/promo-hari-guru.webp",
            alt: "Special Hari Guru Diskon Pelajar dan Mahasiswa 23-26 November 2026",
          },
          {
            url: "/PROMO/undian-akhir-tahun.webp",
            alt: "Undian Akhir Tahun 2026",
          },
          {
            url: "/PROMO/lensa-antifog-blueray.webp",
            alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb",
          },
        ],
        detailLayout: "image-left",
        collageLayout: "grid-2",
        ctaLabel: "Klaim Promo Hari Guru",
        ctaUrl: "",
        termsAndConditions:
          "1. Periode promo berlaku terbatas mulai 23 hingga 26 November 2026.\n2. Diskon 20% berlaku untuk pembelian frame kacamata dengan paket lensa 1 Fokus (Single Vision).\n3. Diskon 15% berlaku untuk pembelian frame kacamata dengan paket lensa 2 Fokus (Bifokal atau Progresif).\n4. Berlaku khusus untuk Guru, Dosen, Pelajar, dan Mahasiswa dengan menunjukkan kartu identitas/kartu pengajar/kartu pelajar yang masih aktif.\n5. Berlaku di seluruh 4 cabang resmi Optik I See You (Purwokerto, Purbalingga, Wonosobo, Cilacap).\n6. Termasuk fasilitas periksa mata gratis dan fitting kenyamanan kacamata.\n7. Syarat dan ketentuan berlaku.",
        showOnHomepage: true,
        showInPopup: false,
        popupPriority: 8,
        sortOrder: 2,
        seoTitle:
          "Promo Hari Guru Diskon Pelajar & Mahasiswa Hingga 20% | Optik I See You",
        seoDescription:
          "Promo Spesial Hari Guru di Optik I See You: Diskon 20% frame 1 fokus dan 15% frame 2 fokus khusus guru, dosen, pelajar, dan mahasiswa.",
        createdAt: "2026-11-23T00:00:00+07:00",
        updatedAt: "2026-11-23T12:00:00+07:00",
        createdBy: "Owner Optik I See You",
      });
      needsUpdate = true;
    }

    // 3. Ensure Antifog is monthly and valid for November
    const antifogIndex = updatedList.findIndex(
      (p) => p.slug.includes("antifog") || p.id.includes("antifog")
    );
    if (antifogIndex !== -1) {
      if (
        updatedList[antifogIndex].category !== "monthly" ||
        updatedList[antifogIndex].startAt !== "2026-11-01T00:00:00+07:00" ||
        updatedList[antifogIndex].heroImageUrl?.endsWith(".png")
      ) {
        updatedList[antifogIndex].category = "monthly";
        updatedList[antifogIndex].startAt = "2026-11-01T00:00:00+07:00";
        updatedList[antifogIndex].endAt = "2026-11-30T23:59:59+07:00";
        updatedList[antifogIndex].heroImageUrl = "/PROMO/lensa-antifog-blueray-display.webp";
        updatedList[antifogIndex].galleryImages = [
          { url: "/PROMO/lensa-antifog-blueray.webp", alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb" },
          { url: "/PROMO/undian-akhir-tahun.webp", alt: "Undian Akhir Tahun 2026" },
          { url: "/PROMO/promo-hari-guru.webp", alt: "Special Hari Guru Diskon Pelajar & Mahasiswa" },
        ];
        updatedList[antifogIndex].sortOrder = 3;
        needsUpdate = true;
      }
    }

    // 4. Ensure Undian has WebP images
    const undianIndex = updatedList.findIndex((p) => p.slug.includes("undian"));
    if (undianIndex !== -1 && updatedList[undianIndex].heroImageUrl?.endsWith(".png")) {
      updatedList[undianIndex].heroImageUrl = "/PROMO/undian-akhir-tahun-display.webp";
      updatedList[undianIndex].galleryImages = [
        { url: "/PROMO/undian-akhir-tahun.webp", alt: "Undian Akhir Tahun 2026 - TV Android, Tiket Hotel, Kompor, Magiccom, Voucher" },
        { url: "/PROMO/promo-hari-guru.webp", alt: "Special Hari Guru Diskon Pelajar & Mahasiswa" },
        { url: "/PROMO/lensa-antifog-blueray.webp", alt: "Promo Lensa Antifog Blueray Potongan Up to 300rb" },
      ];
      needsUpdate = true;
    }

    if (needsUpdate) {
      await writeStore("promos", updatedList);
    }
  }
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

// =============================================================================
// REPOSITORY METHODS: FRAMES
// =============================================================================

export async function getFrames(options?: { onlyPublished?: boolean; search?: string; shape?: string }): Promise<FrameItem[]> {
  await seedInitialDataIfNeeded();
  let items = await readStore<FrameItem[]>("frames", []);

  if (options?.onlyPublished) {
    items = items.filter((item) => item.isPublished);
  }

  if (options?.shape && options.shape !== "all") {
    items = items.filter((item) => item.shape.toLowerCase() === options.shape!.toLowerCase());
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.collection.toLowerCase().includes(q) ||
        (item.sku && item.sku.toLowerCase().includes(q))
    );
  }

  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getFrameById(id: string): Promise<FrameItem | null> {
  const frames = await getFrames();
  return frames.find((f) => f.id === id) || null;
}

export async function saveFrame(frame: FrameItem): Promise<FrameItem> {
  await seedInitialDataIfNeeded();
  const frames = await readStore<FrameItem[]>("frames", []);
  const index = frames.findIndex((f) => f.id === frame.id);

  frame.updatedAt = new Date().toISOString();

  if (index >= 0) {
    frames[index] = { ...frames[index], ...frame };
  } else {
    frame.createdAt = new Date().toISOString();
    frames.push(frame);
  }

  await writeStore("frames", frames);
  await syncManifestWithFrames(frames);
  return frame;
}

export async function deleteFrame(id: string): Promise<boolean> {
  await seedInitialDataIfNeeded();
  const frames = await readStore<FrameItem[]>("frames", []);
  const filtered = frames.filter((f) => f.id !== id);
  if (filtered.length === frames.length) return false;

  await writeStore("frames", filtered);
  await syncManifestWithFrames(filtered);
  return true;
}

/**
 * Synchronize AR Try-On manifest.json with frame catalog changes.
 * Ensures AR try-on camera never experiences broken assets or missing references.
 */
async function syncManifestWithFrames(frames: FrameItem[]) {
  try {
    const manifestPath = path.join(process.cwd(), "public", "glasses", "manifest.json");
    if (!fs.existsSync(manifestPath)) return;

    const currentManifest: any[] = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const manifestMap = new Map<string, any>();
    currentManifest.forEach((item) => {
      if (item.id) manifestMap.set(item.id, item);
    });

    // Update manifest entries from frames that have glassesId
    for (const frame of frames) {
      if (frame.glassesId && manifestMap.has(frame.glassesId)) {
        const existing = manifestMap.get(frame.glassesId);
        if (frame.fitWidthRatio !== undefined) existing.fitWidthRatio = frame.fitWidthRatio;
        if (frame.ipdScaleRef !== undefined) existing.ipdScaleRef = frame.ipdScaleRef;
        if (frame.model3D) existing.model3D = frame.model3D;
        if (frame.recommendedFor) existing.recommendedFor = frame.recommendedFor;
        manifestMap.set(frame.glassesId, existing);
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(Array.from(manifestMap.values()), null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not sync manifest.json:", err);
  }
}

// =============================================================================
// REPOSITORY METHODS: SOFTLENS
// =============================================================================

export async function getSoftlens(options?: { onlyPublished?: boolean; search?: string; category?: string }): Promise<SoftlensItem[]> {
  await seedInitialDataIfNeeded();
  let items = await readStore<SoftlensItem[]>("softlens", []);

  if (options?.onlyPublished) {
    items = items.filter((item) => item.isPublished);
  }

  if (options?.category && options.category !== "all") {
    items = items.filter((item) => item.category === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        (item.brand && item.brand.toLowerCase().includes(q)) ||
        item.variants.some((v) => v.name.toLowerCase().includes(q))
    );
  }

  return items.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getSoftlensById(id: string): Promise<SoftlensItem | null> {
  const items = await getSoftlens();
  return items.find((item) => item.id === id) || null;
}

export async function saveSoftlens(item: SoftlensItem): Promise<SoftlensItem> {
  await seedInitialDataIfNeeded();
  const items = await readStore<SoftlensItem[]>("softlens", []);
  const index = items.findIndex((i) => i.id === item.id);

  item.updatedAt = new Date().toISOString();
  item.basePriceFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(item.basePrice);

  if (item.maxPrice) {
    item.maxPriceFormatted = new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(item.maxPrice);
  }

  if (index >= 0) {
    items[index] = { ...items[index], ...item };
  } else {
    item.createdAt = new Date().toISOString();
    items.push(item);
  }

  await writeStore("softlens", items);
  return item;
}

export async function deleteSoftlens(id: string): Promise<boolean> {
  await seedInitialDataIfNeeded();
  const items = await readStore<SoftlensItem[]>("softlens", []);
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) return false;

  await writeStore("softlens", filtered);
  return true;
}

// =============================================================================
// REPOSITORY METHODS: BLOG
// =============================================================================

export async function getBlogPosts(options?: { onlyPublished?: boolean; category?: string; search?: string }): Promise<BlogPostItem[]> {
  await seedInitialDataIfNeeded();
  let items = await readStore<BlogPostItem[]>("blog", []);

  if (options?.onlyPublished) {
    items = items.filter((p) => p.status === "published");
  }

  if (options?.category && options.category !== "all") {
    items = items.filter((p) => p.category === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
    );
  }

  return items.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug) || null;
}

export function calculateReadingTime(content: string): number {
  const words = content
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function saveBlogPost(post: BlogPostItem): Promise<BlogPostItem> {
  await seedInitialDataIfNeeded();
  const posts = await readStore<BlogPostItem[]>("blog", []);
  const index = posts.findIndex((p) => p.slug === post.slug);

  post.updatedAt = new Date().toISOString();
  post.readingTime = calculateReadingTime(post.content);

  if (index >= 0) {
    posts[index] = { ...posts[index], ...post };
  } else {
    post.createdAt = post.createdAt || new Date().toISOString();
    posts.push(post);
  }

  await writeStore("blog", posts);
  return post;
}

export async function deleteBlogPost(slug: string): Promise<boolean> {
  await seedInitialDataIfNeeded();
  const posts = await readStore<BlogPostItem[]>("blog", []);
  const filtered = posts.filter((p) => p.slug !== slug);
  if (filtered.length === posts.length) return false;

  await writeStore("blog", filtered);
  return true;
}

// =============================================================================
// REPOSITORY METHODS: MEDIA
// =============================================================================

export async function getMediaFiles(options?: { search?: string; category?: string }): Promise<MediaFile[]> {
  await seedInitialDataIfNeeded();
  let items = await readStore<MediaFile[]>("media", []);

  if (options?.category && options.category !== "all") {
    items = items.filter((m) => m.category === options.category);
  }

  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.altText && m.altText.toLowerCase().includes(q))
    );
  }

  return items.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function saveMediaFile(file: MediaFile): Promise<MediaFile> {
  await seedInitialDataIfNeeded();
  const files = await readStore<MediaFile[]>("media", []);
  const index = files.findIndex((f) => f.id === file.id);

  file.updatedAt = new Date().toISOString();

  if (index >= 0) {
    files[index] = { ...files[index], ...file };
  } else {
    file.createdAt = new Date().toISOString();
    files.unshift(file);
  }

  await writeStore("media", files);
  return file;
}

export async function deleteMediaFile(id: string): Promise<{ success: boolean; inUseWarning?: string }> {
  await seedInitialDataIfNeeded();
  const files = await readStore<MediaFile[]>("media", []);
  const target = files.find((f) => f.id === id);
  if (!target) return { success: false };

  // Check if media is referenced
  const frames = await getFrames();
  const softlens = await getSoftlens();
  const blog = await getBlogPosts();

  const url = target.url;
  const usedInFrames = frames.some(
    (f) => f.image === url || f.images.includes(url) || (f.specsImage && f.specsImage === url)
  );
  const usedInSoftlens = softlens.some(
    (s) => s.coverImage === url || s.variants.some((v) => v.image === url)
  );
  const usedInBlog = blog.some(
    (b) => b.coverImage === url || b.content.includes(url)
  );

  if (usedInFrames || usedInSoftlens || usedInBlog) {
    const usages: string[] = [];
    if (usedInFrames) usages.push("Katalog Frame");
    if (usedInSoftlens) usages.push("Katalog Softlens");
    if (usedInBlog) usages.push("Artikel Blog");

    return {
      success: false,
      inUseWarning: `Aset ini masih digunakan pada: ${usages.join(", ")}. Hapus referensinya terlebih dahulu sebelum menghapus aset ini.`,
    };
  }

  const filtered = files.filter((f) => f.id !== id);
  await writeStore("media", filtered);
  return { success: true };
}

// =============================================================================
// REPOSITORY METHODS: WEBSITE SETTINGS
// =============================================================================

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  await seedInitialDataIfNeeded();
  const settings = await readStore<WebsiteSettings | null>("settings", null);
  if (settings) return settings;

  // Fallback to defaults
  return {
    heroHeadline: "Kacamata & Softlens Terbaik untuk Kamu",
    heroSubheadline:
      "Coba puluhan model kacamata trendi di wajahmu secara virtual dengan AR Try-On real-time, atau kunjungi 4 cabang resmi kami.",
    heroCtaText: "Coba AR Try-On",
    heroCtaLink: "/start",
    branches: BRANCHES,
    globalSeoTitle: "Optik I See You | Kacamata Trendy & Softlens Resmi",
    globalSeoDescription:
      "Koleksi kacamata kekinian, softlens resmi Kemenkes RI, periksa mata akurat gratis, dan AR Try-On di Purwokerto, Purbalingga, Wonosobo, Cilacap.",
    contactPhone: "0895-4156-14261",
    contactWhatsapp: "62895415614261",
    instagramUrl: "https://www.instagram.com/iseeyou.glasses/",
    shopeeUrl: "https://shopee.co.id/iseeyou.id",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveWebsiteSettings(settings: WebsiteSettings): Promise<WebsiteSettings> {
  await seedInitialDataIfNeeded();
  settings.updatedAt = new Date().toISOString();
  await writeStore("settings", settings);
  return settings;
}

// =============================================================================
// REPOSITORY METHODS: ADMIN USERS & AUDIT LOGS
// =============================================================================

export async function getAdminUsers(): Promise<Omit<AdminUser, "passwordHash" | "salt">[]> {
  await seedInitialDataIfNeeded();
  const users = await readStore<AdminUser[]>("users", []);
  return users.map(({ passwordHash, salt, ...safeUser }) => safeUser);
}

export async function getAdminUserByEmailWithAuth(email: string): Promise<AdminUser | null> {
  await seedInitialDataIfNeeded();
  const users = await readStore<AdminUser[]>("users", []);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  await seedInitialDataIfNeeded();
  const users = await readStore<AdminUser[]>("users", []);
  return users.find((u) => u.id === id) || null;
}

export async function saveAdminUser(user: AdminUser): Promise<void> {
  await seedInitialDataIfNeeded();
  const users = await readStore<AdminUser[]>("users", []);
  const index = users.findIndex((u) => u.id === user.id);

  user.updatedAt = new Date().toISOString();

  if (index >= 0) {
    users[index] = { ...users[index], ...user };
  } else {
    users.push(user);
  }

  await writeStore("users", users);
}

export async function deleteAdminUser(id: string): Promise<{ success: boolean; error?: string }> {
  await seedInitialDataIfNeeded();
  const users = await readStore<AdminUser[]>("users", []);
  const target = users.find((u) => u.id === id);

  if (!target) {
    return { success: false, error: "Pengguna tidak ditemukan." };
  }

  // Prevent deleting the last owner
  if (target.role === "owner") {
    const ownersCount = users.filter((u) => u.role === "owner" && u.isActive).length;
    if (ownersCount <= 1) {
      return { success: false, error: "Tidak dapat menghapus satu-satunya akun Owner." };
    }
  }

  const filtered = users.filter((u) => u.id !== id);
  await writeStore("users", filtered);
  return { success: true };
}

export async function addAuditLog(entry: Omit<AuditLog, "id" | "createdAt">): Promise<void> {
  try {
    const logs = await readStore<AuditLog[]>("audit", []);
    const newLog: AuditLog = {
      ...entry,
      id: `log-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    // Keep last 1,000 logs
    const capped = logs.slice(0, 1000);
    await writeStore("audit", capped);
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

export async function getAuditLogs(options?: { module?: string; limit?: number }): Promise<AuditLog[]> {
  const logs = await readStore<AuditLog[]>("audit", []);
  let filtered = logs;
  if (options?.module && options.module !== "all") {
    filtered = filtered.filter((l) => l.module === options.module);
  }
  return filtered.slice(0, options?.limit || 100);
}

// =============================================================================
// REPOSITORY METHODS: SESSIONS
// =============================================================================

export async function createAdminSession(session: AdminSession): Promise<void> {
  const sessions = await readStore<AdminSession[]>("sessions", []);
  sessions.push(session);
  await writeStore("sessions", sessions);
}

export async function getAdminSession(token: string): Promise<AdminSession | null> {
  const sessions = await readStore<AdminSession[]>("sessions", []);
  const found = sessions.find((s) => s.token === token);
  if (!found) return null;

  // Check expiration
  if (new Date(found.expiresAt).getTime() < Date.now()) {
    // Expired: remove
    const active = sessions.filter((s) => s.token !== token);
    await writeStore("sessions", active);
    return null;
  }

  return found;
}

export async function revokeAdminSession(token: string): Promise<void> {
  const sessions = await readStore<AdminSession[]>("sessions", []);
  const active = sessions.filter((s) => s.token !== token);
  await writeStore("sessions", active);
}

// =============================================================================
// REPOSITORY METHODS: SPONSORSHIPS
// =============================================================================

export async function getSponsorships(): Promise<any[]> {
  try {
    const { readSponsorships } = await import("@/lib/db/sponsorships");
    return await readSponsorships();
  } catch (err) {
    console.error("Failed to read sponsorships:", err);
    return [];
  }
}

// =============================================================================
// REPOSITORY METHODS: PROMOS & CAMPAIGNS
// =============================================================================

export async function getPromos(options?: {
  category?: string;
  status?: string;
  search?: string;
  onlyActive?: boolean;
}): Promise<PromoItem[]> {
  await seedInitialDataIfNeeded();
  const promos = await readStore<PromoItem[]>("promos", []);
  let filtered = [...promos];

  if (options?.category && options.category !== "all") {
    filtered = filtered.filter((p) => p.category === options.category);
  }

  if (options?.status && options.status !== "all") {
    filtered = filtered.filter((p) => p.status === options.status);
  }

  if (options?.search && options.search.trim() !== "") {
    const query = options.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.subtitle?.toLowerCase().includes(query) ||
        p.excerpt.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
    );
  }

  if (options?.onlyActive) {
    const now = new Date();
    filtered = filtered.filter((p) => isPromoActive(p, now));
  }

  // Sort by sortOrder ascending, then startAt descending
  return filtered.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
  });
}

export async function getPromoById(id: string): Promise<PromoItem | null> {
  await seedInitialDataIfNeeded();
  const promos = await readStore<PromoItem[]>("promos", []);
  return promos.find((p) => p.id === id) || null;
}

export async function getPromoBySlug(slug: string): Promise<PromoItem | null> {
  await seedInitialDataIfNeeded();
  const promos = await readStore<PromoItem[]>("promos", []);
  const normalized = (slug || "").trim().toLowerCase();
  if (!normalized) return null;

  return (
    promos.find((p) => p.slug.toLowerCase() === normalized) ||
    promos.find((p) => p.slug.toLowerCase() === `${normalized}-2026`) ||
    promos.find((p) => normalized.startsWith(p.slug.toLowerCase())) ||
    promos.find((p) => p.slug.toLowerCase().startsWith(normalized)) ||
    null
  );
}

/**
 * Public method: Returns ONLY published and currently active promos.
 */
export async function getPublicPromos(options?: {
  category?: PromoCategory;
  limit?: number;
}): Promise<PromoItem[]> {
  await seedInitialDataIfNeeded();
  const promos = await readStore<PromoItem[]>("promos", []);
  const now = new Date();

  let active = promos.filter((p) => isPromoActive(p, now));

  if (options?.category) {
    active = active.filter((p) => p.category === options.category);
  }

  // Sort by sortOrder ascending, then startAt descending
  active.sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return new Date(b.startAt).getTime() - new Date(a.startAt).getTime();
  });

  if (options?.limit && options.limit > 0) {
    return active.slice(0, options.limit);
  }

  return active;
}

/**
 * Public method for Homepage: Returns active promos with showOnHomepage === true.
 */
export async function getHomepagePromos(limit = 3): Promise<PromoItem[]> {
  const active = await getPublicPromos();
  const homepagePromos = active.filter((p) => p.showOnHomepage);
  return homepagePromos.slice(0, limit);
}

export async function getPromoPopupSettings(): Promise<PromoPopupSettings> {
  await seedInitialDataIfNeeded();
  return await readStore<PromoPopupSettings>("promo-settings", DEFAULT_PROMO_POPUP_SETTINGS);
}

export async function savePromoPopupSettings(
  settings: Partial<PromoPopupSettings>,
  adminUser?: { email: string; name?: string; id?: string }
): Promise<PromoPopupSettings> {
  const current = await getPromoPopupSettings();
  const updated: PromoPopupSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.name || adminUser?.email || "Admin",
  };

  await writeStore("promo-settings", updated);

  if (adminUser) {
    await addAuditLog({
      userId: adminUser.id,
      userName: adminUser.name,
      userEmail: adminUser.email,
      action: "update",
      module: "promos",
      targetId: "popup-settings",
      details: {
        enabled: updated.enabled,
        featuredPromoId: updated.featuredPromoId,
        frequency: updated.frequency,
      },
    });
  }

  return updated;
}

/**
 * Public method: Returns the featured promo for popup display along with settings.
 */
export async function getFeaturedPopupPromo(): Promise<{
  promo: PromoItem | null;
  settings: PromoPopupSettings;
}> {
  const settings = await getPromoPopupSettings();

  if (!settings.enabled) {
    return { promo: null, settings };
  }

  const now = new Date();
  const promos = await readStore<PromoItem[]>("promos", []);

  // 1. If a specific featuredPromoId is set and still active
  if (settings.featuredPromoId) {
    const specific = promos.find((p) => p.id === settings.featuredPromoId);
    if (specific && isPromoActive(specific, now)) {
      return { promo: specific, settings };
    }
  }

  // 2. Otherwise pick from active promos where showInPopup is true
  const candidates = promos.filter((p) => p.showInPopup && isPromoActive(p, now));
  if (candidates.length === 0) {
    return { promo: null, settings };
  }

  // Sort by popupPriority descending, then sortOrder ascending
  candidates.sort((a, b) => {
    if (b.popupPriority !== a.popupPriority) {
      return b.popupPriority - a.popupPriority;
    }
    return a.sortOrder - b.sortOrder;
  });

  return { promo: candidates[0], settings };
}

export async function savePromo(
  data: Partial<PromoItem> & { title: string },
  adminUser: { email: string; name?: string; id?: string }
): Promise<PromoItem> {
  const promos = await readStore<PromoItem[]>("promos", []);
  const nowIso = new Date().toISOString();

  // Validate title
  const title = String(data.title || "").trim();
  if (!title) {
    throw new Error("Judul promo wajib diisi.");
  }

  // Validate dates
  const startAt = data.startAt ? new Date(data.startAt).toISOString() : nowIso;
  let endAt: string | undefined = undefined;
  if (data.endAt && data.endAt.trim() !== "") {
    const endTimestamp = new Date(data.endAt).getTime();
    const startTimestamp = new Date(startAt).getTime();
    if (isNaN(endTimestamp)) {
      throw new Error("Format tanggal berakhir tidak valid.");
    }
    if (endTimestamp <= startTimestamp) {
      throw new Error("Tanggal berakhir promo harus lebih lanjut daripada tanggal mulai.");
    }
    endAt = new Date(data.endAt).toISOString();
  }

  // Validate hero image if publishing
  const status: PromoStatus = data.status || "draft";
  const heroImageUrl = String(data.heroImageUrl || "").trim();
  if (status === "published" && !heroImageUrl) {
    throw new Error("Promo yang diterbitkan wajib memiliki gambar utama.");
  }

  // Determine slug
  let baseSlug = slugify(data.slug || title);
  if (!baseSlug) {
    baseSlug = `promo-${Date.now()}`;
  }

  const existingIndex = data.id ? promos.findIndex((p) => p.id === data.id) : -1;
  const isNew = existingIndex === -1;
  const promoId = isNew ? `promo-${Date.now()}-${Math.floor(100 + Math.random() * 900)}` : data.id!;

  // Ensure slug uniqueness against all OTHER promos
  let finalSlug = baseSlug;
  let counter = 1;
  while (promos.some((p) => p.slug === finalSlug && p.id !== promoId)) {
    counter++;
    finalSlug = `${baseSlug}-${counter}`;
  }

  const existingPromo = !isNew ? promos[existingIndex] : null;

  const promoItem: PromoItem = {
    id: promoId,
    slug: finalSlug,
    title,
    subtitle: data.subtitle ? String(data.subtitle).trim() : undefined,
    excerpt: String(data.excerpt || "").trim(),
    description: String(data.description || "").trim(),
    category: (data.category as PromoCategory) || "special",
    status,
    startAt,
    endAt,
    heroMediaId: data.heroMediaId,
    heroImageUrl,
    heroImageAlt: data.heroImageAlt ? String(data.heroImageAlt).trim() : title,
    galleryMediaIds: Array.isArray(data.galleryMediaIds) ? data.galleryMediaIds : [],
    galleryImages: Array.isArray(data.galleryImages) ? data.galleryImages : [],
    detailLayout: data.detailLayout === "image-right" ? "image-right" : "image-left",
    collageLayout: data.collageLayout || "grid-2",
    ctaLabel: data.ctaLabel ? String(data.ctaLabel).trim() : undefined,
    ctaUrl: data.ctaUrl ? String(data.ctaUrl).trim() : undefined,
    termsAndConditions: data.termsAndConditions ? String(data.termsAndConditions).trim() : undefined,
    showOnHomepage: Boolean(data.showOnHomepage),
    showInPopup: Boolean(data.showInPopup),
    popupPriority: typeof data.popupPriority === "number" ? data.popupPriority : 0,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : (existingPromo?.sortOrder ?? promos.length + 1),
    seoTitle: data.seoTitle ? String(data.seoTitle).trim() : title,
    seoDescription: data.seoDescription ? String(data.seoDescription).trim() : data.excerpt,
    createdAt: existingPromo?.createdAt || nowIso,
    updatedAt: nowIso,
    createdBy: existingPromo?.createdBy || adminUser.name || adminUser.email,
    updatedBy: adminUser.name || adminUser.email,
  };

  if (isNew) {
    promos.unshift(promoItem);
  } else {
    promos[existingIndex] = promoItem;
  }

  await writeStore("promos", promos);

  await addAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userEmail: adminUser.email,
    action: isNew ? "create" : "update",
    module: "promos",
    targetId: promoItem.id,
    details: {
      title: promoItem.title,
      slug: promoItem.slug,
      category: promoItem.category,
      status: promoItem.status,
    },
  });

  return promoItem;
}

export async function deletePromo(
  id: string,
  adminUser: { email: string; name?: string; id?: string }
): Promise<boolean> {
  const promos = await readStore<PromoItem[]>("promos", []);
  const target = promos.find((p) => p.id === id);
  if (!target) return false;

  const filtered = promos.filter((p) => p.id !== id);
  await writeStore("promos", filtered);

  // If this promo was the featured promo in popup settings, reset it
  const settings = await getPromoPopupSettings();
  if (settings.featuredPromoId === id) {
    await savePromoPopupSettings({ ...settings, featuredPromoId: undefined });
  }

  await addAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userEmail: adminUser.email,
    action: "delete",
    module: "promos",
    targetId: target.id,
    details: {
      title: target.title,
      slug: target.slug,
    },
  });

  return true;
}

export async function updatePromoStatus(
  id: string,
  status: PromoStatus,
  adminUser: { email: string; name?: string; id?: string }
): Promise<PromoItem | null> {
  const promos = await readStore<PromoItem[]>("promos", []);
  const targetIndex = promos.findIndex((p) => p.id === id);
  if (targetIndex === -1) return null;

  const target = promos[targetIndex];
  if (status === "published" && !target.heroImageUrl) {
    throw new Error("Promo tidak dapat diterbitkan tanpa gambar utama.");
  }

  target.status = status;
  target.updatedAt = new Date().toISOString();
  target.updatedBy = adminUser.name || adminUser.email;
  promos[targetIndex] = target;

  await writeStore("promos", promos);

  await addAuditLog({
    userId: adminUser.id,
    userName: adminUser.name,
    userEmail: adminUser.email,
    action: status === "published" ? "publish" : status === "archived" ? "archive" : "update",
    module: "promos",
    targetId: target.id,
    details: {
      title: target.title,
      status,
    },
  });

  return target;
}


