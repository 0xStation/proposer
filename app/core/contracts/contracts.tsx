import { useContractFunction, useTokenBalance, useContractCall } from "@usedapp/core"
import { utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import { TERMINAL } from "../utils/constants"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"

// TODO: Remove this const and call endorsementToken contract's public view function "decimals"
export const NUMBER_OF_DECIMALS = 6

// call write functions from the endorsment graph
export const useEndorsementGraphMethod = (methodName: string) => {
  const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
  const contract = new Contract(TERMINAL.GRAPH_ADDRESS, endorseContractInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}

// call write functions from the endorsment token
export const useEndorsementTokenMethod = (methodName: string) => {
  const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
  const contract = new Contract(TERMINAL.TOKEN_ADDRESS, endorsementTokenInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}

// read user's point (reputation) balance
export const useEndorsementTokenBalance = (address) => {
  const balanceOf: any = useTokenBalance(TERMINAL.TOKEN_ADDRESS, address)
  return balanceOf && parseFloat(utils.formatUnits(balanceOf, NUMBER_OF_DECIMALS))
}

// read allowed amount of user's allowance that station can move on their behalf
export const useAllowance = (address) => {
  const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
  const [allowance]: any =
    useContractCall({
      abi: endorsementTokenInterface,
      address: TERMINAL.TOKEN_ADDRESS,
      method: "allowance", // Method to be called
      args: [address, TERMINAL.GRAPH_ADDRESS], // Method arguments - address to be checked for balance
    }) ?? []

  return allowance && parseFloat(utils.formatUnits(allowance, NUMBER_OF_DECIMALS))
}
