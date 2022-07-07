import set from "lodash.set"
import truncateString from "app/core/utils/truncateString"
import { TagType } from "app/tag/types"
import db from "db"
import * as z from "zod"
import { Terminal } from "../types"
import getAdminAccountsForTerminal from "app/permissions/queries/getAdminAccountsForTerminal"

const UpdateTerminal = z.object({
  id: z.number(),
  name: z.string().optional(),
  handle: z.string().optional(),
  pfpURL: z.string().optional(),
  guildId: z.string().optional(),
  adminAddresses: z.string().array().optional().default([]),
})

export default async function updateTerminal(input: z.infer<typeof UpdateTerminal>) {
  const params = UpdateTerminal.parse(input)

  const existingTerminal = (await db.terminal.findUnique({
    where: { id: params.id },
  })) as Terminal

  if (!existingTerminal) {
    console.log("cannot update a terminal that does not exist")
    return null
  }

  // create new admins or delete removed admins
  let updatedTerminalMetadata = JSON.parse(JSON.stringify(existingTerminal.data))
  if (input.adminAddresses) {
    const stationAdminTag = await db.tag.upsert({
      where: {
        value_terminalId: {
          value: "station admin",
          terminalId: input.id,
        },
      },
      update: {},
      create: {
        terminalId: input.id,
        value: "station admin",
        active: true,
        type: TagType.ROLE,
      },
    })

    const terminalAdminAccounts = await getAdminAccountsForTerminal({
      terminalId: input.id,
    })

    terminalAdminAccounts.forEach(async (terminalAdminAccount) => {
      if (!input?.adminAddresses.includes(terminalAdminAccount?.address || "")) {
        await db.accountTerminalTag.delete({
          where: {
            tagId_ticketAccountId_ticketTerminalId: {
              tagId: stationAdminTag.id,
              ticketAccountId: terminalAdminAccount.id,
              ticketTerminalId: input.id,
            },
          },
        })
      }
    })

    // create accounts if the inputted address doesn't exist
    await db.account.createMany({
      skipDuplicates: true,
      data: input.adminAddresses.map((address) => {
        return {
          address,
          data: {
            name: truncateString(address),
          },
        }
      }),
    })

    const adminAccounts = await db.account.findMany({
      where: {
        address: {
          in: input.adminAddresses,
        },
      },
    })

    // give newly created accounts membership to the terminal
    await db.accountTerminal.createMany({
      skipDuplicates: true,
      data: adminAccounts.map((adminAccount) => {
        return {
          accountId: adminAccount.id,
          terminalId: input.id,
          active: true,
        }
      }),
    })

    await db.accountTerminalTag.createMany({
      skipDuplicates: true,
      data: adminAccounts.map((account) => {
        return {
          tagId: stationAdminTag.id,
          ticketAccountId: account.id,
          ticketTerminalId: input.id,
        }
      }),
    })
    if (
      updatedTerminalMetadata?.permissions?.adminTagIdWhitelist &&
      !updatedTerminalMetadata?.permissions?.adminTagIdWhitelist.includes(stationAdminTag.id)
    ) {
      set(
        updatedTerminalMetadata,
        "permissions.adminTagIdWhitelist",
        [stationAdminTag.id].concat(existingTerminal.data?.permissions?.adminTagIdWhitelist || [])
      )
    }
  }
  // Get tag if not create one for the terminal where they are a station admin -> make it a role

  /**
   * required so we can use this function and pass in any or all optional params without wiping out the old ones.
   * The syntax ...(condition && { key: value })
     will only create a key value pair in the object if the condition is truthy.
   */
  const payload = {
    data: {
      ...updatedTerminalMetadata,
      ...(params.pfpURL && { pfpURL: params.pfpURL }),
      ...(params.name && { name: params.name }),
      ...(params.guildId && { guildId: params.guildId }),
    },
    ...(params.handle && { handle: params.handle }),
  }

  try {
    const terminal = await db.terminal.update({
      where: { id: params.id },
      data: payload,
    })

    return terminal
  } catch (err) {
    throw err
  }
}
