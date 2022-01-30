/*
  Warnings:

  - A unique constraint covering the columns `[handle]` on the table `Terminal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `handle` to the `Terminal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Terminal" ADD COLUMN     "handle" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Terminal_handle_key" ON "Terminal"("handle");
