import { corsJson, corsPreflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: Request) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    const items = await prisma.serviceQuote.findMany({
      include: {
        service: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return corsJson({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        status: item.status,
        clientName: item.clientName,
        phone: item.phone,
        detail: item.detail,
        createdAt: item.createdAt.toISOString(),
        service: item.service
          ? {
              id: item.service.id,
              name: item.service.name,
            }
          : null,
      })),
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible cargar solicitudes." }, { status: 500 });
  }
}
