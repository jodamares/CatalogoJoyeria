import { corsJson, corsPreflight } from "@/lib/cors";
import { prisma } from "@/lib/prisma";

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const serviceId = body?.serviceId || null;
    const clientName = body?.clientName?.trim();
    const phone = body?.phone?.trim();
    const detail = body?.detail?.trim();

    if (!clientName || !phone || !detail) {
      return corsJson(
        { ok: false, message: "clientName, phone y detail son requeridos." },
        { status: 400 }
      );
    }

    if (serviceId) {
      const service = await prisma.service.findUnique({ where: { id: serviceId } });
      if (!service) {
        return corsJson({ ok: false, message: "Servicio no encontrado." }, { status: 404 });
      }
    }

    const quote = await prisma.serviceQuote.create({
      data: {
        serviceId,
        clientName,
        phone,
        detail,
      },
    });

    return corsJson({
      ok: true,
      item: {
        id: quote.id,
        status: quote.status,
        createdAt: quote.createdAt.toISOString(),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible crear la solicitud." }, { status: 500 });
  }
}
