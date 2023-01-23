import { useQuery } from "@blitzjs/rpc"
import { toChecksumAddress } from "app/core/utils/checksumAddress"
import getCheckbook from "../queries/getCheckbook"

export const useCheckbook = (chainId: number, address: string) => {
  const [checkbook] = useQuery(
    getCheckbook,
    { chainId, address: toChecksumAddress(address) },
    {
      enabled: !!chainId && !!address,
      suspense: false,
      refetchOnWindowFocus: false,
      cacheTime: 60 * 1000, // 1 minute
    }
  )

  return { checkbook }
}
