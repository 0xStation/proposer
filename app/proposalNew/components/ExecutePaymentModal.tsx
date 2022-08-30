import { invalidateQuery, useMutation } from "blitz"
import Modal from "app/core/components/Modal"
import useStore from "app/core/hooks/useStore"
import truncateString from "app/core/utils/truncateString"
import { formatDate } from "app/core/utils/formatDate"
import Button, { ButtonType } from "app/core/components/sds/buttons/Button"
import { getNetworkName } from "app/core/utils/getNetworkName"
import { useNetwork, useSwitchNetwork, useWaitForTransaction } from "wagmi"
import { useEffect, useState } from "react"
import saveTransactionHashToPayments from "../mutations/saveTransactionToPayments"
import getProposalNewById from "../queries/getProposalNewById"
import { preparePaymentTransaction } from "app/transaction/payments"
import { useSendTransaction } from "wagmi"

export const ExecutePaymentModal = ({
  isOpen,
  setIsOpen,
  isLoading,
  setIsLoading,
  payment,
  proposalId,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const [txnHash, setTxnHash] = useState<string>()
  const [transactionPayload, setTransactionPayload] = useState<any>()
  const [saveTransactionHashToPaymentsMutation] = useMutation(saveTransactionHashToPayments, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
    },
  })

  const { chain: activeChain } = useNetwork()
  const { switchNetwork } = useSwitchNetwork()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  useEffect(() => {
    if (payment) {
      const payload = preparePaymentTransaction(
        payment?.recipientAddress,
        payment?.token,
        payment?.amount
      )
      setTransactionPayload(payload)
    }
  }, [payment])

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as string,
    onSuccess: async (data) => {
      try {
        invalidateQuery(getProposalNewById)

        setIsOpen(false)
        setToastState({
          isToastShowing: true,
          type: "success",
          message: "Payment execution succeeded.",
        })
        setIsLoading(false)
      } catch (e) {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Payment execution failed.",
        })
      }
    },
  })

  const initiatePayment = async () => {
    try {
      setIsLoading(true)

      const transaction = await sendTransactionAsync({
        recklesslySetUnpreparedRequest: {
          ...transactionPayload,
        },
      })

      // update payment as cashed in db
      await saveTransactionHashToPaymentsMutation({
        proposalId: proposalId,
        transactionHash: transaction.hash,
        paymentIds: [],
      })

      // the `txnHash` state is required to enable the useWaitForTransaction hook in the parent page
      // useWaitForTransaction is a wagmi hook that waits for a given transaction to confirm on the blockchain
      // on successful processing of our transaction, we show a toast and update the check's status on UI
      setTxnHash(transaction.hash)
    } catch (e) {
      setIsLoading(false)
      console.error(e)
      if (e.name == "ConnectorNotFoundError") {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Please reset wallet connection.\n(ConnectorNotFoundError)",
        })
      } else {
        setToastState({
          isToastShowing: true,
          type: "error",
          message: "Something went wrong.",
        })
      }
      return false
    }
  }

  return (
    <Modal open={isOpen} toggle={setIsOpen}>
      <div className="p-2">
        {activeChain && activeChain.id === payment?.token.chainId ? (
          <>
            <h3 className="text-2xl font-bold pt-6">Execute payment</h3>
            <div className="mt-8">
              <div className="flex justify-between items-center mt-2">
                <span className="text-small font-bold">Payment recipient</span>
                <span className="text-small">{truncateString(payment?.recipientAddress)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-small font-bold">Network</span>
                <span className="text-small">{getNetworkName(payment?.token.chainId)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-small font-bold">Token</span>
                <span className="text-small">{payment?.token.symbol}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-small font-bold">Amount</span>
                <span className="text-small">{payment?.amount}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-small font-bold">Payment date</span>
                <span className="text-small">{formatDate(new Date())}</span>
              </div>
            </div>
            <div className="mt-8">
              <Button className="mr-2" type={ButtonType.Secondary} onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                className="mb-8"
                isLoading={isLoading}
                isDisabled={isLoading}
                isSubmitType={true}
                onClick={() => initiatePayment()}
              >
                Pay
              </Button>
            </div>
          </>
        ) : (
          <div>
            <h3 className="text-2xl font-bold pt-6">Change network to approve</h3>
            <p className="mt-2">
              You are connected to the wrong network! Click below to switch networks.
            </p>
            <div className="mt-8">
              <button
                type="button"
                className="text-electric-violet border border-electric-violet mr-2 py-1 w-[98px] rounded hover:opacity-75"
                onClick={() => {
                  setIsOpen(false)
                  setIsLoading(false)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-electric-violet text-tunnel-black border border-electric-violet py-1 w-[98px] rounded hover:opacity-75"
                onClick={() => {
                  switchNetwork?.(payment.token.chainId)
                }}
              >
                Switch
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ExecutePaymentModal
