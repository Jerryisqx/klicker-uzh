-- AlterTable
ALTER TABLE "ElementFeedback" ADD COLUMN     "elementGeneratedId" INTEGER;

-- AlterTable
ALTER TABLE "ElementInstance" ADD COLUMN     "elementGeneratedId" INTEGER;

-- AlterTable
ALTER TABLE "QuestionInstance" ADD COLUMN     "generateQuestionId" INTEGER;

-- CreateTable
CREATE TABLE "ElementGenerated" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "originalId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "explanation" TEXT,
    "pointsMultiplier" INTEGER NOT NULL DEFAULT 1,
    "options" JSONB NOT NULL,
    "status" "ElementStatus" NOT NULL DEFAULT 'READY',
    "type" "ElementType" NOT NULL,
    "ownerId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ElementGenerated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ElementGeneratedTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ElementGenerated_ownerId_originalId_key" ON "ElementGenerated"("ownerId", "originalId");

-- CreateIndex
CREATE UNIQUE INDEX "_ElementGeneratedTags_AB_unique" ON "_ElementGeneratedTags"("A", "B");

-- CreateIndex
CREATE INDEX "_ElementGeneratedTags_B_index" ON "_ElementGeneratedTags"("B");

-- AddForeignKey
ALTER TABLE "ElementGenerated" ADD CONSTRAINT "ElementGenerated_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementInstance" ADD CONSTRAINT "ElementInstance_elementGeneratedId_fkey" FOREIGN KEY ("elementGeneratedId") REFERENCES "ElementGenerated"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionInstance" ADD CONSTRAINT "QuestionInstance_generateQuestionId_fkey" FOREIGN KEY ("generateQuestionId") REFERENCES "ElementGenerated"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ElementFeedback" ADD CONSTRAINT "ElementFeedback_elementGeneratedId_fkey" FOREIGN KEY ("elementGeneratedId") REFERENCES "ElementGenerated"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementGeneratedTags" ADD CONSTRAINT "_ElementGeneratedTags_A_fkey" FOREIGN KEY ("A") REFERENCES "ElementGenerated"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ElementGeneratedTags" ADD CONSTRAINT "_ElementGeneratedTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
