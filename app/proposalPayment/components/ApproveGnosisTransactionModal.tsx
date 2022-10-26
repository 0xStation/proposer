import { useState } from "react"
import { invalidateQuery } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import useGnosisSignatureToConfirmTransaction from "app/core/hooks/useGnosisSignatureToConfirmTransaction"
import useStore from "app/core/hooks/useStore"
import { ProposalPayment } from "app/proposalPayment/types"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"
import { useNetwork } from "wagmi"
import SwitchNetworkView from "app/core/components/SwitchNetworkView"

export const ApproveGnosisTransactionModal = ({
  isOpen,
  setIsOpen,
  payment,
}: {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  payment: ProposalPayment
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const activePayment = payment
  const { chain: activeChain } = useNetwork()

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
        {!activeChain || activeChain.id !== activePayment?.data?.token.chainId ? (
          <SwitchNetworkView
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            chainId={activePayment?.data?.token.chainId}
          />
        ) : (
          <ApprovePaymentTab />
        )}
      </div>
    </Modal>
  )
}

export default ApproveGnosisTransactionModal
