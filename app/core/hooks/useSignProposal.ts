import { useSession } from "@blitzjs/auth"
import { ProposalRoleType } from "@prisma/client"
import useSignature from "app/core/hooks/useSignature"
import { genProposalDigest } from "app/signatures/proposal"
import { getHash } from "app/signatures/utils"
import { Proposal } from "app/proposal/types"

export const useSignProposal = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data) => void
  onError?: (error) => void
} = {}) => {
  const { signMessage } = useSignature()
  const session = useSession({ suspense: false })

  const signProposal = async ({
    proposal,
  }: {
    proposal: Proposal
  }): Promise<{ message: any; signature: string; proposalHash: string }> => {
    try {
      const authorRole = proposal?.roles?.find((role) => role.type === ProposalRoleType.AUTHOR)

      // if user disconnects and logs in as another user, we need to check if they are the author
      if (authorRole?.address !== session?.siwe?.address) {
        throw Error("Current address doesn't match author's address.")
      }
      // prompt author to sign proposal to prove they are the author of the content
      const message = genProposalDigest(proposal)
      const signature = await signMessage(message)

      if (!signature) {
        throw Error("Unsuccessful signature.")
      }
      const { domain, types, value } = message
      const proposalHash = getHash(domain, types, value)

      if (onSuccess) {
        // redirect to the proposal's view page
        onSuccess(proposalHash)
      }
      return {
        message,
        signature,
        proposalHash,
      }
    } catch (err) {
      if (onError) {
        onError(err)
      }
      console.error(err)
      return { message: {}, signature: "", proposalHash: "" }
    }
  }

  return { signProposal }
}
