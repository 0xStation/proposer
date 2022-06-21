import { utils } from "ethers"
import { useContractWrite } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookFactoryAbi from "./abi/CheckbookFactory.json"

const checkbookFactoryInterface = new utils.Interface(checkbookFactoryAbi)

// console.log(checkbookFactoryInterface)

export const useCreateCheckbook = (chainId: number) => {
  if (!!chainId && chainId != 4 && chainId != 1337) {
    console.error("Invalid chain selected. Please select Rinkeby or Localhost")
  }
  const address = CONTRACTS[chainId]?.CHECKBOOK_FACTORY
  const { writeAsync: create } = useContractWrite(
    {
      addressOrName: address,
      contractInterface: checkbookFactoryAbi,
    },
    "create(uint256,address[])" // have to specify arguments because two functions with name create but different arguments
  )
  return { create }
}