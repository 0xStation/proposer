import { utils } from "ethers"
import { TERMINAL, CONTRACTS } from "../utils/constants"
import endorsementTokenAbi from "../abi/EndorsementToken.json"
import endorsementGraphAbi from "../abi/EndorsementGraph.json"
import waitingRoomAbi from "../abi/WaitingRoom.json"
import identityAdminAbi from "../abi/IdentityTokenAdmin.json"
import contributorsAbi from "../abi/Contributors.json"
import stationIdAbi from "../abi/StationId.json"
import { useContractRead, useContractWrite } from "wagmi"

const endorseContractInterface = new utils.Interface(endorsementGraphAbi)
const endorsementTokenInterface = new utils.Interface(endorsementTokenAbi)
const waitingRoomInterface = new utils.Interface(waitingRoomAbi)
const identityAdminInterface = new utils.Interface(identityAdminAbi)
const contributorsInterface = new utils.Interface(contributorsAbi)
const stationIdInterface = new utils.Interface(stationIdAbi)

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

export const useContributorsRead = ({ methodName, contract }) => {
  const [{ data, error, loading }, read] = useContractRead(
    {
      addressOrName: contract,
      contractInterface: contributorsInterface,
    },
    methodName
  )
  return { data, error, loading, read }
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

export const useStationIdWrite = ({ methodName, contract }) => {
  const [{ data, error, loading }, write] = useContractWrite(
    {
      addressOrName: contract || "0x33e3a9610D7D0847A68109bA1B2D00089a784D21", // station's contract
      contractInterface: stationIdInterface,
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
