import db from "db"
import * as z from "zod"
import { canInvite } from "app/utils/permissions"

const InviteContributor = z.object({
  referrerId: z.number(),
  accountId: z.number(),
  initiativeId: z.number(),
  terminalId: z.number(),
  roleLocalId: z.number(),
})

export default async function inviteContributor(input: z.infer<typeof InviteContributor>) {
  const params = InviteContributor.parse(input)

  // check that this invitation is valid
  const validInvite = await canInvite(
    params.referrerId,
    params.terminalId,
    params.accountId,
    params.initiativeId
  )

  if (!validInvite) {
    console.log("Not a valid invite pair.")
    return
  }

  // update the application to show that the status is accepted
  await db.accountInitiative.update({
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

  // if the user already exists, we do not want to "re-invite" them
  // but what if this is not meant to be a first time invite but a promotion?
  if (existingMembership) {
    console.log("This user is already part of the terminal.")
  }

  await db.accountTerminal.create({
    data: {
      accountId: params.accountId,
      terminalId: params.terminalId,
      roleLocalId: params.roleLocalId,
      data: {
        invitedBy: params.referrerId,
      },
    },
  })
}
