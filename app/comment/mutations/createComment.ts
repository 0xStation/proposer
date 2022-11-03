import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const CreateComment = z.object({
  commentBody: z.string(),
  authorId: z.number(),
  proposalId: z.string(),
  parentId: z.string().optional(),
})

export default async function createComment(input: z.infer<typeof CreateComment>, ctx: Ctx) {
  const params = CreateComment.parse(input)

  const proposal = await db.proposal.findUnique({
    where: {
      id: params.proposalId,
    },
    include: {
      roles: {
        include: {
          account: true,
        },
      },
    },
  })

  if (!proposal) {
    console.error("cannot add comments to a proposal that does not exist")
    return null
  }

  const addressesWithValidRoles = proposal.roles.map((role) => role.address)
  const accountIdsWithValidRoles = proposal.roles.map((role) => role.account.id)
  ctx.session.$authorize(addressesWithValidRoles, accountIdsWithValidRoles)

  await db.comment.create({
    data: {
      proposalId: params.proposalId,
      authorId: params.authorId,
      parentId: params.parentId,
      data: {
        message: params.commentBody,
      },
    },
  })
}
