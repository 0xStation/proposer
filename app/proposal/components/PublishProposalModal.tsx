import { invalidateQuery, useMutation, useSession } from "blitz"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { genProposalDigest } from "app/signatures/proposal"
import useSignature from "app/core/hooks/useSignature"
import getProposalById from "../queries/getProposalById"
import updateProposalMetadata from "../mutations/updateProposalMetadata"
import { ProposalRoleType } from "@prisma/client"
import { getHash } from "app/signatures/utils"

export const PublishProposalModal = ({ isOpen, setIsOpen, proposal }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const session = useSession({ suspense: false })
  const { signMessage } = useSignature()
  const [updateProposalMetadataMutation] = useMutation(updateProposalMetadata, {
    onSuccess: (data) => {
      setIsLoading(false)
      invalidateQuery(getProposalById)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully published proposal.",
      })
      setIsOpen(false)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <h3 className="text-2xl font-bold pt-6">Send your proposal</h3>
      <p className="mt-4">
        Sign to prove your authorship and increase the verifiability of your proposal. Upon
        confirmation, the proposal will be sent to all parties included in the proposal.
      </p>

      <div className="mt-8 flex items-center">
        <Button
          className="mr-2"
          type={ButtonType.Secondary}
          onClick={() => {
            setIsLoading(false)
            setIsOpen(false)
          }}
        >
          Cancel
        </Button>
        <Button
          isSubmitType={true}
          isLoading={isLoading}
          isDisabled={isLoading}
          onClick={async () => {
            setIsLoading(true)
            try {
              const authorRole = proposal?.roles?.find(
                (role) => role.type === ProposalRoleType.AUTHOR
              )
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

              await updateProposalMetadataMutation({
                proposalId: proposal?.id as string,
                authorSignature: signature as string,
                signatureMessage: message,
                proposalHash: proposalHash,
                contentTitle: proposal?.data?.content?.title,
                contentBody: proposal?.data?.content?.body,
                totalPayments: proposal?.data?.totalPayments,
                paymentTerms: proposal?.data?.paymentTerms,
              })
            } catch (err) {
              setIsLoading(false)
              console.error(err)
              setToastState({
                isToastShowing: true,
                type: "error",
                message: err.message,
              })
              return
            }
          }}
        >
          Send
        </Button>
      </div>
    </Modal>
  )
}

export default PublishProposalModal
