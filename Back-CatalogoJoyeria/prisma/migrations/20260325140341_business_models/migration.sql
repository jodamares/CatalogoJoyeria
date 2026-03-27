-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('ORO', 'PLATA', 'ACERO', 'OTRO');

-- CreateEnum
CREATE TYPE "GoldKarat" AS ENUM ('K10', 'K14', 'K18', 'K24');

-- CreateEnum
CREATE TYPE "ServiceQuoteStatus" AS ENUM ('PENDIENTE', 'CONTACTADO', 'CERRADO');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "materialType" "MaterialType" NOT NULL,
    "karat" "GoldKarat",
    "weightGrams" DECIMAL(10,3) NOT NULL,
    "laborCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "marginCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "fixedBasePrice" DECIMAL(14,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPriceCurrent" (
    "id" TEXT NOT NULL,
    "karat" "GoldKarat" NOT NULL,
    "pricePerGram" DECIMAL(14,2) NOT NULL,
    "source" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoldPriceCurrent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoldPriceHistory" (
    "id" TEXT NOT NULL,
    "karat" "GoldKarat" NOT NULL,
    "pricePerGram" DECIMAL(14,2) NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GoldPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceQuote" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "clientName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "status" "ServiceQuoteStatus" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceQuote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "GoldPriceCurrent_karat_key" ON "GoldPriceCurrent"("karat");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceQuote" ADD CONSTRAINT "ServiceQuote_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
