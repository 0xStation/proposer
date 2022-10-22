import { useSession } from "@blitzjs/auth"
import { useMutation } from "@blitzjs/rpc"
import { ProposalRoleType } from "@prisma/client"
import useSignature from "app/core/hooks/useSignature"
import { genProposalDigest } from "app/signatures/proposal"
import { getHash } from "app/signatures/utils"
import sendProposal from "app/proposal/mutations/sendProposal"
import { Proposal } from "app/proposal/types"

export const useConfirmAuthorship = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data) => void
  onError: (error) => void
}) => {
  const { signMessage } = useSignature()
  const session = useSession({ suspense: false })
  const [sendProposalMutation] = useMutation(sendProposal)

  const confirmAuthorship = async ({
    proposal,
    representingRoles = [],
  }: {
    proposal: Proposal
    representingRoles: { roleId: string; complete: boolean }[] | undefined
  }) => {
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

      const sendProposalSuccess = await sendProposalMutation({
        proposalId: proposal?.id as string,
        authorAddress: session?.siwe?.address as string,
        authorSignature: signature as string,
        signatureMessage: message,
        proposalHash,
        representingRoles,
      })

      if (sendProposalSuccess) {
        // redirect to the proposal's view page
        onSuccess(proposal)
      }
    } catch (err) {
      onError(err)
      console.error(err)
      return
    }
  }

  return { confirmAuthorship }
}
