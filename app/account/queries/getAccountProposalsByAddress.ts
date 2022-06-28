import db from "db"
import * as z from "zod"
import { Account } from "../types"

const GetAccountProposalsByAddress = z.object({
  address: z.string().optional(),
})

export default async function getAccountProposalsByAddress(
  input: z.infer<typeof GetAccountProposalsByAddress>
) {
  const data = GetAccountProposalsByAddress.parse(input)

  const account = await db.account.findFirst({
    where: { address: data.address },
    include: {
      proposals: {
        include: {
          terminal: true,
          proposal: {
            include: {
              rfp: {
                include: {
                  checkbook: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!account) {
    return null
  }

  return account as unknown as Account
}
