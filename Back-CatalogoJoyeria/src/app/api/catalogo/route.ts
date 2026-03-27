import { corsJson, corsPreflight } from "@/lib/cors";
import { obtenerCatalogoCalculado } from "@/lib/catalogo";
import { ensureGoldPriceAutoSyncStarted } from "@/lib/gold-price-auto-sync";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  try {
    ensureGoldPriceAutoSyncStarted();
    const items = await obtenerCatalogoCalculado();
    return corsJson({ ok: true, items });
  } catch {
    return corsJson({ ok: false, message: "No fue posible cargar catalogo." }, { status: 500 });
  }
}
