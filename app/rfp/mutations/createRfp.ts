import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
import { Prisma } from "@prisma/client"
import { RfpStatus as PrismaRfpStatus } from "@prisma/client"
import { TokenTag, Token } from "types"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import { Terminal } from "app/terminal/types"

const CreateRfp = z.object({
  terminalId: z.number(),
  authorAddress: z.string(),
  contentTitle: z.string(),
  contentBody: z.string(),
  startDate: z.date(),
  endDate: z.date().optional(),
  fundingToken: Token,
  fundingBudgetAmount: z.string(),
  signature: z.string(),
  signatureMessage: z.any(),
  submittingPermission: TokenTag.optional(),
  viewingPermission: TokenTag.optional(),
})

const defaultProposalPrefill =
  "# Proposal summary \n\n # Goals \n\n # Roadmap and deliverable details \n\n # Challenges \n\n # Team background and previous contributions \n\n # Support request"

export default async function createRfp(input: z.infer<typeof CreateRfp>, ctx: Ctx) {
  const params = CreateRfp.parse(input)

  if (params.endDate) {
    if (params.startDate > params.endDate) {
      throw new Error("end date cannot come before start date")
    }
  }

  const terminal = (await db.terminal.findUnique({
    where: { id: params.terminalId },
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

  const rfp = await db.rfp.create({
    data: {
      authorAddress: params.authorAddress,
      terminalId: params.terminalId,
      startDate: params.startDate,
      ...(params.endDate && { endDate: params.endDate }),
      status: PrismaRfpStatus.PUBLISHED,
      data: {
        content: {
          title: params.contentTitle,
          body: params.contentBody,
        },
        signature: params.signature,
        signatureMessage: params.signatureMessage,
        proposalPrefill: defaultProposalPrefill,
        funding: {
          token: {
            ...input.fundingToken,
            address: toChecksumAddress(input.fundingToken.address),
          },
          budgetAmount: params.fundingBudgetAmount,
        },
        permissions: {
          submit: input.submittingPermission,
          view: input.viewingPermission,
        },
      },
    },
  })

  return rfp
}
