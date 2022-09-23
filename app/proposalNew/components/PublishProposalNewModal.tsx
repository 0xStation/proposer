import { invalidateQuery, useMutation } from "blitz"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { genProposalNewDigest } from "app/signatures/proposalNew"
import useSignature from "app/core/hooks/useSignature"
import pinProposalNew from "../mutations/pinProposalNew"
import getProposalNewById from "../queries/getProposalNewById"

export const PublishProposalNewModal = ({ isOpen, setIsOpen, proposal }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { signMessage } = useSignature()
  const [pinProposalMutation] = useMutation(pinProposalNew, {
    onSuccess: (data) => {
      setIsLoading(false)
      invalidateQuery(getProposalNewById)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully published proposal",
      })
      setIsOpen(false)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <h3 className="text-2xl font-bold pt-6">Publish your proposal</h3>
      <p className="mt-4">
        Sign to prove your authorship and increase the verifiability of your proposal. Publishing
        your proposal will post your content to decentralized storage.
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
              // prompt author to sign proposal to prove they are the author of the content
              const message = genProposalNewDigest(proposal)
              const signature = await signMessage(message)

              if (!signature) {
                throw Error("Unsuccessful signature.")
              }

              await pinProposalMutation({
                proposalId: proposal?.id as string,
                signature: signature as string,
                signatureMessage: message,
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
          Publish
        </Button>
      </div>
    </Modal>
  )
}

export default PublishProposalNewModal
