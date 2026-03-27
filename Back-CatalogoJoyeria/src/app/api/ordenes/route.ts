import { corsJson, corsPreflight } from "@/lib/cors";
import { verifyAuthToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type OrderPaymentMethod = "TRANSFERENCIA" | "TARJETA" | "PAYPAL";
type OrderStatus = "PENDIENTE" | "PAGADO" | "CANCELADO";
const PAYMENT_METHOD_TRANSFERENCIA: OrderPaymentMethod = "TRANSFERENCIA";
const PAYMENT_METHOD_TARJETA: OrderPaymentMethod = "TARJETA";
const PAYMENT_METHOD_PAYPAL: OrderPaymentMethod = "PAYPAL";
const ORDER_STATUS_PENDIENTE: OrderStatus = "PENDIENTE";
const ORDER_STATUS_PAGADO: OrderStatus = "PAGADO";

export function OPTIONS() {
  return corsPreflight();
}

function getBearerToken(authorizationHeader: string | null) {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authorizationHeader.slice("Bearer ".length);
}

function parsePaymentMethod(value: string | undefined) {
  if (value === "tarjeta") return PAYMENT_METHOD_TARJETA;
  if (value === "paypal") return PAYMENT_METHOD_PAYPAL;
  return PAYMENT_METHOD_TRANSFERENCIA;
}

export async function POST(request: Request) {
  try {
    const token = getBearerToken(request.headers.get("authorization"));
    const authPayload = token ? verifyAuthToken(token) : null;

    const body = await request.json().catch(() => null);
    const customer = body?.customer ?? {};
    const items = Array.isArray(body?.items) ? body.items : [];
    const total = Number(body?.total || 0);
    const paymentMethod = parsePaymentMethod(customer.metodoPago);

    if (!customer.nombre || !customer.email || !customer.telefono || !customer.direccion) {
      return corsJson({ ok: false, message: "Datos del cliente incompletos." }, { status: 400 });
    }

    if (!items.length || total <= 0) {
      return corsJson({ ok: false, message: "No hay items para procesar." }, { status: 400 });
    }

    const order = await prisma.order.create({
      data: {
        userId: authPayload?.sub || null,
        customerName: customer.nombre,
        customerEmail: customer.email,
        phone: customer.telefono,
        address: customer.direccion,
        city: customer.ciudad || "",
        postalCode: customer.codigoPostal || "",
        paymentMethod,
        status: paymentMethod === PAYMENT_METHOD_TRANSFERENCIA ? ORDER_STATUS_PAGADO : ORDER_STATUS_PENDIENTE,
        currency: body?.currency || "COP",
        total,
        items,
      },
    });

    return corsJson({
      ok: true,
      item: {
        id: order.id,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible crear la orden." }, { status: 500 });
  }
}
