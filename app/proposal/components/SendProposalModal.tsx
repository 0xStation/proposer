import { useSession } from "@blitzjs/auth"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { genProposalDigest } from "app/signatures/proposal"
import useSignature from "app/core/hooks/useSignature"
import getProposalById from "../queries/getProposalById"
import { ProposalRoleType } from "@prisma/client"
import { getHash } from "app/signatures/utils"
import sendProposal from "../mutations/sendProposal"
import getRolesByProposalId from "app/proposalRole/queries/getRolesByProposalId"

export const SendProposallModal = ({ isOpen, setIsOpen, proposal }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const session = useSession({ suspense: false })
  const { signMessage } = useSignature()

  const [sendProposalMutation] = useMutation(sendProposal, {
    onSuccess: (data) => {
      setIsLoading(false)
      invalidateQuery(getProposalById)
      invalidateQuery(getRolesByProposalId)
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
        Send this proposal to the workspace of all mentioned parties. Sign with your wallet to
        complete this action.
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

              await sendProposalMutation({
                proposalId: proposal?.id as string,
                authorAddress: session?.siwe?.address as string,
                authorSignature: signature as string,
                signatureMessage: message,
                proposalHash: proposalHash,
                representingRoles: [],
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

export default SendProposallModal
