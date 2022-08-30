import { parseUnits } from "ethers/lib/utils"
import { useSendTransaction } from "wagmi"

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
