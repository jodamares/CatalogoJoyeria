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
    const email = body?.email?.trim()?.toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      return corsJson(
        { ok: false, message: "email y password son requeridos" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return corsJson({ ok: false, message: "Credenciales invalidas" }, { status: 401 });
    }

    const passwordValida = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValida) {
      return corsJson({ ok: false, message: "Credenciales invalidas" }, { status: 401 });
    }

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
    return corsJson({ ok: false, message: "Error interno al iniciar sesion." }, { status: 500 });
  }
}
