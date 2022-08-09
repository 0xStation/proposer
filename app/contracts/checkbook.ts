import { useContractWrite, usePrepareContractWrite } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookFactoryAbi from "./abi/CheckbookFactory.json"
import checkbookAbi from "./abi/Checkbook.json"

export const useCreateCheckbookOnChain = ({ chainId }: { chainId: number }) => {
  const { data, write, isLoading, writeAsync, isSuccess } = useContractWrite({
    mode: "recklesslyUnprepared", // TODO: usePrepareContractWrite with args
    addressOrName: CONTRACTS[chainId]?.CHECKBOOK_FACTORY,
    contractInterface: checkbookFactoryAbi,
    functionName: "create",
  })
  return { data, write, writeAsync, isLoading, isSuccess }
}

export const useCashCheckOnChain = (address: string) => {
  const { data, write, isLoading, writeAsync, isSuccess } = useContractWrite({
    mode: "recklesslyUnprepared", // TODO: usePrepareContractWrite
    addressOrName: address,
    contractInterface: checkbookAbi,
    functionName: "execute",
  })
  return { data, write, writeAsync, isLoading, isSuccess }
}
