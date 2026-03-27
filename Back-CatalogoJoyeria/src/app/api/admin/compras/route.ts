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
    const items = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return corsJson({
      ok: true,
      items: items.map((item: (typeof items)[number]) => ({
        id: item.id,
        status: item.status,
        paymentMethod: item.paymentMethod,
        total: Number(item.total),
        currency: item.currency,
        customerName: item.customerName,
        customerEmail: item.customerEmail,
        createdAt: item.createdAt.toISOString(),
        user: item.user,
      })),
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible cargar compras." }, { status: 500 });
  }
}
