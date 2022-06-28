import db from "db"
import * as z from "zod"
import { useMutation } from "blitz"
import createCheck from "app/check/mutations/createCheck"

const ApproveProposal = z.object({
  signerAddress: z.string(),
  signature: z.string(),
  proposalId: z.string(),
  fundingAddress: z.string(),
  chainId: z.number(),
  recipientAddress: z.string(),
  tokenAddress: z.string(),
  tokenAmount: z.string(),
})

// todo -
// - error handling
export default async function approveProposal(input: z.infer<typeof ApproveProposal>) {
  console.log("the start of approving")
  // assuming we would want to approve all of the checks for a proposal?
  // we are not handling splits right now, so it doesnt reallly matter
  // but assuming we are handling splits and there are many checks for a proposal
  // this will cause the approver to approve all of the checks
  const checksToApprove = await db.check.findMany({
    where: {
      proposalId: input.proposalId,
    },
  })

  if (checksToApprove.length === 0) {
    const check = await createCheck({
      proposalId: input.proposalId,
      fundingAddress: input.fundingAddress,
      chainId: input.chainId,
      recipientAddress: input.recipientAddress,
      tokenAddress: input.tokenAddress,
      tokenAmount: input.tokenAmount,
    })

    checksToApprove.push(check)
  }

  // create all of the check approvals
  const approvals = await db.checkApproval.createMany({
    data: checksToApprove.map((check) => {
      return {
        checkId: check.id,
        signerAddress: input.signerAddress,
        data: {
          signature: input.signature,
        },
      }
    }),
  })

  // this is a number of the approvals, not sure it easily supports returning a list of the approvals since
  // createMany returns a count for some reason...
  // not sure that matters though
  return approvals
}
