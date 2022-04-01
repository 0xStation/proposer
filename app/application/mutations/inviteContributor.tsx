import db from "db"
import * as z from "zod"
import getInvitePermissions from "../queries/getInvitePermissions"

const InviteContributor = z.object({
  inviterId: z.number(),
  accountId: z.number(),
  initiativeId: z.number(),
  terminalId: z.number(),
  roleLocalId: z.number(),
})

export default async function inviteContributor(input: z.infer<typeof InviteContributor>) {
  const params = InviteContributor.parse(input)
  const { inviterId, terminalId, accountId, initiativeId, roleLocalId } = params

  const permissions = await getInvitePermissions({ inviterId, terminalId })

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

  await db.accountTerminal.upsert({
    where: {
      accountId_terminalId: {
        accountId: accountId,
        terminalId: terminalId,
      },
    },
    create: {
      accountId: accountId,
      terminalId: terminalId,
      roleLocalId: roleLocalId,
      data: {
        invitedBy: inviterId,
      },
    },
    update: {
      roleLocalId: roleLocalId,
    },
  })
}
