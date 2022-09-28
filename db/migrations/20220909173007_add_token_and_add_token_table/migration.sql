-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('COIN', 'ERC20', 'ERC721', 'ERC1155');

-- CreateTable
CREATE TABLE "AccountToken" (
    "accountId" INTEGER NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "data" JSONB,

    CONSTRAINT "AccountToken_pkey" PRIMARY KEY ("accountId","tokenAddress","chainId")
);

-- CreateTable
CREATE TABLE "Token" (
    "address" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "chainId" INTEGER NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "decimals" INTEGER,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("address","chainId")
);

-- AddForeignKey
ALTER TABLE "AccountToken" ADD CONSTRAINT "AccountToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountToken" ADD CONSTRAINT "AccountToken_tokenAddress_chainId_fkey" FOREIGN KEY ("tokenAddress", "chainId") REFERENCES "Token"("address", "chainId") ON DELETE RESTRICT ON UPDATE CASCADE;
