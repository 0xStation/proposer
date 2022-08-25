import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"
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

  // easier to write a custom SQL command to fetch the accounts with tags in the list of terminalAdmin tags
  // than to make a deeply nested prisma command
  const accountsWithAdminTags: any[] = await db.$queryRaw`
    SELECT distinct("Account".id), "Account".address
    FROM "Account"
    INNER JOIN "AccountTerminal" ON "AccountTerminal"."accountId" = "Account".id
    INNER JOIN "AccountTerminalTag" ON "AccountTerminalTag"."ticketAccountId" = "Account".id
    INNER JOIN "Tag" ON "Tag".id = "AccountTerminalTag"."tagId"
    WHERE "Tag".id in (${terminalAdminTags?.join(",")})
  `

  ctx.session.$authorize(
    accountsWithAdminTags.map((account) => account.address),
    []
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
