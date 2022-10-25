import { useState } from "react"
import { invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignatureToConfirmTransaction from "app/core/hooks/useGnosisSignatureToConfirmTransaction"
import useStore from "app/core/hooks/useStore"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"

export const ApproveGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const setToastState = useStore((state) => state.setToastState)
  const activePayment = milestone.payments[0]

  const { signMessage: signGnosis } = useGnosisSignatureToConfirmTransaction(activePayment)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const ApprovePaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Approve transaction</h3>
        <p className="mt-2">
          Signing this message marks your approval within gnosis. This will not execute the
          transaction.
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
            isDisabled={false}
            onClick={async () => {
              setIsLoading(true)
              try {
                await signGnosis()
                invalidateQuery(getMilestonesByProposal)
                setIsLoading(false)
                setIsOpen(false)
              } catch (e) {
                setToastState({
                  isToastShowing: true,
                  type: "error",
                  message: "Signature failed.",
                })
                console.error(e)
              }
            }}
          >
            Sign
          </Button>
        </div>
      </>
    )
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <ApprovePaymentTab />
      </div>
    </Modal>
  )
}

export default ApproveGnosisTransactionModal
