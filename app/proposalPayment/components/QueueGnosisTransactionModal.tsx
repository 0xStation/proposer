import { useMutation, invalidateQuery } from "@blitzjs/rpc"
import { useState } from "react"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignature from "app/core/hooks/useGnosisSignature"
import addPaymentAttempt from "app/proposalPayment/mutations/addPaymentAttempt"
import useStore from "app/core/hooks/useStore"
import { useNetwork } from "wagmi"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"
import SwitchNetworkView from "app/core/components/SwitchNetworkView"
import getProposalById from "app/proposal/queries/getProposalById"
import getGnosisTxStatus from "app/proposal/queries/getGnosisTxStatus"

enum Tab {
  QUEUE_PAYMENT = "QUEUE_PAYMENT",
  ATTACH_TRANSACTION = "ATTACH_TRANSACTION",
}

export const QueueGnosisTransactionModal = ({ isOpen, setIsOpen, milestone, payment }) => {
  const setToastState = useStore((state) => state.setToastState)
  const { chain: activeChain } = useNetwork()

  const { signMessage: signGnosis } = useGnosisSignature(payment)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [addPaymentAttemptMutation] = useMutation(addPaymentAttempt, {
    onSuccess: (data) => {},
    onError: (error) => {
      console.error(error)
    },
  })

  const QueuePaymentTab = () => {
    return (
      <>
        <h3 className="text-2xl font-bold mt-4">Queue transaction</h3>
        <p className="mt-2">
          Sign to queue this transaction on Gnosis. Afterwards, you and other signers will be able
          to view and execute this transaction on the Gnosis app.
        </p>
        <div className="mt-8 flex items-center justify-end">
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
                await addPaymentAttemptMutation({
                  paymentId: payment.id,
                  multisigTransaction: {
                    transactionId: response.txId,
                    nonce: response.detailedExecutionInfo.nonce,
                    safeTxHash: response.detailedExecutionInfo.safeTxHash,
                    address: response.safeAddress,
                  },
                })
                invalidateQuery(getMilestonesByProposal)
                invalidateQuery(getProposalById)
                invalidateQuery(getGnosisTxStatus)
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
        <p className="text-xs mt-2 text-right">
          You’ll be redirected to a transaction page to confirm.
        </p>
      </>
    )
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        {!activeChain || activeChain.id !== payment?.data?.token.chainId ? (
          <SwitchNetworkView
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            chainId={payment?.data?.token.chainId}
          />
        ) : (
          <QueuePaymentTab />
        )}
      </div>
    </Modal>
  )
}

export default QueueGnosisTransactionModal
