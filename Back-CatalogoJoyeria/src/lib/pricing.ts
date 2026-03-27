import { MaterialType, type GoldKarat, type GoldPriceCurrent, type Product } from "@prisma/client";

type ProductForPricing = Pick<
  Product,
  "materialType" | "karat" | "weightGrams" | "laborCost" | "marginCost" | "fixedBasePrice"
>;

const karatLabelMap: Record<GoldKarat, string> = {
  K10: "10k",
  K14: "14k",
  K18: "18k",
  K24: "24k",
};

export function getMaterialLabel(materialType: MaterialType, karat: GoldKarat | null) {
  if (materialType === MaterialType.ORO) {
    return `Oro ${karat ? karatLabelMap[karat] : ""}`.trim();
  }

  if (materialType === MaterialType.PLATA) return "Plata";
  if (materialType === MaterialType.ACERO) return "Acero";
  return "Otro material";
}

export function calcularPrecioProducto(
  product: ProductForPricing,
  goldPriceByKarat: Map<GoldKarat, GoldPriceCurrent>
) {
  const labor = Number(product.laborCost);
  const margin = Number(product.marginCost);
  const peso = Number(product.weightGrams);

  if (product.materialType === MaterialType.ORO && product.karat) {
    const currentPrice = goldPriceByKarat.get(product.karat);
    const pricePerGram = Number(currentPrice?.pricePerGram ?? 0);
    return Math.round(peso * pricePerGram + labor + margin);
  }

  const fixedBasePrice = Number(product.fixedBasePrice ?? 0);
  return Math.round(fixedBasePrice + labor + margin);
}
