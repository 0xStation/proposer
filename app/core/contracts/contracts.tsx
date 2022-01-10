import { useContractFunction, useTokenBalance } from "@usedapp/core"
import { utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import { TERMINAL } from "../utils/constants"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"

export const useEndorseContractMethod = (methodName: string) => {
  const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
  const contract = new Contract(TERMINAL.GRAPH_ADDRESS, endorseContractInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}

export const useIncreaseAllowanceMethod = (methodName: string) => {
  const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
  const contract = new Contract(TERMINAL.TOKEN_ADDRESS, endorsementTokenInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}

export const useEndorsementTokenBalance = (address) => {
  const balanceOf: any = useTokenBalance(TERMINAL.TOKEN_ADDRESS, address)
  return balanceOf && utils.formatUnits(balanceOf, 3)
}
