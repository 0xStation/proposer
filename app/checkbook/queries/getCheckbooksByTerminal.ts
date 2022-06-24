import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const GetCheckbooksByTerminal = z.object({
  terminalId: z.number(),
})

export default async function getCheckbooksByTerminal(
  input: z.infer<typeof GetCheckbooksByTerminal>
) {
  const checkbooks = await db.checkbook.findMany({
    where: {
      terminalId: input.terminalId,
    },
  })

  const signers = {}
  checkbooks.forEach((c) => c.signers.forEach((s) => (signers[s] = {})))

  const accounts = await db.account.findMany({
    where: {
      address: {
        in: Object.keys(signers),
      },
    },
  })

  accounts.forEach((a) => (signers[a.address!] = a))

  return checkbooks.map((c) => {
    return { ...c, signerAccounts: c.signers.map((s) => signers[s]) }
  }) as Checkbook[]
}
