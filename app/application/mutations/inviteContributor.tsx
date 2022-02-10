import db from "db"
import * as z from "zod"

const InviteContributor = z.object({
  invitedByAccountId: z.number(),
  accountId: z.number(),
  initiativeId: z.number(),
  terminalId: z.number(),
  roleLocalId: z.number(),
})

export default async function inviteContributor(input: z.infer<typeof InviteContributor>) {
  const params = InviteContributor.parse(input)

  const terminal = await db.terminal.findUnique({
    where: { id: params.terminalId },
  })

  const accountInitiative = await db.accountInitiative.update({
    where: {
      accountId_initiativeId: {
        accountId: params.accountId,
        initiativeId: params.initiativeId,
      },
    },
    data: {
      status: "CONTRIBUTOR",
    },
  })

  const existingMembership = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: params.accountId,
        terminalId: params.terminalId,
      },
    },
  })

  if (!existingMembership) {
    await db.accountTerminal.create({
      data: {
        accountId: params.accountId,
        terminalId: params.terminalId,
        roleLocalId: params.roleLocalId,
        data: {
          invitedBy: params.invitedByAccountId,
        },
      },
    })
  }
}
