type MaterialType = "ORO" | "PLATA" | "ACERO" | "OTRO";
type GoldKarat = "K10" | "K14" | "K18" | "K24";
type GoldPriceCurrentLike = { karat: GoldKarat; pricePerGram: unknown };

const MATERIAL_TYPE_ORO = "ORO" as MaterialType;
const MATERIAL_TYPE_PLATA = "PLATA" as MaterialType;
const MATERIAL_TYPE_ACERO = "ACERO" as MaterialType;

type ProductForPricing = {
  materialType: MaterialType;
  karat: GoldKarat | null;
  weightGrams: unknown;
  laborCost: unknown;
  marginCost: unknown;
  fixedBasePrice: unknown;
};

const karatLabelMap: Record<GoldKarat, string> = {
  K10: "10k",
  K14: "14k",
  K18: "18k",
  K24: "24k",
};

export function getMaterialLabel(materialType: MaterialType, karat: GoldKarat | null) {
  if (materialType === MATERIAL_TYPE_ORO) {
    return `Oro ${karat ? karatLabelMap[karat] : ""}`.trim();
  }

  if (materialType === MATERIAL_TYPE_PLATA) return "Plata";
  if (materialType === MATERIAL_TYPE_ACERO) return "Acero";
  return "Otro material";
}

export function calcularPrecioProducto(
  product: ProductForPricing,
  goldPriceByKarat: Map<GoldKarat, GoldPriceCurrentLike>
) {
  const labor = Number(product.laborCost);
  const margin = Number(product.marginCost);
  const peso = Number(product.weightGrams);

  if (product.materialType === MATERIAL_TYPE_ORO && product.karat) {
    const currentPrice = goldPriceByKarat.get(product.karat);
    const pricePerGram = Number(currentPrice?.pricePerGram ?? 0);
    return Math.round(peso * pricePerGram + labor + margin);
  }

  const fixedBasePrice = Number(product.fixedBasePrice ?? 0);
  return Math.round(fixedBasePrice + labor + margin);
}
