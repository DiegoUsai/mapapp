-- AlterTable
ALTER TABLE "Domain" DROP COLUMN "eurovocUri";

-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "fromModuleId" TEXT,
ADD COLUMN     "toModuleId" TEXT;

-- AlterTable
ALTER TABLE "Requirement" ADD COLUMN     "moduleId" TEXT;

-- CreateTable
CREATE TABLE "Module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Module_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Module" ADD CONSTRAINT "Module_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_fromModuleId_fkey" FOREIGN KEY ("fromModuleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integration" ADD CONSTRAINT "Integration_toModuleId_fkey" FOREIGN KEY ("toModuleId") REFERENCES "Module"("id") ON DELETE SET NULL ON UPDATE CASCADE;
