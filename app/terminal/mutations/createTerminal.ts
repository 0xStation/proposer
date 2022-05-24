import { Ctx } from "blitz"
import db from "db"
import * as z from "zod"
import { Terminal, TerminalMetadata } from "../types"

const CreateTerminal = z.object({
  name: z.string(),
  handle: z.string(),
  pfpURL: z.string().optional(),
  accountId: z.number().optional(),
})

export default async function createTerminal(input: z.infer<typeof CreateTerminal>, ctx: Ctx) {
  const params = CreateTerminal.parse(input)

  const payload = {
    data: {
      pfpURL: params.pfpURL,
      name: params.name,
      permissions: {
        accountWhitelist: [ctx.session.siwe?.address],
      },
    } as TerminalMetadata,
    handle: params.handle,
  }

  if (params.accountId) {
    Object.assign(payload, {
      members: {
        create: [
          {
            account: {
              connect: {
                id: params.accountId,
              },
            },
          },
        ],
      },
    })
  }

  try {
    const terminal = (await db.terminal.create({ data: payload })) as Terminal
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
