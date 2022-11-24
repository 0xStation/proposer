import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import Button from "app/core/components/sds/buttons/Button"
import SwitchNetworkView from "app/core/components/SwitchNetworkView"
import useStore from "app/core/hooks/useStore"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import truncateString from "app/core/utils/truncateString"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import getProposalById from "app/proposal/queries/getProposalById"
import { preparePaymentTransaction } from "app/transaction/payments"
import { useEffect, useState } from "react"
import { useNetwork, useSendTransaction, useWaitForTransaction } from "wagmi"

export const WalletDirectPayment = ({ milestone, payment, isLoading, setIsLoading, setIsOpen }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [txnHash, setTxnHash] = useState<string>()
  const [transactionPayload, setTransactionPayload] = useState<any>()

  const { chain: activeChain } = useNetwork()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  useEffect(() => {
    if (payment) {
      const payload = preparePaymentTransaction(
        payment?.recipientAddress,
        payment?.data?.token,
        payment?.amount
      )
      setTransactionPayload(payload)
    }
  }, [payment])

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as `0x${string}`,
    onSuccess: async (data) => {
      try {
        invalidateQuery(getProposalById)

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
    onError: async (data) => {
      setIsLoading(false)
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Payment execution failed.",
      })
      console.error(data)
    },
  })

  const [saveTransactionHashToPaymentsMutation] = useMutation(saveTransactionHashToPayments, {
    onSuccess: (_data) => {
      console.log("success", _data)
    },
    onError: (error: Error) => {
      console.error(error)
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
        proposalId: milestone.proposalId,
        milestoneId: milestone.id,
        transactionHash: transaction.hash,
      })

      // the `txnHash` state is required to enable the useWaitForTransaction hook in the parent page
      // useWaitForTransaction is a wagmi hook that waits for a given transaction to confirm on the blockchain
      // on successful processing of our transaction, we show a toast and update the check's status on UI
      setTxnHash(transaction.hash)
    } catch (e) {
      setIsLoading(false)
      console.error(e)
      let message = "Something went wrong."
      if (e.name == "ConnectorNotFoundError") {
        message = "Please reset wallet connection.\n(ConnectorNotFoundError)"
      } else if (e.message.includes("insufficient funds")) {
        // don't have enough ETH to pay
        message = "Insufficient wallet balance for payment."
      } else if (e.message.includes("ERC20: transfer amount exceeds balance")) {
        // don't have enough ERC20 to pay
        message = "Insufficient wallet balance for payment."
      }
      setToastState({
        isToastShowing: true,
        type: "error",
        message,
      })
      return false
    }
  }

  return (
    <>
      {!activeChain || activeChain.id !== payment?.data?.token.chainId ? (
        <SwitchNetworkView
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          chainId={payment?.data?.token.chainId}
        />
      ) : (
        <>
          <h3 className="text-2xl font-bold pt-6">
            Next, pay the Contributor for their contribution
          </h3>
          <table className="mt-8">
            <tr>
              <th className="w-36"></th>
              <th></th>
            </tr>
            <tbody>
              <tr className="h-12">
                <td className="text-concrete">Pay to</td>
                {/* TODO: ENS wrap this */}
                <td>{truncateString(payment?.recipientAddress)}</td>
              </tr>
              <tr className="h-12">
                <td className="text-concrete">Token</td>
                <td>{payment?.data?.token.symbol}</td>
              </tr>
              <tr className="h-12">
                <td className="text-concrete">Amount</td>
                <td>{formatCurrencyAmount(payment?.amount.toString())}</td>
              </tr>
            </tbody>
          </table>
          <Button
            className="mt-8"
            isLoading={isLoading}
            isDisabled={isLoading}
            onClick={() => initiatePayment()}
          >
            Pay
          </Button>
          <p className="text-xs mt-2">You’ll be redirected to a transaction page to confirm.</p>
        </>
      )}
    </>
  )
}
