import db from "db"
import * as z from "zod"
import { Account } from "../types"

/**
 * questions
 * ---
 * - do we need terminalId if RFP aready relates to a terminal, and a proposal is joined to an RFP?
 * - what is fundingAddress, and generally, how does funding work for proposals?
 * -> tokenType and tokenAmount from mockups don't seem to align with prisma schema
 * -> my thinking is fundingAddress is also adopted from RFP... then tokenType and tokenAmount are read from funding adresss
 * -> like, this checkbook has 10k USDC and 4 ETH, so you can request either USDC or ETH up to that amount.
 * - How are we going to handle cases like... the checkbook has 10K usdc, and there is already one proposal for 5k.
 * -> so there is 5k "remaining" if that proposal is accepted, but that's not guaranteed? It could get denied.
 * -> but if it does get accepted, then if we allowed the second prop to request > 5k, what do we do?
 * - where in UI do we want to allow users to create "default proposal template" per RFP?
 */
const GetAccountsByAddresses = z.object({
  addresses: z.array(z.string()),
})

export default async function getAccountsByAddresses(
  input: z.infer<typeof GetAccountsByAddresses>
) {
  const data = GetAccountsByAddresses.parse(input)
  const accounts = await db.account.findMany({ where: { address: { in: data.addresses } } })

  if (!accounts) {
    return []
  }

  return accounts as Account[]
}
