import { useSession } from "@blitzjs/auth"
import { useMutation } from "@blitzjs/rpc"
import sendProposal from "app/proposal/mutations/sendProposal"
import { Proposal } from "app/proposal/types"
import { useSignProposal } from "app/core/hooks/useSignProposal"

export const useConfirmAuthorship = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data) => void
  onError: (error) => void
}) => {
  const session = useSession({ suspense: false })
  const [sendProposalMutation] = useMutation(sendProposal)
  const { signProposal } = useSignProposal()

  const confirmAuthorship = async ({
    proposal,
    representingRoles = [],
  }: {
    proposal: Proposal
    representingRoles: { roleId: string; complete: boolean }[] | undefined
  }) => {
    try {
      const { message, signature, proposalHash } = await signProposal({ proposal })

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
