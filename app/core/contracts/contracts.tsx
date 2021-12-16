import { useContractFunction, useEthers } from "@usedapp/core"
import { utils } from "ethers"
import { Contract } from "@ethersproject/contracts"
import timeWeightedReputationTokenIssuerAbi from "../abi/TimeWeightedReputationTokenIssuer.json"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"

const endorsementGraphAddress = "0xa3395B5FEfca8bb39032A9604C0337fF7e847323"
const tokenAddress = "0xbe26Ee78Ba287E5c6a862258DB9c5e7fe7538f56"
export const useEndorseContractMethod = (methodName: string) => {
  const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
  const contract = new Contract(endorsementGraphAddress, endorseContractInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}

export const useIncreaseAllowanceMethod = (methodName: string) => {
  const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
  const contract = new Contract(tokenAddress, endorsementTokenInterface)
  const { state, send } = useContractFunction(contract, methodName)
  return { state, send }
}
