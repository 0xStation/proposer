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
