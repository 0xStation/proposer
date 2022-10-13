import { useMutation, useSession } from "blitz"
import { ProposalRoleType } from "@prisma/client"
import useSignature from "app/core/hooks/useSignature"
import { genProposalDigest } from "app/signatures/proposal"
import { getHash } from "app/signatures/utils"
import updateProposalMetadata from "app/proposal/mutations/updateProposalMetadata"

export const useConfirmAuthorship = ({
  onSuccess,
  onError,
}: {
  onSuccess: (data) => void
  onError: (error) => void
}) => {
  const { signMessage } = useSignature()
  const session = useSession({ suspense: false })
  const [updateProposalMetadataMutation] = useMutation(updateProposalMetadata)

  const confirmAuthorship = async ({ proposal }) => {
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

      const updatedProposal = await updateProposalMetadataMutation({
        proposalId: proposal?.id as string,
        authorSignature: signature as string,
        signatureMessage: message,
        proposalHash,
        contentTitle: proposal?.data?.content?.title,
        contentBody: proposal?.data?.content?.body,
        totalPayments: proposal?.data?.totalPayments,
        paymentTerms: proposal?.data?.paymentTerms,
      })

      if (updatedProposal) {
        onSuccess(updatedProposal)
      }
    } catch (err) {
      onError(err)
      console.error(err)
      return
    }
  }

  return { confirmAuthorship }
}
