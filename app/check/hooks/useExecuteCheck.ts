import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import { checkbookTransaction } from "app/checkbook/transaction"
import useStore from "app/core/hooks/useStore"
import { useState } from "react"
import { useSendTransaction, useWaitForTransaction } from "wagmi"
import addTransactionHashToChecks from "../mutations/addTransactionHashToChecks"
import getChecks from "../queries/getChecks"
import { ADD_SIGNER_AND_THRESHOLD_CHANGE, THRESHOLD_CHANGE } from "app/core/utils/constants"
import getSafeMetadata from "../../account/queries/getSafeMetadata"
import { REPLACE_SIGNER } from "../../core/utils/constants"

export const useExecuteCheck = ({ check, setIsLoading }) => {
  const setToastState = useStore((state) => state.setToastState)
  const [txnHash, setTxnHash] = useState<string>()

  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })

  const [addTransactionHashToChecksMutation] = useMutation(addTransactionHashToChecks)

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as `0x${string}`,
    onSuccess: async (data) => {
      invalidateQuery(getChecks)
      if (
        check.data.title === THRESHOLD_CHANGE ||
        check.data.title === ADD_SIGNER_AND_THRESHOLD_CHANGE ||
        check.data.title === REPLACE_SIGNER
      ) {
        invalidateQuery(getSafeMetadata)
      }
      setToastState({
        isToastShowing: true,
        type: "success",
        message: "Payment execution succeeded.",
      })
    },
    onError: async (data) => {
      setToastState({
        isToastShowing: true,
        type: "error",
        message: "Payment execution failed.",
      })
      console.error(data)
    },
    onSettled: () => {
      setIsLoading(false)
    },
  })

  const executeCheck = async () => {
    try {
      setIsLoading(true)

      const transactionPayload = checkbookTransaction({
        checkTitle: check.data.title,
        chainId: check.chainId,
        safe: check.address,
        nonce: check.nonce,
        to: check.data.txn.to,
        value: check.data.txn.value,
        data: check.data.txn.data,
        proofs: check?.proofs,
      })

      const transaction = await sendTransactionAsync({
        recklesslySetUnpreparedRequest: {
          ...transactionPayload,
        },
      })

      // update payment as cashed in db
      await addTransactionHashToChecksMutation({
        txnHash: transaction.hash,
        checkIds: [check.id],
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

  return { executeCheck }
}