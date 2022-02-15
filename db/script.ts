import inviteContributor from "app/application/mutations/inviteContributor"
/*
 * This seed function is executed when you run `blitz db seed -f db/wipe.ts`.
 */
const seed = async () => {
  console.log("testing")

  const accountId = 4
  const initiativeId = 10
  const terminalId = 2
  const roleLocalId = 1
  const inviterId = 3

  await inviteContributor({
    invitedByAccountId: inviterId,
    accountId: accountId,
    initiativeId: initiativeId,
    terminalId: terminalId,
    roleLocalId: roleLocalId,
  })
}

export default seed
