import { useEnsName } from "wagmi"
import truncateString from "../utils/truncateString"
import { isAddress } from "@ethersproject/address"

const useDisplayAddress = (addressOrEnsName) => {
  const { data: ensName } = useEnsName({
    address: addressOrEnsName as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
    enabled: isAddress(addressOrEnsName),
  })

  return ensName
    ? { text: ensName, isEns: true }
    : { text: truncateString(addressOrEnsName), isEns: false }
}

export default useDisplayAddress
