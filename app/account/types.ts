import { Account as PrismaAccount, AccountAccount } from "@prisma/client"

export type Account = PrismaAccount & {
  data: AccountMetadata
  originsOf: (AccountAccount & { targetAccount: Account })[]
  targetsOf: (AccountAccount & { originAccount: Account })[]
}

export type AccountMetadata = {
  name: string
  bio?: string
  prompt?: string
  pfpUrl?: string
  discordHandle: string
  hasSavedEmail?: boolean
  hasVerifiedEmail?: boolean
  // for smart contract Accounts (e.g. multisigs), indicate the chainId of the smart contract
  chainId?: number
  // used by getRolesByProposalId to attach Safe metadata to roles returned to frontend for dev convenience
  // not actually saved in database and only used when account's addressType is SAFE
  quorum?: number
  signers?: string[]
}
