import db from "db"
import * as z from "zod"
import { Check } from "../types"

const GetChecks = z.object({
  chainId: z.number(),
  address: z.string(),
  inboxIds: z.string().array().default([]),
})

export default async function getChecks(input: z.infer<typeof GetChecks>) {
  const params = GetChecks.parse(input)

  const checks = await db.check.findMany({
    where: {
      chainId: params.chainId,
      address: params.address,
      ...(params.inboxIds.length > 0 && { inboxId: { in: params.inboxIds } }),
    },
    include: {
      inbox: true,
      proofs: {
        include: {
          signature: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!checks) return []

  return checks as unknown as Check[]
}
