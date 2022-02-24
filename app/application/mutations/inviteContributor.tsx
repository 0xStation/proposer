import db from "db"
import * as z from "zod"
import { TerminalMetadata } from "app/terminal/types"

const InviteContributor = z.object({
  referrerId: z.number(),
  accountId: z.number(),
  initiativeId: z.number(),
  terminalId: z.number(),
  roleLocalId: z.number(),
})

export default async function inviteContributor(input: z.infer<typeof InviteContributor>) {
  const params = InviteContributor.parse(input)
  const { referrerId, terminalId, accountId, initiativeId, roleLocalId } = params

  const referrerTicket = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: params?.referrerId,
        terminalId: params?.terminalId,
      },
    },
    include: { role: true, terminal: true },
  })

  const permissions = (referrerTicket?.terminal.data as TerminalMetadata).permissions.invite[
    referrerTicket?.role?.localId as number
  ]

  if (!permissions || !permissions.includes(roleLocalId)) {
    console.log("Not a valid invite pair.")
    return
  }

  // update the application to show that the status is accepted
  await db.accountInitiative.update({
    where: {
      accountId_initiativeId: {
        accountId: accountId,
        initiativeId: initiativeId,
      },
    },
    data: {
      status: "CONTRIBUTOR",
    },
  })

  const existingMembership = await db.accountTerminal.findUnique({
    where: {
      accountId_terminalId: {
        accountId: accountId,
        terminalId: terminalId,
      },
    },
  })

  // if the user already exists, we do not want to "re-invite" them
  // but what if this is not meant to be a first time invite but a promotion?
  if (existingMembership) {
    console.log("This user is already part of the terminal.")
  }

  await db.accountTerminal.create({
    data: {
      accountId: accountId,
      terminalId: terminalId,
      roleLocalId: roleLocalId,
      data: {
        invitedBy: referrerId,
      },
    },
  })
}
