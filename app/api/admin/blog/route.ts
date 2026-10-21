import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getBlogPosts,
  getBlogPostBySlug,
  saveBlogPost,
  deleteBlogPost,
  addAuditLog,
} from "@/lib/db/repository";
import { sanitizeHtml } from "@/lib/sanitize";
import { BlogPostItem } from "@/lib/db/types";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const onlyPublished = searchParams.get("published") === "true";

    const posts = await getBlogPosts({ category, search, onlyPublished });
    return NextResponse.json({ success: true, data: posts });
  } catch (err: any) {
    console.error("Error in GET /api/admin/blog:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar artikel blog." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const {
      title,
      category,
      excerpt,
      coverImage,
      content,
      slug: customSlug,
      videoUrl,
      author,
      relatedCabang,
      status,
      seoTitle,
      seoDescription,
    } = body;

    if (!title || !category || !excerpt || !coverImage || !content) {
      return NextResponse.json(
        {
          success: false,
          error: "Field wajib belum lengkap: judul, kategori, excerpt, cover image, dan isi artikel wajib diisi.",
        },
        { status: 400 }
      );
    }

    let slug = slugify(customSlug || title);
    if (!slug) {
      slug = `artikel-${Date.now()}`;
    }

    // Check slug uniqueness
    const existing = await getBlogPostBySlug(slug);
    if (existing) {
      slug = `${slug}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const cleanContent = sanitizeHtml(content);

    const newPost: BlogPostItem = {
      slug,
      title: String(title).trim(),
      category,
      excerpt: String(excerpt).trim(),
      coverImage: String(coverImage).trim(),
      videoUrl: videoUrl ? String(videoUrl).trim() : undefined,
      content: cleanContent,
      author: String(author || auth.user.name || "Tim Optik I See You").trim(),
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readingTime: 1, // Will be auto-calculated in saveBlogPost
      relatedCabang: relatedCabang ? String(relatedCabang).trim() : undefined,
      status: status === "draft" ? "draft" : status === "archived" ? "archived" : "published",
      seoTitle: seoTitle ? String(seoTitle).trim() : `${title} | Blog Optik I See You`,
      seoDescription: seoDescription ? String(seoDescription).trim() : excerpt,
      createdAt: new Date().toISOString(),
    };

    const saved = await saveBlogPost(newPost);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "create",
      module: "blog",
      targetId: saved.slug,
      details: { title: saved.title, status: saved.status, category: saved.category },
    });

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${saved.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil disimpan.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/blog:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menyimpan artikel blog." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug artikel wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getBlogPostBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan." },
        { status: 404 }
      );
    }

    const cleanContent = body.content ? sanitizeHtml(body.content) : existing.content;

    const updatedPost: BlogPostItem = {
      ...existing,
      ...body,
      slug,
      content: cleanContent,
      updatedAt: new Date().toISOString(),
    };

    const saved = await saveBlogPost(updatedPost);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "update",
      module: "blog",
      targetId: saved.slug,
      details: { title: saved.title, status: saved.status },
    });

    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${saved.slug}`);
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui.",
      data: saved,
    });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/blog:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui artikel blog." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await authenticateAdminRequest(req);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug artikel wajib dicantumkan." },
        { status: 400 }
      );
    }

    const existing = await getBlogPostBySlug(slug);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Artikel tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteBlogPost(slug);

    if (success) {
      await addAuditLog({
        userId: auth.user.id,
        userEmail: auth.user.email,
        action: "delete",
        module: "blog",
        targetId: slug,
        details: { title: existing.title },
      });

      try {
        revalidatePath("/blog");
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Artikel "${existing.title}" berhasil dihapus.`,
      });
    }

    return NextResponse.json(
      { success: false, error: "Gagal menghapus artikel." },
      { status: 500 }
    );
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/blog:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses penghapusan artikel." },
      { status: 500 }
    );
  }
}
