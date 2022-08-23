-- This is an empty migration.
/*
This migration represents a change in the metadata structure of tokens stored in Rfps and Proposals

# Key

--- : removed from schema
+++ : added to schema
••• : no change to schema, but mistakenly missing data that needs populating

# Schema Changes

TokenType {
+++ COIN
    ERC20
    ERC721
    ERC1155
}

--- TagTokenMetadata {
+++ Token {
    chainId: number
    address: string
    type: TokenType
••• name?: string
    symbol?: string
+++ decimals?: number
}

RfpMetadata {
    permissions: {
        view: {
            chainId: number
            address: string
            type: TokenType
•••         name: string
            symbol: string
+++         decimals: number
        }
        submit: {
            chainId: number
            address: string
            type: TokenType
•••         name: string
            symbol: string
+++         decimals: number
        }
    }
    funding: {
        token: {
            chainId: number
            address: string
+++         type: TokenType
+++         name: string
            symbol: string
            decimals: number
        }
    }
}

ProposalMetadata {
    funding: {
---     token: string
---     symbol: string
+++     token: {
+++         chainId: number
+++         address: string
+++         type: TokenType
+++         name: string
+++         symbol: string
+++         decimals: number
+++     }
    }
}

*/

