import { GoldKarat } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const OUNCE_TROY_IN_GRAMS = 31.1034768;
const REQUIRED_KARATS: GoldKarat[] = ["K24", "K18", "K14", "K10"];

const KARAT_PURITY: Record<GoldKarat, number> = {
  K24: 24 / 24,
  K18: 18 / 24,
  K14: 14 / 24,
  K10: 10 / 24,
};

function parsePositiveNumber(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue <= 0) {
    return null;
  }
  return numberValue;
}

async function fetchRemotePrices() {
  const apiKey = process.env.METAL_PRICE_API_KEY;
  const baseCurrency = process.env.METAL_PRICE_BASE || "USD";
  const quoteCurrency = process.env.METAL_PRICE_QUOTE || "COP";
  const endpoint = process.env.METAL_PRICE_API_URL || "https://api.metalpriceapi.com/v1/latest";

  if (!apiKey) {
    throw new Error("METAL_PRICE_API_KEY no esta definida.");
  }

  const params = new URLSearchParams({
    api_key: apiKey,
    base: baseCurrency,
    currencies: `${quoteCurrency},XAU`,
  });

  const response = await fetch(`${endpoint}?${params.toString()}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`MetalPriceAPI respondio ${response.status}.`);
  }

  const data = await response.json();
  const rates = data?.rates || {};
  const quoteRate = parsePositiveNumber(rates[quoteCurrency]);
  const xauRate = parsePositiveNumber(rates.XAU);

  if (!quoteRate || !xauRate) {
    throw new Error("Respuesta invalida de MetalPriceAPI.");
  }

  const quotePerOunce24k = quoteRate / xauRate;
  const quotePerGram24k = quotePerOunce24k / OUNCE_TROY_IN_GRAMS;

  return {
    source: `metalpriceapi:${baseCurrency}->${quoteCurrency}`,
    prices: {
      K24: Math.round(quotePerGram24k * KARAT_PURITY.K24),
      K18: Math.round(quotePerGram24k * KARAT_PURITY.K18),
      K14: Math.round(quotePerGram24k * KARAT_PURITY.K14),
      K10: Math.round(quotePerGram24k * KARAT_PURITY.K10),
    } satisfies Record<GoldKarat, number>,
  };
}

function getSyncMinutes() {
  const parsed = Number(process.env.GOLD_PRICE_SYNC_MINUTES || 60);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 60;
  }
  return Math.floor(parsed);
}

export async function syncGoldPrices(force = false) {
  const current = await prisma.goldPriceCurrent.findMany({
    where: { karat: { in: REQUIRED_KARATS } },
  });

  const syncMinutes = getSyncMinutes();
  const now = Date.now();
  const minAllowedAgeMs = syncMinutes * 60 * 1000;
  const oldestUpdatedAtMs = current.length
    ? Math.min(...current.map((item) => item.updatedAt.getTime()))
    : 0;
  const isFresh =
    current.length === REQUIRED_KARATS.length && now - oldestUpdatedAtMs < minAllowedAgeMs;

  if (!force && isFresh) {
    return current;
  }

  let remote;
  try {
    remote = await fetchRemotePrices();
  } catch (error) {
    if (current.length) {
      return current;
    }
    throw error;
  }

  await prisma.$transaction(
    REQUIRED_KARATS.map((karat) =>
      prisma.goldPriceCurrent.upsert({
        where: { karat },
        create: {
          karat,
          pricePerGram: remote.prices[karat],
          source: remote.source,
        },
        update: {
          pricePerGram: remote.prices[karat],
          source: remote.source,
        },
      })
    )
  );

  await prisma.goldPriceHistory.createMany({
    data: REQUIRED_KARATS.map((karat) => ({
      karat,
      pricePerGram: remote.prices[karat],
      source: remote.source,
    })),
  });

  return prisma.goldPriceCurrent.findMany({
    where: { karat: { in: REQUIRED_KARATS } },
    orderBy: { karat: "asc" },
  });
}
