import { useState } from "react"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignature from "app/core/hooks/useGnosisSignature"

export const QueueGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const activePayment = milestone.payments[0]

  const { signMessage: signGnosis } = useGnosisSignature(activePayment)
  const [isLoading, setIsLoading] = useState<boolean>(false)
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
              const response = await signGnosis()
              setIsLoading(false)
              setIsOpen(false)
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
