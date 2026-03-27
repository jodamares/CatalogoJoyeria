import { corsJson, corsPreflight } from "@/lib/cors";
import { verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
}

export async function GET(request: Request) {
  try {
    const token = getBearerToken(request.headers.get("authorization"));

    if (!token) {
      return corsJson({ ok: false, message: "Token requerido" }, { status: 401 });
    }

    const payload = verifyAuthToken(token);

    if (!payload) {
      return corsJson({ ok: false, message: "Token invalido o expirado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return corsJson({ ok: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    return corsJson({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "Error interno al consultar perfil." }, { status: 500 });
  }
}
