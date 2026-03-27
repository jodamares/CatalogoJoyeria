import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no definida.");
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: connectionString.replace("sslmode=require", ""),
    ssl: { rejectUnauthorized: false },
  }),
});

const JOYAS_BASE = [
  { nombre: "Anillo solitario", tipo: "Oro 18k · diamante", precio: 12500, imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Collar cadena", tipo: "Plata 925", precio: 2890, imagen: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes argolla", tipo: "Oro 14k", precio: 4100, imagen: "https://pe.todomoda.com/media/catalog/product/7/9/79587301_1_1_20230703120428.jpg?quality=75&bg-color=255,255,255&fit=bounds&height=841&width=657&canvas=657:841" },
  { nombre: "Pulsera tennis", tipo: "Plata 925 · zirconias", precio: 3650, imagen: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo vintage", tipo: "Oro rosa 14k", precio: 5980, imagen: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Collar perlas", tipo: "Perla natural · plata", precio: 5200, imagen: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes gota", tipo: "Plata 925", precio: 2450, imagen: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Dije corazón", tipo: "Oro 18k", precio: 3320, imagen: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo infinito", tipo: "Plata 925", precio: 1890, imagen: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Pulsera esclava", tipo: "Oro 14k", precio: 4760, imagen: "https://images.unsplash.com/photo-1619119069152-a2b331eb392a?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Cadena cubana", tipo: "Plata 925", precio: 6490, imagen: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes estrella", tipo: "Oro 10k", precio: 2280, imagen: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo sello", tipo: "Acero quirúrgico", precio: 1590, imagen: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Collar minimal", tipo: "Plata 925", precio: 2640, imagen: "https://images.unsplash.com/photo-1611107683227-e9060eccd846?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Pulsera charms", tipo: "Plata · dijes", precio: 3890, imagen: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo trenzado", tipo: "Oro blanco 14k", precio: 5580, imagen: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes flor", tipo: "Plata 925 · circonia", precio: 2120, imagen: "https://images.unsplash.com/photo-1612817159949-195b6eb9e31a?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Dije luna", tipo: "Oro rosa 10k", precio: 2760, imagen: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo halo", tipo: "Oro 18k · zirconias", precio: 6920, imagen: "https://images.unsplash.com/photo-1543295204-8e6d1f8f71ff?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Cadena rope", tipo: "Oro 14k", precio: 7150, imagen: "https://images.unsplash.com/photo-1617038261235-a6e8bbf21965?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Tobillera clásica", tipo: "Plata 925", precio: 1390, imagen: "https://images.unsplash.com/photo-1611652022221-d56f6f718376?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes perla", tipo: "Perla cultivada", precio: 3090, imagen: "https://images.unsplash.com/photo-1512163143273-bde0e3cc7407?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo piedra azul", tipo: "Plata · zafiro sintético", precio: 2840, imagen: "https://images.unsplash.com/photo-1602752250015-52934bc45613?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Pulsera rígida", tipo: "Acero inoxidable", precio: 1750, imagen: "https://images.unsplash.com/photo-1619119069152-3c1f49fda8f2?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Collar barra", tipo: "Oro 10k", precio: 3410, imagen: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo duo", tipo: "Plata 925", precio: 2190, imagen: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Aretes aro mini", tipo: "Oro 14k", precio: 2560, imagen: "https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Dije cruz", tipo: "Plata 925", precio: 1980, imagen: "https://images.unsplash.com/photo-1611652022222-3f53efc6b4d8?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Pulsera cuero y acero", tipo: "Cuero natural", precio: 1490, imagen: "https://images.unsplash.com/photo-1621961458348-f013d219b50c?w=600&auto=format&fit=crop&q=80" },
  { nombre: "Anillo compromiso", tipo: "Oro blanco 18k · diamante", precio: 15200, imagen: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&auto=format&fit=crop&q=80" },
];

const GOLD_PRICE = {
  K10: 720,
  K14: 980,
  K18: 1280,
  K24: 1700,
};

function inferCategory(name) {
  if (name.toLowerCase().includes("anillo")) return "anillos";
  if (name.toLowerCase().includes("collar")) return "collares";
  if (name.toLowerCase().includes("cadena")) return "cadenas";
  if (name.toLowerCase().includes("pulsera")) return "pulseras";
  if (name.toLowerCase().includes("aretes")) return "aretes";
  if (name.toLowerCase().includes("dije")) return "dijes";
  if (name.toLowerCase().includes("tobillera")) return "manillas-tejidas";
  return "otros";
}

function inferMaterial(tipo) {
  const t = tipo.toLowerCase();
  if (t.includes("oro")) return "ORO";
  if (t.includes("plata")) return "PLATA";
  if (t.includes("acero")) return "ACERO";
  return "OTRO";
}

function inferKarat(tipo) {
  const t = tipo.toLowerCase();
  if (t.includes("24k")) return "K24";
  if (t.includes("18k")) return "K18";
  if (t.includes("14k")) return "K14";
  if (t.includes("10k")) return "K10";
  return null;
}

async function main() {
  await prisma.serviceQuote.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.siteConfig.deleteMany();

  await prisma.goldPriceCurrent.upsert({
    where: { karat: "K10" },
    update: { pricePerGram: GOLD_PRICE.K10, source: "manual-seed" },
    create: { karat: "K10", pricePerGram: GOLD_PRICE.K10, source: "manual-seed" },
  });
  await prisma.goldPriceCurrent.upsert({
    where: { karat: "K14" },
    update: { pricePerGram: GOLD_PRICE.K14, source: "manual-seed" },
    create: { karat: "K14", pricePerGram: GOLD_PRICE.K14, source: "manual-seed" },
  });
  await prisma.goldPriceCurrent.upsert({
    where: { karat: "K18" },
    update: { pricePerGram: GOLD_PRICE.K18, source: "manual-seed" },
    create: { karat: "K18", pricePerGram: GOLD_PRICE.K18, source: "manual-seed" },
  });
  await prisma.goldPriceCurrent.upsert({
    where: { karat: "K24" },
    update: { pricePerGram: GOLD_PRICE.K24, source: "manual-seed" },
    create: { karat: "K24", pricePerGram: GOLD_PRICE.K24, source: "manual-seed" },
  });

  await prisma.goldPriceHistory.createMany({
    data: [
      { karat: "K10", pricePerGram: GOLD_PRICE.K10, source: "manual-seed" },
      { karat: "K14", pricePerGram: GOLD_PRICE.K14, source: "manual-seed" },
      { karat: "K18", pricePerGram: GOLD_PRICE.K18, source: "manual-seed" },
      { karat: "K24", pricePerGram: GOLD_PRICE.K24, source: "manual-seed" },
    ],
  });

  const categories = [
    { name: "Anillos", slug: "anillos" },
    { name: "Collares", slug: "collares" },
    { name: "Cadenas", slug: "cadenas" },
    { name: "Pulseras", slug: "pulseras" },
    { name: "Aretes", slug: "aretes" },
    { name: "Dijes", slug: "dijes" },
    { name: "Manillas Tejidas", slug: "manillas-tejidas" },
    { name: "Otros", slug: "otros" },
  ];

  for (const category of categories) {
    await prisma.category.create({ data: category });
  }

  const categoryBySlug = new Map(
    (await prisma.category.findMany()).map((category) => [category.slug, category])
  );

  for (const joya of JOYAS_BASE) {
    const materialType = inferMaterial(joya.tipo);
    const karat = inferKarat(joya.tipo);
    const categorySlug = inferCategory(joya.nombre);
    const category = categoryBySlug.get(categorySlug);
    if (!category) continue;

    const goldPerGram = karat ? GOLD_PRICE[karat] : 0;
    const weightGrams =
      materialType === "ORO" && goldPerGram > 0 ? Number((joya.precio / goldPerGram).toFixed(3)) : 0;

    await prisma.product.create({
      data: {
        name: joya.nombre,
        description: joya.tipo,
        imageUrl: joya.imagen,
        materialType,
        karat,
        weightGrams,
        laborCost: 0,
        marginCost: 0,
        fixedBasePrice: materialType === "ORO" ? null : joya.precio,
        categoryId: category.id,
      },
    });
  }

  await prisma.service.createMany({
    data: [
      {
        name: "Reparacion de joyas",
        description: "Reparacion, ajuste y mantenimiento general de piezas.",
        imageUrl:
          "https://images.unsplash.com/photo-1517837016564-bfcf8d5f2ca1?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Tejido de manillas",
        description: "Tejido de manillas con balines y acabados personalizados.",
        imageUrl:
          "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=600&auto=format&fit=crop&q=80",
      },
      {
        name: "Fabricacion personalizada",
        description: "Diseño y fabricacion de joyas a medida.",
        imageUrl:
          "https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80",
      },
    ],
  });

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Administrador";

  if (adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail.toLowerCase() },
      update: {
        name: adminName,
        passwordHash,
        role: "ADMIN",
      },
      create: {
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: "ADMIN",
      },
    });
  }

  await prisma.siteConfig.create({
    data: {
      logoUrl: null,
      storeName: "Joyeria Premiun",
    },
  });

  console.log("Seed completado: productos, precios oro y servicios creados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
