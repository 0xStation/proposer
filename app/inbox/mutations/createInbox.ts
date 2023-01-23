import db from "db"
import * as z from "zod"
import { Inbox } from "../types"

const CreateInbox = z.object({
  chainId: z.number(),
  address: z.string(),
  name: z.string(),
  notes: z.string(),
})

export default async function createInbox(input: z.infer<typeof CreateInbox>) {
  const params = CreateInbox.parse(input)

  // auth a signature from safe signer

  const inbox = await db.inbox.create({
    data: {
      chainId: params.chainId,
      address: params.address,
      data: {
        name: params.name,
        notes: params.notes,
      },
    },
  })

  return inbox as unknown as Inbox
}
