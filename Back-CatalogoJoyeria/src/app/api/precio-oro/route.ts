import { corsJson, corsPreflight } from "@/lib/cors";
import { syncGoldPrices } from "@/lib/gold-price-sync";
import { ensureGoldPriceAutoSyncStarted } from "@/lib/gold-price-auto-sync";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  try {
    ensureGoldPriceAutoSyncStarted();
    const precios = await syncGoldPrices(true);

    return corsJson({
      ok: true,
      items: precios.map((item) => ({
        karat: item.karat,
        pricePerGram: Number(item.pricePerGram),
        source: item.source,
        updatedAt: item.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    const detail = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined;
    return corsJson(
      { ok: false, message: "No fue posible obtener precio del oro.", detail },
      { status: 500 }
    );
  }
}
