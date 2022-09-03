import { useContractRead, useContractReads, chainId } from "wagmi"
import { CONTRACTS } from "app/core/utils/constants"
import checkbookAbi from "./abi/Checkbook.json"
import safeAbi from "./abi/GnosisSafe.json"
import { AddressType } from "app/types"
import { number } from "zod"

type Multisig = {
  chainId: number
  address: string
  addressType: AddressType
}

export const useFetchMultisigParametersBatch = (multisigs: Multisig[]) => {
  const multisigParameters = {
    [AddressType.SAFE]: {
      quorum: "getThreshold",
      signers: "getOwners",
      contractInterface: safeAbi,
    },
  }

  const safes = multisigs.filter((multisig) => multisig.addressType === AddressType.SAFE)

  let calls: any = []
  safes.forEach((multisig) => {
    const args = {
      chainId: multisig.chainId,
      addressOrName: multisig.address,
      contractInterface: multisigParameters[multisig.addressType].contractInterface,
    }
    calls.push(
      {
        ...args,
        functionName: multisigParameters[multisig.addressType].quorum,
      },
      {
        ...args,
        functionName: multisigParameters[multisig.addressType].signers,
      }
    )
  })

  const { data, isError, isLoading } = useContractReads({
    contracts: calls,
  })

  // parse data to populate quorum and signers
  let results = {}
  safes.forEach((safe, i) => {
    results[safe.address] = {
      quorum: data?.[2 * i],
      signers: data?.[2 * i + 1],
    }
  })

  return { multisigs: safes, isError, isLoading }
}
