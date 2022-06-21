import { utils } from "ethers"
import { useContractWrite, useContractRead, useToken } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookFactoryAbi from "./abi/CheckbookFactory.json"

const checkbookFactoryInterface = new utils.Interface(checkbookFactoryAbi)

// console.log(checkbookFactoryInterface)

export const useCreateCheckbook = () => {
  const { writeAsync: create } = useContractWrite(
    {
      addressOrName: CONTRACTS.CHECKBOOK_FACTORY,
      contractInterface: checkbookFactoryAbi,
    },
    "create(uint256,address[])" // have to specify arguments because two functions with name create but different arguments
  )
  return { create }
}
