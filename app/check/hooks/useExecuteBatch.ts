import { useState } from "react"
import { invalidateQuery, useMutation } from "@blitzjs/rpc"
import useStore from "app/core/hooks/useStore"
import { useSendTransaction, useWaitForTransaction } from "wagmi"
import getChecks from "../queries/getChecks"
import addTransactionHashToChecks from "../mutations/addTransactionHashToChecks"
import { PreparedTransaction } from "app/transaction/types"

export const useExecuteBatch = () => {
  const setToastState = useStore((state) => state.setToastState)
  const [txnHash, setTxnHash] = useState<string>()
  const { sendTransactionAsync } = useSendTransaction({ mode: "recklesslyUnprepared" })
  const [addTransactionHashToChecksMutation] = useMutation(addTransactionHashToChecks)

  useWaitForTransaction({
    confirmations: 1,
    hash: txnHash as `0x${string}`,
    onSuccess: async (data) => {
      invalidateQuery(getChecks)
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
      // setIsLoading(false)
    },
  })

  const executeCheck = async (
    batchTxn: PreparedTransaction & { chainId: number },
    checkIds: string[]
  ) => {
    try {
      // setIsLoading(true)

      const transaction = await sendTransactionAsync({
        recklesslySetUnpreparedRequest: {
          chainId: batchTxn.chainId,
          to: batchTxn.target,
          value: batchTxn.value,
          data: batchTxn.data,
        },
      })

      await addTransactionHashToChecksMutation({
        txnHash: transaction.hash,
        checkIds,
      })

      // the `txnHash` state is required to enable the useWaitForTransaction hook in the parent page
      // useWaitForTransaction is a wagmi hook that waits for a given transaction to confirm on the blockchain
      // on successful processing of our transaction, we show a toast and update the check's status on UI
      setTxnHash(transaction.hash)
    } catch (e) {
      // setIsLoading(false)
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
