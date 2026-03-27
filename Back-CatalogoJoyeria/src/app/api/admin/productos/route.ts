import { corsJson, corsPreflight } from "@/lib/cors";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { MaterialType, type GoldKarat, type GoldPriceCurrent } from "@prisma/client";
import { calcularPrecioProducto } from "@/lib/pricing";
import { syncGoldPrices } from "@/lib/gold-price-sync";
import { ensureGoldPriceAutoSyncStarted } from "@/lib/gold-price-auto-sync";

function buildGoldPriceMap(items: GoldPriceCurrent[]) {
  return new Map<GoldKarat, GoldPriceCurrent>(items.map((item) => [item.karat, item]));
}
const VALID_GOLD_KARATS = ["K10", "K14", "K18", "K24"] as const;

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(request: Request) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    ensureGoldPriceAutoSyncStarted();
    await syncGoldPrices(false);

    const [items, goldPriceCurrent, categories] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goldPriceCurrent.findMany(),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    const goldPriceByKarat = buildGoldPriceMap(goldPriceCurrent);

    return corsJson({
      ok: true,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category.name,
        categoryId: item.categoryId,
        materialType: item.materialType,
        karat: item.karat,
        imageUrl: item.imageUrl,
        weightGrams: Number(item.weightGrams),
        laborCost: Number(item.laborCost),
        marginCost: Number(item.marginCost),
        fixedBasePrice: item.fixedBasePrice ? Number(item.fixedBasePrice) : null,
        active: item.active,
        calculatedPrice: calcularPrecioProducto(item, goldPriceByKarat),
      })),
      categories: categories.map((category) => ({
        id: category.id,
        name: category.name,
      })),
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible cargar productos." }, { status: 500 });
  }
}

function isValidMaterialType(value: string): value is MaterialType {
  return Object.values(MaterialType).includes(value as MaterialType);
}

function isValidGoldKarat(value: string): value is GoldKarat {
  return (VALID_GOLD_KARATS as readonly string[]).includes(value);
}

export async function POST(request: Request) {
  const adminGuard = requireAdmin(request);
  if (!adminGuard.ok) {
    return adminGuard.response;
  }

  try {
    ensureGoldPriceAutoSyncStarted();
    await syncGoldPrices(false);

    const body = await request.json().catch(() => null);
    const name = body?.name?.trim();
    const description = body?.description?.trim();
    const imageUrl = body?.imageUrl?.trim();
    const categoryId = body?.categoryId?.trim();
    const materialType = body?.materialType;
    const karat = body?.karat || null;
    const weightGrams = Number(body?.weightGrams ?? 0);
    const laborCost = Number(body?.laborCost ?? 0);
    const marginCost = Number(body?.marginCost ?? 0);
    const fixedBasePrice =
      body?.fixedBasePrice != null && body?.fixedBasePrice !== "" ? Number(body.fixedBasePrice) : null;
    const active = typeof body?.active === "boolean" ? body.active : true;

    if (!name || !description || !imageUrl || !categoryId) {
      return corsJson(
        { ok: false, message: "name, description, imageUrl y categoryId son requeridos." },
        { status: 400 }
      );
    }

    if (!isValidMaterialType(materialType)) {
      return corsJson({ ok: false, message: "materialType invalido." }, { status: 400 });
    }

    if (materialType === MaterialType.ORO) {
      if (!karat || !isValidGoldKarat(karat)) {
        return corsJson({ ok: false, message: "karat invalido para producto de oro." }, { status: 400 });
      }
      if (!Number.isFinite(weightGrams) || weightGrams <= 0) {
        return corsJson({ ok: false, message: "weightGrams invalido para producto de oro." }, { status: 400 });
      }
    }

    if (materialType !== MaterialType.ORO && (!Number.isFinite(fixedBasePrice ?? NaN) || (fixedBasePrice ?? 0) <= 0)) {
      return corsJson(
        { ok: false, message: "fixedBasePrice invalido para productos que no son de oro." },
        { status: 400 }
      );
    }

    const created = await prisma.product.create({
      data: {
        name,
        description,
        imageUrl,
        categoryId,
        materialType,
        karat: materialType === MaterialType.ORO ? karat : null,
        weightGrams: materialType === MaterialType.ORO ? weightGrams : 0,
        laborCost: Number.isFinite(laborCost) ? laborCost : 0,
        marginCost: Number.isFinite(marginCost) ? marginCost : 0,
        fixedBasePrice: materialType === MaterialType.ORO ? null : fixedBasePrice,
        active,
      },
      include: { category: true },
    });

    const goldPriceCurrent = await prisma.goldPriceCurrent.findMany();
    const goldPriceByKarat = buildGoldPriceMap(goldPriceCurrent);

    return corsJson({
      ok: true,
      item: {
        id: created.id,
        name: created.name,
        description: created.description,
        imageUrl: created.imageUrl,
        categoryId: created.categoryId,
        category: created.category.name,
        materialType: created.materialType,
        karat: created.karat,
        weightGrams: Number(created.weightGrams),
        laborCost: Number(created.laborCost),
        marginCost: Number(created.marginCost),
        fixedBasePrice: created.fixedBasePrice ? Number(created.fixedBasePrice) : null,
        active: created.active,
        calculatedPrice: calcularPrecioProducto(created, goldPriceByKarat),
      },
    });
  } catch {
    return corsJson({ ok: false, message: "No fue posible crear producto." }, { status: 500 });
  }
}
