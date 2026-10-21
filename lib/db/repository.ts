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
} from "./types";

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
