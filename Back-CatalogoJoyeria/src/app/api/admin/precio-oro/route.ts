import { corsJson, corsPreflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const VALID_KARATS = ["K10", "K14", "K18", "K24"] as const;
type GoldKarat = (typeof VALID_KARATS)[number];

export function OPTIONS() {
  return corsPreflight();
}

function isValidKarat(value: string): value is GoldKarat {
  return (VALID_KARATS as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    const body = await request.json().catch(() => null);
    const karat = body?.karat;
    const pricePerGram = Number(body?.pricePerGram);
    const source = body?.source?.trim() || "manual-admin";

    if (!karat || !isValidKarat(karat)) {
      return corsJson({ ok: false, message: "karat invalido." }, { status: 400 });
    }

    if (!pricePerGram || Number.isNaN(pricePerGram) || pricePerGram <= 0) {
      return corsJson({ ok: false, message: "pricePerGram invalido." }, { status: 400 });
    }

    const current = await prisma.goldPriceCurrent.upsert({
      where: { karat },
      create: {
        karat,
        pricePerGram,
        source,
      },
      update: {
        pricePerGram,
        source,
      },
    });

    await prisma.goldPriceHistory.create({
      data: {
        karat,
        pricePerGram,
        source,
      },
    });

    return corsJson({
      ok: true,
      item: {
        karat: current.karat,
        pricePerGram: Number(current.pricePerGram),
        source: current.source,
        updatedAt: current.updatedAt.toISOString(),
      },
    });
  } catch {
    return corsJson(
      { ok: false, message: "No fue posible actualizar precio del oro." },
      { status: 500 }
    );
  }
}
