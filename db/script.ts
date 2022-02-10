import { useMutation, useRouter, useParam, useQuery } from "blitz"
import inviteContributor from "app/application/mutations/inviteContributor"
/*
 * This seed function is executed when you run `blitz db seed -f db/wipe.ts`.
 */
const seed = async () => {
  console.log("Wiping all database rows...")

  const [createApplicationMutation] = useMutation(inviteContributor, {
    onSuccess: () => {
      console.log("completed")
    },
  })

  const accountId = 1
  const initiativeId = 1
  const terminalId = 1
  const roleLocalId = 1
  const inviterId = 1

  await createApplicationMutation({
    invitedByAccountId: inviterId,
    accountId: accountId,
    initiativeId: initiativeId,
    terminalId: terminalId,
    roleLocalId: roleLocalId,
  })
}

export default seed
