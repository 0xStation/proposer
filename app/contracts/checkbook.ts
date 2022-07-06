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
    "create(uint256,address[])" // have to specify arguments because two functions with name create but different arguments
  )
  return { createCheckbook }
}

export const useCashCheckOnChain = (address: string) => {
  const { writeAsync: cashCheck } = useContractWrite(
    {
      addressOrName: address,
      contractInterface: checkbookAbi,
    },
    "withdraw(address,address,uint256,uint256,uint256,bytes[])" // have to specify arguments because two functions with name create but different arguments
    // recipient, token, amount, deadline, nonce, signatures
  )
  return { cashCheck }
}
