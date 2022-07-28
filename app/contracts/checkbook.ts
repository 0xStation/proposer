import { useContractWrite } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookFactoryAbi from "./abi/CheckbookFactory.json"
import checkbookAbi from "./abi/Checkbook.json"

export const useCreateCheckbookOnChain = (chainId: number) => {
  const { writeAsync: createCheckbook } = useContractWrite(
    {
      addressOrName: CONTRACTS[chainId]?.CHECKBOOK_FACTORY,
      contractInterface: checkbookFactoryAbi,
    },
    "create"
  )
  return { createCheckbook }
}

export const useCashCheckOnChain = (address: string) => {
  const { writeAsync: cashCheck } = useContractWrite(
    {
      addressOrName: address,
      contractInterface: checkbookAbi,
    },
    "execute"
  )
  return { cashCheck }
}
