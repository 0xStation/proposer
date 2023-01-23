import { Inbox as PrismaInbox } from "@prisma/client"

export type Inbox = PrismaInbox & {
  data: InboxMetadata
}

export type InboxMetadata = {
  name: string
  notes: string
}
