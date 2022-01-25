import { utils } from "ethers"
import { TERMINAL } from "../utils/constants"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"
import { useContractRead, useContractWrite, useToken } from "wagmi"

const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)

// call write functions from the endorsment graph
export const useEndorsementGraphRead = ({ methodName }) => {
  const [{ data, error, loading }, read] = useContractRead(
    {
      addressOrName: TERMINAL.GRAPH_ADDRESS,
      contractInterface: endorseContractInterface,
    },
    methodName
  )
  return { data, error, loading, read }
}

export const useEndorsementGraphWrite = ({ methodName }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: TERMINAL.GRAPH_ADDRESS,
      contractInterface: endorseContractInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useEndorsementTokenRead = ({ methodName }) => {
  const [{ data, error, loading }, read] = useContractRead(
    {
      addressOrName: TERMINAL.TOKEN_ADDRESS,
      contractInterface: endorsementTokenInterface,
    },
    methodName
  )
  return { data, error, loading, read }
}

export const useEndorsementTokenWrite = ({ methodName }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: TERMINAL.TOKEN_ADDRESS,
      contractInterface: endorsementTokenInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useDecimals = () => {
  const {
    data: decimals,
    error: decimalsError,
    loading: decimalsLoading,
  } = useEndorsementTokenRead({ methodName: "decimals" })
  return { decimals: decimals as unknown as number, decimalsError, decimalsLoading }
}
