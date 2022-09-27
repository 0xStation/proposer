/*
  Warnings:

  - You are about to drop the `AccountInitiative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountProposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountTerminal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AccountTerminalTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Check` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CheckApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Checkbook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Endorsement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Initiative` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InitiativeSkill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Proposal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProposalApproval` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rfp` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Skill` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Terminal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountInitiative" DROP CONSTRAINT "AccountInitiative_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountInitiative" DROP CONSTRAINT "AccountInitiative_initiativeId_fkey";

-- DropForeignKey
ALTER TABLE "AccountProposal" DROP CONSTRAINT "AccountProposal_address_fkey";

-- DropForeignKey
ALTER TABLE "AccountProposal" DROP CONSTRAINT "AccountProposal_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "AccountProposal" DROP CONSTRAINT "AccountProposal_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "AccountSkill" DROP CONSTRAINT "AccountSkill_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountSkill" DROP CONSTRAINT "AccountSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_accountId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminal" DROP CONSTRAINT "AccountTerminal_terminalId_roleLocalId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminalTag" DROP CONSTRAINT "AccountTerminalTag_tagId_fkey";

-- DropForeignKey
ALTER TABLE "AccountTerminalTag" DROP CONSTRAINT "AccountTerminalTag_ticketAccountId_ticketTerminalId_fkey";

-- DropForeignKey
ALTER TABLE "Check" DROP CONSTRAINT "Check_fundingAddress_fkey";

-- DropForeignKey
ALTER TABLE "Check" DROP CONSTRAINT "Check_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "CheckApproval" DROP CONSTRAINT "CheckApproval_checkId_fkey";

-- DropForeignKey
ALTER TABLE "CheckApproval" DROP CONSTRAINT "CheckApproval_signerAddress_fkey";

-- DropForeignKey
ALTER TABLE "Checkbook" DROP CONSTRAINT "Checkbook_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "Endorsement" DROP CONSTRAINT "Endorsement_endorserId_fkey";

-- DropForeignKey
ALTER TABLE "Initiative" DROP CONSTRAINT "Initiative_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "InitiativeSkill" DROP CONSTRAINT "InitiativeSkill_initiativeId_fkey";

-- DropForeignKey
ALTER TABLE "InitiativeSkill" DROP CONSTRAINT "InitiativeSkill_skillId_fkey";

-- DropForeignKey
ALTER TABLE "Proposal" DROP CONSTRAINT "Proposal_rfpId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalApproval" DROP CONSTRAINT "ProposalApproval_proposalId_fkey";

-- DropForeignKey
ALTER TABLE "ProposalApproval" DROP CONSTRAINT "ProposalApproval_signerAddress_fkey";

-- DropForeignKey
ALTER TABLE "Rfp" DROP CONSTRAINT "Rfp_authorAddress_fkey";

-- DropForeignKey
ALTER TABLE "Rfp" DROP CONSTRAINT "Rfp_fundingAddress_fkey";

-- DropForeignKey
ALTER TABLE "Rfp" DROP CONSTRAINT "Rfp_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_terminalId_fkey";

-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_terminalId_fkey";

-- DropTable
DROP TABLE "AccountInitiative";

-- DropTable
DROP TABLE "AccountProposal";

-- DropTable
DROP TABLE "AccountSkill";

-- DropTable
DROP TABLE "AccountTerminal";

-- DropTable
DROP TABLE "AccountTerminalTag";

-- DropTable
DROP TABLE "Check";

-- DropTable
DROP TABLE "CheckApproval";

-- DropTable
DROP TABLE "Checkbook";

-- DropTable
DROP TABLE "Endorsement";

-- DropTable
DROP TABLE "Initiative";

-- DropTable
DROP TABLE "InitiativeSkill";

-- DropTable
DROP TABLE "Proposal";

-- DropTable
DROP TABLE "ProposalApproval";

-- DropTable
DROP TABLE "Rfp";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "Skill";

-- DropTable
DROP TABLE "Tag";

-- DropTable
DROP TABLE "Terminal";

-- DropEnum
DROP TYPE "AccountInitiativeStatus";
