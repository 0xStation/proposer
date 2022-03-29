import { utils } from "ethers"
import { TERMINAL, CONTRACTS } from "../utils/constants"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"
import waitingRoomAbi from "../abi/WaitingRoom.json"
import identityAdminAbi from "../abi/IdentityTokenAdmin.json"
import { useContractRead, useContractWrite, useToken } from "wagmi"

const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
const waitingRoomInterface = new utils.Interface(waitingRoomAbi)
const identityAdminInterface = new utils.Interface(identityAdminAbi)

// call write functions from the endorsment graph
export const useEndorsementGraphRead = ({ methodName, contract }) => {
  const [{ data, error, loading }, read] = useContractRead(
    {
      // addressOrName: TERMINAL.GRAPH_ADDRESS,
      addressOrName: contract || TERMINAL.GRAPH_ADDRESS,
      contractInterface: endorseContractInterface,
    },
    methodName
  )
  return { data, error, loading, read }
}

export const useEndorsementGraphWrite = ({ methodName, contract }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      // addressOrName: TERMINAL.GRAPH_ADDRESS,
      addressOrName: contract || TERMINAL.GRAPH_ADDRESS,
      contractInterface: endorseContractInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useWaitingRoomWrite = ({ methodName }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: CONTRACTS.WAITING_ROOM,
      contractInterface: waitingRoomInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useIdentityAdminWrite = ({ methodName }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: CONTRACTS.IDENTITY_ADMIN,
      contractInterface: identityAdminInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useEndorsementTokenRead = ({ methodName, contract }) => {
  const [{ data, error, loading }, read] = useContractRead(
    {
      // addressOrName: TERMINAL.TOKEN_ADDRESS,
      addressOrName: contract || TERMINAL.TOKEN_ADDRESS,
      contractInterface: endorsementTokenInterface,
    },
    methodName
  )
  return { data, error, loading, read }
}

export const useEndorsementTokenWrite = ({ methodName, contract }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      // addressOrName: TERMINAL.TOKEN_ADDRESS,
      addressOrName: contract || TERMINAL.TOKEN_ADDRESS,
      contractInterface: endorsementTokenInterface,
    },
    methodName
  )
  return { data, error, loading, write }
}

export const useDecimals = (contract) => {
  const {
    data: decimals,
    error: decimalsError,
    loading: decimalsLoading,
  } = useEndorsementTokenRead({ methodName: "decimals", contract })
  return { decimals: decimals as unknown as number, decimalsError, decimalsLoading }
}
