/*
  Warnings:

  - Made the column `groupDeadlineDate` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isGroupCreationEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxGroupSize" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "preferredGroupSize" INTEGER NOT NULL DEFAULT 3,
ALTER COLUMN "groupDeadlineDate" SET NOT NULL;
