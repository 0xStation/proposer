import { useState } from "react"
import { useMutation, invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignature from "app/core/hooks/useGnosisSignature"
import updatePayment from "app/proposalPayment/mutations/updatePayment"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"

export const QueueGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const activePayment = milestone.payments[0]

  const { signMessage: signGnosis } = useGnosisSignature(activePayment)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [updatePaymentMutation] = useMutation(updatePayment, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.error(error)
    },
  })
  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        <h3 className="text-2xl font-bold mt-4">Queue transaction</h3>
        <p className="mt-2">
          Sign to queue this transaction On Gnosis. Afterwards, you will be able to view this
          transaction on the Gnosis app.
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
                const response = await signGnosis()
                await updatePaymentMutation({
                  gnosisTxData: {
                    txId: response.txId,
                    safeAddress: response.safeAddress,
                  },
                  paymentId: activePayment.id,
                })
                invalidateQuery(getMilestonesByProposal)
                setIsLoading(false)
                setIsOpen(false)
              } catch (e) {
                console.error(e)
              }
            }}
          >
            Sign
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default QueueGnosisTransactionModal
