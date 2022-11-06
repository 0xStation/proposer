import db from "db"
import * as z from "zod"
import { Ctx } from "blitz"

const CreateComment = z.object({
  commentBody: z.string(),
  proposalId: z.string(),
  parentId: z.string().optional(),
})

export default async function createComment(input: z.infer<typeof CreateComment>, ctx: Ctx) {
  const params = CreateComment.parse(input)

  const roles = await db.proposalRole.findMany({
    where: {
      proposalId: params.proposalId,
    },
  })

  const addressesWithValidRoles = roles.map((role) => role.address)
  ctx.session.$authorize(addressesWithValidRoles, [])

  if (!ctx.session.$publicData.siwe) {
    console.error("cannot comment without a user session.")
    return null
  }

  await db.comment.create({
    data: {
      proposalId: params.proposalId,
      authorAddress: ctx.session.$publicData.siwe.address,
      parentId: params.parentId,
      data: {
        body: params.commentBody,
      },
    },
  })
}
