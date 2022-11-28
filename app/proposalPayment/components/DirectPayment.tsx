import { invalidateQuery, invoke, useMutation } from "@blitzjs/rpc"
import { AddressType } from "@prisma/client"
import Button from "app/core/components/sds/buttons/Button"
import SwitchNetworkView from "app/core/components/SwitchNetworkView"
import TextLink from "app/core/components/TextLink"
import { useSafeTxStatus } from "app/core/hooks/useSafeTxStatus"
import useStore from "app/core/hooks/useStore"
import LinkArrow from "app/core/icons/LinkArrow"
import { formatCurrencyAmount } from "app/core/utils/formatCurrencyAmount"
import { getTransactionLink } from "app/core/utils/getTransactionLink"
import { getNetworkExplorer, getNetworkName } from "app/core/utils/networkInfo"
import truncateString from "app/core/utils/truncateString"
import saveTransactionHashToPayments from "app/proposal/mutations/saveTransactionToPayments"
import getProposalById from "app/proposal/queries/getProposalById"
import getMilestonesByProposal from "app/proposalMilestone/queries/getMilestonesByProposal"
import { preparePaymentTransaction, prepareSafeTransaction } from "app/transaction/payments"
import { useEffect, useState } from "react"
import { useNetwork, useSendTransaction, useWaitForTransaction } from "wagmi"

export const DirectPayment = ({
  proposal,
  milestone,
  payment,
  isLoading,
  setIsLoading,
  setIsOpen,
  setTabAttachTransaction,
}) => {
  const setToastState = useStore((state) => state.setToastState)
  const [txnHash, setTxnHash] = useState<string>()
  const [transactionPayload, setTransactionPayload] = useState<any>()

  const { chain: activeChain } = useNetwork()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  const {
    confirmations,
    isNonceBlocked,
    isLoading: isSafeTxStatusLoading,
  } = useSafeTxStatus(proposal, milestone, payment)

  useEffect(() => {
    if (payment) {
      const transferPayload = preparePaymentTransaction(
        payment?.recipientAddress,
        payment?.data?.token,
        payment?.amount
      )
      if (payment.data.multisigTransaction?.type === AddressType.SAFE) {
        // payment is to be paid by Safe
        const transactionData = prepareSafeTransaction(transferPayload, confirmations)
        setTransactionPayload({
          chainId: transferPayload.chainId,
          to: payment.data.multisigTransaction.address,
          value: 0,
          data: transactionData,
        })
      } else {
        // payment to be paid by wallet
        setTransactionPayload(transferPayload)
      }
    }
  }, [payment])

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as `0x${string}`,
    onSuccess: async (data) => {
      try {
        invalidateQuery(getProposalById)
        invalidateQuery(getMilestonesByProposal)

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
      } else if (e.message.includes("GS013")) {
        // Safe transaction failed, blame on insufficient funds for now (one potential cause)
        message = "Insufficient Safe balance for payment."
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
          <h3 className="text-2xl font-bold pt-6">Pay the Contributor for their contribution</h3>
          <table className="mt-8">
            <tr>
              <th className="w-36"></th>
              <th></th>
            </tr>
            <tbody>
              <tr className="h-8">
                <td className="text-concrete">From</td>
                <td>{truncateString(payment?.senderAddress, 5)}</td>
              </tr>
              <tr className="h-8">
                <td className="text-concrete">To</td>
                <td>{truncateString(payment?.recipientAddress, 5)}</td>
              </tr>
              <tr className="h-8">
                <td className="text-concrete">Network</td>
                <td>{getNetworkName(payment?.data?.token.chainId)}</td>
              </tr>
              <tr className="h-8">
                <td className="text-concrete">Token</td>
                <td>{payment?.data?.token.symbol}</td>
              </tr>
              <tr className="h-8">
                <td className="text-concrete">Amount</td>
                <td>{formatCurrencyAmount(payment?.amount.toString())}</td>
              </tr>
            </tbody>
          </table>
          <div className="text-right">
            <Button
              className="mt-8 mb-2"
              isLoading={
                isLoading || (!!payment?.data?.multisigTransaction && isSafeTxStatusLoading)
              }
              isDisabled={
                !transactionPayload ||
                isLoading ||
                (!!payment?.data?.multisigTransaction && (isSafeTxStatusLoading || isNonceBlocked))
              }
              onClick={() => initiatePayment()}
            >
              Pay
            </Button>
            {!txnHash ? (
              <>
                <p className="text-xs">You’ll be redirected to a transaction page to confirm.</p>
                <p className="text-xs">
                  Already paid?{" "}
                  <button onClick={setTabAttachTransaction}>
                    <span className="text-electric-violet">Paste a transaction link</span>
                  </button>
                  .
                </p>
              </>
            ) : (
              <p className="text-xs">
                Executing the transaction.{" "}
                <TextLink url={getTransactionLink(payment.data.token.chainId, txnHash)}>
                  View on Explorer
                </TextLink>{" "}
              </p>
            )}
          </div>
        </>
      )}
    </>
  )
}
