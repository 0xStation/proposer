/*
  Warnings:

  - Added the required column `data` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Check" ADD COLUMN     "data" JSONB NOT NULL;
