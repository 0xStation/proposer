import { Routes } from "@blitzjs/next"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useStore from "app/core/hooks/useStore"
import { useRouter } from "next/router"
import { useState } from "react"
import safeDeleteProposal from "../mutations/safeDeleteProposal"
import getProposalsByAddress from "../queries/getProposalsByAddress"

export const DeleteProposalModal = ({
  isOpen,
  setIsOpen,
  proposalId,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  proposalId: string
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const activeUser = useStore((state) => state.activeUser)
  const setToastState = useStore((state) => state.setToastState)
  const router = useRouter()

  const [safeDeleteProposalMutation] = useMutation(safeDeleteProposal, {
    onSuccess: (_data) => {
      console.log("proposal deleted: ", _data)
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Successfully deleted the proposal.",
      })
      invalidateQuery(getProposalsByAddress)
      router.push(Routes.WorkspaceHome({ accountAddress: activeUser?.address as string }))
    },
    onError: (error: Error) => {
      console.error(error)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Failed to delete the proposal.",
      })
    },
  })

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="py-8 px-4">
        <h3 className="text-2xl font-bold">Are you sure you want to delete the proposal?</h3>
        <p className="mt-4">You won’t be able to undo this action.</p>
        <div className="mt-12 flex items-center justify-end">
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
            isDisabled={false}
            onClick={async () => {
              setIsLoading(true)
              try {
                await safeDeleteProposalMutation({ proposalId })
                setIsOpen(false)
              } catch (e) {
                console.error(e)
              }
              setIsLoading(false)
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default DeleteProposalModal
