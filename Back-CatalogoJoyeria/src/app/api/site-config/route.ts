import { corsJson, corsPreflight } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst({ orderBy: { createdAt: "asc" } });
    return corsJson({
      ok: true,
      item: config
        ? {
            id: config.id,
            logoUrl: config.logoUrl,
            storeName: config.storeName,
            updatedAt: config.updatedAt.toISOString(),
          }
        : null,
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible cargar configuracion." }, { status: 500 });
  }
}
