import { Account as PrismaAccount, AccountAccount } from "@prisma/client"

export type Account = PrismaAccount & {
  data: AccountMetadata
  originsOf: (AccountAccount & { targetAccount: Account })[]
  targetsOf: (AccountAccount & { originAccount: Account })[]
}

export type AccountMetadata = {
  name: string
  bio?: string
  pfpUrl?: string
  hasSavedEmail?: boolean
  hasVerifiedEmail?: boolean
  // for smart contract Accounts (e.g. multisigs), indicate the chainId of the smart contract
  chainId?: number
  // not saved in database, but threaded into account object sometimes in queries
  quorum?: number
  signers?: string[]
}
