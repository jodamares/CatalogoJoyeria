import { corsJson, corsPreflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    const body = await request.json().catch(() => null);
    const logoUrl = body?.logoUrl?.trim() || null;
    const storeName = body?.storeName?.trim() || "Joyeria Premiun";

    const existing = await prisma.siteConfig.findFirst({ orderBy: { createdAt: "asc" } });

    const config = existing
      ? await prisma.siteConfig.update({
          where: { id: existing.id },
          data: { logoUrl, storeName },
        })
      : await prisma.siteConfig.create({
          data: { logoUrl, storeName },
        });

    return corsJson({
      ok: true,
      item: {
        id: config.id,
        logoUrl: config.logoUrl,
        storeName: config.storeName,
        updatedAt: config.updatedAt.toISOString(),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible guardar configuracion." }, { status: 500 });
  }
}
