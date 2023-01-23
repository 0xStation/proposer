import db from "db"
import * as z from "zod"
import { Inbox } from "../types"

const GetInbox = z.object({
  inboxId: z.string(),
})

export default async function getInbox(input: z.infer<typeof GetInbox>) {
  const params = GetInbox.parse(input)

  const inbox = await db.inbox.findUnique({
    where: {
      id: params.inboxId,
    },
    include: {
      checkbook: true,
    },
  })

  if (!inbox) return null

  return inbox as unknown as Inbox
}
