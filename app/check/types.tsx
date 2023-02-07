import { Check as PrismaCheck } from "@prisma/client"
import { Inbox } from "app/inbox/types"
import { Proof } from "app/proof/types"
import { Schedule } from "app/schedule/types"
import { Token } from "app/token/types"

export type Check = PrismaCheck & {
  data: CheckMetadata
  inbox?: Inbox
  schedule?: Schedule
  proofs?: Proof[]
}

export type CheckMetadata = {
  title: string
  meta: {
    type: CheckType
    token?: Token
    recipient?: string
    amount?: string
  }
  txn: {
    to: string
    value: string
    data: string
    operation: number
  }
}

export enum CheckType {
  FungibleTransfer,
  NonFungibleTransfer,
  ThresholdChange,
  NewSignerAndThresholdChange,
  ReplaceSigner,
  CustomCall,
}

export enum CheckStatus {
  PENDING = "PENDING",
  READY = "READY",
  EXECUTED = "EXECUTED",
}
