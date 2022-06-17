import { Account } from "app/account/types"

export type CheckbookMetadata = {}

export type Checkbook = {
  address: string
  chainId: number
  name: string
  quorum: number
  signers: string[]
  signerAccounts?: Account[]
  data: CheckbookMetadata
}
