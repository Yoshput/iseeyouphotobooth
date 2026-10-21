import { NextResponse } from "next/server";
import { authenticateAdminRequest } from "@/lib/auth/guard";
import {
  getAdminUsers,
  getAdminUserById,
  getAdminUserByEmailWithAuth,
  saveAdminUser,
  deleteAdminUser,
  addAuditLog,
} from "@/lib/db/repository";
import { hashPassword } from "@/lib/auth/passwords";
import { AdminUser } from "@/lib/db/types";

export async function GET(req: Request) {
  const auth = await authenticateAdminRequest(req, { requireOwner: true });
  if (!auth.authorized) return auth.response;

  try {
    const users = await getAdminUsers();
    return NextResponse.json({ success: true, data: users });
  } catch (err: any) {
    console.error("Error in GET /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memuat daftar pengguna admin." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const auth = await authenticateAdminRequest(req, { requireOwner: true });
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Email, nama lengkap, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (String(password).length < 8) {
      return NextResponse.json(
        { success: false, error: "Password minimal terdiri dari 8 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).toLowerCase().trim();
    const existing = await getAdminUserByEmailWithAuth(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "Email ini sudah terdaftar sebagai akun admin." },
        { status: 409 }
      );
    }

    const { hash, salt } = hashPassword(String(password));
    const newId = `usr-${Date.now().toString(36)}-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: AdminUser = {
      id: newId,
      email: cleanEmail,
      name: String(name).trim(),
      passwordHash: hash,
      salt,
      role: role === "owner" ? "owner" : "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveAdminUser(newUser);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "create",
      module: "users",
      targetId: newId,
      details: { createdUserEmail: cleanEmail, role: newUser.role },
    });

    const { passwordHash: _, salt: __, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      message: "Akun admin baru berhasil dibuat.",
      data: safeUser,
    });
  } catch (err: any) {
    console.error("Error in POST /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Gagal menambahkan akun admin." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const auth = await authenticateAdminRequest(req, { requireOwner: true });
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const { id, name, role, isActive, password } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna diperlukan." },
        { status: 400 }
      );
    }

    const targetUser = await getAdminUserById(id);
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: "Pengguna tidak ditemukan." },
        { status: 404 }
      );
    }

    if (name) targetUser.name = String(name).trim();
    if (role && (role === "owner" || role === "admin")) targetUser.role = role;
    if (typeof isActive === "boolean") targetUser.isActive = isActive;

    if (password) {
      if (String(password).length < 8) {
        return NextResponse.json(
          { success: false, error: "Password baru minimal 8 karakter." },
          { status: 400 }
        );
      }
      const { hash, salt } = hashPassword(String(password));
      targetUser.passwordHash = hash;
      targetUser.salt = salt;
    }

    await saveAdminUser(targetUser);

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "update",
      module: "users",
      targetId: id,
      details: { targetEmail: targetUser.email, changes: Object.keys(body) },
    });

    const { passwordHash: _, salt: __, ...safeUser } = targetUser;

    return NextResponse.json({
      success: true,
      message: "Data akun admin berhasil diperbarui.",
      data: safeUser,
    });
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui akun admin." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const auth = await authenticateAdminRequest(req, { requireOwner: true });
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID pengguna diperlukan." },
        { status: 400 }
      );
    }

    if (id === auth.user.id) {
      return NextResponse.json(
        { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." },
        { status: 400 }
      );
    }

    const result = await deleteAdminUser(id);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Gagal menghapus akun." },
        { status: 400 }
      );
    }

    await addAuditLog({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: "delete",
      module: "users",
      targetId: id,
    });

    return NextResponse.json({
      success: true,
      message: "Akun admin berhasil dihapus.",
    });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/users:", err);
    return NextResponse.json(
      { success: false, error: "Gagal memproses penghapusan akun." },
      { status: 500 }
    );
  }
}
