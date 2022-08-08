import db from "db"
import * as z from "zod"
import { Checkbook } from "../types"

const GetCheckbook = z.object({
  chainId: z.number(),
  address: z.string(),
})

export default async function getCheckbook(input: z.infer<typeof GetCheckbook>) {
  const params = GetCheckbook.parse(input)

  if (params.address === "") {
    return null
  }

  const checkbook = await db.checkbook.findFirst({
    where: {
      chainId: params.chainId,
      address: params.address,
    },
  })

  if (!checkbook) {
    return null
  }

  const accounts = await db.account.findMany({
    where: {
      address: {
        in: checkbook.signers,
      },
    },
  })

  let signers = {}
  accounts.forEach((a) => (signers[a.address!] = a))

  return {
    ...checkbook,
    signerAccounts: checkbook.signers.map((s) => signers[s]),
  } as unknown as Checkbook
}
