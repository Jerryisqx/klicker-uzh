-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "ElementGenerated" ADD COLUMN     "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'EASY';
