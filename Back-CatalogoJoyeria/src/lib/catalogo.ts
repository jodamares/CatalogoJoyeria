import { GoldKarat, type GoldPriceCurrent } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calcularPrecioProducto, getMaterialLabel } from "@/lib/pricing";
import { syncGoldPrices } from "@/lib/gold-price-sync";

export async function obtenerCatalogoCalculado() {
  await syncGoldPrices(false);

  const [products, goldPriceCurrent] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.goldPriceCurrent.findMany(),
  ]);

  const goldPriceByKarat = new Map<GoldKarat, GoldPriceCurrent>(
    goldPriceCurrent.map((item) => [item.karat, item])
  );

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl,
    category: {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    },
    material: getMaterialLabel(product.materialType, product.karat),
    karat: product.karat,
    weightGrams: Number(product.weightGrams),
    price: calcularPrecioProducto(product, goldPriceByKarat),
  }));
}
