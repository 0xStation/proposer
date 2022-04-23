import db from "db"
import * as z from "zod"
import { Application } from "../types"

const GetApplicationByAddress = z.object({
  terminalId: z.number(),
  initiativeLocalId: z.number(),
  address: z.string(),
})

export default async function getApplicationByAddress(
  input: z.infer<typeof GetApplicationByAddress>
) {
  const data = GetApplicationByAddress.parse(input)
  const { terminalId, initiativeLocalId, address } = data

  const initiative = await db.initiative.findFirst({
    where: { terminalId: terminalId, localId: initiativeLocalId },
  })

  if (!initiative) {
    console.error(
      `Could not find initiative with terminal id: ${terminalId} and initiative local id: ${initiativeLocalId}.`
    )
    return null
  }

  const account = await db.account.findUnique({
    where: { address: address },
  })

  if (!account) {
    console.error(`Could not find account with address: ${address}.`)
    return null
  }

  const application = await db.accountInitiative.findFirst({
    where: {
      status: "INTERESTED",
      initiativeId: initiative.id as unknown as number,
      accountId: account.id,
    },
    include: {
      account: {
        include: {
          tickets: {
            where: {
              terminalId: terminalId,
            },
            include: {
              role: true,
            },
          },
          skills: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  })

  if (!application) {
    console.error(
      `Could not find application with address: ${address}, terminal id: ${terminalId}, and initiativeLocalId: ${initiativeLocalId}.`
    )
    return null
  }

  return application as unknown as Application
}
