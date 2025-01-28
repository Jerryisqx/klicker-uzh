/*
  Warnings:

  - You are about to drop the column `elementGeneratedId` on the `ElementFeedback` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `ElementGenerated` table. All the data in the column will be lost.
  - You are about to drop the column `isDeleted` on the `ElementGenerated` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `ElementGenerated` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `ElementGenerated` table. All the data in the column will be lost.
  - You are about to drop the column `elementGeneratedId` on the `ElementInstance` table. All the data in the column will be lost.
  - You are about to drop the column `generateQuestionId` on the `QuestionInstance` table. All the data in the column will be lost.
  - You are about to drop the `_ElementGeneratedTags` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `difficulty` on the `ElementGenerated` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "ElementFeedback" DROP CONSTRAINT "ElementFeedback_elementGeneratedId_fkey";

-- DropForeignKey
ALTER TABLE "ElementInstance" DROP CONSTRAINT "ElementInstance_elementGeneratedId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionInstance" DROP CONSTRAINT "QuestionInstance_generateQuestionId_fkey";

-- DropForeignKey
ALTER TABLE "_ElementGeneratedTags" DROP CONSTRAINT "_ElementGeneratedTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_ElementGeneratedTags" DROP CONSTRAINT "_ElementGeneratedTags_B_fkey";

-- AlterTable
ALTER TABLE "ElementFeedback" DROP COLUMN "elementGeneratedId";

-- AlterTable
ALTER TABLE "ElementGenerated" DROP COLUMN "isArchived",
DROP COLUMN "isDeleted",
DROP COLUMN "score",
DROP COLUMN "version",
ADD COLUMN     "ambiguity" INTEGER,
ADD COLUMN     "difficultyRate" INTEGER,
ADD COLUMN     "factualCorrectness" INTEGER,
ADD COLUMN     "relevance" INTEGER,
ADD COLUMN     "typeRate" INTEGER,
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ElementInstance" DROP COLUMN "elementGeneratedId";

-- AlterTable
ALTER TABLE "QuestionInstance" DROP COLUMN "generateQuestionId";

-- DropTable
DROP TABLE "_ElementGeneratedTags";

-- DropEnum
DROP TYPE "DifficultyLevel";
