/*
  Warnings:

  - The primary key for the `AccountsOnInitiative` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "AccountsOnInitiative" DROP CONSTRAINT "AccountsOnInitiative_pkey",
ADD CONSTRAINT "AccountsOnInitiative_pkey" PRIMARY KEY ("accountId");
