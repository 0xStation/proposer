import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { TagType } from "app/tag/types"
import { truncateString } from "app/core/utils/truncateString"
import { Terminal } from "app/terminal/types"
import { Prisma } from "@prisma/client"

const CreateCheckbook = z.object({
  terminalId: z.number(),
  address: z.string(),
  chainId: z.number(),
  name: z.string(),
  quorum: z.number(),
  signers: z.string().array(), // assumes sanitized
})

export default async function createCheckbook(input: z.infer<typeof CreateCheckbook>, ctx: Ctx) {
  const terminal = (await db.terminal.findUnique({
    where: { id: input.terminalId },
  })) as Terminal

  if (!terminal) {
    throw new Error("Cannot create a checkbook for a terminal that does not exist.")
  }

  const terminalAdminTags = terminal.data.permissions.adminTagIdWhitelist

  if (!terminalAdminTags || terminalAdminTags.length === 0) {
    throw new Error(
      "No admin tags available for this terminal. Nobody is in control, so there is no way to auth."
    )
  }

  const accountTerminalTags = await db.accountTerminalTag.findMany({
    where: { tagId: { in: terminalAdminTags } },
    select: { ticketAccountId: true },
  })

  ctx.session.$authorize(
    [],
    accountTerminalTags.map((accountTerminalTag) => accountTerminalTag.ticketAccountId)
  )

  // create checkbook
  const checkbook = await db.checkbook.create({
    data: {
      address: input.address,
      chainId: input.chainId,
      name: input.name,
      terminalId: input.terminalId,
      quorum: input.quorum,
      signers: input.signers,
      data: {},
    },
  })

  // TODO: have signers come to the app to create an account if they don't have one
  // for now, create accounts for signers if they do not exist
  await db.account.createMany({
    skipDuplicates: true,
    data: input.signers.map((address) => {
      return {
        address,
        data: {
          name: truncateString(address),
        },
      }
    }),
  })

  const accounts = await db.account.findMany({
    where: {
      address: {
        in: input.signers,
      },
    },
  })

  // create memberships for signers if they do not exist
  await db.accountTerminal.createMany({
    skipDuplicates: true,
    data: accounts.map((a) => {
      return {
        accountId: a.id,
        terminalId: input.terminalId,
        active: true,
      }
    }),
  })

  const tag = await db.tag.create({
    data: {
      terminalId: input.terminalId,
      value: input.name,
      active: true,
      type: TagType.CHECKBOOK_SIGNER,
      data: {
        chainId: input.chainId,
        address: input.address,
      },
    },
  })

  await db.accountTerminalTag.createMany({
    data: accounts.map((account) => {
      return {
        tagId: tag.id,
        ticketAccountId: account.id,
        ticketTerminalId: input.terminalId,
      }
    }),
  })

  return checkbook
}
