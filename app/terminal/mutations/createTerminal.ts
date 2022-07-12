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

  let allAdminAccountIds = [] as number[]
  let inputtedAdminAccountIds = [] as number[]
  if (params.accountId || params.adminAddresses) {
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

      const inputtedAdminAccounts = await db.account.findMany({
        where: {
          address: {
            in: input.adminAddresses,
          },
        },
      })

      // convert admin accounts array to array of account ids,
      // filtering to remove the user's id since we will append
      // to an array that already includes the user's id
      inputtedAdminAccountIds = inputtedAdminAccounts
        .map((account) => account.id)
        .filter((accountId) => accountId !== params.accountId)
    }
    allAdminAccountIds = [params.accountId as number].concat(inputtedAdminAccountIds)

    Object.assign(payload, {
      members: {
        create: allAdminAccountIds.map((id) => {
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
          ...terminal.data,
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
        data: allAdminAccountIds.map((accountId) => {
          return {
            tagId: stationAdminTag.id as number,
            ticketAccountId: accountId,
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
