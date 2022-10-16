import { useEnsName } from "wagmi"
import truncateString from "../utils/truncateString"

const useDisplayAddress = (address) => {
  const { data: ensName } = useEnsName({
    address: address as string,
    chainId: 1,
    cacheTime: 60 * 60 * 1000, // (1 hr) time (in ms) which the data should remain in the cache
  })

  return "@" + (ensName || truncateString(address))
}

export default useDisplayAddress
