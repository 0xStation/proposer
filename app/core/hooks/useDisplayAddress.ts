import { useEnsName } from "wagmi"
import truncateString from "../utils/truncateString"
import { isAddress } from "@ethersproject/address"
import { isEns } from "../utils/isEns"

const useDisplayAddress = (addressOrEnsName) => {
  const isInputAddress = isAddress(addressOrEnsName)
  const isInputEns = isEns(addressOrEnsName)

  const { data: ensName } = useEnsName({
    address: addressOrEnsName as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
    enabled: isInputAddress, // don't run hook if not address to prevent console.error
  })

  return isInputEns
    ? // check if ENS already provided
      { text: addressOrEnsName, isEns: true, isAddress: false }
    : // argument is address or ENS, condition on return of useEnsName
    ensName
    ? { text: ensName, isEns: true, isAddress: false }
    : { text: truncateString(addressOrEnsName), isEns: false, isAddress: true }
}

export default useDisplayAddress
