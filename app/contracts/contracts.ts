import { useContractWrite } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookFactoryAbi from "./abi/CheckbookFactory.json"

export const useCreateCheckbook = (chainId: number) => {
  const { writeAsync: createCheckbook } = useContractWrite(
    {
      addressOrName: CONTRACTS[chainId]?.CHECKBOOK_FACTORY,
      contractInterface: checkbookFactoryAbi,
    },
    "create(uint256,address[])" // have to specify arguments because two functions with name create but different arguments
  )
  return { createCheckbook }
}
