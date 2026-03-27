import { UserRole } from "@prisma/client";
import { corsJson } from "@/lib/cors";
import { verifyAuthToken } from "@/lib/auth";

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authorizationHeader.slice("Bearer ".length);
}

export function requireAdmin(request: Request) {
  const token = getBearerToken(request.headers.get("authorization"));
  if (!token) {
    return { ok: false as const, response: corsJson({ ok: false, message: "Token requerido." }, { status: 401 }) };
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    return { ok: false as const, response: corsJson({ ok: false, message: "Token invalido." }, { status: 401 }) };
  }

  if (payload.role !== UserRole.ADMIN) {
    return { ok: false as const, response: corsJson({ ok: false, message: "Acceso solo admin." }, { status: 403 }) };
  }

  return { ok: true as const, payload };
}
