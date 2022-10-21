import { useState } from "react"
import { useMutation, invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignatureToConfirmTransaction from "app/core/hooks/useGnosisSignatureToConfirmTransaction"
import updatePayment from "app/proposalPayment/mutations/updatePayment"
import useStore from "app/core/hooks/useStore"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"

export const ApproveGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const setToastState = useStore((state) => state.setToastState)
  const activePayment = milestone.payments[0]

  const { signMessage: signGnosis } = useGnosisSignatureToConfirmTransaction(activePayment)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [updatePaymentMutation] = useMutation(updatePayment, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.error(error)
    },
  })

  const ApprovePaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Approve transaction</h3>
        <p className="mt-2">Sign to approve this transaction.</p>
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
                const response = await signGnosis()
                if (!response) {
                  setIsLoading(false)
                  throw new Error("Signature Failed")
                }
                const s = await updatePaymentMutation({
                  multisigTransaction: {
                    transactionId: response.txId,
                    safeTxHash: response.detailedExecutionInfo.safeTxHash,
                    address: response.safeAddress,
                  },
                  paymentId: activePayment.id,
                })
                console.log(s)
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
        <p className="text-xs mt-2">You’ll be redirected to a transaction page to confirm.</p>
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
