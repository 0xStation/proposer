import db from "db"
import * as z from "zod"

export type TerminalMetadata = {
  name: string
  description: string
  pfpURL: string
  coverURL?: string
  permissions: {
    invite: Record<string, number[]>
    edit: Record<string, number[]>
  }
  contracts: {
    addresses: {
      endorsements: string
      points: string
      referrals: string
    }
    symbols: {
      endorsements: string
      points: string
      referrals: string
    }
  }
  hide?: boolean
  discordWebhookUrl?: string
  visualizeNftMethod?: string
}

const GetTerminalsByAccount = z.object({
  accountId: z.number(),
})

export default async function getTerminalsByAccount(input: z.infer<typeof GetTerminalsByAccount>) {
  const params = GetTerminalsByAccount.parse(input)
  const tickets = await db.accountTerminal.findMany({
    include: {
      terminal: true,
    },
    where: {
      accountId: params.accountId,
    },
  })

  return tickets
    .map((ticket) => ({
      ...ticket.terminal,
    }))
    .filter((t) => !(t.data as TerminalMetadata).hide)
}
