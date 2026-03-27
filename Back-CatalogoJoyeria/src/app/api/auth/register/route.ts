import bcrypt from "bcryptjs";
import { signAuthToken } from "@/lib/auth";
import { corsJson, corsPreflight } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const name = body?.name?.trim();
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!name || !email || !password) {
      return corsJson(
        { ok: false, message: "name, email y password son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return corsJson({ ok: false, message: "El email ya existe" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
      },
    });

    const token = signAuthToken({ sub: user.id, email: user.email, name: user.name, role: user.role });

    return corsJson({
      ok: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch {
    return corsJson(
      { ok: false, message: "Error interno al registrar usuario." },
      { status: 500 }
    );
  }
}
