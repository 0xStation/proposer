import db from "db"
import * as z from "zod"
import { Inbox } from "../types"

const GetInboxes = z.object({
  chainId: z.number(),
  address: z.string(),
})

export default async function getInboxes(input: z.infer<typeof GetInboxes>) {
  const params = GetInboxes.parse(input)

  console.log("params", params)

  const inboxes = await db.inbox.findMany({
    where: {
      chainId: params.chainId,
      address: params.address,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  if (!inboxes) return []

  return inboxes as unknown as Inbox[]
}
