import { parseUnits } from "ethers/lib/utils"
import { usePrepareSendTransaction, useSendTransaction } from "wagmi"

export const useSendEther = () =>
  // chainId: number, address: string, value: string
  {
    const { sendTransactionAsync: sendEtherAsync, isLoading } = useSendTransaction({
      mode: "recklesslyUnprepared", // TODO: usePrepareContractWrite with args
      // request: {
      //   chainId: chainId,
      //   to: address,
      //   value: parseUnits(value, 18),
      // },
    })
    return { sendEtherAsync, isLoading }
  }

export const useTransactionPayload = (payload) => {
  const { config } = usePrepareSendTransaction({
    request: {
      chainId: payload?.chainId,
      to: payload?.to,
      value: payload?.value,
      data: payload?.data,
    },
    enabled: !!payload,
  })
  const { sendTransactionAsync } = useSendTransaction(config)
  return { sendTransactionAsync }
}
