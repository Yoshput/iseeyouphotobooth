import { ProductColorVariant, ProductDimensions } from "@/lib/catalog";
import { SoftlensVariant } from "@/lib/softlens";
import { Branch } from "@/lib/branches";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  role: "owner" | "admin";
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  token: string;
  ipAddress?: string;
  userAgent?: string;
  expiresAt: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  userEmail: string;
  action: string; // "create", "update", "delete", "publish", "unpublish", "login_success", "login_failed", "seed", etc.
  module: "frames" | "softlens" | "blog" | "media" | "settings" | "auth" | "users" | "promos";
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  device?: string; // e.g. "Laptop (Windows 11) • Chrome"
  deviceType?: "desktop" | "mobile" | "tablet" | "unknown";
  createdAt: string;
}

export interface FrameItem {
  id: string;
  sku?: string;
  name: string;
  collection: string;
  shape: string;
  material?: string;
  dimensions?: ProductDimensions;
  colors?: ProductColorVariant[];
  price?: number;
  priceRange?: string;
  priceIncludesLens?: boolean;
  image: string;
  coverImage?: string;
  images: string[];
  lifestyleImages?: string[];
  posterImages?: string[];
  specsImage?: string;
  arAssetId?: string;
  glassesId?: string;
  fitWidthRatio?: number;
  ipdScaleRef?: number;
  model3D?: {
    name?: string;
    glbFile?: string;
    fitWidthRatio?: number;
    ipdScaleRef?: number;
    yOffsetRatio?: number;
    frameColor?: string;
    metalColor?: string;
    style?: string;
    templeFadeStart?: number;
    isTinted?: boolean;
  };
  recommendedFor: string[];
  description: string;
  style?: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SoftlensItem {
  id: string;
  name: string;
  brand?: string;
  category: "Softlens" | "Aksesoris dan Perawatan";
  type: "lens" | "accessory";
  colorFamily: "brown" | "grey" | "hazel" | "natural" | "colorful" | "accessory";
  coverImage: string;
  description: string;
  specs: string[];
  diameter?: string;
  waterContent?: string;
  usageDuration?: string;
  volume?: string;
  isAccessory?: boolean;
  basePrice: number;
  basePriceFormatted: string;
  hasPriceRange?: boolean;
  maxPrice?: number;
  maxPriceFormatted?: string;
  badgeText?: string;
  variants: SoftlensVariant[];
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type BlogCategory =
  | "edukasi-mata"
  | "tips-pilih-frame"
  | "perawatan-softlens"
  | "tren-gaya"
  | "info-cabang-promo";

export interface BlogPostItem {
  slug: string;
  title: string;
  category: BlogCategory;
  excerpt: string;
  coverImage: string;
  videoUrl?: string;
  content: string; // HTML string
  author: string;
  publishedAt: string; // ISO 8601
  updatedAt: string;
  readingTime: number;
  relatedCabang?: string;
  status: "draft" | "published" | "archived";
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
}

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  filePath?: string;
  sizeBytes: number;
  mimeType: string;
  width?: number;
  height?: number;
  altText?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaText: string;
  heroCtaLink: string;
  branches: Branch[];
  globalSeoTitle: string;
  globalSeoDescription: string;
  contactPhone: string;
  contactWhatsapp: string;
  instagramUrl: string;
  shopeeUrl: string;
  updatedAt: string;
}

export type PromoCategory = "weekly" | "monthly" | "special";
export type PromoStatus = "draft" | "published" | "archived";
export type PromoDetailLayout = "image-left" | "image-right";
export type PromoCollageLayout = "grid-2" | "grid-3" | "masonry" | "carousel" | "split-hero";

export interface PromoGalleryItem {
  id?: string;
  url: string;
  alt?: string;
  caption?: string;
}

export interface PromoItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  description: string;
  category: PromoCategory;
  status: PromoStatus;
  startAt: string; // ISO 8601
  endAt?: string;   // ISO 8601
  heroMediaId?: string;
  heroImageUrl: string;
  heroImageAlt?: string;
  galleryMediaIds?: string[];
  galleryImages?: PromoGalleryItem[];
  detailLayout: PromoDetailLayout;
  collageLayout: PromoCollageLayout;
  ctaLabel?: string;
  ctaUrl?: string;
  termsAndConditions?: string;
  showOnHomepage: boolean;
  showInPopup: boolean;
  popupPriority: number;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface PromoPopupSettings {
  enabled: boolean;
  featuredPromoId?: string;
  frequency: "once-per-session" | "once-per-day" | "always";
  delayMs: number;
  layout: PromoDetailLayout;
  updatedAt: string;
  updatedBy?: string;
}
