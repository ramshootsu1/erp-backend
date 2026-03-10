-- AlterTable
ALTER TABLE "CustomerAddress" ADD COLUMN     "deletedByCascade" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CustomerContact" ADD COLUMN     "deletedByCascade" BOOLEAN NOT NULL DEFAULT false;
