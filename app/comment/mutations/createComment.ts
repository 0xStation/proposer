import db from "db"
import { invoke } from "@blitzjs/rpc"
import * as z from "zod"
import { Ctx } from "blitz"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"
import { addressesAreEqual } from "app/core/utils/addressesAreEqual"
import { AddressType } from "@prisma/client"

const CreateComment = z.object({
  commentBody: z.string(),
  proposalId: z.string(),
  parentId: z.string().optional(),
})

export default async function createComment(input: z.infer<typeof CreateComment>, ctx: Ctx) {
  const params = CreateComment.parse(input)

  // const roles = await db.proposalRole.findMany({
  //   where: {
  //     proposalId: params.proposalId,
  //   },
  // })

  if (!ctx.session.$publicData.siwe) {
    console.error("cannot comment without a user session.")
    throw new Error("cannot comment without a user session.")
  }

  const roles = await invoke(getRolesByProposalId, { proposalId: params.proposalId as string })
  const addressesWithValidRoles =
    roles
      ?.map((role) => {
        if (role?.account?.addressType === AddressType.WALLET) {
          return role.account.address
        } else if (role?.account?.addressType === AddressType.SAFE) {
          return role?.account?.data?.signers || []
        }
        return []
      })
      .flat()
      .filter((e) => e !== undefined) || []

  ctx.session.$authorize(addressesWithValidRoles, [])

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
