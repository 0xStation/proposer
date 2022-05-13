import { AccountTerminalTag, Tag } from "@prisma/client"
import { Account } from "app/account/types"

export type AccountTerminalMetadata = any

export type AccountTerminalWithTagsAndAccount = {
  accountId: number
  terminalId: number
  roleLocalId: number | null
  joinedAt: Date
  active: boolean
  data: AccountTerminalMetadata
  tags: (AccountTerminalTag & { tag: Tag })[]
  account: Account
}
