import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prismaAdapter?: PrismaPg;
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no esta definida en variables de entorno.");
}

const allowSelfSignedTls = process.env.ALLOW_SELF_SIGNED_TLS !== "false";
if (allowSelfSignedTls) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

function buildRuntimeConnection(url: string) {
  const parsed = new URL(url);
  parsed.searchParams.delete("sslmode");
  return parsed.toString();
}

const runtimeConnectionString = buildRuntimeConnection(connectionString);

const prismaAdapter =
  globalForPrisma.prismaAdapter ??
  new PrismaPg(
    {
      connectionString: runtimeConnectionString,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    {
      schema: "public",
    }
  );

const existingPrisma = globalForPrisma.prisma as PrismaClient | undefined;
const isClientCompatible =
  existingPrisma &&
  "product" in (existingPrisma as object) &&
  "goldPriceCurrent" in (existingPrisma as object) &&
  "order" in (existingPrisma as object) &&
  "siteConfig" in (existingPrisma as object);

export const prisma =
  isClientCompatible
    ? existingPrisma
    : new PrismaClient({
        adapter: prismaAdapter,
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaAdapter = prismaAdapter;
  globalForPrisma.prisma = prisma;
}
