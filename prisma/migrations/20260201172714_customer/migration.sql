-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Customer_tenantId_idx" ON "Customer"("tenantId");

-- CreateIndex
CREATE INDEX "Customer_tenantId_deletedAt_idx" ON "Customer"("tenantId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_tenantId_code_key" ON "Customer"("tenantId", "code");
