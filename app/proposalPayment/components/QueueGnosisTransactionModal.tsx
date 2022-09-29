import { useState, useEffect } from "react"
import { useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import createGnosisSignature from "app/proposalPayment/mutations/createGnosisTransaction"
import useStore from "app/core/hooks/useStore"
import { useSignMessage } from "wagmi"

export const QueueGnosisTransactionModal = ({ isOpen, setIsOpen, milestone }) => {
  const [txHash, setTxHash] = useState<string>("")
  const activeUser = useStore((state) => state.activeUser)
  const [createGnosisSignatureMutation] = useMutation(createGnosisSignature, {
    onSuccess: (data) => {
      setTxHash(data)
    },
    onError: (error) => {
      console.log(error)
    },
  })

  useEffect(() => {
    if (!txHash) {
      if (!activeUser) {
        // todo: throw toast
        return
      }

      createGnosisSignatureMutation({
        senderAddress: activeUser?.address,
        sendTo: activePayment.recipientAddress,
        sendAmount: activePayment.amount,
        safeAddress: activePayment.senderAddress,
        chainId: activePayment.data.token.chainId,
      })
    }
  }, [txHash, activeUser])

  const {
    data: signature,
    isLoading: isSignatureLoading,
    signMessage,
  } = useSignMessage({
    message: txHash,
  })

  useEffect(() => {
    if (signature) {
      if (!activeUser) {
        // todo: throw toast
        return
      }
      createGnosisSignatureMutation({
        senderAddress: activeUser?.address,
        sendTo: activePayment.recipientAddress,
        sendAmount: activePayment.amount,
        safeAddress: activePayment.senderAddress,
        chainId: activePayment.data.token.chainId,
        txHash: txHash,
        signature: signature,
      })
    }
  }, [signature, activeUser])

  const activePayment = milestone.payments[0]

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
            isLoading={isSignatureLoading}
            isDisabled={!txHash}
            onClick={() => {
              signMessage()
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
