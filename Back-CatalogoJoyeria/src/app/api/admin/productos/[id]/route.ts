import { corsJson, corsPreflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { GoldKarat, MaterialType, type GoldPriceCurrent } from "@prisma/client";
import { calcularPrecioProducto } from "@/lib/pricing";
import { syncGoldPrices } from "@/lib/gold-price-sync";
import { ensureGoldPriceAutoSyncStarted } from "@/lib/gold-price-auto-sync";

type Params = { params: Promise<{ id: string }> };

function buildGoldPriceMap(items: GoldPriceCurrent[]) {
  return new Map<GoldKarat, GoldPriceCurrent>(items.map((item) => [item.karat, item]));
}

function isValidMaterialType(value: string): value is MaterialType {
  return Object.values(MaterialType).includes(value as MaterialType);
}

function isValidGoldKarat(value: string): value is GoldKarat {
  return Object.values(GoldKarat).includes(value as GoldKarat);
}

export function OPTIONS() {
  return corsPreflight();
}

export async function PATCH(request: Request, { params }: Params) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    ensureGoldPriceAutoSyncStarted();
    await syncGoldPrices(false);

    const { id } = await params;
    const body = await request.json().catch(() => null);

    const weightGrams = body?.weightGrams != null ? Number(body.weightGrams) : undefined;
    const laborCost = body?.laborCost != null ? Number(body.laborCost) : undefined;
    const marginCost = body?.marginCost != null ? Number(body.marginCost) : undefined;
    const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl.trim() : undefined;
    const active = typeof body?.active === "boolean" ? body.active : undefined;
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const description = typeof body?.description === "string" ? body.description.trim() : undefined;
    const categoryId = typeof body?.categoryId === "string" ? body.categoryId.trim() : undefined;
    const materialType = body?.materialType;
    const karat = body?.karat;
    const fixedBasePrice = body?.fixedBasePrice != null ? Number(body.fixedBasePrice) : undefined;

    if (materialType != null && !isValidMaterialType(materialType)) {
      return corsJson({ ok: false, message: "materialType invalido." }, { status: 400 });
    }

    if (karat != null && karat !== "" && !isValidGoldKarat(karat)) {
      return corsJson({ ok: false, message: "karat invalido." }, { status: 400 });
    }

    if (materialType === MaterialType.ORO && karat != null && (karat === "" || karat == null)) {
      return corsJson({ ok: false, message: "karat requerido para productos de oro." }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(weightGrams != null ? { weightGrams } : {}),
        ...(laborCost != null ? { laborCost } : {}),
        ...(marginCost != null ? { marginCost } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(active != null ? { active } : {}),
        ...(materialType != null ? { materialType } : {}),
        ...(karat != null ? { karat: karat || null } : {}),
        ...(fixedBasePrice != null ? { fixedBasePrice } : {}),
      },
    });

    const goldPriceCurrent = await prisma.goldPriceCurrent.findMany();
    const goldPriceByKarat = buildGoldPriceMap(goldPriceCurrent);

    return corsJson({
      ok: true,
      item: {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        categoryId: updated.categoryId,
        materialType: updated.materialType,
        karat: updated.karat,
        weightGrams: Number(updated.weightGrams),
        laborCost: Number(updated.laborCost),
        marginCost: Number(updated.marginCost),
        fixedBasePrice: updated.fixedBasePrice ? Number(updated.fixedBasePrice) : null,
        imageUrl: updated.imageUrl,
        active: updated.active,
        calculatedPrice: calcularPrecioProducto(updated, goldPriceByKarat),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible actualizar producto." }, { status: 500 });
  }
}
