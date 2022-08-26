-- DropForeignKey
ALTER TABLE "Rfp" DROP CONSTRAINT "Rfp_fundingAddress_fkey";

-- AlterTable
ALTER TABLE "Rfp" ALTER COLUMN "fundingAddress" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Rfp" ADD CONSTRAINT "Rfp_fundingAddress_fkey" FOREIGN KEY ("fundingAddress") REFERENCES "Checkbook"("address") ON DELETE SET NULL ON UPDATE CASCADE;

/*
The above is changing the FK from rfp to checkbook to be ON DELETE SET NULL condition and making the fundingAddress column nullable

This migration ALSO represents a change in the metadata structure of Proposals and Projects

# Key
--- : removed from schema
+++ : added to schema
••• : no change to schema, but mistakenly missing data that needs populating

# Schema Changes
```
+++ AddressType {
+++     CHECKBOOK
+++     SAFE
+++     WALLET
+++ }

RfpMetadata {
    funding: {
+++     senderAddress?: string
+++     senderType?: AddressType
        token: {
            chainId: number
            address: string
            symbol: string
            decimals: number
        }
        budgetAmount: string
    }
}

ProposalMetadata {
    funding: {
+++     senderAddress?: string
+++     senderType?: AddressType
+++     chainId: number
        recipientAddress: string
        token: string
        symbol: string
        amount: string
    }
}
```
*/