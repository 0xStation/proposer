import truncateString from "app/core/utils/truncateString"
import { Ctx } from "blitz"
import db from "db"
import * as z from "zod"
import { Terminal, TerminalMetadata } from "../types"
import { StationPlatformTagValues, Tag, TagType } from "app/tag/types"

const CreateTerminal = z.object({
  name: z.string(),
  handle: z.string(),
  description: z.string().optional(),
  adminAddresses: z.string().array().optional().default([]),
  pfpURL: z.string().optional(),
  // require account id rather than address to create accountTerminal object
  accountId: z.number().optional(),
  contactUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
})

export default async function createTerminal(input: z.infer<typeof CreateTerminal>, ctx: Ctx) {
  const params = CreateTerminal.parse(input)

  const payload = {
    data: {
      pfpURL: params.pfpURL,
      name: params.name,
      description: params.description,
      contactUrl: params.contactUrl,
      twitterUrl: params.twitterUrl,
      githubUrl: params.githubUrl,
      instagramUrl: params.instagramUrl,
      permissions: {
        accountWhitelist: [ctx.session.siwe?.address],
      },
    } as TerminalMetadata,
    handle: params.handle,
  }

  let adminAccounts
  if (params.accountId || params.adminAddresses) {
    let adminAccountIds = [] as number[]
    if (params.adminAddresses) {
      // create accounts if the inputted adminAddresses don't exist
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

      adminAccounts = await db.account.findMany({
        where: {
          address: {
            in: input.adminAddresses,
          },
        },
      })

      adminAccountIds = adminAccounts.map((account) => account.id)
    }

    const accountIdsToCreateAccountTerminals =
      params.accountId && !adminAccountIds.includes(params.accountId)
        ? [params.accountId].concat(adminAccountIds)
        : adminAccountIds

    Object.assign(payload, {
      members: {
        create: accountIdsToCreateAccountTerminals.map((id) => {
          return {
            account: {
              connect: { id },
            },
          }
        }),
      },
      tags: {
        create: [
          {
            value: StationPlatformTagValues.STATION_ADMIN,
            active: true,
            type: TagType.ROLE,
          },
        ],
      },
    })
  }

  try {
    const terminal = (await db.terminal.create({
      data: payload,
      include: { tags: true },
    })) as Terminal

    const stationAdminTag = terminal.tags[0] as Tag

    await db.terminal.update({
      where: { id: terminal.id },
      data: {
        data: {
          permissions: {
            adminTagIdWhitelist: [stationAdminTag.id as number],
            ...(terminal.data.permissions && terminal.data.permissions),
          },
        },
      },
    })

    if (params.accountId || params.adminAddresses) {
      // create account tag association for station admin tag and inputted admin accounts
      await db.accountTerminalTag.createMany({
        skipDuplicates: true,
        data: adminAccounts.map((account) => {
          return {
            tagId: stationAdminTag.id as number,
            ticketAccountId: account.id,
            ticketTerminalId: terminal.id,
          }
        }),
      })
    }
    return terminal
  } catch (err) {
    // prisma error code docs
    // https://www.prisma.io/docs/reference/api-reference/error-reference#error-codes
    if (err.code === "P2002") {
      throw new Error(`${err.meta.target[0]} already exists.`)
    }
    throw err
  }
}
