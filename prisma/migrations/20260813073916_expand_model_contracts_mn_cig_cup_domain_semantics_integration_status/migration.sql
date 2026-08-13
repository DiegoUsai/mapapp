-- CreateTable
CREATE TABLE "_ApplicationToContract" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApplicationToContract_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApplicationToContract_B_index" ON "_ApplicationToContract"("B");

-- AddForeignKey
ALTER TABLE "_ApplicationToContract" ADD CONSTRAINT "_ApplicationToContract_A_fkey" FOREIGN KEY ("A") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApplicationToContract" ADD CONSTRAINT "_ApplicationToContract_B_fkey" FOREIGN KEY ("B") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "cig" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cup" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "cofogCode" TEXT,
ADD COLUMN     "eurovocUri" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'verticale';

-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'backlog';

-- DataMigration: preserve existing single Application -> Contract links in the new join table
INSERT INTO "_ApplicationToContract" ("A", "B")
SELECT "id", "contractId" FROM "Application" WHERE "contractId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_contractId_fkey";

-- AlterTable
ALTER TABLE "Application" DROP COLUMN "contractId";
